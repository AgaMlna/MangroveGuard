import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
    // Router and incoming params (used to prefill the edit form)
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, name: initialName, coordinates: initialCoordinates, accuration: initialAccuration } = params;

    const normalizeParam = (p: any) => {
        if (Array.isArray(p)) return p[0] ?? '';
        return p ?? '';
    };

    const [name, setName] = useState<string>(normalizeParam(initialName));
    const [location, setLocation] = useState<string>(normalizeParam(initialCoordinates));
    const [accuration, setAccuration] = useState<string>(normalizeParam(initialAccuration));

    // Get current location
    const getCoordinates = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const coords = location.coords.latitude + ',' + location.coords.longitude;
        setLocation(coords);

        const accuracy = location.coords.accuracy;
        setAccuration(accuracy + ' m');
    };

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAPmGLyMQWh17wtcBexJm8vulBvBi8yxak",
        authDomain: "mangroveapp-d5409.firebaseapp.com",
        databaseURL: "https://mangroveapp-d5409-default-rtdb.firebaseio.com",
        projectId: "mangroveapp-d5409",
        storageBucket: "mangroveapp-d5409.firebasestorage.app",
        messagingSenderId: "406030584238",
        appId: "1:406030584238:web:830b3278b345eff2d1e03f",
        measurementId: "G-RT0BCEFHET"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // Handle update
    const handleUpdate = () => {
        if (!id) {
            Alert.alert("Error", "ID lokasi tidak ditemukan.");
            return;
        }
        if (!name.trim()) {
            Alert.alert("Validasi", "Nama tidak boleh kosong");
            return;
        }
        if (!location.trim()) {
            Alert.alert("Validasi", "Koordinat tidak boleh kosong");
            return;
        }
        
        const pointRef = ref(db, `points/${id}`);
        update(pointRef, {
            name: name,
            coordinates: location,
            accuration: accuration,
        }).then(() => {
            Alert.alert("Sukses", "Data berhasil diperbarui");
            router.back();
        }).catch((e) => {
            console.error("Error updating document: ", e);
            Alert.alert("Error", "Gagal memperbarui data: " + e.message);
        });
    };

    return (
        <SafeAreaProvider style={{ backgroundColor: 'white' }}>
            <SafeAreaView>
                <Stack.Screen options={{ title: 'Form Edit Location' }} />

                <Text style={styles.inputTitle}>Nama</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Isikan nama objek'
                    value={name}
                    onChangeText={setName}
                />
                <Text style={styles.inputTitle}>Koordinat</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Isikan koordinat (contoh: -6.200000,106.816666)"
                    value={location}
                    onChangeText={setLocation}
                />
                <Text style={styles.inputTitle}>Accuration</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Isikan accuration (contoh: 5 meter)"
                    value={accuration}
                    onChangeText={setAccuration}
                />
                <View style={styles.button}>
                    <Button
                        title="Get Current Location"
                        onPress={getCoordinates}
                    />
                </View>
                <View style={styles.button}>
                    <Button
                        title="Save"
                        onPress={handleUpdate}
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};


const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
    },
    inputTitle: {
        marginLeft: 12,
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        margin: 12,
    }
});


export default App;
