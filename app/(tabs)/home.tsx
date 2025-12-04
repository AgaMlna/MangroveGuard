import { Image } from 'expo-image';
// Mengganti ThemedText/ThemedView dengan komponen dasar untuk kemudahan implementasi
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, onValue, ref, update } from 'firebase/database';

// Dapatkan dimensi layar untuk styling responsif
const screenWidth = Dimensions.get('window').width;

// Konstanta Warna Tema Mangrove
const Colors = {
  backgroundLight: '#e0ffe0',
  backgroundDark: '#557458', // Hijau tua, gradien bawah
  backgroundTop: '#7aa07c',   // Hijau muda, gradien atas
  cardBackground: 'rgba(255, 255, 255, 0.95)', // Putih transparan
  primaryGreen: '#4d8a50',
  textLight: '#f0f0f0',
  textDark: '#303030',
};

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
const db = getDatabase(app);
const auth = getAuth(app);

// Komponen Utama
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [totalObservations, setTotalObservations] = useState<number>(0);
  const [totalPollution, setTotalPollution] = useState<number>(0);
  const [totalDisturbance, setTotalDisturbance] = useState<number>(0);
  const [totalOtherSightings, setTotalOtherSightings] = useState<number>(0);
  const [unsynced, setUnsynced] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const pointsRef = ref(db, 'points/');
    const pollutionRef = ref(db, 'pollution/');
    const disturbanceRef = ref(db, 'disturbance/');
    const otherSightingsRef = ref(db, 'other_sightings/');

    const unsubscribePoints = onValue(pointsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.values(data) as any[];
        const syncedObservations = entries.filter(e => e && (e as any).synced === true).length;
        setTotalObservations(syncedObservations);
        const uns = entries.filter(e => e && (e as any).synced === false).length;
        setUnsynced(uns);
      } else {
        setTotalObservations(0);
        setUnsynced(0);
      }
    }, (e) => {
      console.error(e);
    });

    const unsubscribePollution = onValue(pollutionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTotalPollution(Object.values(data).length);
      } else {
        setTotalPollution(0);
      }
    }, (e) => {
      console.error(e);
    });

    const unsubscribeDisturbance = onValue(disturbanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTotalDisturbance(Object.values(data).length);
      } else {
        setTotalDisturbance(0);
      }
    }, (e) => {
      console.error(e);
    });

    const unsubscribeOtherSightings = onValue(otherSightingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTotalOtherSightings(Object.values(data).length);
      } else {
        setTotalOtherSightings(0);
      }
    }, (e) => {
      console.error(e);
    });

    return () => {
      unsubscribePoints();
      unsubscribePollution();
      unsubscribeDisturbance();
      unsubscribeOtherSightings();
    };
  }, []);

  // Handlers
  const handleSync = async () => {
    setSyncing(true);
    try {
      const pointsRef = ref(db, 'points/');
      // read once and update items without synced flag
      onValue(pointsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          Alert.alert('Sync', 'Tidak ada data untuk disinkronkan.');
          setSyncing(false);
          return;
        }
        const keys = Object.keys(data);
        let updated = 0;
        keys.forEach(key => {
          const item = data[key];
          if (!item || item.synced === true) return;
          update(ref(db, `points/${key}`), { synced: true }).then(() => updated++).catch(() => {});
        });
        Alert.alert('Sync', `Sinkronisasi selesai. Diperbarui: ${updated} item.`);
        setSyncing(false);
      }, { onlyOnce: true });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Gagal melakukan sinkronisasi.');
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error: any) {
      console.error('Logout Error:', error);
      Alert.alert('Logout Failed', error.message || 'An error occurred during logout.');
    }
  };

  // Fungsi dummy untuk navigasi
  const handleNavigation = (screen: string) => {
    console.log(`Navigasi ke: ${screen}`);
    // Di aplikasi nyata, Anda akan menggunakan router di sini, contoh: router.push(screen)
  };

  return (
    <>
      <StatusBar 
        style="dark"
        translucent
        backgroundColor="transparent"
      />
  
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.backgroundTop }}>
        <LinearGradient
          colors={[Colors.backgroundTop, Colors.backgroundDark]}
          style={styles.container}
        >
  
          <View style={[styles.safeArea, { paddingTop: insets.top + 10 }]}>
  
            {/* === 1. HEADER === */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@/assets/images/mangrove_logo.png')}
                  style={styles.logo}
                  contentFit="contain"
                />
                <Text style={styles.appName}>MangroveGuard</Text>
              </View>
  
              <TouchableOpacity
                style={styles.syncButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color={Colors.textLight} />
                <Text style={styles.syncText}>LOGOUT</Text>
              </TouchableOpacity>
            </View>
  
            {/* === 2. CARD === */}
            <View style={styles.mainCardContainer}>
              <Image
                source={require('@/assets/images/mangrove_scene.jpg')}
                style={styles.mainImage}
                contentFit="cover"
              />
  
              <View style={styles.overlay}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => router.push('/forminput')}
                >
                  <Ionicons 
                    name="add-circle-outline"
                    size={24}
                    color={Colors.textLight}
                  />
                  <Text style={styles.buttonText}>START NEW PLOT</Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => router.push('/maps')}
                >
                  <Ionicons name="map-outline" size={20} color={Colors.primaryGreen} />
                  <Text style={styles.mapButtonText}>VIEW PROJECT MAP</Text>
                </TouchableOpacity>
              </View>
            </View>
  
            {/* === 3. STATISTIK === */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="eye-outline" size={30} color={Colors.textLight} />
                <Text style={styles.statLabel}>TOTAL OBSERVATIONS: {totalObservations}</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="trash-outline" size={30} color={Colors.textLight} />
                <Text style={styles.statLabel}>TOTAL POLLUTION: {totalPollution}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="warning-outline" size={30} color={Colors.textLight} />
                <Text style={styles.statLabel}>TOTAL DISTURBANCE: {totalDisturbance}</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="leaf-outline" size={30} color={Colors.textLight} />
                <Text style={styles.statLabel}>OTHER SIGHTINGS: {totalOtherSightings}</Text>
              </View>
            </View>
  
          </View>
  
          {/* === 4. NAVBAR === */}
          <View style={styles.bottomNavContainer}>
            <LinearGradient
              colors={['#84c489', Colors.primaryGreen]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bottomNav}
            >
              <NavButton iconName="home" label="HOME" onPress={() => handleNavigation('Home')} isActive />
              <NavButton iconName="leaf-outline" label="LEARN" onPress={() => handleNavigation('Learn')} />
              <NavButton iconName="add-circle" label="NEW PLOT" onPress={() => handleNavigation('New Plot')} />
              <NavButton iconName="list" label="MY DATA" onPress={() => handleNavigation('My Data')} />
              <NavButton iconName="map" label="MAP" onPress={() => handleNavigation('Map')} />
            </LinearGradient>
          </View>
  
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

// Komponen Pembantu untuk Tombol Navigasi Bawah
interface NavButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isActive?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ iconName, label, onPress, isActive = false }) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress}>
    <Ionicons 
        name={iconName} 
        size={24} 
        color={isActive ? Colors.textLight : 'rgba(255, 255, 255, 0.7)'} 
    />
    <Text style={[styles.navText, isActive && { fontWeight: 'bold' }]}>{label}</Text>
  </TouchableOpacity>
);


// === STYLESHEET ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // 1. HEADER
    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
    tintColor: Colors.textLight,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLight,
    
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  syncText: {
    color: Colors.textLight,
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
  },

  // 2. CARD AKSI UTAMA
  mainCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    // Menyesuaikan lebar kartu agar tidak terlalu lebar
    width: screenWidth * 0.9, 
    alignSelf: 'center',
    paddingTop: 40,
  },

  
  mainImage: {
    width: '100%',
    height: 200, // Ketinggian gambar utama
    position: 'relative',
    borderTopLeftRadius: 20, // Radius sudut kiri atas
    borderTopRightRadius: 20, // Radius sudut kanan atas
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 15,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGreen,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexGrow: 1, // Memungkinkan tombol ini tumbuh
    marginRight: 10,
    justifyContent: 'center',
  },
  mapButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    padding: 10,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.textLight,
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: 14,
  },
  mapButtonText: {
    color: Colors.primaryGreen,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 3,
  },

  // 3. STATISTIK RINGKAS
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 0,
    paddingHorizontal: 15, // tambahkan padding agar ada jarak lebih besar antar kotak
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 5,
    width: (screenWidth * 0.9 / 2) - 25, // kurangi agar ada jarak antar kotak 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statLabel: {
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center'
  },

  // 4. BOTTOM NAVIGATION BAR
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 0, // Padding bottom akan di handle oleh SafeAreaView di komponen luar
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    paddingHorizontal: 5,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  navText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
});