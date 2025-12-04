import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();



export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = React.useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      SplashScreen.hideAsync();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isAuthReady]);

  if (!isAuthReady) {
    return null; // Or a loading spinner
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'Logged out successfully!');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

