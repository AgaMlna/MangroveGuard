import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { get, push, ref as databaseRef, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db, storage } from '../lib/firebase';

const Colors = {
    backgroundTop: '#7aa07c',
    backgroundDark: '#557458',
    primaryGreen: '#4d8a50',
    otherSightingsBlue: '#3498db',
    textLight: '#f0f0f0',
    textDark: '#333333',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
};

const sightingCategories = ['Satwa', 'Hama', 'Spesies Langka', 'Lainnya'];
const rarityOptions = ['Umum', 'Dilindungi', 'Langka'];

export default function FormInputOtherSightings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { recordId } = useLocalSearchParams<{ recordId?: string }>();

    const [sightingCategory, setSightingCategory] = useState(sightingCategories[0]);
    const [customCategory, setCustomCategory] = useState('');
    const [speciesName, setSpeciesName] = useState('');
    const [population, setPopulation] = useState('');
    const [behavior, setBehavior] = useState('');
    const [rarity, setRarity] = useState<'Umum' | 'Dilindungi' | 'Langka' | ''>('');
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
        const recordRef = databaseRef(db, `other_sightings/${recordId}`);
        get(recordRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setSightingCategory(sightingCategories.includes(data.category) ? data.category : 'Lainnya');
                    if (!sightingCategories.includes(data.category) && data.category) {
                        setCustomCategory(data.category);
                    }
                    setSpeciesName(data.speciesName || data.type || '');
                    setPopulation(data.population || '');
                    setBehavior(data.behavior || '');
                    setRarity(data.rarity || '');
                    setNotes(data.notes || data.description || '');
                    setLatitude(data.latitude ? String(data.latitude) : data.coordinates?.split(',')[0] || '');
                    setLongitude(data.longitude ? String(data.longitude) : data.coordinates?.split(',')[1] || '');
                    setAccuracy(data.accuracy || '');
                    if (data.photoUrl) {
                        setPhotoUri(data.photoUrl);
                        setRemotePhotoUrl(data.photoUrl);
                    }
                }
            })
            .catch(() => Alert.alert('Error', 'Gagal memuat data temuan.'))
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
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Dibutuhkan', 'Berikan akses galeri untuk mengunggah foto.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled && result.assets?.length) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const uploadImageIfNeeded = async () => {
        if (!photoUri) return '';
        if (photoUri === remotePhotoUrl) return remotePhotoUrl;
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const fileRef = storageRef(storage, `other_sightings/${Date.now()}.jpg`);
        await uploadBytes(fileRef, blob);
        return getDownloadURL(fileRef);
    };

    const handleSave = async () => {
        if (sightingCategory === 'Lainnya' && !customCategory.trim()) {
            Alert.alert('Validasi', 'Masukkan jenis temuan lainnya.');
            return;
        }
        if (!speciesName.trim()) {
            Alert.alert('Validasi', 'Nama satwa atau temuan wajib diisi.');
            return;
        }
        if (!population.trim()) {
            Alert.alert('Validasi', 'Jumlah/estimasi populasi wajib diisi.');
            return;
        }
        if (!rarity) {
            Alert.alert('Validasi', 'Status kelangkaan wajib dipilih.');
            return;
        }
        if (!latitude || !longitude) {
            Alert.alert('Validasi', 'Ambil lokasi GPS terlebih dahulu.');
            return;
        }
        if (!photoUri) {
            Alert.alert('Validasi', 'Foto dokumentasi wajib diunggah.');
            return;
        }

        try {
            setSubmitting(true);
            const finalPhotoUrl = await uploadImageIfNeeded();
            const payload = {
                category: sightingCategory === 'Lainnya' ? customCategory.trim() : sightingCategory,
                speciesName: speciesName.trim(),
                population: population.trim(),
                behavior: behavior.trim(),
                rarity,
                notes: notes.trim(),
                latitude,
                longitude,
                accuracy,
                coordinates: `${latitude},${longitude}`,
                photoUrl: finalPhotoUrl,
                timestamp: new Date().toISOString(),
                type: sightingCategory,
            };

            if (isEditing && recordId) {
                await update(databaseRef(db, `other_sightings/${recordId}`), payload);
                Alert.alert('Sukses', 'Data temuan diperbarui.');
            } else {
                await push(databaseRef(db, 'other_sightings/'), payload);
                Alert.alert('Sukses', 'Data temuan tersimpan.');
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
            <Stack.Screen options={{ title: 'Record Other Sightings', headerShown: false }} />
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Other Sightings' : 'Record Other Sightings'}</Text>
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
                            <Text style={styles.label}>Jenis Temuan *</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={sightingCategory}
                                    onValueChange={(value) => setSightingCategory(value)}
                                >
                                    {sightingCategories.map((option) => (
                                        <Picker.Item key={option} label={option} value={option} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                        {sightingCategory === 'Lainnya' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Jenis Temuan Lain *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tulis jenis temuan"
                                    placeholderTextColor="#999"
                                    value={customCategory}
                                    onChangeText={setCustomCategory}
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nama Satwa / Temuan *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: Bangau tongtong"
                                placeholderTextColor="#999"
                                value={speciesName}
                                onChangeText={setSpeciesName}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.rowItem]}>
                                <Text style={styles.label}>Jumlah / Estimasi *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contoh: ±5 individu"
                                    placeholderTextColor="#999"
                                    value={population}
                                    onChangeText={setPopulation}
                                />
                            </View>
                            <View style={[styles.inputGroup, styles.rowItem]}>
                                <Text style={styles.label}>Status Kelangkaan *</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker selectedValue={rarity} onValueChange={(value) => setRarity(value)}>
                                        <Picker.Item label="Pilih status" value="" />
                                        {rarityOptions.map((option) => (
                                            <Picker.Item key={option} label={option} value={option} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Perilaku / Kondisi Saat Dilihat</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: sedang mencari makan, migrasi, agresif"
                                placeholderTextColor="#999"
                                value={behavior}
                                onChangeText={setBehavior}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Catatan / Deskripsi</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Informasi tambahan, interaksi dengan manusia, dsb."
                                placeholderTextColor="#999"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Foto Dokumentasi *</Text>
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
                            <Text style={styles.label}>Lokasi GPS *</Text>
                            <View style={styles.locationBox}>
                                <Text style={styles.locationText}>Latitude: {latitude || '-'}</Text>
                                <Text style={styles.locationText}>Longitude: {longitude || '-'}</Text>
                                <Text style={styles.locationText}>Akurasi: {accuracy || '-'}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.gpsButton, { backgroundColor: Colors.otherSightingsBlue }]}
                                onPress={getCoordinates}
                            >
                                <Ionicons name="locate" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.gpsButtonText}>
                                    {isEditing ? 'Update Location' : 'Get GPS Coordinates'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: Colors.otherSightingsBlue, opacity: submitting ? 0.7 : 1 }]}
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    rowItem: {
        flex: 1,
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
        backgroundColor: Colors.otherSightingsBlue,
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
