import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
// Pastikan Anda menginstal @expo/vector-icons dan ionicions
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons'; 
import { LinearGradient } from 'expo-linear-gradient'; // Anda mungkin perlu menginstalnya

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme'; // Menggunakan Colors yang sudah ada
import { useColorScheme } from '@/hooks/use-color-scheme';

// --- DEFINISI WARNA TEMA MANGROVE ---
// Menggunakan warna yang sama dari desain Home Screen sebelumnya.
const MangroveColors = {
  primaryGreen: '#4d8a50', // Warna Hijau Utama (Aktif)
  secondaryGreen: '#84c489', // Warna Hijau Muda (Gradien)
  textLight: '#f0f0f0', // Teks/Ikon Putih
  iconInactive: 'rgba(255, 255, 255, 0.7)', // Ikon Tidak Aktif
};

// --- KOMPONEN CUSTOM TAB BAR BACKGROUND ---
// Komponen ini akan digunakan sebagai pengganti latar belakang Tab Bar
const TabBarBackground = () => (
    <View style={styles.tabBarBackgroundContainer}>
        <LinearGradient
            colors={[MangroveColors.secondaryGreen, MangroveColors.primaryGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBackground}
        />
    </View>
);


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // Warna aktif ikon menggunakan warna hijau utama/putih terang
        tabBarActiveTintColor: MangroveColors.textLight,
        // Warna tidak aktif menggunakan warna putih transparan
        tabBarInactiveTintColor: MangroveColors.iconInactive, 
        
        headerShown: false,
        tabBarButton: HapticTab,
        
        // --- STYLING TAB BAR ---
        tabBarStyle: {
            backgroundColor: 'transparent', // Penting agar gradient terlihat
            borderTopWidth: 0, // Hapus garis atas default
            elevation: 0,
            height: 70 + (Platform.OS === 'ios' ? 30 : 0), // Sesuaikan tinggi + safe area iOS
            position: 'absolute', // Penting untuk tampilan custom
        },
        // Mengganti latar belakang dengan komponen LinearGradient
        tabBarBackground: () => <TabBarBackground />, 
      }}>
      
      {/* 1. HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home', // Ganti menjadi huruf besar sesuai desain
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      
      {/* 2. LEARN */}
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          // Menggunakan Ionicons untuk konsistensi dengan New Plot/Map
          tabBarIcon: ({ color }) => <Ionicons name="leaf-outline" size={24} color={color} />, 
        }}
      />
      
      {/* 3. NEW PLOT (Ganti 'record' menjadi 'newplot' atau 'record' dengan ikon Add) */}
      <Tabs.Screen
        name="record" // Jika nama file di folder app adalah 'record.tsx'
        options={{
          title: 'Record',
          // Ikon Plus sesuai desain Home Screen
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={28} color={color} />, 
        }}
      />
      
      {/* 4. MY DATA (Ganti 'myrecord' menjadi 'mydata' atau 'myrecord' dengan ikon List) */}
      <Tabs.Screen
        name="myrecord" 
        options={{
          title: 'My Records',
          // Ikon List
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />, 
        }}
      />
      
      {/* 5. MAPS */}
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Maps',
          // Ikon Map
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

// --- STYLESHEET ---

const styles = StyleSheet.create({
    // Container untuk menampung LinearGradient
    tabBarBackgroundContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70 + (Platform.OS === 'ios' ? 30 : 0), // Sesuaikan tinggi + safe area iOS
        overflow: 'hidden',
    },
    // Style untuk LinearGradient yang meniru style 'bottomNav' di Home Screen
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 70, // Tinggi aktual tab bar
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
        // Pindahkan ke atas jika di iOS agar menghindari safe area
        transform: [{ translateY: Platform.OS === 'ios' ? 0 : 0 }], 
    },
});