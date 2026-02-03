import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { authService, supabase } from '../services/supabase';
import { attendanceService } from '../services/attendance.service';
import { THEME } from '../theme';
import { calculateAggregateAttendance, getAttendanceStatus, calculateBunkCapacity } from '../utils/attendance';
import { LogOut, Plus, Camera, AlertTriangle, Linkedin } from 'lucide-react-native';
import { AddSubjectModal } from '../components/AddSubjectModal';
import { AttendanceMarkingModal } from '../components/AttendanceMarkingModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { User } from 'lucide-react-native';

export const DashboardScreen = ({ onScanPress }: { onScanPress: () => void }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
    const [showMarkingModal, setShowMarkingModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const [prof, subs] = await Promise.all([
                    authService.getProfile(user.id),
                    attendanceService.getSubjects(user.id).catch(() => []) // Handle missing subjects table
                ]);

                if (!prof) {
                    setErrorMsg('Unable to load or create your profile. This usually means the "profiles" table is missing.');
                } else {
                    setProfile(prof);
                    setErrorMsg(null);
                }

                const subjectsWithMath = (subs || []).map(s => ({
                    ...s,
                    attendedHours: s.total_hours_attended,
                    conductedHours: s.total_hours_conducted,
                    midtermBonus: s.midterm_bonus_hours,
                    type: s.subject_type
                }));
                setSubjects(subjectsWithMath);
            }
        } catch (error: any) {
            console.error('Fetch Data Error:', error);
            if (error.message?.includes('profiles')) {
                setErrorMsg('Database tables are missing. Please run the SQL schema in Supabase SQL Editor.');
            } else {
                setErrorMsg(error.message || 'Failed to load data');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const aggregatePerf = calculateAggregateAttendance(subjects);
    const status = getAttendanceStatus(aggregatePerf);

    // Correct Aggregate Bunk Capacity Calculation
    // We calculate how many TOTAL hours can be missed across all subjects to stay above 75%
    const totalAttendedAll = subjects.reduce((acc, s) => acc + (s.total_hours_attended + s.midterm_bonus_hours), 0);
    const totalConductedAll = subjects.reduce((acc, s) => acc + s.total_hours_conducted, 0);

    const maxTotalConducted = Math.floor((totalAttendedAll * 100) / 75);
    const totalBunkCapacity = Math.max(0, maxTotalConducted - totalConductedAll);

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={THEME.colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.profileHeader} onPress={() => setShowProfileModal(true)}>
                    <View style={styles.profileAvatar}>
                        <User color={THEME.colors.primary} size={20} />
                    </View>
                    <View>
                        <Text style={styles.welcome}>Hello, {profile?.full_name?.split(' ')[0] || 'Student'}</Text>
                        <Text style={styles.rollNo}>{profile?.university_roll_no || 'Setup Profile'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => authService.signOut()}>
                    <LogOut color={THEME.colors.textLight} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCardHalf}>
                        <Text style={styles.summaryLabel}>Total Attendance</Text>
                        <Text style={[styles.summaryValueLarge, { color: status.color }]}>
                            {aggregatePerf.toFixed(1)}%
                        </Text>
                        <View style={[styles.statusBadgeInline, { backgroundColor: status.color + '20' }]}>
                            <Text style={[styles.statusBadgeTextSmall, { color: status.color }]}>
                                {status.icon} {status.label}
                            </Text>
                        </View>
                        <View style={styles.regulationContainer}>
                            <Text style={styles.regulationText}>{profile?.regulation}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryCardHalf}>
                        <Text style={styles.summaryLabel}>Bunk Capacity</Text>
                        <Text style={[
                            styles.summaryValueLarge,
                            { color: totalBunkCapacity > 0 ? THEME.colors.safe : THEME.colors.detention }
                        ]}>
                            {totalBunkCapacity}h
                        </Text>
                        <View style={[
                            styles.statusBadgeInline,
                            { backgroundColor: (totalBunkCapacity > 0 ? THEME.colors.safe : THEME.colors.detention) + '20' }
                        ]}>
                            <Text style={[
                                styles.statusBadgeTextSmall,
                                { color: totalBunkCapacity > 0 ? THEME.colors.safe : THEME.colors.detention }
                            ]}>
                                {totalBunkCapacity > 0 ? '🏃 Skip Limit' : '🔴 No Bunks'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Subjects</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.iconButton} onPress={onScanPress}>
                            <Camera color={THEME.colors.primary} size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setShowAddModal(true)}>
                            <Plus color={THEME.colors.primary} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                {errorMsg ? (
                    <View style={styles.errorBanner}>
                        <AlertTriangle color={THEME.colors.detention} size={24} />
                        <Text style={styles.errorBannerText}>{errorMsg}</Text>
                    </View>
                ) : subjects.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No subjects added yet.</Text>
                        <Text style={styles.emptySubtext}>Scan your timetable or add subjects manually.</Text>
                    </View>
                ) : (
                    subjects.map((subject) => {
                        const perc = ((subject.attendedHours + subject.midtermBonus) / (subject.conductedHours || 1) * 100);
                        const subStatus = getAttendanceStatus(perc);
                        return (
                            <TouchableOpacity
                                key={subject.id}
                                style={styles.subjectCard}
                                onPress={() => {
                                    setSelectedSubject(subject);
                                    setShowMarkingModal(true);
                                }}
                            >
                                <View style={styles.subjectMain}>
                                    <Text style={styles.subjectName}>{subject.name}</Text>
                                    <Text style={styles.subjectType}>{subject.type} • {subject.code || 'No Code'}</Text>
                                </View>
                                <View style={styles.subjectStats}>
                                    <Text style={[styles.subjectPerc, { color: subStatus.color }]}>
                                        {perc.toFixed(0)}%
                                    </Text>
                                    <Text style={styles.subjectHours}>
                                        {subject.total_hours_attended + subject.midterm_bonus_hours}/{subject.total_hours_conducted} hrs
                                    </Text>
                                    {perc >= 75 ? (
                                        <Text style={styles.bunkSmall}>
                                            Skip: {calculateBunkCapacity({
                                                id: subject.id,
                                                name: subject.name,
                                                type: subject.subject_type,
                                                attendedHours: subject.total_hours_attended,
                                                conductedHours: subject.total_hours_conducted,
                                                midtermBonus: subject.midterm_bonus_hours
                                            }, 75)}h
                                        </Text>
                                    ) : (
                                        <Text style={[styles.bunkSmall, { color: THEME.colors.detention }]}>
                                            Need: {Math.ceil((75 * subject.total_hours_conducted - 100 * (subject.total_hours_attended + subject.midterm_bonus_hours)) / 25)}h
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                <TouchableOpacity
                    style={styles.linkedinFooter}
                    onPress={() => Linking.openURL('https://www.linkedin.com/in/rachith-koushik-vanam003b2367')}
                >
                    <View style={styles.linkedinIconContainer}>
                        <Linkedin color="#fff" size={16} />
                    </View>
                    <Text style={styles.linkedinText}>Built by Rachith Koushik</Text>
                </TouchableOpacity>
            </ScrollView>

            <AddSubjectModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchData}
            />

            <AttendanceMarkingModal
                visible={showMarkingModal}
                subject={selectedSubject}
                onClose={() => {
                    setShowMarkingModal(false);
                    setSelectedSubject(null);
                }}
                onSuccess={fetchData}
            />

            <EditProfileModal
                visible={showProfileModal}
                profile={profile}
                onClose={() => setShowProfileModal(false)}
                onSuccess={fetchData}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        paddingTop: 60,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: THEME.spacing.lg,
        marginBottom: THEME.spacing.lg,
    },
    welcome: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    rollNo: {
        fontSize: 14,
        color: THEME.colors.textLight,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: THEME.spacing.md,
    },
    profileAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: THEME.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: THEME.colors.primary + '30',
    },
    scrollContent: {
        paddingHorizontal: THEME.spacing.lg,
        paddingBottom: 40,
    },
    summaryContainer: {
        flexDirection: 'row',
        gap: THEME.spacing.md,
        marginBottom: THEME.spacing.xl,
    },
    summaryCardHalf: {
        flex: 1,
        backgroundColor: THEME.colors.card,
        padding: THEME.spacing.lg,
        borderRadius: THEME.radius.lg,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
        position: 'relative',
        overflow: 'hidden',
    },
    summaryLabel: {
        color: THEME.colors.textLight,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    summaryValueLarge: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statusBadgeInline: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusBadgeTextSmall: {
        fontSize: 11,
        fontWeight: '700',
    },
    regulationContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: THEME.colors.cardSecondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomLeftRadius: 8,
    },
    regulationText: {
        color: THEME.colors.textLight,
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    actions: {
        flexDirection: 'row',
        gap: THEME.spacing.sm,
    },
    iconButton: {
        backgroundColor: THEME.colors.cardSecondary,
        padding: 10,
        borderRadius: THEME.radius.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    subjectCard: {
        backgroundColor: THEME.colors.card,
        padding: THEME.spacing.md,
        borderRadius: THEME.radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    subjectMain: {
        flex: 1,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 2,
    },
    subjectType: {
        fontSize: 12,
        color: THEME.colors.textLight,
    },
    subjectStats: {
        alignItems: 'flex-end',
    },
    subjectPerc: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subjectHours: {
        fontSize: 11,
        color: THEME.colors.textLight,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: THEME.spacing.xl,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.colors.text,
    },
    emptySubtext: {
        fontSize: 14,
        color: THEME.colors.textLight,
    },
    errorBanner: {
        backgroundColor: THEME.colors.detention + '15',
        padding: THEME.spacing.lg,
        borderRadius: THEME.radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: THEME.spacing.md,
        marginVertical: THEME.spacing.md,
        borderWidth: 1,
        borderColor: THEME.colors.detention + '40',
    },
    errorBannerText: {
        color: THEME.colors.text,
        fontSize: 14,
        flex: 1,
    },
    linkedinFooter: {
        marginTop: 40,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: THEME.colors.card,
        borderRadius: THEME.radius.full,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#0077B5', // LinkedIn Blue
        alignSelf: 'center',
        shadowColor: '#0077B5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    linkedinIconContainer: {
        backgroundColor: '#0077B5',
        padding: 6,
        borderRadius: THEME.radius.full,
        marginRight: 10,
    },
    linkedinText: {
        color: THEME.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    bunkBadge: {
        marginTop: 12,
        backgroundColor: THEME.colors.safe + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: THEME.radius.md,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: THEME.colors.safe + '40',
    },
    bunkBadgeText: {
        color: THEME.colors.safe,
        fontSize: 12,
        fontWeight: 'bold',
    },
    rightHeader: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '100%',
    },
    bunkSmall: {
        fontSize: 10,
        fontWeight: 'bold',
        color: THEME.colors.safe,
        marginTop: 2,
    },
});
