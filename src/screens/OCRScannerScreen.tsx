import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ocrService, OCRresult } from '../services/ocr';
import { attendanceService } from '../services/attendance.service';
import { supabase } from '../services/supabase';
import { THEME } from '../theme';
import { Camera, Upload, Check, X, RefreshCw, AlertTriangle } from 'lucide-react-native';

export const OCRScannerScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<OCRresult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const uriToBase64 = async (uri: string): Promise<string> => {
        try {
            console.log('Converting URI to base64:', uri);
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    if (result && result.includes(',')) {
                        resolve(result.split(',')[1]);
                    } else {
                        reject(new Error('Failed to convert image to base64 format.'));
                    }
                };
                reader.onerror = () => reject(new Error('FileReader failed to read the image blob.'));
                reader.readAsDataURL(blob);
            });
        } catch (error: any) {
            console.error('uriToBase64 error:', error);
            throw new Error('Could not process the selected image. Please try another one.');
        }
    };

    const pickImage = async () => {
        try {
            console.log('Opening image library...');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                console.log('Image selected:', asset.uri);
                setImage(asset.uri);

                let b64 = asset.base64;
                if (!b64) {
                    console.log('Base64 missing from asset, converting URI manually...');
                    b64 = await uriToBase64(asset.uri);
                }
                processImage(b64);
            }
        } catch (error: any) {
            console.error('Pick Image Error:', error);
            Alert.alert('Error', 'Failed to pick image: ' + error.message);
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                return Alert.alert('Permission denied', 'Camera access is required to scan timetables.');
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                setImage(asset.uri);

                let b64 = asset.base64;
                if (!b64) {
                    b64 = await uriToBase64(asset.uri);
                }
                processImage(b64);
            }
        } catch (error: any) {
            if (error.message?.includes('platform')) {
                Alert.alert('Not Supported', 'Camera is not available on this browser. Please use the Gallery option.');
            } else {
                Alert.alert('Error', error.message);
            }
        }
    };

    const processImage = async (base64: string) => {
        if (!base64 || base64.length < 100) {
            console.error('Invalid base64 received');
            Alert.alert('Error', 'The selected image is invalid or could not be processed.');
            return;
        }

        console.log('Sending image to Gemini for analysis (B64 length:', base64.length, ')');
        setLoading(true);
        try {
            const parsed = await ocrService.processTimetableImage(base64);
            console.log('Gemini Analysis Success:', parsed.sessions?.length, 'sessions found');
            if (!parsed.sessions || parsed.sessions.length === 0) {
                Alert.alert('No sessions found', 'Gemini couldn\'t find any timetable entries in that photo. Try a clearer or zoomed-in photo.');
            }
            setResults(parsed);
        } catch (error: any) {
            console.error('OCR Screen Error:', error);
            setError(error.message);
            Alert.alert('Analysis Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const saveToSchedule = async () => {
        if (!results || !results.sessions) return;
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User NOT FOUND. Please login again.');

            console.log('User ID:', user.id);
            console.log('Results to save:', results.sessions.length);

            // 1. Get unique subject names from the scan (trim and clean)
            const uniqueSubjects = Array.from(new Set(
                results.sessions
                    .map(s => s.subject?.trim())
                    .filter(name => !!name)
            ));

            if (uniqueSubjects.length === 0) {
                throw new Error('No valid subjects were detected in the timetable.');
            }

            // 2. Create subjects in the 'subjects' table if they don't exist
            const subjectMap: Record<string, string> = {};

            for (const subName of uniqueSubjects) {
                // Find if subject exists or create it
                const { data: existing, error: fetchError } = await supabase
                    .from('subjects')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('name', subName)
                    .maybeSingle();

                if (fetchError) {
                    console.error(`Error checking subject "${subName}":`, fetchError);
                }

                if (existing) {
                    subjectMap[subName] = existing.id;
                } else {
                    const subType = results.sessions.find(s => s.subject?.trim() === subName)?.type || 'Theory';
                    const { data: created, error: subError } = await supabase
                        .from('subjects')
                        .insert({
                            user_id: user.id,
                            name: subName,
                            subject_type: subType,
                        })
                        .select()
                        .single();

                    if (subError) {
                        console.error(`Error creating subject "${subName}":`, subError);
                        throw new Error(`Failed to create subject "${subName}": ${subError.message}`);
                    }
                    console.log(`Created subject "${subName}" with ID: ${created.id}`);
                    subjectMap[subName] = created.id;
                }
            }
            console.log('Subject Map completed:', Object.keys(subjectMap).length, 'subjects mapped');

            // 3. Save to Timetable table
            const timetableData = results.sessions.map(s => {
                const subId = subjectMap[s.subject?.trim() || ''];

                // Ensure time format HH:mm:ss for Supabase
                const startTime = s.startTime?.includes(':') && s.startTime.split(':').length === 2 ? `${s.startTime}:00` : s.startTime;
                const endTime = s.endTime?.includes(':') && s.endTime.split(':').length === 2 ? `${s.endTime}:00` : s.endTime;

                return {
                    user_id: user.id,
                    day: s.day,
                    subject_id: subId,
                    start_time: startTime,
                    end_time: endTime,
                    room_number: s.room || null,
                    instructor: s.instructor || null
                };
            });

            console.log('Inserting timetable data:', JSON.stringify(timetableData, null, 2));

            const { error: timeError } = await supabase
                .from('timetable')
                .insert(timetableData);

            if (timeError) throw timeError;

            Alert.alert('Success', `Imported ${uniqueSubjects.length} subjects to your schedule!`, [
                { text: 'Awesome', onPress: onComplete }
            ]);
        } catch (error: any) {
            console.error('Save Error:', error);
            Alert.alert('Import Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Timetable Scanner</Text>
                <TouchableOpacity onPress={onComplete}>
                    <X color={THEME.colors.text} size={24} />
                </TouchableOpacity>
            </View>

            {!image ? (
                <View style={styles.uploadArea}>
                    <Text style={styles.instruction}>Upload or take a photo of your JNTUH timetable grid.</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                            <Upload color={THEME.colors.primary} size={32} />
                            <Text style={styles.buttonLabel}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                            <Camera color={THEME.colors.primary} size={32} />
                            <Text style={styles.buttonLabel}>Camera</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <ScrollView style={styles.resultsArea} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Image source={{ uri: image }} style={styles.previewImage} />

                    {loading ? (
                        <View style={styles.analyzing}>
                            <ActivityIndicator color={THEME.colors.primary} size="large" />
                            <Text style={styles.analyzingText}>Gemini AI is analyzing your timetable...</Text>
                        </View>
                    ) : results ? (
                        <View style={styles.resultsList}>
                            <Text style={styles.resultsTitle}>Extracted Sessions</Text>
                            {results.sessions.length > 0 ? (
                                results.sessions.map((session, i) => (
                                    <View key={i} style={styles.sessionItem}>
                                        <View style={styles.sessionHeader}>
                                            <Text style={styles.sessionDay}>{session.day}</Text>
                                            <Text style={[styles.sessionType, { color: session.type === 'Lab' ? THEME.colors.detention : THEME.colors.primary }]}>
                                                {session.type}
                                            </Text>
                                        </View>
                                        <Text style={styles.sessionSubject}>{session.subject}</Text>
                                        <Text style={styles.sessionTime}>{session.startTime} - {session.endTime}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.instruction}>No sessions were detected. Please try a clearer photo.</Text>
                            )}

                            {results.sessions.length > 0 && (
                                <TouchableOpacity style={styles.saveButton} onPress={saveToSchedule}>
                                    <Check color="#fff" size={20} />
                                    <Text style={styles.saveButtonText}>Confirm & Import</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.retryButton} onPress={() => { setImage(null); setResults(null); }}>
                                <RefreshCw color={THEME.colors.textLight} size={16} />
                                <Text style={styles.retryButtonText}>Try Another Photo</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.analyzing}>
                            <AlertTriangle color={THEME.colors.detention} size={32} />
                            <Text style={styles.analyzingText}>{error || 'Analysis failed or returned no results.'}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => { setImage(null); setResults(null); setError(null); }}>
                                <RefreshCw color={THEME.colors.primary} size={20} />
                                <Text style={[styles.retryButtonText, { color: THEME.colors.primary }]}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: THEME.spacing.lg,
        marginBottom: THEME.spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    uploadArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: THEME.spacing.xl,
    },
    instruction: {
        fontSize: 16,
        color: THEME.colors.textLight,
        textAlign: 'center',
        marginBottom: THEME.spacing.xl,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: THEME.spacing.xl,
    },
    uploadButton: {
        backgroundColor: THEME.colors.card,
        padding: THEME.spacing.xl,
        borderRadius: THEME.radius.lg,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        width: 120,
        borderWidth: 1,
        borderColor: THEME.colors.cardSecondary,
    },
    buttonLabel: {
        marginTop: THEME.spacing.sm,
        fontWeight: '600',
        color: THEME.colors.text,
    },
    resultsArea: {
        flex: 1,
    },
    previewImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    analyzing: {
        padding: THEME.spacing.xl,
        alignItems: 'center',
    },
    analyzingText: {
        marginTop: THEME.spacing.md,
        color: THEME.colors.textLight,
        fontWeight: '600',
    },
    resultsList: {
        padding: THEME.spacing.lg,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.md,
    },
    sessionItem: {
        backgroundColor: THEME.colors.card,
        padding: THEME.spacing.md,
        borderRadius: THEME.radius.md,
        marginBottom: THEME.spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: THEME.colors.primary,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    sessionDay: {
        fontSize: 12,
        fontWeight: 'bold',
        color: THEME.colors.textLight,
    },
    sessionType: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    sessionSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    sessionTime: {
        fontSize: 13,
        color: THEME.colors.textLight,
    },
    saveButton: {
        backgroundColor: THEME.colors.primary,
        flexDirection: 'row',
        padding: THEME.spacing.md,
        borderRadius: THEME.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: THEME.spacing.lg,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    retryButton: {
        flexDirection: 'row',
        padding: THEME.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    retryButtonText: {
        color: THEME.colors.textLight,
        fontSize: 14,
    },
});
