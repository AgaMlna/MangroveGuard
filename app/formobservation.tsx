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
    observationGreen: '#4d8a50',
    textLight: '#f0f0f0',
    textDark: '#333333',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
};

const speciesOptions = [
    'Rhizophora mucronata',
    'Rhizophora apiculata',
    'Avicennia marina',
    'Bruguiera gymnorrhiza',
    'Sonneratia alba',
    'Nypa fruticans',
    'Ceriops tagal',
    'Other'
];

export default function FormObservation() {
    const router = useRouter();
    const { recordId } = useLocalSearchParams<{ recordId?: string }>();
    const insets = useSafeAreaInsets();

    const [plotName, setPlotName] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState(speciesOptions[0]);
    const [customSpecies, setCustomSpecies] = useState('');
    const [dbh, setDbh] = useState('');
    const [height, setHeight] = useState('');
    const [density, setDensity] = useState('');
    const [healthStatus, setHealthStatus] = useState<'Sehat' | 'Sedang Stres' | 'Mati' | ''>('');
    const [substrate, setSubstrate] = useState<'Lumpur' | 'Pasir' | 'Campuran' | ''>('');
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

        const recordRef = databaseRef(db, `points/${recordId}`);
        get(recordRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setPlotName(data.name || '');
                    setSelectedSpecies(speciesOptions.includes(data.species) ? data.species : 'Other');
                    if (!speciesOptions.includes(data.species) && data.species) {
                        setCustomSpecies(data.species);
                    }
                    setDbh(data.dbh || '');
                    setHeight(data.height || '');
                    setDensity(data.density || '');
                    setHealthStatus(data.healthStatus || '');
                    setSubstrate(data.substrate || '');
                    setNotes(data.notes || data.description || '');
                    if (data.latitude && data.longitude) {
                        setLatitude(String(data.latitude));
                        setLongitude(String(data.longitude));
                    } else if (typeof data.coordinates === 'string') {
                        const [lat, lon] = data.coordinates.split(',');
                        setLatitude(lat?.trim() || '');
                        setLongitude(lon?.trim() || '');
                    }
                    setAccuracy(data.accuracy || data.accuration || '');
                    if (data.photoUrl) {
                        setPhotoUri(data.photoUrl);
                        setRemotePhotoUrl(data.photoUrl);
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                Alert.alert('Error', 'Gagal memuat data observasi.');
            })
            .finally(() => setLoadingRecord(false));
    }, [recordId]);

    const getCoordinates = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Izin untuk mengakses lokasi ditolak.');
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
            Alert.alert('Izin Dibutuhkan', 'Izin galeri diperlukan untuk mengunggah foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // Explicitly set allowsEditing to false for library pick
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Izin Dibutuhkan', 'Izin kamera diperlukan untuk mengambil foto.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const showImagePickerOptions = () => {
        Alert.alert(
            'Pilih Foto',
            'Pilih sumber foto:',
            [
                {
                    text: 'Ambil Foto',
                    onPress: takePhoto,
                },
                {
                    text: 'Pilih dari Galeri',
                    onPress: pickImage,
                },
                {
                    text: 'Batal',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const uploadImageIfNeeded = async () => {
        if (!photoUri) return '';
        if (photoUri === remotePhotoUrl) return remotePhotoUrl;

        const response = await fetch(photoUri);
        const blob = await response.blob();
        const fileRef = storageRef(storage, `observations/${Date.now()}.jpg`);
        await uploadBytes(fileRef, blob);
        return getDownloadURL(fileRef);
    };

    const handleSave = async () => {
        if (!plotName.trim()) {
            Alert.alert('Validasi', 'Nama plot wajib diisi.');
            return;
        }
        if (!selectedSpecies && !customSpecies.trim()) {
            Alert.alert('Validasi', 'Jenis mangrove wajib dipilih.');
            return;
        }
        if (selectedSpecies === 'Other' && !customSpecies.trim()) {
            Alert.alert('Validasi', 'Masukkan nama spesies lainnya.');
            return;
        }
        if (!dbh.trim() || !height.trim() || !density.trim()) {
            Alert.alert('Validasi', 'DBH, tinggi, dan kerapatan wajib diisi.');
            return;
        }
        if (!healthStatus) {
            Alert.alert('Validasi', 'Pilih kondisi kesehatan mangrove.');
            return;
        }
        if (!substrate) {
            Alert.alert('Validasi', 'Pilih kondisi substrat.');
            return;
        }
        if (!latitude || !longitude) {
            Alert.alert('Validasi', 'Lokasi GPS wajib diambil.');
            return;
        }

        try {
            setSubmitting(true);
            const finalPhotoUrl = await uploadImageIfNeeded();

            const payload = {
                name: plotName.trim(),
                species: selectedSpecies === 'Other' ? customSpecies.trim() : selectedSpecies,
                dbh: dbh.trim(),
                height: height.trim(),
                density: density.trim(),
                healthStatus,
                substrate,
                notes: notes.trim(),
                description: notes.trim(),
                photoUrl: finalPhotoUrl,
                latitude,
                longitude,
                accuracy,
                coordinates: `${latitude},${longitude}`,
                timestamp: new Date().toISOString(),
                category: 'observation',
            };

            if (isEditing && recordId) {
                const recordRef = databaseRef(db, `points/${recordId}`);
                await update(recordRef, payload);
                Alert.alert('Sukses', 'Data observasi berhasil diperbarui.');
            } else {
                const pointsRef = databaseRef(db, 'points/');
                await push(pointsRef, payload);
                Alert.alert('Sukses', 'Data observasi berhasil disimpan.');
            }
            router.back();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message ?? 'Gagal menyimpan data.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LinearGradient colors={[Colors.backgroundTop, Colors.backgroundDark]} style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: 'Record Observation',
                    headerShown: false,
                }}
            />
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Observation' : 'Record Observation'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loadingRecord ? (
                    <View style={styles.loaderWrapper}>
                        <ActivityIndicator size="large" color={Colors.textLight} />
                        <Text style={{ color: Colors.textLight, marginTop: 10 }}>Memuat data...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nama Plot / ID *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: Plot A1, Re-survey Plot B2"
                                placeholderTextColor="#999"
                                value={plotName}
                                onChangeText={setPlotName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Jenis Mangrove *</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedSpecies}
                                    onValueChange={(value) => setSelectedSpecies(value)}
                                >
                                    {speciesOptions.map((option) => (
                                        <Picker.Item key={option} label={option} value={option} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {selectedSpecies === 'Other' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nama Spesies Lainnya *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan nama spesies"
                                    placeholderTextColor="#999"
                                    value={customSpecies}
                                    onChangeText={setCustomSpecies}
                                />
                            </View>
                        )}

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.rowItem]}>
                                <Text style={styles.label}>DBH (cm) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Diameter"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                    value={dbh}
                                    onChangeText={setDbh}
                                />
                            </View>
                            <View style={[styles.inputGroup, styles.rowItem]}>
                                <Text style={styles.label}>Tinggi (m) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tinggi pohon"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                    value={height}
                                    onChangeText={setHeight}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Kerapatan / Jumlah Pohon *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: 25 pohon dalam 10x10 m"
                                placeholderTextColor="#999"
                                value={density}
                                onChangeText={setDensity}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Kondisi Kesehatan *</Text>
                            <View style={styles.optionRow}>
                                {['Sehat', 'Sedang Stres', 'Mati'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.optionButton,
                                            healthStatus === status && styles.optionButtonActive
                                        ]}
                                        onPress={() => setHealthStatus(status as any)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionButtonText,
                                                healthStatus === status && styles.optionButtonTextActive
                                            ]}
                                        >
                                            {status}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Kondisi Substrat *</Text>
                            <View style={styles.optionRow}>
                                {['Lumpur', 'Pasir', 'Campuran'].map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={[
                                            styles.optionButton,
                                            substrate === item && styles.optionButtonActive
                                        ]}
                                        onPress={() => setSubstrate(item as any)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionButtonText,
                                                substrate === item && styles.optionButtonTextActive
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Catatan Tambahan</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Observasi lapangan, kondisi umum, tindakan lanjutan"
                                    placeholderTextColor="#999"
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Foto Lapangan (opsional)</Text>
                            <View style={styles.photoSection}>
                                {photoUri ? (
                                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <Ionicons name="image" size={32} color="#777" />
                                        <Text style={{ color: '#777', marginTop: 6 }}>Belum ada foto</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.photoButton} onPress={showImagePickerOptions}>
                                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
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
                                style={[styles.gpsButton, { backgroundColor: Colors.observationGreen }]}
                                onPress={getCoordinates}
                            >
                                <Ionicons name="locate" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.gpsButtonText}>
                                    {isEditing ? 'Update Location' : 'Get GPS Coordinates'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: Colors.observationGreen, opacity: submitting ? 0.7 : 1 }]}
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
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionButtonActive: {
        borderColor: Colors.observationGreen,
        backgroundColor: '#e8f5e9',
    },
    optionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textDark,
    },
    optionButtonTextActive: {
        color: Colors.observationGreen,
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
        borderColor: '#ddd',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    photoButton: {
        flexDirection: 'row',
        backgroundColor: Colors.observationGreen,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationBox: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    locationText: {
        color: Colors.textDark,
        fontSize: 14,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    saveButtonText: {
        color: Colors.textLight,
        fontWeight: 'bold',
        fontSize: 18,
        textTransform: 'uppercase',
    },
});
