import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { THEME } from '../theme';
import { X, User, Hash, GraduationCap } from 'lucide-react-native';
import { authService, supabase } from '../services/supabase';

interface EditProfileModalProps {
    visible: boolean;
    profile: any;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditProfileModal = ({ visible, profile, onClose, onSuccess }: EditProfileModalProps) => {
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [rollNo, setRollNo] = useState(profile?.university_roll_no || '');
    const [regulation, setRegulation] = useState(profile?.regulation || 'R22');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name);
            setRollNo(profile.university_roll_no);
            setRegulation(profile.regulation || 'R22');
        }
    }, [profile]);

    const handleUpdate = async () => {
        if (!fullName.trim() || !rollNo.trim()) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName.trim(),
                    university_roll_no: rollNo.trim(),
                    regulation: regulation
                })
                .eq('id', user.id);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            alert(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Update Profile</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <X color={THEME.colors.textLight} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <User color={THEME.colors.primary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your Name"
                                    placeholderTextColor={THEME.colors.textLight + '80'}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>University Roll Number</Text>
                            <View style={styles.inputWrapper}>
                                <Hash color={THEME.colors.primary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 21071A05..."
                                    placeholderTextColor={THEME.colors.textLight + '80'}
                                    value={rollNo}
                                    onChangeText={setRollNo}
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Regulation</Text>
                            <View style={styles.row}>
                                {['R18', 'R22', 'R25'].map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[styles.chip, regulation === r && styles.chipActive]}
                                        onPress={() => setRegulation(r)}
                                    >
                                        <Text style={[styles.chipText, regulation === r && styles.chipTextActive]}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, (!fullName.trim() || !rollNo.trim() || loading) && styles.buttonDisabled]}
                            onPress={handleUpdate}
                            disabled={!fullName.trim() || !rollNo.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: THEME.colors.background,
        borderTopLeftRadius: THEME.radius.xl,
        borderTopRightRadius: THEME.radius.xl,
        padding: THEME.spacing.lg,
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    form: {
        gap: THEME.spacing.lg,
    },
    inputGroup: {
        gap: THEME.spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.colors.textLight,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.card,
        borderRadius: THEME.radius.md,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
        paddingHorizontal: THEME.spacing.md,
    },
    inputIcon: {
        marginRight: THEME.spacing.sm,
    },
    input: {
        flex: 1,
        height: 50,
        color: THEME.colors.text,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: THEME.spacing.md,
    },
    chip: {
        flex: 1,
        paddingVertical: THEME.spacing.sm,
        borderWidth: 1,
        borderColor: THEME.colors.primary,
        borderRadius: THEME.radius.full || 20,
        alignItems: 'center',
    },
    chipActive: {
        backgroundColor: THEME.colors.primary,
    },
    chipText: {
        color: THEME.colors.primary,
        fontWeight: '600',
    },
    chipTextActive: {
        color: THEME.colors.white,
    },
    button: {
        backgroundColor: THEME.colors.primary,
        height: 55,
        borderRadius: THEME.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: THEME.spacing.md,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
