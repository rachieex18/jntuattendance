import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY,
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);

// Replace with your local IP or backend URL
// Use 'http://10.0.2.2:3000' for Android Emulator
// Use 'http://127.0.0.1:3000' or localhost for Web
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3000';

// Helper for session persistence and auth
export const authService = {
    async signUp(email: string, password: string, fullName: string, rollNo: string, regulation: string) {
        try {
            const response = await fetch(`${BACKEND_URL}/signup-with-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fullName, rollNo, regulation }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
            return data;
        } catch (error) {
            console.error('Signup Error:', error);
            throw error;
        }
    },

    async verifyOtp(email: string, otp: string) {
        try {
            const response = await fetch(`${BACKEND_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Verification failed');
            return data;
        } catch (error) {
            console.error('Verify OTP Error:', error);
            throw error;
        }
    },

    async forgotPassword(email: string) {
        try {
            const response = await fetch(`${BACKEND_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to send reset OTP');
            return data;
        } catch (error) {
            console.error('Forgot Password Error:', error);
            throw error;
        }
    },

    async resetPassword(email: string, otp: string, newPassword: string) {
        try {
            const response = await fetch(`${BACKEND_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to reset password');
            return data;
        } catch (error) {
            console.error('Reset Password Error:', error);
            throw error;
        }
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw error;

        // If profile is missing (e.g. signup failed halfway), create a temporary one
        if (!data) {
            const { data: newData, error: createError } = await supabase
                .from('profiles')
                .insert([{
                    id: userId,
                    full_name: 'New Student',
                    university_roll_no: 'PENDING-' + userId.slice(0, 5),
                    regulation: 'R22'
                }])
                .select()
                .single();

            if (createError) {
                console.error('Failed to auto-create profile:', createError);
                return null;
            }
            return newData;
        }

        return data;
    }
};
