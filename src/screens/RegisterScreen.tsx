import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { authService } from '../services/supabase';
import { THEME } from '../theme';

export const RegisterScreen = ({ onLoginPress, onSuccess }: { onLoginPress: () => void, onSuccess: () => void }) => {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [regulation, setRegulation] = useState('R22');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleRegister = async () => {
        setErrorMsg(null);
        if (!email || !password || !fullName || !rollNo) return Alert.alert('Error', 'Please fill all fields');
        setLoading(true);
        try {
            await authService.signUp(email, password, fullName, rollNo, regulation);
            setStep('otp');
            if (Platform.OS === 'web') alert('Success: OTP sent to your email!');
            else Alert.alert('Success', 'OTP sent to your email!');
        } catch (error: any) {
            console.error('Registration error:', error);
            setErrorMsg(error.message || 'Registration failed');
            if (Platform.OS === 'web') alert(`Registration Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return Alert.alert('Error', 'Please enter OTP');
        setLoading(true);
        try {
            await authService.verifyOtp(email, otp);
            Alert.alert('Success', 'Account created! Please sign in.', [{ text: 'OK', onPress: onSuccess }]);
        } catch (error: any) {
            console.error('OTP error:', error);
            setErrorMsg(error.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'otp') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Verify Email</Text>
                    <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>OTP Code</Text>
                    <TextInput
                        style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 10 }]}
                        placeholder="000000"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                    />

                    {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleVerifyOtp}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Complete</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setStep('details')} style={styles.linkButton}>
                        <Text style={styles.linkText}>Back to Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>New Student</Text>
                <Text style={styles.subtitle}>Setup your tracking profile</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor={THEME.colors.textLight} value={fullName} onChangeText={setFullName} />

                <Text style={styles.label}>Roll Number</Text>
                <TextInput style={styles.input} placeholder="22071A0..." placeholderTextColor={THEME.colors.textLight} value={rollNo} onChangeText={setRollNo} autoCapitalize="characters" />

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

                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor={THEME.colors.textLight} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

                <Text style={styles.label}>Password</Text>
                <TextInput style={styles.input} placeholder="********" placeholderTextColor={THEME.colors.textLight} value={password} onChangeText={setPassword} secureTextEntry />

                {errorMsg && (
                    <Text style={styles.errorText}>{errorMsg}</Text>
                )}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join Now</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={onLoginPress} style={styles.linkButton}>
                    <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Sign In</Text></Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: THEME.colors.background,
        justifyContent: 'center',
        padding: THEME.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
        marginTop: THEME.spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: THEME.colors.primary,
    },
    subtitle: {
        fontSize: 16,
        color: THEME.colors.textLight,
    },
    form: {
        backgroundColor: THEME.colors.card,
        padding: THEME.spacing.xl,
        borderRadius: THEME.radius.lg,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
        backgroundColor: THEME.colors.background,
        borderRadius: THEME.radius.md,
        padding: THEME.spacing.md,
        fontSize: 15,
        color: THEME.colors.text,
        marginBottom: THEME.spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
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
        padding: THEME.spacing.md,
        borderRadius: THEME.radius.md,
        alignItems: 'center',
        marginTop: THEME.spacing.md,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: THEME.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: THEME.spacing.lg,
        alignItems: 'center',
    },
    linkText: {
        color: THEME.colors.textLight,
        fontSize: 14,
    },
    linkTextBold: {
        color: THEME.colors.primary,
        fontWeight: 'bold',
    },
    errorText: {
        color: THEME.colors.detention,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: THEME.spacing.md,
        fontWeight: '500',
    },
});
