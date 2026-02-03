import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from './services/supabase';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { OCRScannerScreen } from './screens/OCRScannerScreen';
import { THEME } from './theme';

export default function App() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'scan'>('dashboard');

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth State Changed:', event, session?.user?.id);
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background }}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            {!session ? (
                showRegister ? (
                    <RegisterScreen
                        onLoginPress={() => setShowRegister(false)}
                        onSuccess={() => setShowRegister(false)}
                    />
                ) : (
                    <LoginScreen
                        onRegisterPress={() => setShowRegister(true)}
                    />
                )
            ) : (
                currentScreen === 'scan' ? (
                    <OCRScannerScreen onComplete={() => setCurrentScreen('dashboard')} />
                ) : (
                    <DashboardScreen onScanPress={() => setCurrentScreen('scan')} />
                )
            )}
        </SafeAreaProvider>
    );
}
