import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import { ref as databaseRef, push } from 'firebase/database';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../lib/firebase';

const Colors = {
    backgroundTop: '#7aa07c',
    backgroundDark: '#557458',
    primaryGreen: '#4d8a50',
    observationGreen: '#4d8a50',
    textLight: '#f0f0f0',
    textDark: '#333333',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
};

export default function FormInputPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [plotName, setPlotName] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [accuracy, setAccuracy] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [savedPlotData, setSavedPlotData] = useState<any>(null);

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

    const handleSave = async () => {
        if (!plotName.trim()) {
            Alert.alert('Validasi', 'Nama plot wajib diisi.');
            return;
        }
        if (!latitude || !longitude) {
            Alert.alert('Validasi', 'Lokasi GPS wajib diambil.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: plotName.trim(),
                latitude,
                longitude,
                accuracy,
                coordinates: `${latitude},${longitude}`,
                timestamp: new Date().toISOString(),
            };

            const pointsRef = databaseRef(db, 'other_forms/');
            await push(pointsRef, payload);
            setSavedPlotData(payload);
            setIsModalVisible(true);
            // Alert.alert('Sukses', 'Data berhasil disimpan.');
            // router.back();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message ?? 'Gagal menyimpan data.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSavedPlotData(null);
        router.back();
    };

    return (
        <LinearGradient colors={[Colors.backgroundTop, Colors.backgroundDark]} style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: 'Form Input',
                    headerShown: false,
                }}
            />
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Rencana Observasi</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nama Observasi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Plot A1, Re-survey Plot B2"
                            placeholderTextColor="#999"
                            value={plotName}
                            onChangeText={setPlotName}
                        />
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
                            style={[styles.gpsButton, { backgroundColor: Colors.primaryGreen }]}
                            onPress={getCoordinates}
                        >
                            <Ionicons name="locate" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.gpsButtonText}>
                                Get GPS Coordinates
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: Colors.primaryGreen, opacity: submitting ? 0.7 : 1 }]}
                        onPress={handleSave}
                        disabled={submitting}
                    >
                        <Text style={styles.saveButtonText}>Simpan Data</Text>
                    </TouchableOpacity>
                </ScrollView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Data Plot Berhasil Disimpan!</Text>
                            {savedPlotData && (
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalLabel}>Nama Plot:</Text>
                                    <Text style={styles.modalValue}>{savedPlotData.name}</Text>
                                    <Text style={styles.modalLabel}>Latitude:</Text>
                                    <Text style={styles.modalValue}>{savedPlotData.latitude}</Text>
                                    <Text style={styles.modalLabel}>Longitude:</Text>
                                    <Text style={styles.modalValue}>{savedPlotData.longitude}</Text>
                                    <Text style={styles.modalLabel}>Akurasi:</Text>
                                    <Text style={styles.modalValue}>{savedPlotData.accuracy}</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: Colors.primaryGreen }]}
                                onPress={handleCloseModal}
                            >
                                <Text style={styles.modalButtonText}>Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
    content: {
        padding: 16,
        gap: 16,
    },
    inputGroup: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: Colors.textDark,
        backgroundColor: '#fff',
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
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    saveButtonText: {
        color: Colors.textLight,
        fontSize: 18,
        fontWeight: 'bold',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalContent: {
        width: '100%',
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: 5,
    },
    modalValue: {
        fontSize: 16,
        color: Colors.textDark,
        marginBottom: 10,
    },
    modalButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 10,
        width: 120,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});