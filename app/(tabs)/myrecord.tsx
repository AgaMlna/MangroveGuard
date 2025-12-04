import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ref as databaseRef, onValue, remove } from 'firebase/database';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../lib/firebase';

const Colors = {
    backgroundTop: '#7aa07c',
    backgroundDark: '#557458',
    primaryGreen: '#4d8a50',
    textLight: '#f0f0f0',
    textDark: '#333333',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
    navActive: '#f0f0f0',
    navInactive: 'rgba(255, 255, 255, 0.7)',
};

type FirebaseRecord = {
    id: string;
    [key: string]: any;
};

type SectionKey = 'observations' | 'pollution' | 'disturbance' | 'sightings' | 'other_forms';

type EditPath =
    '/formobservation'
    | '/forminputpollution'
    | '/forminputdisturbance'
    | '/forminputothersightings'
    | '/forminput';

const sectionMeta: Record<SectionKey, { title: string; color: string; path: string; editPath: EditPath }> = {
    observations: { title: 'Record Observation', color: '#4d8a50', path: 'points/', editPath: '/formobservation' },
    pollution: { title: 'Record Pollution', color: '#e74c3c', path: 'pollution/', editPath: '/forminputpollution' },
    disturbance: { title: 'Record Disturbance', color: '#f39c12', path: 'disturbance/', editPath: '/forminputdisturbance' },
    sightings: { title: 'Other Sightings', color: '#3498db', path: 'other_sightings/', editPath: '/forminputothersightings' },
    other_forms: { title: 'Planning Point', color: '#000000', path: 'other_forms/', editPath: '/forminput' },
};

export default function MyRecordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [records, setRecords] = useState<Record<SectionKey, FirebaseRecord[]>>({
        observations: [],
        pollution: [],
        disturbance: [],
        sightings: [],
        other_forms: [],
    });

    const [loadingSources, setLoadingSources] = useState<Record<SectionKey, boolean>>({
        observations: true,
        pollution: true,
        disturbance: true,
        sightings: true,
        other_forms: true,
    });

    useEffect(() => {
        const configs = Object.entries(sectionMeta) as Array<[SectionKey, { path: string }]>;
        const unsubscribes = configs.map(([key, meta]) => {
            const ref = databaseRef(db, meta.path);
            return onValue(
                ref,
                (snapshot) => {
                    const data = snapshot.val();
                    const list = data
                        ? Object.keys(data).map((id) => ({
                            id,
                            ...data[id],
                        }))
                        : [];
                    setRecords((prev) => ({ ...prev, [key]: list }));
                    setLoadingSources((prev) => ({ ...prev, [key]: false }));
                },
                (error) => {
                    console.error(error);
                    Alert.alert('Error', `Gagal memuat ${sectionMeta[key].title}`);
                    setLoadingSources((prev) => ({ ...prev, [key]: false }));
                }
            );
        });

        return () => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
    }, []);

    const isLoading = useMemo(() => Object.values(loadingSources).some(Boolean), [loadingSources]);
    const hasAnyData = useMemo(() => Object.values(records).some((list) => list.length > 0), [records]);

    const handleDelete = (key: SectionKey, item: FirebaseRecord) => {
        Alert.alert(
            'Hapus Data',
            `Hapus "${item.name || item.type || item.speciesName || 'data'}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: () => {
                        remove(databaseRef(db, `${sectionMeta[key].path}${item.id}`))
                            .then(() => Alert.alert('Sukses', 'Data berhasil dihapus'))
                            .catch((error) => Alert.alert('Error', error.message || 'Gagal menghapus data.'));
                    },
                },
            ]
        );
    };

    const handleEdit = (key: SectionKey, item: FirebaseRecord) => {
        router.push({ pathname: sectionMeta[key].editPath, params: { recordId: item.id } });
    };

    const openInMaps = (item: FirebaseRecord) => {
        const lat = parseFloat(item.latitude || item.lat || item.coordinates?.split(',')[0] || '');
        const lon = parseFloat(item.longitude || item.lon || item.coordinates?.split(',')[1] || '');
        if (isNaN(lat) || isNaN(lon)) {
            Alert.alert('Oops', 'Koordinat tidak valid.');
            return;
        }
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Tidak dapat membuka Google Maps.'));
    };

    const renderDetailRow = (label: string, value?: string) => {
        if (!value) return null;
        return (
            <View style={{ marginBottom: 6 }}>
                <Text style={localStyles.detailLabel}>{label}</Text>
                <Text style={localStyles.detailValue}>{value}</Text>
            </View>
        );
    };

    const renderCard = (section: SectionKey, item: FirebaseRecord) => {
        const locationText = item.coordinates || [item.latitude, item.longitude].filter(Boolean).join(', ');
        const subtitle = item.timestamp ? new Date(item.timestamp).toLocaleString() : undefined;

        const fieldMap: Record<SectionKey, Array<{ label: string; value?: string }>> = {
            observations: [
                { label: 'Spesies', value: item.species },
                { label: 'DBH', value: item.dbh && `${item.dbh} cm` },
                { label: 'Tinggi', value: item.height && `${item.height} m` },
                { label: 'Kerapatan', value: item.density },
                { label: 'Kesehatan', value: item.healthStatus },
                { label: 'Substrat', value: item.substrate },
                { label: 'Catatan', value: item.notes || item.description },
            ],
            pollution: [
                { label: 'Jenis Polusi', value: item.type },
                { label: 'Keparahan', value: item.severity },
                { label: 'Sebaran', value: item.spread },
                { label: 'Deskripsi', value: item.description },
            ],
            disturbance: [
                { label: 'Jenis Gangguan', value: item.type },
                { label: 'Skala', value: item.scale },
                { label: 'Area', value: item.area },
                { label: 'Catatan', value: item.notes || item.description },
            ],
            sightings: [
                { label: 'Kategori', value: item.category },
                { label: 'Nama', value: item.speciesName },
                { label: 'Populasi', value: item.population },
                { label: 'Perilaku', value: item.behavior },
                { label: 'Status', value: item.rarity },
                { label: 'Catatan', value: item.notes },
            ],
            other_forms: [
                { label: 'Nama Plot', value: item.name },
                { label: 'Akurasi GPS', value: item.accuracy },
            ],
        };

        const title =
            item.name ||
            item.speciesName ||
            item.type ||
            item.category ||
            sectionMeta[section].title;

        return (
            <View key={item.id} style={localStyles.recordCard}>
                <View style={localStyles.recordHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.recordTitle}>{title}</Text>
                        {subtitle && <Text style={localStyles.recordSubtitle}>{subtitle}</Text>}
                    </View>
                    <View style={[localStyles.tag, { backgroundColor: `${sectionMeta[section].color}1A`, borderColor: sectionMeta[section].color }]}>
                        <Text style={{ color: sectionMeta[section].color, fontWeight: '600', fontSize: 11 }}>
                            #{item.id.slice(0, 6)}
                        </Text>
                    </View>
                </View>

                {item.photoUrl && (
                    <Image source={{ uri: item.photoUrl }} style={localStyles.recordImage} />
                )}

                <View style={{ marginTop: 10 }}>
                    {fieldMap[section].map(({ label, value }) => renderDetailRow(label, value))}
                </View>

                {locationText && (
                    <View style={localStyles.locationBlock}>
                        <Text style={localStyles.detailLabel}>Koordinat</Text>
                        <Text style={localStyles.detailValue}>{locationText}</Text>
                        {item.accuracy && <Text style={localStyles.detailValue}>Akurasi: {item.accuracy}</Text>}
                    </View>
                )}

                <View style={localStyles.cardActions}>
                    <TouchableOpacity style={localStyles.actionButton} onPress={() => handleEdit(section, item)}>
                        <Ionicons name="pencil" size={16} color={sectionMeta[section].color} />
                        <Text style={[localStyles.actionText, { color: sectionMeta[section].color }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={localStyles.actionButton} onPress={() => handleDelete(section, item)}>
                        <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
                        <Text style={[localStyles.actionText, { color: '#ff6b6b' }]}>Hapus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={localStyles.actionButton} onPress={() => openInMaps(item)}>
                        <Ionicons name="navigate-outline" size={16} color="#2e86de" />
                        <Text style={[localStyles.actionText, { color: '#2e86de' }]}>Google Maps</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderSection = (key: SectionKey) => {
        const data = records[key];
        return (
            <View key={key} style={localStyles.sectionWrapper}>
                <View style={localStyles.sectionHeader}>
                    <View>
                        <Text style={[localStyles.sectionTitle, { color: sectionMeta[key].color }]}>{sectionMeta[key].title}</Text>
                        <Text style={localStyles.sectionSubtitle}>{data.length} data</Text>
                    </View>
                    <Ionicons name="leaf-outline" size={20} color={sectionMeta[key].color} />
                </View>

                {data.length === 0 ? (
                    <View style={localStyles.emptyState}>
                        <Ionicons name="document-outline" size={28} color="rgba(0,0,0,0.3)" />
                        <Text style={localStyles.emptyText}>Belum ada data</Text>
                    </View>
                ) : (
                    data.map((item) => renderCard(key, item))
                )}
            </View>
        );
    };

    return (
        <LinearGradient colors={[Colors.backgroundTop, Colors.backgroundDark]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top + 8 }}>
                <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={localStyles.pageTitle}>My Records</Text>
                    <View>
                        <Text style={{ color: Colors.textLight, opacity: 0.8, fontSize: 14 }}>
                            Total records {Object.values(records).reduce((acc, list) => acc + list.length, 0)} data
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={localStyles.loaderWrapper}>
                        <ActivityIndicator size="large" color={Colors.textLight} />
                        <Text style={{ color: Colors.textLight, marginTop: 10 }}>Memuat data...</Text>
                    </View>
                ) : !hasAnyData ? (
                    <View style={localStyles.loaderWrapper}>
                        <Ionicons name="document-outline" size={64} color="rgba(255,255,255,0.6)" />
                        <Text style={{ color: Colors.textLight, marginTop: 12, textAlign: 'center' }}>
                            Belum ada data yang tersimpan. Tambahkan data dari tab NEW.
                        </Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}>
                        {(['observations', 'pollution', 'disturbance', 'sightings', 'other_forms'] as SectionKey[]).map(renderSection)}
                    </ScrollView>
                )}

                <LinearGradient colors={['#84c489', Colors.primaryGreen]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={localStyles.bottomNav}>
                    <TouchableOpacity style={localStyles.navButton}><Ionicons name="home" size={22} color={Colors.navInactive} /><Text>HOME</Text></TouchableOpacity>
                    <TouchableOpacity style={localStyles.navButton}><Ionicons name="leaf-outline" size={22} color={Colors.navInactive} /><Text>LEARN</Text></TouchableOpacity>
                    <TouchableOpacity style={localStyles.navButton}><Ionicons name="add-circle" size={22} color={Colors.navInactive} /><Text>NEW</Text></TouchableOpacity>
                    <TouchableOpacity style={localStyles.navButton}><Ionicons name="list" size={22} color={Colors.navActive} /><Text>MY DATA</Text></TouchableOpacity>
                    <TouchableOpacity style={localStyles.navButton}><Ionicons name="map" size={22} color={Colors.navInactive} /><Text>MAP</Text></TouchableOpacity>
                </LinearGradient>
            </SafeAreaView>
        </LinearGradient>
    );
}

const localStyles = StyleSheet.create({
    pageTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: Colors.textDark,
        paddingVertical: 2,
    },
    loaderWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    sectionWrapper: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
    },
    emptyText: {
        marginTop: 6,
        color: '#888',
        fontSize: 13,
    },
    recordCard: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        backgroundColor: '#fff',
    },
    recordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    recordTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    },
    recordSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    tag: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    recordImage: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        marginTop: 12,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 14,
        color: '#222',
    },
    locationBlock: {
        marginTop: 8,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(132, 196, 137, 0.15)',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
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
});

