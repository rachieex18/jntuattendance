import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { THEME } from '../theme';
import { X, Book, Hash, Layers } from 'lucide-react-native';
import { attendanceService } from '../services/attendance.service';
import { supabase } from '../services/supabase';

interface AddSubjectModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddSubjectModal = ({ visible, onClose, onSuccess }: AddSubjectModalProps) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState<'Theory' | 'Lab'>('Theory');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            await attendanceService.addSubject(user.id, name.trim(), type, code.trim() || undefined);

            setName('');
            setCode('');
            setType('Theory');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Add Subject Error:', error);
            alert(error.message || 'Failed to add subject');
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
                        <Text style={styles.title}>Add New Subject</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <X color={THEME.colors.textLight} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject Name</Text>
                            <View style={styles.inputWrapper}>
                                <Book color={THEME.colors.primary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Mathematics - IV"
                                    placeholderTextColor={THEME.colors.textLight + '80'}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject Code (Optional)</Text>
                            <View style={styles.inputWrapper}>
                                <Hash color={THEME.colors.primary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. CS401"
                                    placeholderTextColor={THEME.colors.textLight + '80'}
                                    value={code}
                                    onChangeText={setCode}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject Type</Text>
                            <View style={styles.typeRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        type === 'Theory' && styles.typeButtonActive
                                    ]}
                                    onPress={() => setType('Theory')}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        type === 'Theory' && styles.typeButtonTextActive
                                    ]}>Theory</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        type === 'Lab' && styles.typeButtonActive
                                    ]}
                                    onPress={() => setType('Lab')}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        type === 'Lab' && styles.typeButtonTextActive
                                    ]}>Lab / Practical</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.addButton, (!name.trim() || loading) && styles.addButtonDisabled]}
                            onPress={handleAdd}
                            disabled={!name.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.addButtonText}>Create Subject</Text>
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
    typeRow: {
        flexDirection: 'row',
        gap: THEME.spacing.md,
    },
    typeButton: {
        flex: 1,
        height: 45,
        borderRadius: THEME.radius.md,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.card,
    },
    typeButtonActive: {
        borderColor: THEME.colors.primary,
        backgroundColor: THEME.colors.primary + '15',
    },
    typeButtonText: {
        color: THEME.colors.textLight,
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: THEME.colors.primary,
    },
    addButton: {
        backgroundColor: THEME.colors.primary,
        height: 55,
        borderRadius: THEME.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: THEME.spacing.md,
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonDisabled: {
        backgroundColor: THEME.colors.cardSecondary,
        shadowOpacity: 0,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
