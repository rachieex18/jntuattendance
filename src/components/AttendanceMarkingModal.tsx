import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { THEME } from '../theme';
import { X, CheckCircle, XCircle, Trophy, Clock, Trash2 } from 'lucide-react-native';
import { attendanceService } from '../services/attendance.service';
import { supabase } from '../services/supabase';

interface AttendanceMarkingModalProps {
    visible: boolean;
    subject: any | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const AttendanceMarkingModal = ({ visible, subject, onClose, onSuccess }: AttendanceMarkingModalProps) => {
    const [loading, setLoading] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [isDeleting, setIsDeleting] = useState(false);

    // Update default duration when subject changes
    React.useEffect(() => {
        if (subject) {
            setSelectedDuration(subject.type === 'Lab' ? 3 : 1);
        }
    }, [subject]);

    if (!subject) return null;

    const durations = subject.type === 'Lab' ? [2, 3] : [1, 2];

    const handleMark = async (status: 'Present' | 'Absent' | 'MidtermBonus') => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            await attendanceService.markAttendance(user.id, subject.id, status, selectedDuration);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Mark Attendance Error:', error);
            alert(error.message || 'Failed to update attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await attendanceService.deleteSubject(subject.id);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Delete Subject Error:', error);
            alert(error.message || 'Failed to delete subject');
        } finally {
            setLoading(false);
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{subject.name}</Text>
                            <Text style={styles.subtitle}>{subject.type} • {subject.code || 'No Code'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <X color={THEME.colors.textLight} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.durationSection}>
                        <Text style={styles.sectionLabel}>Select Class Duration:</Text>
                        <View style={styles.durationRow}>
                            {durations.map(d => (
                                <TouchableOpacity
                                    key={d}
                                    style={[
                                        styles.durationButton,
                                        selectedDuration === d && styles.durationButtonActive
                                    ]}
                                    onPress={() => setSelectedDuration(d)}
                                >
                                    <Clock size={16} color={selectedDuration === d ? THEME.colors.primary : THEME.colors.textLight} />
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === d && styles.durationTextActive
                                    ]}>{d} Hour{d > 1 ? 's' : ''}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {isDeleting ? (
                        <View style={styles.deleteConfirm}>
                            <Text style={[styles.prompt, { marginBottom: THEME.spacing.md }]}>Are you sure? This will delete all attendance records for this subject.</Text>
                            <View style={styles.buttonGrid}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.absentButton]}
                                    onPress={handleDelete}
                                    disabled={loading}
                                >
                                    <Trash2 color="#fff" size={24} />
                                    <Text style={styles.buttonText}>Yes, Delete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={() => setIsDeleting(false)}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.prompt}>Did you attend this session?</Text>

                            <View style={styles.buttonGrid}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.presentButton]}
                                    onPress={() => handleMark('Present')}
                                    disabled={loading}
                                >
                                    <CheckCircle color="#fff" size={28} />
                                    <Text style={styles.buttonText}>Present</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.absentButton]}
                                    onPress={() => handleMark('Absent')}
                                    disabled={loading}
                                >
                                    <XCircle color="#fff" size={28} />
                                    <Text style={styles.buttonText}>Absent</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.bonusButton]}
                                    onPress={() => handleMark('MidtermBonus')}
                                    disabled={loading}
                                >
                                    <Trophy color="#fff" size={28} />
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.buttonText}>Midterm Bonus</Text>
                                        <Text style={styles.bonusSubtext}>+2 Hours Credit</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteLink}
                                    onPress={() => setIsDeleting(true)}
                                    disabled={loading}
                                >
                                    <Trash2 color={THEME.colors.detention} size={16} />
                                    <Text style={styles.deleteLinkText}>Delete Subject</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator color={THEME.colors.primary} size="large" />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        padding: THEME.spacing.lg,
    },
    content: {
        backgroundColor: THEME.colors.card,
        borderRadius: THEME.radius.xl,
        padding: THEME.spacing.xl,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: THEME.spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: THEME.colors.textLight,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: THEME.spacing.xl,
    },
    statBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: THEME.radius.full,
        gap: 6,
    },
    statText: {
        color: THEME.colors.textLight,
        fontSize: 12,
        fontWeight: '600',
    },
    prompt: {
        fontSize: 16,
        color: THEME.colors.text,
        textAlign: 'center',
        marginBottom: THEME.spacing.xl,
        fontWeight: '500',
    },
    buttonGrid: {
        gap: THEME.spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: THEME.spacing.lg,
        borderRadius: THEME.radius.lg,
        gap: THEME.spacing.md,
    },
    presentButton: {
        backgroundColor: THEME.colors.safe,
    },
    absentButton: {
        backgroundColor: THEME.colors.detention,
    },
    bonusButton: {
        backgroundColor: THEME.colors.accent,
        flexDirection: 'column',
        alignItems: 'center',
        padding: THEME.spacing.md,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bonusSubtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationSection: {
        marginBottom: THEME.spacing.lg,
    },
    sectionLabel: {
        color: THEME.colors.textLight,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: THEME.spacing.sm,
        letterSpacing: 1,
    },
    durationRow: {
        flexDirection: 'row',
        gap: THEME.spacing.md,
    },
    durationButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: THEME.colors.background,
        paddingVertical: 10,
        borderRadius: THEME.radius.md,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
    },
    durationButtonActive: {
        borderColor: THEME.colors.primary,
        backgroundColor: THEME.colors.primary + '10',
    },
    durationText: {
        color: THEME.colors.textLight,
        fontSize: 14,
        fontWeight: '600',
    },
    durationTextActive: {
        color: THEME.colors.primary,
    },
    deleteLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: THEME.spacing.md,
        padding: 10,
    },
    deleteLinkText: {
        color: THEME.colors.detention,
        fontSize: 14,
        fontWeight: '600',
    },
    deleteConfirm: {
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: THEME.colors.cardSecondary,
        justifyContent: 'center',
    },
});
