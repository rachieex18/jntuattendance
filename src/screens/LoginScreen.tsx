import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { authService } from '../services/supabase';
import { THEME } from '../theme';

export const LoginScreen = ({ onRegisterPress }: { onRegisterPress: () => void }) => {
    const [step, setStep] = useState<'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleLogin = async () => {
        setErrorMsg(null);
        if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
        setLoading(true);
        try {
            await authService.signIn(email, password);
        } catch (error: any) {
            console.error('Login Error:', error);
            setErrorMsg(error.message || 'Login failed');
            if (Platform.OS === 'web') alert(`Login Failed: ${error.message}`);
            else Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) return Alert.alert('Error', 'Please enter your email');
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setStep('forgot-otp');
            if (Platform.OS === 'web') alert('Reset code sent to your email!');
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) return Alert.alert('Error', 'Please fill all fields');
        setLoading(true);
        try {
            await authService.resetPassword(email, otp, newPassword);
            setStep('login');
            Alert.alert('Success', 'Password reset successfully! Please login.');
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'forgot-email') {
        return (
            <View style={styles.container}>
                <View style={styles.header}><Text style={styles.title}>Forgot Password</Text></View>
                <View style={styles.form}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                    {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                    <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setStep('login')} style={styles.linkButton}><Text style={styles.linkText}>Back to Login</Text></TouchableOpacity>
                </View>
            </View>
        );
    }

    if (step === 'forgot-otp' || step === 'forgot-reset') {
        return (
            <View style={styles.container}>
                <View style={styles.header}><Text style={styles.title}>Reset Password</Text></View>
                <View style={styles.form}>
                    <Text style={styles.label}>OTP Code</Text>
                    <TextInput style={styles.input} placeholder="000000" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
                    <Text style={styles.label}>New Password</Text>
                    <TextInput style={styles.input} placeholder="********" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                    {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                    <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setStep('login')} style={styles.linkButton}><Text style={styles.linkText}>Cancel</Text></TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>JNTUH</Text>
                <Text style={styles.subtitle}>Attendance Tracker</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={THEME.colors.textLight}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor={THEME.colors.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {errorMsg && (
                    <Text style={styles.errorText}>{errorMsg}</Text>
                )}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep('forgot-email')} style={styles.linkButton}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onRegisterPress} style={styles.linkButton}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        justifyContent: 'center',
        padding: THEME.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: THEME.colors.primary,
    },
    subtitle: {
        fontSize: 18,
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
        fontSize: 14,
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
        fontSize: 16,
        color: THEME.colors.text,
        marginBottom: THEME.spacing.lg,
    },
    button: {
        backgroundColor: THEME.colors.primary,
        padding: THEME.spacing.md,
        borderRadius: THEME.radius.md,
        alignItems: 'center',
        marginTop: THEME.spacing.sm,
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
