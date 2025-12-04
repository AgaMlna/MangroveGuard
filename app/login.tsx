import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


// Firebase Auth
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase Config (same project)
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Colors = {
    backgroundLight: '#e0ffe0',
    backgroundDark: '#557458',
    backgroundTop: '#7aa07c',
    primaryGreen: '#4d8a50',
    textLight: '#f0f0f0',
    textDark: '#303030',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
    accentRed: '#e74c3c',
};

export default function LoginPage() {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert('Success', 'Logged in successfully!');
            router.replace('/(tabs)/home');
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        const auth = getAuth(); // Ambil instance Auth

        if (password.length < 6) {
            Alert.alert("Error", "Kata sandi harus minimal 6 karakter.");
            setLoading(false);
            return;
        }

        try {
            // --- FUNGSI UTAMA UNTUK PENDAFTARAN ---
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Pendaftaran berhasil
            const user = userCredential.user;
            console.log("Pendaftaran Berhasil! UID Pengguna:", user.uid);
            Alert.alert('Success', 'Account created and logged in!');
            router.replace('/(tabs)/home');

        } catch (error: any) {
            // Pendaftaran gagal
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/email-already-in-use') {
                Alert.alert('Sign Up Failed', 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.');
            } else if (errorCode === 'auth/invalid-email') {
                Alert.alert('Sign Up Failed', 'Format email tidak valid.');
            } else {
                console.error("Gagal Mendaftar:", errorMessage);
                Alert.alert(`Pendaftaran gagal`, errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }; return (
        <LinearGradient colors={[Colors.backgroundTop, Colors.backgroundDark]} style={styles.container}>
            <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome!</Text>
                    <Text style={styles.subtitle}>Sign in to continue to MangroveGuard</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Ionicons name="mail-outline" size={20} color={Colors.textDark} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.textDark}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.textDark} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={Colors.textDark}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textDark} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={isRegistering ? handleSignUp : handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{isRegistering ? 'Sign Up' : 'Login'}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPasswordButton}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}></Text>
                    <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                        <Text style={styles.toggleText}>
                            {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.textLight,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: 8,
        opacity: 0.8,
    },
    formContainer: {
        width: '100%',
        backgroundColor: Colors.cardBackground,
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 50,
        borderColor: Colors.primaryGreen,
        borderWidth: 1,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: Colors.textDark,
        fontSize: 16,
    },
    passwordToggle: {
        padding: 5,
    },
    button: {
        backgroundColor: Colors.primaryGreen,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        height: 50,
    },
    buttonText: {
        color: Colors.textLight,
        fontSize: 13,
        fontWeight: 'bold',
    },
    forgotPasswordButton: {
        marginTop: 20,
    },
    forgotPasswordText: {
        color: Colors.textLight,
        fontSize: 14,
        opacity: 0.7,
    },
    signupContainer: {
        flexDirection: 'row',
        marginTop: 5,
        alignItems: 'center',
    },
    signupText: {
        color: Colors.textLight,
        fontSize: 14,
        opacity: 0.7,
    },
    toggleText: {
        color: Colors.textLight,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
