import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    SafeAreaView,
    useSafeAreaInsets
} from 'react-native-safe-area-context';


// Hitung ukuran tombol untuk grid 2 kolom dengan spacing rapi
const { width } = Dimensions.get('window');
const horizontalPadding = 20 * 2; // padding kiri-kanan
const columnGap = 12; // jarak antar kolom
const buttonSize = (width - horizontalPadding - columnGap) / 2;


// Tema warna aplikasi
const Colors = {
    backgroundTop: '#7aa07c',
    backgroundDark: '#557458',

    primaryGreen: '#4d8a50',

    textLight: '#f0f0f0',
    textDark: '#333333',

    observationGreen: '#4d8a50',
    pollutionRed: '#e74c3c',
    disturbanceYellow: '#f39c12',
    otherSightingsBlue: '#3498db',

    navActive: '#ffffff',
    navInactive: 'rgba(255, 255, 255, 0.6)',
    navBarGradientStart: '#84c489',
};


// === NAV BUTTON ===
const NavButton = ({
    iconName,
    label,
    isActive
}: {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    isActive: boolean;
}) => (
    <TouchableOpacity style={styles.navButton}>
        <Ionicons
            name={iconName}
            size={24}
            color={isActive ? Colors.navActive : Colors.navInactive}
        />
        <Text style={isActive ? styles.navTextActive : styles.navTextInactive}>
            {label}
        </Text>
    </TouchableOpacity>
);


// Helper untuk mendapatkan warna soft dari warna asli
const getSoftColor = (color: string): { iconColor: string; bgColor: string } => {
    const colorMap: { [key: string]: { iconColor: string; bgColor: string } } = {
        [Colors.observationGreen]: { iconColor: '#7aa07c', bgColor: 'rgba(122, 160, 124, 0.15)' }, // Soft green
        [Colors.pollutionRed]: { iconColor: '#c97a7a', bgColor: 'rgba(201, 122, 122, 0.15)' }, // Soft red
        [Colors.disturbanceYellow]: { iconColor: '#d4a574', bgColor: 'rgba(212, 165, 116, 0.15)' }, // Soft yellow/orange
        [Colors.otherSightingsBlue]: { iconColor: '#7aa0c9', bgColor: 'rgba(122, 160, 201, 0.15)' }, // Soft blue
    };
    return colorMap[color] || { iconColor: color, bgColor: color + '20' };
};

// === RECORD BUTTON ===
const RecordButton = ({
    title,
    subtitle,
    icon,
    color,
    onPress
}: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
}) => {
    const { iconColor, bgColor } = getSoftColor(color);
    return (
        <TouchableOpacity style={styles.recordButton} onPress={onPress}>
            <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>

            <Text style={styles.recordButtonTitle}>{title}</Text>
            <Text style={styles.recordButtonSubtitle}>{subtitle}</Text>
        </TouchableOpacity>
    );
};


// === RECORD SCREEN ===
export default function RecordScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <LinearGradient
            colors={[Colors.backgroundTop, Colors.backgroundDark]}
            style={{ flex: 1 }}
        >
            <StatusBar style="light" backgroundColor={Colors.backgroundTop} />

            <View style={{ flex: 1 }}>
                <SafeAreaView
                    style={{
                        flex: 1,
                        paddingTop: insets.top,
                        backgroundColor: Colors.backgroundTop
                    }}
                >

                    {/* === MAIN CONTENT === */}
                    <View style={styles.content}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.pageTitle}>Choose Recording Type</Text>
                        </View>

                        <View style={styles.buttonGrid}>
                            <RecordButton
                                title="Record Observation"
                                subtitle="New Plot / Re-survey"
                                icon="leaf"
                                color={Colors.observationGreen}
                                onPress={() => router.push('/formobservation')}
                            />
                            <RecordButton
                                title="Record Pollution"
                                subtitle="Oil spill, trash, debris"
                                icon="trash"
                                color={Colors.pollutionRed}
                                onPress={() => router.push('/forminputpollution')}
                            />
                            <RecordButton
                                title="Record Disturbance"
                                subtitle="Illegal cutting, erosion, fire"
                                icon="warning"
                                color={Colors.disturbanceYellow}
                                onPress={() => router.push('/forminputdisturbance')}
                            />
                            <RecordButton
                                title="Other Sightings"
                                subtitle="Animals & rare species"
                                icon="eye"
                                color={Colors.otherSightingsBlue}
                                onPress={() => router.push('/forminputothersightings')}
                            />
                        </View>
                    </View>
                </SafeAreaView>


                {/* === BOTTOM NAV === */}
                <View style={styles.bottomNavContainer}>
                    <LinearGradient
                        colors={['rgba(132, 196, 137, 0.85)', 'rgba(77, 138, 80, 0.85)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bottomNav}
                    >
                        <NavButton iconName="home" label="HOME" isActive={false} />
                        <NavButton iconName="leaf-outline" label="LEARN" isActive={false} />
                        <NavButton iconName="add-circle" label="NEW PLOT" isActive={true} />
                        <NavButton iconName="list" label="MY DATA" isActive={false} />
                        <NavButton iconName="map" label="MAP" isActive={false} />
                    </LinearGradient>
                </View>

            </View>
        </LinearGradient>
    );
}



// === STYLES ===
const styles = StyleSheet.create({

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    titleContainer: {
        paddingBottom: 15,
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: Colors.textDark, // Warna hitam untuk kontras dengan latar belakang hijau
        marginBottom: 15,
        paddingTop: 10,
    },

    // Grid - Layout 2 kolom × 2 baris dengan spacing rapi
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
        columnGap: 12,
    },

    // Card Button - Tetap square berdasarkan buttonSize
    recordButton: {
        width: buttonSize,
        height: buttonSize,
        backgroundColor: '#F1F5F2',
        borderRadius: 16,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 16,
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    recordButtonTitle: {
        color: Colors.textDark,
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 0,
        marginBottom: 4,
    },
    recordButtonSubtitle: {
        color: '#6A6A6A',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 0,
    },


    // Bottom Nav - Semi-transparan dengan floating look
    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 0,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 70,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
        // Floating look dengan shadow ringan
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 0, // Hilangkan elevation untuk efek transparan
    },
    navButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    navTextActive: {
        color: Colors.navActive,
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 2,
    },
    navTextInactive: {
        color: Colors.navInactive,
        fontSize: 11,
        marginTop: 2,
    },
});
