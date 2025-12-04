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
    disturbanceYellow: '#f39c12',
    textLight: '#f0f0f0',
    textDark: '#333333',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
};

const disturbanceOptions = [
    'Penebangan ilegal',
    'Erosi',
    'Abrasi',
    'Kebakaran',
    'Pembangunan liar',
    'Lainnya'
];

const scaleOptions = ['Kecil', 'Sedang', 'Luas'];

export default function FormInputDisturbance() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { recordId } = useLocalSearchParams<{ recordId?: string }>();

    const [disturbanceType, setDisturbanceType] = useState(disturbanceOptions[0]);
    const [customType, setCustomType] = useState('');
    const [scale, setScale] = useState<'Kecil' | 'Sedang' | 'Luas' | ''>('');
    const [areaImpacted, setAreaImpacted] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
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
        const recordRef = databaseRef(db, `disturbance/${recordId}`);
        get(recordRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setDisturbanceType(disturbanceOptions.includes(data.type) ? data.type : 'Lainnya');
                    if (!disturbanceOptions.includes(data.type) && data.type) {
                        setCustomType(data.type);
                    }
                    setScale(data.scale || data.severity || '');
                    setAreaImpacted(data.area || '');
                    setDescription(data.description || '');
                    setNotes(data.notes || '');
                    setLatitude(data.latitude ? String(data.latitude) : data.coordinates?.split(',')[0] || '');
                    setLongitude(data.longitude ? String(data.longitude) : data.coordinates?.split(',')[1] || '');
                    setAccuracy(data.accuracy || '');
                    if (data.photoUrl) {
                        setPhotoUri(data.photoUrl);
                        setRemotePhotoUrl(data.photoUrl);
                    }
                }
            })
            .catch(() => Alert.alert('Error', 'Gagal memuat data gangguan.'))
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
        const fileRef = storageRef(storage, `disturbance/${Date.now()}.jpg`);
        await uploadBytes(fileRef, blob);
        return getDownloadURL(fileRef);
    };

    const handleSave = async () => {
        if (disturbanceType === 'Lainnya' && !customType.trim()) {
            Alert.alert('Validasi', 'Masukkan jenis gangguan lainnya.');
            return;
        }
        if (!scale) {
            Alert.alert('Validasi', 'Skala kerusakan wajib dipilih.');
            return;
        }
        if (!areaImpacted.trim()) {
            Alert.alert('Validasi', 'Perkiraan area terdampak wajib diisi.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Validasi', 'Deskripsi lapangan wajib diisi.');
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
                type: disturbanceType === 'Lainnya' ? customType.trim() : disturbanceType,
                scale,
                area: areaImpacted.trim(),
                description: description.trim(),
                notes: notes.trim(),
                latitude,
                longitude,
                accuracy,
                coordinates: `${latitude},${longitude}`,
                photoUrl: finalPhotoUrl,
                timestamp: new Date().toISOString(),
                category: 'disturbance',
            };

            if (isEditing && recordId) {
                await update(databaseRef(db, `disturbance/${recordId}`), payload);
                Alert.alert('Sukses', 'Data gangguan diperbarui.');
            } else {
                await push(databaseRef(db, 'disturbance/'), payload);
                Alert.alert('Sukses', 'Data gangguan tersimpan.');
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
            <Stack.Screen options={{ title: 'Record Disturbance', headerShown: false }} />
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Disturbance' : 'Record Disturbance'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loadingRecord ? (
                    <View style={styles.loaderWrapper}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={{ color: '#fff', marginTop: 8 }}>Memuat data...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Jenis Gangguan *</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={disturbanceType}
                                    onValueChange={(value) => setDisturbanceType(value)}
                                >
                                    {disturbanceOptions.map((option) => (
                                        <Picker.Item key={option} label={option} value={option} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                        {disturbanceType === 'Lainnya' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Jenis Gangguan Lain *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tulis jenis gangguan"
                                    placeholderTextColor="#999"
                                    value={customType}
                                    onChangeText={setCustomType}
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Skala Kerusakan *</Text>
                            <View style={styles.optionRow}>
                                {scaleOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionButton,
                                            scale === option && styles.optionButtonActive
                                        ]}
                                        onPress={() => setScale(option as any)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionButtonText,
                                                scale === option && styles.optionButtonTextActive
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Perkiraan Area Terdampak (m²) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: 150 m²"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={areaImpacted}
                                onChangeText={setAreaImpacted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Deskripsi Lapangan *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Ceritakan kondisi kerusakan, penyebab, tindakan"
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Catatan Tambahan</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Informasi tambahan"
                                placeholderTextColor="#999"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Foto Bukti Lapangan (opsional)</Text>
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
                                    style={[styles.gpsButton, { backgroundColor: Colors.disturbanceYellow }]}
                                    onPress={getCoordinates}
                                >
                                    <Ionicons name="locate" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.gpsButtonText}>
                                        Get GPS Coordinates
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: Colors.disturbanceYellow, opacity: submitting ? 0.7 : 1 }]}
                                onPress={handleSave}
                                disabled={submitting}
                            >
                                <Text style={styles.saveButtonText}>{isEditing ? 'Perbarui Data' : 'Simpan Data'}</Text>
                            </TouchableOpacity>
                        </View>
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
        borderColor: Colors.disturbanceYellow,
        backgroundColor: '#fff8e5',
    },
    optionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textDark,
    },
    optionButtonTextActive: {
        color: Colors.disturbanceYellow,
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
        backgroundColor: Colors.disturbanceYellow,
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
