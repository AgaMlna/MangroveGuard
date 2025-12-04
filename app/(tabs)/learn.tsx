import { MangroveColors, sharedBottomNavStyles } from '@/constants/sharedStyles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, ImageSourcePropType, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const cardWidth = (width - 64) / 2; // (Total lebar - padding kiri/kanan - spacing di tengah) / 2

// Alias untuk konsistensi
const Colors = MangroveColors;

type SpeciesDetail = {
    conservationStatus?: string;
    distribution?: string;
    vernacular?: string;
    plantType?: string;
    leaves?: string;
    flowers?: string;
    fruits?: string;
    bark?: string;
    roots?: string;
    zonation?: string;
    uses?: string;
};

type MangroveItem = {
    id: string;
    name_scientific: string;
    name_local: string;
    category: string;
    image_url: ImageSourcePropType;
    category_color: string;
    detail?: SpeciesDetail;
};

// --- DATA SPESIES MANGROVE YANG DIPERBARUI ---
const MANGROVE_DATA: MangroveItem[] = [
    {
        id: '1',
        name_scientific: 'Rhizophora mucronata',
        name_local: 'Bakau Merah',
        category: 'True Mangrove',
        image_url: require('@/assets/images/rhizophora_mucronata.jpg'), // Ganti dengan path gambar asli Anda
        category_color: '#55AA55',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Mauritius dan pesisir Samudra Hindia lainnya, tumbuh subur di muara pasang surut.',
            vernacular: 'Manglier, Paletuvier, Bakau Merah.',
            plantType: 'Pohon biasanya setinggi 5–10 m, kadang mencapai 30 m.',
            leaves: 'Berbentuk elips hingga lonjong, permukaan atas hijau gelap dengan titik-titik hitam di bawah.',
            flowers: 'Gugusan 2–8 kelopak putih-hijau.',
            fruits: 'Propagul berdiameter 1–2 cm, panjang hingga 35 cm dengan ujung tajam.',
            bark: 'Tekstur kasar dengan warna cokelat hingga keabu-abuan.',
            roots: 'Akar tunjang panjang yang mengangkat batang di atas tanah berlumpur.', 
            zonation: 'Zona intertidal yang secara teratur dibanjiri air payau.',
            uses: 'Tanin kulit kayu digunakan untuk pewarnaan kulit; kayu untuk tiang.',
        },
    },
    {
        id: '2',
        name_scientific: 'Avicennia marina',
        name_local: 'Api-api Putih',
        category: 'True Mangrove',
        image_url: require('@/assets/images/avicennia_marina.jpg'), // Ganti dengan path gambar asli Anda
        category_color: '#4477AA',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pesisir tropis dan subtropis dari Afrika Timur hingga Asia Tenggara dan Australia.',
            vernacular: 'Grey Mangrove, White Mangrove, Api-api Putih.',
            plantType: 'Pohon atau semak, dapat mencapai 3–14 m.',
            leaves: 'Berbentuk elips, permukaan atas hijau muda mengkilap, bawah keperakan atau berbulu.',
            flowers: 'Kuning keemasan atau putih, kecil, beraroma madu.',
            fruits: 'Kapsul kecil berbentuk hati atau telur, hijau kekuningan, mengandung satu biji yang berkecambah sebelum jatuh (kriptovivipar).',
            bark: 'Halus atau agak pecah-pecah, abu-abu pucat hingga keputihan.',
            roots: 'Memiliki akar napas **pneumatofor** vertikal yang menjulur dari lumpur.', 
            zonation: 'Zona tengah hingga belakang, toleran terhadap salinitas tinggi dan genangan air yang lebih pendek.',
            uses: 'Daun digunakan sebagai pakan ternak; kayu untuk kayu bakar; madu dari bunga.',
        },
    },
    {
        id: '3',
        name_scientific: 'Sonneratia alba',
        name_local: 'Pedada Putih',
        category: 'True Mangrove',
        image_url: require('@/assets/images/sonneratia_alba.jpg'), // Ganti dengan path gambar asli Anda
        category_color: '#AA7744',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Afrika Timur, Asia Tenggara, Melanesia, dan Australia Utara.',
            vernacular: 'Lumnitzera, Sonneratia, Pedada Putih.',
            plantType: 'Pohon besar, sering mencapai 10–20 m.',
            leaves: 'Tebal, berdaging, bundar, dan berwarna hijau kekuningan cerah, tumbuh berpasangan berlawanan.',
            flowers: 'Besar dan mencolok, berwarna putih, mekar di malam hari, dengan banyak benang sari putih panjang.',
            fruits: 'Buah berbentuk bola atau pipih, menyerupai kapsul hijau dengan mahkota kelopak yang persisten.',
            bark: 'Abu-abu, pecah-pecah memanjang.',
            roots: 'Memiliki akar napas **pneumatofor** berbentuk kerucut yang kokoh, tersebar luas.', 
            zonation: 'Zona paling depan, paling dekat dengan laut, tahan terhadap ombak dan genangan air pasang tinggi secara teratur.',
            uses: 'Buah dapat dimakan (rasanya asam); kayu untuk konstruksi dan kayu bakar.',
        },
    },
    {
        id: '4',
        name_scientific: 'Bruguiera gymnorhiza',
        name_local: 'Tancang',
        category: 'True Mangrove',
        image_url: require('@/assets/images/bruguiera_gymnorhiza.jpg'), // Ganti dengan path gambar asli Anda
        category_color: '#8844AA',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pesisir tropis Afrika, Asia, hingga Pasifik.',
            vernacular: 'Large-leafed Orange Mangrove, Black Mangrove, Tancang.',
            plantType: 'Pohon berukuran sedang hingga besar, mencapai 7–20 m.',
            leaves: 'Elips, hijau tua mengkilap, mengelompok di ujung ranting.',
            flowers: 'Kelopak merah, oranye, atau kekuningan, berbentuk lonceng, menempel pada bakal buah.',
            fruits: 'Propagul berbentuk cerutu, tebal, dengan ujung tumpul, berwarna hijau atau ungu/kemerahan, panjangnya bisa mencapai 15–20 cm.',
            bark: 'Cokelat gelap, kasar dan sedikit pecah-pecah.',
            roots: 'Akar lutut (**knee roots**) yang muncul dari lumpur dan kembali masuk, membentuk lengkungan.', 
            zonation: 'Zona tengah hingga belakang, genangan air pasang kurang sering daripada *Rhizophora*.',
            uses: 'Kulit kayu kaya tanin, digunakan untuk pewarna dan pengawet jaring ikan; kayu untuk konstruksi ringan dan kayu bakar.',
        },
    },

    // Spesies Tambahan dari Gambar (image_38d902.png, image_38d8ca.png, etc.)
    {
        id: '5',
        name_scientific: 'Pemphis acidula',
        name_local: 'Cemara laut / Stigi',
        category: 'Mangrove Associate',
        image_url: require('@/assets/images/pemphis_acidula.jpg'),
        category_color: '#44AA77',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pesisir tropis di Samudra Hindia dan Pasifik.',
            vernacular: 'Stigi, Mentigi, Cemara Laut.',
            plantType: 'Semak atau pohon kecil, seringkali beradaptasi menjadi bonsaian alami karena tanah yang tandus.',
            leaves: 'Kecil, tebal, berwarna hijau keabu-abuan, ditutupi rambut halus.',
            flowers: 'Kecil, putih, tumbuh tunggal di ketiak daun.',
            fruits: 'Kapsul kering kecil, mengandung biji.',
            bark: 'Abu-abu kecoklatan, sering terkelupas.',
            roots: 'Sistem akar yang padat, tahan terhadap angin kencang.',
            zonation: 'Zona pantai berpasir atau berbatu, tepat di atas batas pasang tertinggi.',
            uses: 'Kayu sangat keras, digunakan untuk pasak, perkakas, dan bahan bangunan kecil.',
        },
    },
    {
        id: '6',
        name_scientific: 'Heritiera littoralis',
        name_local: 'Dungun',
        category: 'Mangrove Associate',
        image_url: require('@/assets/images/heritiera_littoralis.jpeg'),
        category_color: '#AA4444', // Warna gelap untuk kontras
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pesisir tropis Afrika Timur, Asia Tenggara, dan Kepulauan Pasifik.',
            vernacular: 'Dungun, Looking-glass Mangrove.',
            plantType: 'Pohon berukuran sedang hingga besar, mencapai 15–25 m.',
            leaves: 'Oblong, permukaan atas hijau mengkilap, bawah berwarna perak/putih (seperti cermin).',
            flowers: 'Kecil, berwarna kehijauan atau cokelat kemerahan.',
            fruits: 'Buah bersayap, berbentuk perahu yang tebal dan kayu, berwarna cokelat saat matang.',
            bark: 'Halus hingga retak, abu-abu.',
            roots: 'Akar papan (**buttress roots**) sering terlihat, kadang disertai pneumatofor kecil.',
            zonation: 'Zona belakang atau transisi mangrove, toleran terhadap salinitas rendah.',
            uses: 'Kayu keras dan tahan lama digunakan untuk perahu dan konstruksi.',
        },
    },
    {
        id: '7',
        name_scientific: 'Acrostichum aureum',
        name_local: 'Paku Laut',
        category: 'Mangrove Associate',
        image_url: require('@/assets/images/acrostichum_aureum.jpg'),
        category_color: '#55AA55',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Habitat payau tropis dan subtropis di seluruh dunia.',
            vernacular: 'Golden Leather Fern, Paku Laut.',
            plantType: 'Pakis besar, tumbuh dalam rumpun, dapat mencapai tinggi 2–3 m.',
            leaves: 'Daun majemuk, menyirip; frond fertil (subur) berwarna cokelat emas di bagian atas.',
            flowers: 'Tidak berbunga (pakis), bereproduksi dengan spora.',
            fruits: 'Spora terletak di permukaan bawah daun fertil.',
            bark: 'Tidak ada (pakis).',
            roots: 'Rimpang bawah tanah yang tebal dan berserat.',
            zonation: 'Zona belakang mangrove, seringkali membentuk batas vegetasi, tahan terhadap genangan air tawar yang musiman.',
            uses: 'Daun muda kadang dimakan sebagai sayuran; digunakan dalam pengobatan tradisional.',
        },
    },
    {
        id: '8',
        name_scientific: 'Zoysia matrella',
        name_local: 'Rumput Zoysia',
        category: 'Mangrove Associate',
        image_url: require('@/assets/images/zoysia_matrella.png'),
        category_color: '#4477AA',
        detail: {
            conservationStatus: 'Not Evaluated (NE)',
            distribution: 'Asia Tenggara dan pulau-pulau di Samudra Pasifik.',
            vernacular: 'Manila Grass, Rumput Zoysia.',
            plantType: 'Rumput penutup tanah yang membentuk karpet padat.',
            leaves: 'Halus, berbentuk bilah, berwarna hijau cerah.',
            flowers: 'Perbungaan kecil, seperti bulir.',
            fruits: 'Buah berupa biji kecil (kariopsis).',
            bark: 'Tidak ada (rumput).',
            roots: 'Sistem rimpang dan stolon yang luas, tahan terhadap garam.',
            zonation: 'Daerah tergenang pasang tinggi yang jarang, atau pantai berpasir yang terbuka.',
            uses: 'Umum digunakan sebagai rumput taman karena toleransinya terhadap garam dan kekeringan.',
        },
    },
    {
        id: '9',
        name_scientific: 'Milletia pinnata', // *Pongamia pinnata* (sinonim)
        name_local: 'Milletia',
        category: 'Beach/Associate',
        image_url: require('@/assets/images/milletia_pinnata.jpeg'),
        category_color: '#AA4444',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'India, Asia Tenggara, Tiongkok, Jepang, dan Australia.',
            vernacular: 'Karanja, Millettia, Beru.',
            plantType: 'Pohon berukuran sedang, sering digunakan sebagai peneduh.',
            leaves: 'Majemuk menyirip, hijau mengkilap.',
            flowers: 'Kelopak merah muda, ungu, atau putih, bergerombol.',
            fruits: 'Polong kayu, pipih, tebal, berwarna cokelat muda, mengandung satu atau dua biji.',
            bark: 'Abu-abu, halus hingga pecah-pecah seiring bertambahnya usia.',
            roots: 'Toleran terhadap genangan air, memiliki kemampuan fiksasi nitrogen.',
            zonation: 'Zona transisi antara pantai dan daratan tinggi (upland).',
            uses: 'Minyak dari biji digunakan untuk bahan bakar bio dan pengobatan tradisional; kayu untuk peralatan.',
        },
    },
    {
        id: '10',
        name_scientific: 'Dracaena concinna',
        name_local: 'Dracaena',
        category: 'Beach/Upland',
        image_url: require('@/assets/images/dracaena_concinna.jpg'),
        category_color: '#44AA77',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Madagaskar dan pulau-pulau di Samudra Hindia, dibudidayakan luas.',
            vernacular: 'Pleomele, Dracaena.',
            plantType: 'Pohon atau semak berbatang tunggal atau bercabang yang lambat tumbuh.',
            leaves: 'Panjang, sempit, melengkung, hijau gelap seringkali dengan tepi merah atau putih.',
            flowers: 'Putih kehijauan, kecil, beraroma, dalam kelompok terminal.',
            fruits: 'Buah beri kecil, oranye hingga merah, jarang terlihat.',
            bark: 'Halus, cokelat muda.',
            roots: 'Sistem akar berserat.',
            zonation: 'Area daratan tinggi (upland) di belakang pantai atau bukit pasir.',
            uses: 'Tanaman hias populer.',
        },
    },
    {
        id: '11',
        name_scientific: 'Talipariti tiliaceum', // Sebelumnya *Hibiscus tiliaceus*
        name_local: 'Waru Laut',
        category: 'Mangrove Associate',
        image_url: require('@/assets/images/talipariti_tiliaceum.jpg'),
        category_color: '#55AA55',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pesisir tropis dan subtropis di seluruh dunia.',
            vernacular: 'Sea Hibiscus, Cottonwood Hibiscus, Waru Laut.',
            plantType: 'Pohon kecil hingga sedang, seringkali berbentuk semak dan bengkok.',
            leaves: 'Berbentuk hati besar, hijau; bagian bawah berbulu halus.',
            flowers: 'Besar, berbentuk lonceng, kuning dengan pusat merah gelap saat mekar, menjadi oranye/merah sebelum layu.',
            fruits: 'Kapsul berambut, berisi banyak biji.',
            bark: 'Abu-abu, sedikit kasar, seratnya kuat.',
            roots: 'Tahan air dan garam.',
            zonation: 'Zona transisi mangrove ke daratan, sering berasosiasi di tepi sungai pasang surut.',
            uses: 'Serat dari kulit kayu digunakan untuk tali, daun dan bunga untuk obat tradisional.',
        },
    },
    {
        id: '12',
        name_scientific: 'Thespesia populnea',
        name_local: 'Baru Laut',
        category: 'Mangrove Associate',
        image_url: require('@/assets/images/thespesia_populnea.jpg'),
        category_color: '#AA7744',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pesisir di seluruh wilayah tropis dan subtropis.',
            vernacular: 'Portia Tree, Baru Laut.',
            plantType: 'Pohon kecil, sering tumbuh tidak beraturan, dapat mencapai 6–10 m.',
            leaves: 'Berbentuk hati, hijau mengkilap, mirip dengan *Talipariti tiliaceum* tetapi lebih halus.',
            flowers: 'Berbentuk lonceng, kuning hingga ungu tua, biasanya hanya memiliki bercak merah di pangkal.',
            fruits: 'Kapsul keras dan bundar, tidak pecah (indehiscent), berwarna cokelat saat matang.',
            bark: 'Abu-abu kecokelatan, berserat.',
            roots: 'Toleran terhadap salinitas tinggi.',
            zonation: 'Pantai berbatu atau berpasir, dan daerah transisi di tepi mangrove.',
            uses: 'Kayu untuk kerajinan dan alat musik; digunakan sebagai peneduh di pinggir jalan.',
        },
    },
    {
        id: '13',
        name_scientific: 'Casuarina equisetifolia',
        name_local: 'Cemara Laut',
        category: 'Beach Species',
        image_url: require('@/assets/images/casuarina_equisetifolia.jpg'),
        category_color: '#AA4444',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Asia Tenggara, Australia Utara, dan Kepulauan Pasifik.',
            vernacular: 'Australian Pine, Cemara Laut.',
            plantType: 'Pohon tinggi dan ramping, menyerupai cemara sejati, mencapai 6–35 m.',
            leaves: 'Ranting hijau tipis dan beruas yang berfungsi seperti daun.',
            flowers: 'Jantan berupa bulir tipis, betina berupa kerucut kecil yang berkayu.',
            fruits: 'Kerucut kecil yang berkayu, mirip dengan kerucut pinus, mengandung biji bersayap.',
            bark: 'Cokelat kemerahan, pecah-pecah dan bersisik.',
            roots: 'Sistem akar kuat, menstabilkan bukit pasir dan pantai.',
            zonation: 'Zona pantai berpasir yang kering, di atas batas air pasang.',
            uses: 'Kayu bakar yang sangat baik; digunakan untuk reboisasi pantai dan pencegahan erosi.',
        },
    },
    {
        id: '14',
        name_scientific: 'Ipomoea pes-caprae',
        name_local: 'Tapak Kuda',
        category: 'Beach/Dune',
        image_url: require('@/assets/images/ipomoea_pes-caprae.jpg'),
        category_color: '#8844AA',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pantai tropis dan subtropis di seluruh dunia.',
            vernacular: 'Beach Morning Glory, Tapak Kuda.',
            plantType: 'Tanaman merambat di atas pasir dengan batang yang menjalar panjang.',
            leaves: 'Berbentuk seperti kuku kambing (tapal kuda), berdaging, hijau cerah.',
            flowers: 'Besar, berbentuk corong, berwarna ungu muda hingga merah muda.',
            fruits: 'Kapsul bulat yang melepaskan empat biji yang mengapung.',
            bark: 'Tidak ada (tanaman merambat).',
            roots: 'Akar yang dangkal namun ekstensif, penting untuk menstabilkan bukit pasir.',
            zonation: 'Bukit pasir dan pantai berpasir, zona yang jarang tergenang air laut.',
            uses: 'Digunakan untuk stabilisasi bukit pasir; pengobatan tradisional untuk sengatan ubur-ubur.',
        },
    },
    {
        id: '15',
        name_scientific: 'Canavalia rosea',
        name_local: 'Kacang Pantai',
        category: 'Beach/Dune',
        image_url: require('@/assets/images/canavalia_rosea.jpg'),
        category_color: '#4477AA',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pantai tropis di seluruh dunia.',
            vernacular: 'Bay Bean, Kacang Pantai.',
            plantType: 'Tanaman merambat yang agresif, membentuk karpet di atas pasir.',
            leaves: 'Majemuk, terdiri dari tiga selebaran bundar atau elips yang berdaging.',
            flowers: 'Bunga berbentuk kacang, merah muda hingga ungu cerah.',
            fruits: 'Polong datar yang panjang dan keras, mengandung biji berwarna cokelat.',
            bark: 'Tidak ada (tanaman merambat).',
            roots: 'Toleran terhadap garam, berperan dalam fiksasi nitrogen.',
            zonation: 'Bukit pasir dan area pantai yang kering, sering berbagi habitat dengan *Ipomoea pes-caprae*.',
            uses: 'Stabilisasi pasir; beberapa bagian dapat dimakan setelah diolah dengan benar.',
        },
    },
    {
        id: '16',
        name_scientific: 'Calophyllum inophyllum',
        name_local: 'Nyamplung',
        category: 'Beach Species',
        image_url: require('@/assets/images/calophyllum_inophyllum.jpg'),
        category_color: '#AA4444',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pesisir tropis di Samudra Hindia dan Pasifik.',
            vernacular: 'Tamanu, Alexandrian Laurel, Nyamplung.',
            plantType: 'Pohon peneduh besar dengan tajuk menyebar dan padat.',
            leaves: 'Tebal, kaku, hijau mengkilap, dengan urat sejajar yang rapat.',
            flowers: 'Putih, wangi, berukuran sedang, bergerombol.',
            fruits: 'Buah bundar, keras, berwarna hijau saat mentah, kuning kecokelatan saat matang.',
            bark: 'Pecah-pecah, cokelat gelap.',
            roots: 'Toleran terhadap angin laut dan semprotan garam.',
            zonation: 'Area daratan tinggi di belakang pantai berpasir atau berbatu.',
            uses: 'Minyak dari biji (minyak Tamanu) digunakan untuk kosmetik dan obat; kayu untuk konstruksi perahu.',
        },
    },
    {
        id: '17',
        name_scientific: 'Fimbristylis ferruginea',
        name_local: 'Rumput Bundar',
        category: 'Salt Marsh',
        image_url: require('@/assets/images/fimbristylis_ferruginea.jpg'),
        category_color: '#44AA77',
        detail: {
            conservationStatus: 'Not Evaluated (NE)',
            distribution: 'Pesisir tropis dan subtropis di seluruh dunia.',
            vernacular: 'Rusty Sedge, Rumput Bundar.',
            plantType: 'Tanaman seperti rumput (sedge), tumbuh tegak dalam rumpun.',
            leaves: 'Sangat sempit atau tidak ada; batang berbentuk segitiga.',
            flowers: 'Spikelet kecil, berwarna cokelat kemerahan atau karat.',
            fruits: 'Achene kecil.',
            bark: 'Tidak ada.',
            roots: 'Sistem rimpang yang dangkal.',
            zonation: 'Rawa asin (salt marsh) di zona belakang mangrove, sering tergenang air saat pasang tinggi.',
            uses: 'Tidak umum digunakan, berfungsi sebagai habitat invertebrata.',
        },
    },
    {
        id: '18',
        name_scientific: 'Sporobolus virginicus',
        name_local: 'Rumput Garam',
        category: 'Salt Marsh',
        image_url: require('@/assets/images/sporobolus_virginicus.jpg'),
        category_color: '#55AA55',
        detail: {
            conservationStatus: 'Least Concern (LC)',
            distribution: 'Pesisir tropis dan subtropis di seluruh dunia.',
            vernacular: 'Saltmarsh Grass, Rumput Garam.',
            plantType: 'Rumput perenial, menyebar melalui stolon, membentuk hamparan yang padat.',
            leaves: 'Bilah daun kaku, runcing, dan tahan garam.',
            flowers: 'Perbungaan tipis, berbentuk malai.',
            fruits: 'Biji kecil.',
            bark: 'Tidak ada (rumput).',
            roots: 'Stolon yang panjang dan merayap.',
            zonation: 'Habitat rawa asin dan bukit pasir pesisir, sangat toleran terhadap garam dan kekeringan.',
            uses: 'Stabilisasi tanah di lingkungan payau.',
        },
    },
    {
        id: '19',
        name_scientific: 'Sesuvium ayresii',
        name_local: 'Sesuvium',
        category: 'Salt Tolerant',
        image_url: require('@/assets/images/sesuvium_ayresii.jpg'),
        category_color: '#AA7744',
        detail: {
            conservationStatus: 'Vulnerable (VU) - Catatan: Status konservasi ini mungkin berbeda di setiap wilayah, seringkali adalah status untuk spesies yang endemik.',
            distribution: 'Ditemukan di pesisir pasir dan dataran lumpur di Madagaskar (endemik di sana).',
            vernacular: 'Sesuvium.',
            plantType: 'Herba merayap yang berdaging (sukulen).',
            leaves: 'Kecil, tebal, berdaging, berbentuk sendok.',
            flowers: 'Kecil, ungu atau merah muda, terletak di ketiak daun.',
            fruits: 'Kapsul kecil yang mengandung biji hitam.',
            bark: 'Tidak ada.',
            roots: 'Akar yang relatif dangkal.',
            zonation: 'Dataran garam, rawa asin, dan di atas batas pasang tertinggi.',
            uses: 'Tidak umum digunakan, berperan penting dalam ekologi lokal dataran garam.',
        },
    },
];




// --- KOMPONEN MANGROVE CARD ---
const MangroveCard = ({
    item,
    onPress,
}: {
    item: MangroveItem;
    onPress: (item: MangroveItem) => void;
}) => (
    <TouchableOpacity style={localStyles.card} onPress={() => onPress(item)}>
        <Image
            source={item.image_url}
            style={localStyles.cardImage}
            contentFit="cover"
        />
        <View style={[localStyles.categoryBadge, { backgroundColor: item.category_color }]}>
            <Text style={localStyles.categoryText}>{item.category}</Text>
        </View>
        <View style={localStyles.cardContent}>
            <Text style={localStyles.scientificNameText}>{item.name_scientific}</Text>
            <Text style={localStyles.localNameText}>{item.name_local}</Text>
        </View>
    </TouchableOpacity>
);

// --- KOMPONEN UTAMA ---
export default function LearnScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortAscending, setSortAscending] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [selectedSpecies, setSelectedSpecies] = useState<MangroveItem | null>(null);

    const categories = useMemo(
        () => Array.from(new Set(MANGROVE_DATA.map(item => item.category))).sort(),
        []
    );

    const filteredData = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const result = MANGROVE_DATA.filter(item => {
            const matchesSearch =
                !normalizedQuery ||
                item.name_scientific.toLowerCase().includes(normalizedQuery) ||
                item.name_local.toLowerCase().includes(normalizedQuery);
            const matchesCategory = !selectedCategory || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        return result.sort((a, b) =>
            sortAscending
                ? a.name_scientific.localeCompare(b.name_scientific)
                : b.name_scientific.localeCompare(a.name_scientific)
        );
    }, [searchQuery, selectedCategory, sortAscending]);

    return (
        <LinearGradient colors={[Colors.backgroundTop, Colors.backgroundDark]} style={{ flex: 1 }}>
            {/* Jarak (paddingTop) dari status bar tetap dipertahankan sesuai permintaan sebelumnya */}
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top + 8 }}> 
                
                {/* 1. JUDUL DAN PENCARIAN */}
                <View style={localStyles.topArea}>
                    <Text style={localStyles.guideTitle}>Mangrove Guide</Text>
                    <View style={localStyles.searchBarContainer}>
                        <View style={localStyles.searchBox}>
                            <Ionicons name="search" size={20} color={Colors.textDark} style={{ marginRight: 8 }} />
                            <TextInput 
                                placeholder="Search Species..."
                                placeholderTextColor="#888"
                                style={localStyles.searchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity
                            style={[
                                localStyles.iconButton,
                                showFilterPanel && localStyles.iconButtonActive,
                            ]}
                            onPress={() => setShowFilterPanel(prev => !prev)}
                        >
                            <Ionicons name="filter" size={22} color={Colors.textDark} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={localStyles.iconButton}
                            onPress={() => setSortAscending(prev => !prev)}
                        >
                            <Ionicons
                                name={sortAscending ? 'swap-vertical' : 'swap-vertical-outline'}
                                size={22}
                                color={Colors.textDark}
                            />
                        </TouchableOpacity>
                    </View>
                    {(selectedCategory || searchQuery) && (
                        <View style={localStyles.activeFilterRow}>
                            {selectedCategory && (
                                <View style={localStyles.filterBadge}>
                                    <Text style={localStyles.filterBadgeText}>{selectedCategory}</Text>
                                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                                        <Ionicons name="close" size={14} color={Colors.textLight} />
                        </TouchableOpacity>
                    </View>
                            )}
                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    style={localStyles.clearSearchButton}
                                    onPress={() => setSearchQuery('')}
                                >
                                    <Ionicons name="close-circle" size={16} color={Colors.textDark} />
                                    <Text style={localStyles.clearSearchText}>Clear search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    {showFilterPanel && (
                        <View style={localStyles.filterPanel}>
                            <Text style={localStyles.filterPanelTitle}>Filter by category</Text>
                            <View style={localStyles.filterChipContainer}>
                                <TouchableOpacity
                                    style={[
                                        localStyles.filterChip,
                                        !selectedCategory && localStyles.filterChipActive,
                                    ]}
                                    onPress={() => setSelectedCategory(null)}
                                >
                                    <Text
                                        style={[
                                            localStyles.filterChipText,
                                            !selectedCategory && localStyles.filterChipTextActive,
                                        ]}
                                    >
                                        All
                                    </Text>
                                </TouchableOpacity>
                                {categories.map(category => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            localStyles.filterChip,
                                            selectedCategory === category && localStyles.filterChipActive,
                                        ]}
                                        onPress={() =>
                                            setSelectedCategory(prev => (prev === category ? null : category))
                                        }
                                    >
                                        <Text
                                            style={[
                                                localStyles.filterChipText,
                                                selectedCategory === category && localStyles.filterChipTextActive,
                                            ]}
                                        >
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* 2. DAFTAR SPESIES (GRID VIEW) */}
                <FlatList
                    data={filteredData}
                    renderItem={({ item }) => (
                        <MangroveCard item={item} onPress={setSelectedSpecies} />
                    )}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={localStyles.flatListContent}
                    columnWrapperStyle={localStyles.flatListColumnWrapper}
                    ListEmptyComponent={
                        <Text style={localStyles.emptyListText}>
                            No species match your search or filter.
                        </Text>
                    }
                />
                <SpeciesDetailModal
                    visible={!!selectedSpecies}
                    species={selectedSpecies}
                    onClose={() => setSelectedSpecies(null)}
                />

                {/* 3. Bottom nav placeholder (Dibuat minimalis agar tidak mengganggu fokus) */}
                <View style={sharedBottomNavStyles.bottomNavContainer}>
                    <LinearGradient 
                        colors={[Colors.navBarGradientStart, Colors.primaryGreen]} 
                        start={{ x: 0, y: 0 }} 
                        end={{ x: 1, y: 0 }} 
                        style={sharedBottomNavStyles.bottomNav}
                    >
                        <TouchableOpacity style={sharedBottomNavStyles.navButton}><Ionicons name="home" size={24} color={Colors.iconInactive} /><Text style={sharedBottomNavStyles.navText}>HOME</Text></TouchableOpacity>
                        <TouchableOpacity style={sharedBottomNavStyles.navButton}><Ionicons name="leaf-outline" size={24} color={Colors.textLight} /><Text style={sharedBottomNavStyles.navTextActive}>LEARN</Text></TouchableOpacity>
                        <TouchableOpacity style={sharedBottomNavStyles.navButton}><Ionicons name="add-circle" size={24} color={Colors.iconInactive} /><Text style={sharedBottomNavStyles.navText}>NEW</Text></TouchableOpacity>
                        <TouchableOpacity style={sharedBottomNavStyles.navButton}><Ionicons name="list" size={24} color={Colors.iconInactive} /><Text style={sharedBottomNavStyles.navText}>MY DATA</Text></TouchableOpacity>
                        <TouchableOpacity style={sharedBottomNavStyles.navButton}><Ionicons name="map" size={24} color={Colors.iconInactive} /><Text style={sharedBottomNavStyles.navText}>MAP</Text></TouchableOpacity>
                    </LinearGradient>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const SpeciesDetailModal = ({
    visible,
    species,
    onClose,
}: {
    visible: boolean;
    species: MangroveItem | null;
    onClose: () => void;
}) => {
    if (!species) return null;

    const detail: SpeciesDetail = species.detail ?? {};
    const statusText = detail.conservationStatus ?? '';
    const hasStatus = Boolean(detail.conservationStatus);
    const detailRows: Array<{
        key: keyof SpeciesDetail;
        label: string;
        icon: keyof typeof Ionicons.glyphMap;
    }> = [
        { key: 'distribution', label: 'Natural distribution', icon: 'earth' },
        { key: 'vernacular', label: 'Vernacular names', icon: 'chatbubbles-outline' },
        { key: 'plantType', label: 'Type of Plant', icon: 'leaf' },
        { key: 'leaves', label: 'Leaves', icon: 'leaf-outline' },
        { key: 'flowers', label: 'Flowers', icon: 'flower-outline' },
        { key: 'fruits', label: 'Fruits', icon: 'nutrition' },
        { key: 'bark', label: 'Bark', icon: 'layers' },
        { key: 'roots', label: 'Roots', icon: 'git-branch' },
        { key: 'zonation', label: 'Zonation', icon: 'water' },
        { key: 'uses', label: 'Uses', icon: 'construct' },
    ];

    // Perbaikan: cek apakah nilai ada dan bukan string kosong
    const renderValue = (key: keyof SpeciesDetail) => {
        const value = detail[key];
        return value && value.trim() ? value : 'Information will be updated soon.';
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={localStyles.modalBackdrop}>
                <View style={localStyles.modalContainer}>
                    <View style={localStyles.modalHeader}>
                        <TouchableOpacity style={localStyles.backButton} onPress={onClose}>
                            <Ionicons name="arrow-back" size={20} color={Colors.primaryGreen} />
                        </TouchableOpacity>
                        <Text style={localStyles.modalTitle}>Species Identification</Text>
                    </View>
                    <ScrollView contentContainerStyle={localStyles.modalScrollContent} showsVerticalScrollIndicator={true}>
                        <Image source={species.image_url} style={localStyles.detailImage} contentFit="cover" />
                        <View style={localStyles.scientificPanel}>
                            <Text style={localStyles.scientificTitle}>
                                Scientific Name:{' '}
                                <Text style={localStyles.scientificNameHighlight}>{species.name_scientific}</Text>
                            </Text>
                            {hasStatus && (
                                <View style={localStyles.statusRow}>
                                    <Text style={localStyles.statusLabel}>Status</Text>
                                    <View style={localStyles.statusChipsContainer}>
                                        {['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC'].map(code => {
                                            const isActive = statusText.includes(code);
                                            return (
                                                <View
                                                    key={code}
                                                    style={[
                                                        localStyles.statusChip,
                                                        isActive && localStyles.statusChipActive,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            localStyles.statusChipText,
                                                            isActive && localStyles.statusChipTextActive,
                                                        ]}
                                                    >
                                                        {code}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                    <Text style={localStyles.statusDescription}>{statusText}</Text>
                                </View>
                            )}
                        </View>

                        <View style={localStyles.detailCard}>
                            {detailRows.map(row => (
                                <View key={row.key} style={localStyles.detailRow}>
                                    <Ionicons name={row.icon as any} size={18} color={Colors.primaryGreen} />
                                    <View style={localStyles.detailTextContainer}>
                                        <Text style={localStyles.detailLabel}>{row.label}:</Text>
                                        <Text style={localStyles.detailValue}>{renderValue(row.key)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// --- STYLESHEET LOKAL ---
const localStyles = StyleSheet.create({
    // --- Layout dan Header ---
    topArea: {
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    guideTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: Colors.textDark, // Warna hitam untuk kontras dengan latar belakang hijau
        marginBottom: 15,
        paddingTop: 37,
    },
    
    // --- Search Bar dan Filter ---
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.searchBackground,
        paddingHorizontal: 55,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.textDark,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.searchBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    iconButtonActive: {
        borderWidth: 1,
        borderColor: Colors.primaryGreen,
    },
    activeFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        flexWrap: 'wrap',
    },
    filterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryGreen,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    filterBadgeText: {
        color: Colors.textLight,
        fontSize: 12,
        fontWeight: '600',
    },
    clearSearchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.searchBackground,
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    clearSearchText: {
        color: Colors.textDark,
        fontSize: 12,
    },
    filterPanel: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 18,
        padding: 12,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    filterPanelTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: 8,
    },
    filterChipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    filterChip: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primaryGreen,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    filterChipActive: {
        backgroundColor: Colors.primaryGreen,
    },
    filterChipText: {
        fontSize: 12,
        color: Colors.primaryGreen,
    },
    filterChipTextActive: {
        color: Colors.textLight,
        fontWeight: '600',
    },

    // --- FlatList dan Cards ---
    flatListContent: {
        paddingHorizontal: 20,
        paddingBottom: 80, // Ruang untuk Bottom Nav
    },
    flatListColumnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    emptyListText: {
        textAlign: 'center',
        color: Colors.textLight,
        marginTop: 40,
        fontSize: 14,
    },
    card: {
        width: cardWidth,
        backgroundColor: Colors.cardBackground,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    cardImage: {
        width: '100%',
        height: cardWidth, // Membuat gambar persegi
    },
    categoryBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        opacity: 0.9,
    },
    categoryText: {
        color: Colors.textLight,
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 10,
    },
    scientificNameText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: Colors.textDark,
        marginBottom: 2,
    },
    localNameText: {
        fontSize: 12,
        color: '#666',
    },


    // --- Modal Detail ---
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        maxHeight: '90%',
        paddingBottom: 16,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
    },
    backButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: Colors.primaryGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textDark,
    },
    profileCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.primaryGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalScrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 24,
    },
    detailImage: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        marginTop: 16
    },
    scientificPanel: {
        backgroundColor: '#dfeadf',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    scientificTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textDark,
    },
    scientificNameHighlight: {
        fontStyle: 'italic',
        color: Colors.primaryGreen,
    },
    statusRow: {
        marginTop: 12,
    },
    statusLabel: {
        fontSize: 12,
        color: Colors.textDark,
        marginBottom: 8,
    },
    statusChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    statusChip: {
        borderWidth: 1,
        borderColor: '#8aa88b',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    statusChipActive: {
        backgroundColor: Colors.primaryGreen,
        borderColor: Colors.primaryGreen,
    },
    statusChipText: {
        fontSize: 11,
        color: '#6c7c6c',
    },
    statusChipTextActive: {
        color: Colors.textLight,
        fontWeight: '600',
    },
    statusDescription: {
        marginTop: 6,
        fontSize: 12,
        color: Colors.textDark,
    },
    detailCard: {
        marginTop: 18,
        borderWidth: 1,
        borderColor: '#dcdcdc',
        borderRadius: 18,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    detailTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textDark,
    },
    detailValue: {
        marginTop: 2,
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
});