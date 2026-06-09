# 2.1 Deskripsi Produk

## 2.1.1 Gambaran Umum
Aplikasi ini merupakan sebuah sistem berbasis web yang dirancang untuk mengidentifikasi dan mengklasifikasikan berbagai jenis motif batik secara otomatis. Dengan memanfaatkan teknologi *Machine Learning*, sistem ini mampu mengenali pola motif batik dari gambar yang diunggah oleh pengguna dan memberikan informasi mengenai jenis motif tersebut.

## 2.1.2 Cara Kerja Sistem
1. **Input:** Pengguna mengunggah gambar atau memindai foto kain batik melalui antarmuka antarmuka web (Frontend).
2. **Proses:** Gambar yang diunggah dikirim ke server (Backend) melalui API. Sistem *Machine Learning* (model yang telah dilatih) akan memproses dan mengekstraksi fitur dari gambar untuk memprediksi jenis motifnya.
3. **Output:** Hasil prediksi kelas/motif batik akan dikembalikan oleh server dan ditampilkan kepada pengguna di halaman web beserta tingkat kecocokannya.

## 2.1.3 Teknologi yang digunakan
Sistem ini dibangun menggunakan beberapa teknologi utama:
* **Frontend:** React (dengan Vite) dan Tailwind CSS untuk antarmuka pengguna yang responsif.
* **Backend:** Python dengan *framework* Flask / FastAPI untuk menangani request API.
* **Machine Learning:** TensorFlow / Keras (menggunakan arsitektur seperti MobileNetV3) dan Scikit-Learn untuk pelatihan dan prediksi model klasifikasi citra.

## 2.1.4 Dataset Motif
Model ini dilatih menggunakan dataset gambar yang terdiri dari **19 kelas motif batik** nusantara, yaitu:
1. Batik Bali
2. Batik Betawi
3. Batik Celup
4. Batik Cendrawasih
5. Batik Ceplok
6. Batik Ciamis
7. Batik Garutan
8. Batik Gentongan
9. Batik Kawung
10. Batik Keraton
11. Batik Lasem
12. Batik Megamendung
13. Batik Parang
14. Batik Pekalongan
15. Batik Priangan
16. Batik Sekar
17. Batik Sidoluhur
18. Batik Sidomukti
19. Batik Tambal
