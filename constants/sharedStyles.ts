import { StyleSheet } from 'react-native';

// --- COLOR CONSTANTS (TEMA MANGROVE) ---
export const MangroveColors = {
    backgroundTop: '#7aa07c',
    backgroundDark: '#557458',
    primaryGreen: '#4d8a50',
    textLight: '#f0f0f0',
    textDark: '#333333',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
    searchBackground: 'rgba(255, 255, 255, 0.95)',
    iconInactive: 'rgba(255, 255, 255, 0.7)',
    navActive: '#f0f0f0',
    navInactive: 'rgba(255, 255, 255, 0.7)',
    navBarGradientStart: '#84c489',
};

// --- SHARED HEADER STYLES ---
export const sharedHeaderStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 0,
        paddingHorizontal: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 30,
        height: 30,
        marginRight: 8,
        tintColor: MangroveColors.textLight,
    },
    appName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: MangroveColors.textLight,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    syncButtonGreen: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MangroveColors.primaryGreen,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    syncText: {
        color: MangroveColors.textLight,
        marginLeft: 5,
        fontSize: 12,
        fontWeight: '600',
    },
});

// --- SHARED BOTTOM NAVIGATION STYLES ---
export const sharedBottomNavStyles = StyleSheet.create({
    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 70,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 15,
    },
    navButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    navText: {
        fontSize: 10,
        color: MangroveColors.navInactive,
        marginTop: 2,
        fontWeight: '500',
    },
    navTextActive: {
        fontSize: 10,
        color: MangroveColors.navActive,
        marginTop: 2,
        fontWeight: 'bold',
    },
});

