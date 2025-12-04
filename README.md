🌳 MangroveGuard 🛡️
Aplikasi Konservasi Mangrove Berbasis Komunitas

✨ Deskripsi
ProdukMangroveGuard adalah aplikasi mobile berbasis komunitas (Citizen Science) yang dirancang untuk memantau dan mendokumentasikan kondisi ekosistem mangrove. Aplikasi ini memanfaatkan para konservasionis, peneliti, dan masyarakat umum untuk secara aktif berpartisipasi dalam perlindungan hutan mangrove dengan merekam data lapangan seperti observasi, polusi, dan gangguan.Dengan MangroveGuard, kita dapat:Melakukan Observasi Plot: Mencatat data detail tentang jenis, kesehatan, dan kerapatan mangrove.Mendokumentasikan Ancaman: Merekam kejadian polusi (seperti tumpahan minyak dan sampah plastik) dan gangguan (seperti penebangan ilegal).Mengidentifikasi Spesies: Mengakses panduan mangrove untuk identifikasi cepat.Memvisualisasikan Data: Melihat semua rekaman data dan plot observasi pada peta proyek interaktif.Tujuan utama dari MangroveGuard adalah menyediakan data real-time dan terverifikasi untuk mendukung upaya mitigasi, pengambilan keputusan konservasi yang lebih baik, serta meningkatkan kesadaran publik terhadap pentingnya ekosistem mangrove.

🛠️ Komponen Pembangun 
ProdukAplikasi MangroveGuard dibangun dengan beberapa komponen fungsional utama, yang memungkinkan pengguna untuk melakukan kegiatan pemantauan di lapangan:
1. Sistem Pencatatan Data LapanganPencatatan Observasi: Mendokumentasikan kondisi plot, termasuk Jenis Mangrove (cth., Rhizophora mucronata), DBH, Tinggi, Kerapatan, Kondisi Kesehatan (Sehat, Sedang Stres, Mati), dan Kondisi Substrat (Lumpur, Pasir, Campuran). * Pencatatan Polusi: Merekam detail Jenis Polusi (cth., Sampah plastik, Minyak/Oil spill), Tingkat Keparahan (Ringan, Sedang, Berat), dan Luas/Sebaran Polusi yang terdampak. * Pencatatan Gangguan: Mendokumentasikan Jenis Gangguan (cth., Penebangan ilegal), Skala Kerusakan (Kecil, Sedang, Luas), dan perkiraan Area Terdampak ($\text{m}^2$). * Pencatatan Lain-Lain (Other Sightings): Untuk merekam penampakan hewan atau spesies langka lainnya di area mangrove.Ringkasan Data: Halaman utama menampilkan statistik total Observations, Pollution, Disturbance, dan Other Sightings yang sudah direkam.
2. Panduan Mangrove (Learn)Fitur untuk identifikasi spesies, menyajikan Nama Ilmiah (cth., Acrostichum aureum), Status Konservasi (LC - Least Concern), Distribusi Alami, Nama Umum (Vernacular names), dan Tipe Tanaman.
3. Peta Proyek InteraktifMemvisualisasikan lokasi semua plot observasi dan titik data lain yang telah direkam (Polusi, Gangguan) di atas peta interaktif.Mendukung tampilan peta STANDARD, SATELLITE, dan TERRAIN.
4. Manajemen Data Pengguna (My Records)Menampilkan daftar lengkap data yang telah direkam oleh pengguna, lengkap dengan detail waktu, koordinat, dan deskripsi.Terdapat opsi untuk EDIT, HAPUS, dan melihat lokasi rekaman pada GOOGLE MAPS.

Jenis
Data,Sumber/Aksi,Deskripsi
Data Geospasial,Google Maps/Satellit,Digunakan untuk tampilan peta (Project Map) dan penentuan lokasi koordinat rekaman.
Data Input Pengguna,Crowdsourced / Relawan,"Data observasi, polusi, dan gangguan yang dimasukkan langsung oleh pengguna di lapangan."
Data Spesies,"Basis Data Konservasi (IUCN Status, dll.)","Informasi detail mengenai taksonomi, status, dan deskripsi spesies mangrove dan asosiasi."
Data Log User,Sistem Aplikasi,Informasi login (Email/Password) untuk autentikasi dan otorisasi pengguna. 

📸 Tangkapan Layar Komponen Penting
Berikut adalah tampilan visual dari fitur-fitur inti aplikasi MangroveGuard:

1. Halaman Utama & Ringkasan Data
   <img width="452" height="982" alt="Screenshot 2025-12-05 023059" src="https://github.com/user-attachments/assets/d4140901-eab3-4e61-aa86-9fa3a023d1bd" />
   <img width="453" height="981" alt="Screenshot 2025-12-05 030659" src="https://github.com/user-attachments/assets/94464e8a-ba99-444a-b2d0-4feb30054738" />

3. Pembelajaran Mangrove
  <img width="452" height="977" alt="Screenshot 2025-12-05 023155" src="https://github.com/user-attachments/assets/bff866be-b1f4-40e7-b7cf-81068528a01d" />
<img width="452" height="983" alt="Screenshot 2025-12-05 023209" src="https://github.com/user-attachments/assets/90cc5751-3c49-405f-91f1-63001911d310" />


5. Formulir Pencatatan Mangrove
   <img width="453" height="978" alt="Screenshot 2025-12-05 023224" src="https://github.com/user-attachments/assets/5e1d58eb-fbc8-459f-bf46-425983a6fe78" />
   <img width="450" height="981" alt="Screenshot 2025-12-05 023235" src="https://github.com/user-attachments/assets/abef4355-9836-42a4-acf3-e4b5dc752c81" />
   <img width="450" height="978" alt="Screenshot 2025-12-05 023246" src="https://github.com/user-attachments/assets/626147b7-a407-4b0a-ae8f-64e8e11300fd" />
   <img width="452" height="979" alt="Screenshot 2025-12-05 023255" src="https://github.com/user-attachments/assets/4cbae1e9-a8b3-4e04-adc6-d1d77a296cac" />
   <img width="453" height="984" alt="Screenshot 2025-12-05 023304" src="https://github.com/user-attachments/assets/4d3d2c52-be55-446a-aa09-6839d4fed4e6" />

6. Tampilan Hasil Pencatatan
   <img width="456" height="987" alt="Screenshot 2025-12-05 023325" src="https://github.com/user-attachments/assets/cba8e715-bcb8-442c-9183-05e9a06b93c1" />

7. Peta Ptoyek
   <img width="452" height="975" alt="Screenshot 2025-12-05 023335" src="https://github.com/user-attachments/assets/1d88300f-2db8-48b6-80e6-8d4afe6cd61e" />






   

