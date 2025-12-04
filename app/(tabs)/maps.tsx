import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ref as databaseRef, onValue } from 'firebase/database';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../lib/firebase';

type SectionKey = 'observations' | 'pollution' | 'disturbance' | 'sightings' | 'other_forms' | 'planning_plots';

type MapRecord = {
    id: string;
    title: string;
    description?: string;
    latitude: number;
    longitude: number;
    category: SectionKey;
    photoUrl?: string;
};

const categoryColors: Record<SectionKey, string> = {
    observations: '#34a853',
    pollution: '#e74c3c',
    disturbance: '#f4c20d',
    sightings: '#4285f4',
    other_forms: '#000000',
    planning_plots: '#000000', // Black color for planning plots
};

const sectionMeta: Record<SectionKey, { path: string }> = {
    observations: { path: 'points/' },
    pollution: { path: 'pollution/' },
    disturbance: { path: 'disturbance/' },
    sightings: { path: 'other_sightings/' },
    other_forms: { path: 'other_forms/' },
    planning_plots: { path: 'planning_plots/' }, // Path for planning plots
};

const defaultRegion: Region = {
    latitude: -5.8364,
    longitude: 110.4495,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

type ClusterNode =
    | { type: 'marker'; record: MapRecord }
    | { type: 'cluster'; latitude: number; longitude: number; records: MapRecord[] };

export default function MapScreen() {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView | null>(null);

    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('satellite');
    const [mapRegion, setMapRegion] = useState<Region>(defaultRegion);
    const [records, setRecords] = useState<MapRecord[]>([]);
    const [loadingSources, setLoadingSources] = useState<Record<SectionKey, boolean>>({
        observations: true,
        pollution: true,
        disturbance: true,
        sightings: true,
        other_forms: true,
        planning_plots: true, // Add planning_plots to loading sources
    });
    const [selectedRecord, setSelectedRecord] = useState<MapRecord | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const configs = Object.entries(sectionMeta) as Array<[SectionKey, { path: string }]>;
        const unsubscribes = configs.map(([key, meta]) => {
            const ref = databaseRef(db, meta.path);
            return onValue(
                ref,
                (snapshot) => {
                    const data = snapshot.val();
                    const parsed: MapRecord[] = data
                        ? Object.keys(data)
                            .map((id) => parseRecord(key, id, data[id]))
                            .filter((item): item is MapRecord => item !== null)
                        : [];
                    setRecords((prev) => {
                        const others = prev.filter((item) => item.category !== key);
                        return [...others, ...parsed];
                    });
                    setLoadingSources((prev) => ({ ...prev, [key]: false }));
                },
                () => {
                    setLoadingSources((prev) => ({ ...prev, [key]: false }));
                    Alert.alert('Error', `Gagal memuat data ${key}`);
                }
            );
        });

        return () => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
    }, []);

    const isLoading = useMemo(() => Object.values(loadingSources).some(Boolean), [loadingSources]);

    const clusters = useMemo<ClusterNode[]>(() => clusterRecords(records, mapRegion), [records, mapRegion]);

    const handleZoom = (factor: number) => {
        const newRegion = {
            ...mapRegion,
            latitudeDelta: Math.max(0.005, mapRegion.latitudeDelta * factor),
            longitudeDelta: Math.max(0.005, mapRegion.longitudeDelta * factor),
        };
        setMapRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 200);
    };


    const handleClusterPress = (node: Extract<ClusterNode, { type: 'cluster' }>) => {
        const region = {
            ...mapRegion,
            latitude: node.latitude,
            longitude: node.longitude,
            latitudeDelta: mapRegion.latitudeDelta / 1.8,
            longitudeDelta: mapRegion.longitudeDelta / 1.8,
        };
        setMapRegion(region);
        mapRef.current?.animateToRegion(region, 250);
    };

    const handleNavigate = (record: MapRecord) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${record.latitude},${record.longitude}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Tidak bisa membuka Google Maps'));
    };

    const handleRecenter = () => {
        setMapRegion(defaultRegion);
        mapRef.current?.animateToRegion(defaultRegion, 250);
    };

    const handleMarkerPress = (record: MapRecord) => {
        setSelectedRecord(record);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedRecord(null);
    };


    if (isLoading) {
        return (
            <LinearGradient colors={['#7aa07c', '#557458']} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 8 }}>Memuat titik peta...</Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#7aa07c', '#557458']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top + 8 }}>
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.pageTitle}>Project Map</Text>
                </View>
                <View style={styles.container}>
                    <MapView
                        ref={(ref) => {
                            mapRef.current = ref;
                            return undefined;
                        }}
                        style={styles.map}
                        mapType={mapType}
                        region={mapRegion}
                        onRegionChangeComplete={(region) => setMapRegion(region)}
                        showsUserLocation
                        showsCompass
                        zoomControlEnabled
                    >
                        {clusters.map((node) =>
                            node.type === 'marker' ? (
                                <Marker
                                    key={node.record.id}
                                    coordinate={{ latitude: node.record.latitude, longitude: node.record.longitude }}
                                    pinColor={categoryColors[node.record.category]}
                                    onPress={() => handleMarkerPress(node.record)}
                                >
                                    <Callout tooltip>
                                        <View style={styles.callout}>
                                            <Text style={styles.calloutTitle}>{node.record.title}</Text>
                                            <Text style={styles.calloutSubtitle}>
                                                {node.record.category.toUpperCase()}
                                            </Text>
                                            {node.record.photoUrl && (
                                                <Image source={{ uri: node.record.photoUrl }} style={styles.calloutImage} />
                                            )}
                                            {node.record.description && (
                                                <Text style={styles.calloutDescription}>{node.record.description}</Text>
                                            )}
                                            <TouchableOpacity style={styles.calloutButton} onPress={() => handleNavigate(node.record)}>
                                                <Ionicons name="navigate" size={14} color="#fff" />
                                                <Text style={styles.calloutButtonText}>Navigate in Google Maps</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Callout>
                                </Marker>
                            ) : (
                                <Marker
                                    key={`cluster-${node.latitude}-${node.longitude}-${node.records.length}`}
                                    coordinate={{ latitude: node.latitude, longitude: node.longitude }}
                                    onPress={() => handleClusterPress(node)}
                                >
                                    <View style={styles.clusterBubble}>
                                        <Text style={styles.clusterCount}>{node.records.length}</Text>
                                    </View>
                                </Marker>
                            )
                        )}
                    </MapView>



                    <View style={[styles.mapControls, { top: insets.top + 30 }]} pointerEvents="box-none">
                        <View style={styles.basemapContainer}>
                            {(["standard", "satellite", "terrain"] as const).map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.basemapButton, mapType === type && styles.basemapButtonActive]}
                                    onPress={() => setMapType(type)}
                                >
                                    <Text style={[styles.basemapButtonText, mapType === type && styles.basemapButtonTextActive]}>
                                        {type.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.zoomControls}>
                            <TouchableOpacity style={styles.zoomButton} onPress={handleRecenter}>
                                <Ionicons name="location" size={17} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.fab} onPress={() => router.push('/forminput')}>
                        <FontAwesome name="plus" size={17} color="white" />
                    </TouchableOpacity>
                </View>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => {
                        setIsModalVisible(!isModalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>{selectedRecord?.title}</Text>
                            <Text style={styles.modalSubtitle}>{selectedRecord?.category.toUpperCase()}</Text>
                            {selectedRecord?.photoUrl && (
                                <Image source={{ uri: selectedRecord.photoUrl }} style={styles.modalImage} />
                            )}
                            {selectedRecord?.description && (
                                <Text style={styles.modalDescription}>{selectedRecord.description}</Text>
                            )}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.buttonClose]}
                                    onPress={() => setIsModalVisible(!isModalVisible)}
                                >
                                    <Text style={styles.textStyle}>Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonPrimary]}
                                    onPress={() => selectedRecord && handleNavigate(selectedRecord)}
                                >
                                    <Ionicons name="navigate" size={18} color="white" />
                                    <Text style={styles.textStyle}>Navigate</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

function parseRecord(category: SectionKey, id: string, data: any): MapRecord | null {
    const coordinates = typeof data?.coordinates === 'string' ? data.coordinates.split(',') : [];
    const latValue = data?.latitude ?? coordinates[0];
    const lonValue = data?.longitude ?? coordinates[1];
    const latitude = parseFloat(latValue);
    const longitude = parseFloat(lonValue);
    if (isNaN(latitude) || isNaN(longitude)) {
        return null;
    }

    const title =
        data?.name ||
        data?.speciesName ||
        data?.type ||
        data?.category ||
        `${category} record`;

    const description = data?.notes || data?.description || undefined;

    return {
        id,
        title,
        description,
        latitude,
        longitude,
        category,
        photoUrl: data?.photoUrl,
    };
}

function clusterRecords(points: MapRecord[], region: Region): ClusterNode[] {
    const thresholdLat = region.latitudeDelta / 8;
    const thresholdLon = region.longitudeDelta / 8;
    const clusters: { latitude: number; longitude: number; records: MapRecord[] }[] = [];

    points.forEach((point) => {
        let cluster = clusters.find(
            (node) =>
                Math.abs(node.latitude - point.latitude) < thresholdLat &&
                Math.abs(node.longitude - point.longitude) < thresholdLon
        );

        if (!cluster) {
            cluster = { latitude: point.latitude, longitude: point.longitude, records: [] };
            clusters.push(cluster);
        }
        cluster.records.push(point);
    });

    return clusters.map((cluster) =>
        cluster.records.length === 1
            ? { type: 'marker', record: cluster.records[0] }
            : { type: 'cluster', latitude: cluster.latitude, longitude: cluster.longitude, records: cluster.records }
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '90%',
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333333',
        paddingTop: -60,
        marginBottom: 20,
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        left: 20,
        bottom: 120,
        backgroundColor: '#0275d8',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    mapControls: {
        position: 'absolute',
        right: 12,
        zIndex: 100,
    },
    basemapContainer: {
        position: 'absolute',
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 6,
        borderRadius: 10,
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
    },

    basemapButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginBottom: 6,
        alignItems: 'center',
    },
    basemapButtonActive: {
        backgroundColor: 'rgba(77,138,80,0.15)',
    },
    basemapButtonText: {
        fontSize: 11,
        color: '#333',
    },
    basemapButtonTextActive: {
        color: '#2e7d32',
        fontWeight: '700',
    },
    zoomControls: {
        position: 'absolute',
        right: 51,
        bottom: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 0,
        overflow: 'hidden',
        elevation: 5,
    },
    zoomButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: 'center',
    },
    zoomText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    zoomDivider: {
        height: 1,
        width: '80%',
        backgroundColor: '#ccc',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        width: '80%',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalButtonPrimary: {
        backgroundColor: '#2e7d32',
        marginLeft: 10,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 64,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    navButton: {
        alignItems: 'center',
    },
    navText: {
        color: '#fff',
        fontSize: 10,
        marginTop: 2,
    },
    clusterBubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2c3e50',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    clusterCount: {
        color: '#fff',
        fontWeight: '700',
    },
    callout: {
        width: 220,
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2c3e50',
    },
    calloutSubtitle: {
        fontSize: 11,
        color: '#888',
        marginBottom: 6,
    },
    calloutImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        marginBottom: 6,
    },
    calloutDescription: {
        fontSize: 12,
        color: '#555',
        marginBottom: 8,
    },
    calloutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#2c7be5',
        paddingVertical: 8,
        borderRadius: 20,
    },
    calloutButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
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
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalImage: {
        width: 200,
        height: 120,
        borderRadius: 10,
        marginBottom: 12,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        backgroundColor: '#2196F3',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 10,
    },
    buttonClose: {
        backgroundColor: '#dc3545',
        marginTop: 10,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

