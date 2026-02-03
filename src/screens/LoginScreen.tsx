import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.mainContent}>
                    {/* Left Side: Branding & Features (Web Only) */}
                    {Platform.OS === 'web' && (
                        <View style={styles.heroSection}>
                            <Text style={styles.heroTitle}>Smart Attendance for JNTUH</Text>
                            <Text style={styles.heroSubtitle}>
                                Track your sessions, calculate bunk capacity, and manage your timetable with AI-powered scanning.
                            </Text>

                            <View style={styles.featureList}>
                                {[
                                    { icon: '📊', title: 'Live Tracker', desc: 'Real-time aggregate calculations' },
                                    { icon: '📸', title: 'AI Timetable Scan', desc: 'Upload photo, get schedule' },
                                    { icon: '🏃', title: 'Bunk Logic', desc: 'Know exactly when you can skip' }
                                ].map((feature, i) => (
                                    <View key={i} style={styles.featureItem}>
                                        <Text style={styles.featureIcon}>{feature.icon}</Text>
                                        <View>
                                            <Text style={styles.featureTitle}>{feature.title}</Text>
                                            <Text style={styles.featureDesc}>{feature.desc}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Right Side: Login Form */}
                    <View style={styles.formSection}>
                        <View style={styles.header}>
                            <Text style={styles.title}>JNTUH</Text>
                            <Text style={styles.subtitle}>Log in to your dashboard</Text>
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
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: THEME.colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: THEME.spacing.lg,
    },
    mainContent: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        gap: THEME.spacing.xl,
    },
    heroSection: {
        flex: 1.2,
        paddingRight: THEME.spacing.xl,
        display: Platform.OS === 'web' ? 'flex' : 'none',
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: THEME.colors.text,
        lineHeight: 56,
        marginBottom: THEME.spacing.lg,
    },
    heroSubtitle: {
        fontSize: 20,
        color: THEME.colors.textLight,
        lineHeight: 30,
        marginBottom: THEME.spacing.xl,
    },
    featureList: {
        gap: THEME.spacing.lg,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: THEME.spacing.md,
    },
    featureIcon: {
        fontSize: 32,
        backgroundColor: THEME.colors.card,
        padding: 12,
        borderRadius: 16,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    featureDesc: {
        fontSize: 14,
        color: THEME.colors.textLight,
    },
    formSection: {
        flex: 1,
        width: '100%',
        maxWidth: 450,
    },
    header: {
        alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
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
        padding: Platform.OS === 'web' ? THEME.spacing.xl : THEME.spacing.lg,
        borderRadius: THEME.radius.lg,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
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
