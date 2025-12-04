import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ref as databaseRef, get, push, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db, storage } from '../lib/firebase';

const Colors = {
    backgroundTop: '#7aa07c',
    backgroundDark: '#557458',
    primaryGreen: '#4d8a50',
    pollutionRed: '#e74c3c',
    textLight: '#f0f0f0',
    textDark: '#333333',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
};

const pollutionTypeOptions = [
    'Sampah plastik',
    'Minyak / Oil spill',
    'Limbah cair',
    'Logam berat',
    'Lainnya'
];

const severityOptions = ['Ringan', 'Sedang', 'Berat'];

export default function FormInputPollution() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { recordId } = useLocalSearchParams<{ recordId?: string }>();

    const [pollutionType, setPollutionType] = useState(pollutionTypeOptions[0]);
    const [customType, setCustomType] = useState('');
    const [severity, setSeverity] = useState<'Ringan' | 'Sedang' | 'Berat' | ''>('');
    const [description, setDescription] = useState('');
    const [spread, setSpread] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [accuracy, setAccuracy] = useState('');
    const [photoUri, setPhotoUri] = useState('');
    const [remotePhotoUrl, setRemotePhotoUrl] = useState('');
    const [loadingRecord, setLoadingRecord] = useState(Boolean(recordId));
    const [submitting, setSubmitting] = useState(false);

    const isEditing = useMemo(() => Boolean(recordId), [recordId]);

    useEffect(() => {
        if (!recordId) return;

        const recordRef = databaseRef(db, `pollution/${recordId}`);
        get(recordRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setPollutionType(pollutionTypeOptions.includes(data.type) ? data.type : 'Lainnya');
                    if (!pollutionTypeOptions.includes(data.type) && data.type) {
                        setCustomType(data.type);
                    }
                    setSeverity(data.severity || '');
                    setDescription(data.description || '');
                    setSpread(data.spread || data.area || '');
                    setLatitude(data.latitude ? String(data.latitude) : data.coordinates?.split(',')[0] || '');
                    setLongitude(data.longitude ? String(data.longitude) : data.coordinates?.split(',')[1] || '');
                    setAccuracy(data.accuracy || '');
                    if (data.photoUrl) {
                        setPhotoUri(data.photoUrl);
                        setRemotePhotoUrl(data.photoUrl);
                    }
                }
            })
            .catch(() => Alert.alert('Error', 'Gagal memuat data polusi.'))
            .finally(() => setLoadingRecord(false));
    }, [recordId]);

    const getCoordinates = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission', 'Izin lokasi ditolak.');
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLatitude(loc.coords.latitude.toFixed(6));
        setLongitude(loc.coords.longitude.toFixed(6));
        setAccuracy(loc.coords.accuracy ? `${loc.coords.accuracy.toFixed(2)} m` : 'N/A');
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Izin Dibutuhkan', 'Berikan akses galeri untuk mengunggah foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const uploadImageIfNeeded = async () => {
        if (!photoUri) return '';
        if (photoUri === remotePhotoUrl) return remotePhotoUrl;

        const response = await fetch(photoUri);
        const blob = await response.blob();
        const fileRef = storageRef(storage, `pollution/${Date.now()}.jpg`);
        await uploadBytes(fileRef, blob);
        return getDownloadURL(fileRef);
    };

    const handleSave = async () => {
        if (pollutionType === 'Lainnya' && !customType.trim()) {
            Alert.alert('Validasi', 'Masukkan jenis polusi lainnya.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Validasi', 'Deskripsi kejadian wajib diisi.');
            return;
        }
        if (!severity) {
            Alert.alert('Validasi', 'Tingkat keparahan wajib dipilih.');
            return;
        }
        if (!latitude || !longitude) {
            Alert.alert('Validasi', 'Ambil lokasi GPS terlebih dahulu.');
            return;
        }

        try {
            setSubmitting(true);
            const finalPhotoUrl = await uploadImageIfNeeded();

            const payload = {
                type: pollutionType === 'Lainnya' ? customType.trim() : pollutionType,
                severity,
                description: description.trim(),
                spread: spread.trim(),
                latitude,
                longitude,
                accuracy,
                coordinates: `${latitude},${longitude}`,
                photoUrl: finalPhotoUrl,
                timestamp: new Date().toISOString(),
                category: 'pollution',
            };

            if (isEditing && recordId) {
                await update(databaseRef(db, `pollution/${recordId}`), payload);
                Alert.alert('Sukses', 'Data polusi diperbarui.');
            } else {
                await push(databaseRef(db, 'pollution/'), payload);
                Alert.alert('Sukses', 'Data polusi tersimpan.');
            }
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message ?? 'Gagal menyimpan data.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LinearGradient colors={[Colors.backgroundTop, Colors.backgroundDark]} style={{ flex: 1 }}>
            <Stack.Screen options={{ title: 'Record Pollution', headerShown: false }} />
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Pollution' : 'Record Pollution'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loadingRecord ? (
                    <View style={styles.loaderWrapper}>
                        <ActivityIndicator color="#fff" size="large" />
                        <Text style={{ color: '#fff', marginTop: 8 }}>Memuat data...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Jenis Polusi *</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={pollutionType}
                                    onValueChange={(value) => setPollutionType(value)}
                                >
                                    {pollutionTypeOptions.map((option) => (
                                        <Picker.Item key={option} label={option} value={option} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                        {pollutionType === 'Lainnya' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Jenis Polusi Lain</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan jenis polusi"
                                    placeholderTextColor="#999"
                                    value={customType}
                                    onChangeText={setCustomType}
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tingkat Keparahan *</Text>
                            <View style={styles.optionRow}>
                                {severityOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionButton,
                                            severity === option && styles.optionButtonActive
                                        ]}
                                        onPress={() => setSeverity(option as any)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionButtonText,
                                                severity === option && styles.optionButtonTextActive
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Deskripsi Kejadian *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Ceritakan kronologi, kondisi lapangan, pelaku, dll"
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Luas / Sebaran Polusi</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: ±50 m persegi"
                                placeholderTextColor="#999"
                                value={spread}
                                onChangeText={setSpread}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Foto Bukti (opsional)</Text>
                            <View style={styles.photoSection}>
                                {photoUri ? (
                                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <Ionicons name="image" size={32} color="#777" />
                                        <Text style={{ color: '#777', marginTop: 6 }}>Belum ada foto</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                                    <Ionicons name="cloud-upload-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                                        {photoUri ? 'Ganti Foto' : 'Unggah Foto'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Lokasi Koordinat *</Text>
                            <View style={styles.locationBox}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Latitude"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                    value={latitude}
                                    onChangeText={setLatitude}
                                />
                                <TextInput
                                    style={[styles.input, { marginTop: 10 }]}
                                    placeholder="Longitude"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                    value={longitude}
                                    onChangeText={setLongitude}
                                />
                            </View>
                            <Text style={styles.locationText}>Akurasi GPS: {accuracy || '-'}</Text>
                            <TouchableOpacity
                                style={[styles.gpsButton, { backgroundColor: Colors.pollutionRed }]}
                                onPress={getCoordinates}
                            >
                                <Ionicons name="locate" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.gpsButtonText}>
                                    {isEditing ? 'Update Location' : 'Get GPS Coordinates'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: Colors.pollutionRed, opacity: submitting ? 0.7 : 1 }]}
                            onPress={handleSave}
                            disabled={submitting}
                        >
                            <Text style={styles.saveButtonText}>{isEditing ? 'Perbarui Data' : 'Simpan Data'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textLight,
    },
    loaderWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 60,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: Colors.textDark,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    pickerWrapper: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        overflow: 'hidden',
    },
    optionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    optionButton: {
        flex: 1,
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionButtonActive: {
        borderColor: Colors.pollutionRed,
        backgroundColor: '#ffe5e5',
    },
    optionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textDark,
    },
    optionButtonTextActive: {
        color: Colors.pollutionRed,
    },
    photoSection: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 15,
    },
    photoPreview: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 12,
    },
    photoPlaceholder: {
        height: 180,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    photoButton: {
        flexDirection: 'row',
        backgroundColor: Colors.pollutionRed,
        paddingVertical: 12,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationBox: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        marginBottom: 10,
    },
    locationText: {
        fontSize: 14,
        color: Colors.textDark,
        marginBottom: 4,
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        paddingVertical: 15,
    },
    gpsButtonText: {
        color: Colors.textLight,
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: Colors.textLight,
        fontWeight: 'bold',
        fontSize: 18,
        textTransform: 'uppercase',
    },
});
