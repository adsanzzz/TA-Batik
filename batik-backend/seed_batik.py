import os
import sys
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models

# Ensure tables are created
print("Verifikasi dan sinkronisasi tabel di basis data...")
print("Menghapus tabel 'batik' lama untuk sinkronisasi schema...")
models.Batik.__table__.drop(bind=engine, checkfirst=True)
print("Membuat kembali tabel 'batik' dengan skema terbaru...")
models.Batik.__table__.create(bind=engine, checkfirst=True)
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        # Clear existing data to prevent duplicates on re-run
        print("Membersihkan data lama di tabel 'batik' dan 'batik_ai_info'...")
        db.query(models.Batik).delete()
        db.query(models.BatikAIInfo).delete()
        db.commit()

        print("Memulai proses seeding...")

        # Data map containing display name, AI description, and 2 catalog entries
        seeder_data = [
            {
                "display_name": "Bali",
                "ai_desc": "Batik Bali memiliki perpaduan motif tradisional Bali dengan pengaruh luar. Sering kali menggambarkan keindahan alam pulau Bali, seperti bunga kamboja, burung, serta cerita-cerita pewayangan khas Bali.",
                "catalog": [
                    {
                        "nama": "Batik Bali Buketan",
                        "jenis_acara": "Umum",
                        "asal": "Bali",
                        "makna": "Melambangkan keindahan alam Bali dan keharmonisan hidup.",
                        "filosofi": "Buketan berarti buket bunga, melambangkan kebahagiaan, kecantikan, dan keasrian alam semesta.",
                        "penggunaan": "Digunakan pada kain bawahan atau selendang dalam upacara adat Bali.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Bali Singa Barong",
                        "jenis_acara": "Umum",
                        "asal": "Bali",
                        "makna": "Melambangkan kekuatan spiritual dan pelindung dari marabahaya.",
                        "filosofi": "Singa Barong adalah makhluk mitologi pelindung kebaikan dalam budaya Bali.",
                        "penggunaan": "Dipakai sebagai hiasan dinding atau busana adat khusus.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Betawi",
                "ai_desc": "Batik Betawi memiliki ciri khas warna-warna cerah dan mencolok seperti merah, hijau, kuning, dan oranye. Motifnya seringkali menggambarkan maskot kota Jakarta seperti Ondel-ondel, Monas, atau kehidupan masyarakat Betawi kuno.",
                "catalog": [
                    {
                        "nama": "Batik Betawi Ondel-Ondel",
                        "jenis_acara": "Umum",
                        "asal": "Jakarta (Betawi)",
                        "makna": "Melambangkan penolak bala dan pelindung keluarga dari roh jahat.",
                        "filosofi": "Ondel-ondel adalah bagian dari seni pertunjukan khas Betawi yang bermakna sebagai simbol perlindungan masyarakat.",
                        "penggunaan": "Dipakai oleh pengantin pria Betawi atau untuk seragam acara formal budaya.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Betawi Pencakar Langit",
                        "jenis_acara": "Umum",
                        "asal": "Jakarta (Betawi)",
                        "makna": "Melambangkan kemajuan teknologi dan modernisasi kota Jakarta.",
                        "filosofi": "Menggambarkan dinamika pembangunan gedung-gedung bertingkat di Jakarta yang tetap berakar pada budaya lokal.",
                        "penggunaan": "Dipakai untuk pakaian kerja instansi pemerintahan DKI Jakarta.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Celup",
                "ai_desc": "Batik Celup dibuat menggunakan teknik celup rintang (seperti shibori atau tie-dye). Motifnya terbentuk dari lipatan atau ikatan kain sebelum dicelupkan ke dalam pewarna, menghasilkan pola abstrak yang indah.",
                "catalog": [
                    {
                        "nama": "Batik Celup Pelangi",
                        "jenis_acara": "Umum",
                        "asal": "Palembang",
                        "makna": "Melambangkan keceriaan, keberagaman warna hidup, dan kebahagiaan.",
                        "filosofi": "Pelangi melambangkan keindahan yang muncul setelah hujan atau badai berlalu.",
                        "penggunaan": "Banyak diaplikasikan pada kaos santai, daster, atau selendang kasual.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Celup Shibori Modern",
                        "jenis_acara": "Umum",
                        "asal": "Yogyakarta",
                        "makna": "Melambangkan kesederhanaan dan keunikan karya buatan tangan yang tidak identik.",
                        "filosofi": "Setiap tarikan lipatan menghasilkan keunikan yang tidak bisa diulangi sempurna, melambangkan keunikan manusia.",
                        "penggunaan": "Digunakan untuk kemeja kasual, tote bag, atau dekorasi interior.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Cendrawasih",
                "ai_desc": "Batik Cendrawasih berasal dari Papua. Ciri khas utamanya adalah motif burung Cendrawasih yang anggun dipadukan dengan flora khas Papua serta warna-warna alam yang eksotis.",
                "catalog": [
                    {
                        "nama": "Batik Cendrawasih Papua Klasik",
                        "jenis_acara": "Umum",
                        "asal": "Papua",
                        "makna": "Melambangkan keanggunan, kecantikan tiada tara, dan kedamaian.",
                        "filosofi": "Burung Cendrawasih dijuluki sebagai Burung Surga (Bird of Paradise), simbol kemurnian dan keagungan.",
                        "penggunaan": "Dipakai sebagai busana formal saat upacara resmi atau penyambutan tamu agung.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Cendrawasih Jingga",
                        "jenis_acara": "Umum",
                        "asal": "Papua",
                        "makna": "Melambangkan kehangatan, semangat membara, dan kemakmuran bumi Papua.",
                        "filosofi": "Warna jingga menggambarkan matahari terbit di ufuk timur Indonesia, menyinari surga alam Papua.",
                        "penggunaan": "Dipakai untuk kemeja kerja atau pakaian semi-formal.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Kawung",
                "ai_desc": "Batik Kawung adalah salah satu motif tertua di Indonesia. Bentuknya berupa empat lingkaran elips yang melambangkan buah kolang-kaling atau buah pohon aren, tersusun rapi membentuk pola geometris suci.",
                "catalog": [
                    {
                        "nama": "Batik Kawung Picis Klasik",
                        "jenis_acara": "Batik Keraton",
                        "asal": "Yogyakarta / Solo",
                        "makna": "Melambangkan kesucian pikiran, kebijaksanaan, dan keadilan.",
                        "filosofi": "Kawung Picis berukuran koin kecil (picis), melambangkan pengendalian diri dan kejujuran.",
                        "penggunaan": "Dipakai oleh keluarga kerajaan atau pejabat penting saat upacara resmi.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Kawung Seno",
                        "jenis_acara": "Umum",
                        "asal": "Solo",
                        "makna": "Melambangkan kewibawaan tingkat tinggi dan kedudukan yang terhormat.",
                        "filosofi": "Kawung Seno merupakan simbol kepemimpinan yang mengayomi seluruh lapisan masyarakat.",
                        "penggunaan": "Dipakai sebagai pakaian kemeja resmi pria modern.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Mega Mendung",
                "ai_desc": "Batik Mega Mendung berasal dari Cirebon. Bentuknya berupa awan mendung bergaya oriental dengan gradasi warna biru atau merah yang tegas. Melambangkan pembawa hujan kesuburan serta ketenangan hati.",
                "catalog": [
                    {
                        "nama": "Batik Mega Mendung Biru Klasik",
                        "jenis_acara": "Umum",
                        "asal": "Cirebon",
                        "makna": "Melambangkan ketenangan jiwa, kebijaksanaan, dan kesabaran yang luas layaknya langit.",
                        "filosofi": "Awan mendung melambangkan pembawa hujan kemakmuran, dan gradasi warna mencerminkan kedalaman emosi.",
                        "penggunaan": "Dipakai sebagai pakaian adat Cirebon resmi atau kemeja formal.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Mega Mendung Merah Jingga",
                        "jenis_acara": "Umum",
                        "asal": "Cirebon",
                        "makna": "Melambangkan keberanian, energi kreatif, dan semangat pembaharuan modern.",
                        "filosofi": "Variasi warna merah menggambarkan akulturasi budaya Cirebon yang dinamis.",
                        "penggunaan": "Banyak dijadikan busana fashion show modern atau jaket blazer.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Parang",
                "ai_desc": "Batik Parang adalah motif legendaris yang menggambarkan barisan ombak samudra. Bentuk huruf S diagonal melambangkan kontinuitas, kekuatan tak berujung, serta perjuangan ksatria yang pantang menyerah.",
                "catalog": [
                    {
                        "nama": "Batik Parang Rusak Barong",
                        "jenis_acara": "Batik Keraton",
                        "asal": "Yogyakarta",
                        "makna": "Melambangkan kekuatan moral yang tinggi, kekuasaan tertinggi, dan keberanian perang melawan nafsu diri.",
                        "filosofi": "Motif parang terbesar (barong) yang dahulu hanya boleh dikenakan oleh Raja/Sultan.",
                        "penggunaan": "Khusus untuk ritual keraton adat yang bersifat sakral.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Parang Klisik",
                        "jenis_acara": "Umum",
                        "asal": "Solo",
                        "makna": "Melambangkan kelembutan hati, ketekunan, dan perilaku yang santun.",
                        "filosofi": "Ukuran parang yang kecil melambangkan sifat feminin, keanggunan, dan kearifan seorang wanita.",
                        "penggunaan": "Dipakai oleh kaum wanita atau mempelai putri Jawa dalam pertunangan.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Sekar",
                "ai_desc": "Batik Sekar Jagad menggambarkan keindahan alam semesta dalam satu kesatuan harmonis. Motifnya terbagi atas petak-petak pulau abstrak yang berisi aneka macam motif bunga dan daun.",
                "catalog": [
                    {
                        "nama": "Batik Sekar Jagad Solo",
                        "jenis_acara": "Umum",
                        "asal": "Solo",
                        "makna": "Melambangkan keindahan keberagaman dunia (kebhinnekaan) yang dipersatukan dengan damai.",
                        "filosofi": "Sekar berarti bunga, Jagad berarti dunia. Melambangkan kumpulan bunga-bunga terindah di dunia.",
                        "penggunaan": "Dipakai oleh pengantin dalam upacara adat pernikahan Jawa.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Sekar Jagad Jogja",
                        "jenis_acara": "Umum",
                        "asal": "Yogyakarta",
                        "makna": "Melambangkan kekayaan intelektual budaya nusantara dan keluhuran budi.",
                        "filosofi": "Setiap fragmen motif mewakili suatu daerah penting, melambangkan kebersamaan hidup bernegara.",
                        "penggunaan": "Dipakai sebagai selendang atau pakaian luar formal.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Sidoluhur",
                "ai_desc": "Batik Sidoluhur mengandung harapan spiritual yang sangat mendalam agar orang yang mengenakannya senantiasa dianugerahi sifat yang berbudi luhur, terhormat, serta menjadi teladan hidup bagi orang lain.",
                "catalog": [
                    {
                        "nama": "Batik Sidoluhur Solo Modis",
                        "jenis_acara": "Umum",
                        "asal": "Solo",
                        "makna": "Melambangkan doa agar sang pemakai diangkat derajatnya dan memiliki akhlak mulia.",
                        "filosofi": "Sido berarti jadi/berhasil, Luhur berarti terhormat/berakhlak mulia.",
                        "penggunaan": "Dipakai oleh kedua mempelai dalam upacara ijab kabul pernikahan Jawa.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Sidoluhur Kraton",
                        "jenis_acara": "Batik Keraton",
                        "asal": "Yogyakarta",
                        "makna": "Melambangkan doa keselamatan bagi bayi agar kelak tumbuh menjadi orang berkedudukan luhur.",
                        "filosofi": "Mencerminkan nilai ketuhanan dan harapan keselamatan keturunan.",
                        "penggunaan": "Dipakai saat ritual siraman adat ibu hamil.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Sidomukti",
                "ai_desc": "Batik Sidomukti bermakna harapan agar pemakainya meraih kemakmuran, kecukupan materi dan batin, serta kebahagiaan hidup dunia akhirat.",
                "catalog": [
                    {
                        "nama": "Batik Sidomukti Solo",
                        "jenis_acara": "Batik Keraton",
                        "asal": "Solo",
                        "makna": "Melambangkan doa restu agar kedua mempelai hidup sejahtera, bahagia, dan berkecukupan.",
                        "filosofi": "Sido berarti terlaksana, Mukti berarti makmur/sejahtera.",
                        "penggunaan": "Dipakai wajib oleh kedua mempelai saat prosesi resepsi adat.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Sidomukti Garuda",
                        "jenis_acara": "Umum",
                        "asal": "Yogyakarta",
                        "makna": "Melambangkan kebebasan jiwa, kejayaan negara, dan kewibawaan spiritual.",
                        "filosofi": "Motif burung garuda melambangkan kekuatan pelindung semesta.",
                        "penggunaan": "Dipakai untuk busana kemeja pimpinan instansi formal.",
                        "gambar": ""
                    }
                ]
            },
            {
                "display_name": "Tambal",
                "ai_desc": "Batik Tambal bermakna menambal atau memperbaiki hal-hal yang rusak dalam hidup. Terdiri dari motif-motif segitiga geometris berpetak-petak yang diisi oleh aneka motif batik keraton Jawa.",
                "catalog": [
                    {
                        "nama": "Batik Tambal Kanoman",
                        "jenis_acara": "Batik Keraton",
                        "asal": "Yogyakarta",
                        "makna": "Melambangkan harapan akan kesembuhan jasmani dan perbaikan akhlak diri.",
                        "filosofi": "Tambal melambangkan tindakan memperbaiki kain yang bolong/rusak, bermakna pemulihan hidup.",
                        "penggunaan": "Dipakai menyelimuti orang sakit atau digunakan sebagai kain busana ritual.",
                        "gambar": ""
                    },
                    {
                        "nama": "Batik Tambal Sewu",
                        "jenis_acara": "Umum",
                        "asal": "Solo",
                        "makna": "Melambangkan seribu perbaikan diri menuju kemurnian hati.",
                        "filosofi": "Sewu berarti seribu, menggambarkan kompleksitas perjuangan batin membenahi kelemahan diri.",
                        "penggunaan": "Dipakai sebagai busana luar bergaya etnik modern.",
                        "gambar": ""
                    }
                ]
            }
        ]

        # Mapping dictionaries for the new schema
        MOTIF_UTAMA_MAP = {
            "Bali": "Buketan Bunga & Flora",
            "Betawi": "Ondel-Ondel & Ikon Jakarta",
            "Celup": "Pola Abstrak Jumputan",
            "Cendrawasih": "Burung Cendrawasih & Flora Papua",
            "Kawung": "Buah Aren / Empat Elips",
            "Mega Mendung": "Awan Mendung Cirebon",
            "Parang": "Barisan Ombak Diagonal S",
            "Sekar": "Sekar Jagad / Kumpulan Ragam Hias",
            "Sidoluhur": "Sido Luhur / Geometris",
            "Sidomukti": "Sido Mukti / Singgasana & Kupu-Kupu",
            "Tambal": "Segitiga Geometris Berpetak",
        }

        JENIS_BATIK_MAP = {
            "Bali": "Batik Cap",
            "Betawi": "Batik Cap",
            "Celup": "Batik Celup",
            "Cendrawasih": "Batik Tulis",
            "Kawung": "Batik Tulis",
            "Mega Mendung": "Batik Tulis",
            "Parang": "Batik Tulis",
            "Sekar": "Batik Tulis",
            "Sidoluhur": "Batik Tulis",
            "Sidomukti": "Batik Tulis",
            "Tambal": "Batik Tulis",
        }

        # Insert into DB
        total_ai_info = 0
        total_batik = 0

        for item in seeder_data:
            display_name = item["display_name"]
            # Seed BatikAIInfo
            ai_info = models.BatikAIInfo(
                nama=display_name,
                deskripsi=item["ai_desc"]
            )
            db.add(ai_info)
            total_ai_info += 1

            # Seed Batik entries
            for b in item["catalog"]:
                motif_utama = MOTIF_UTAMA_MAP.get(display_name, "Motif Tradisional")
                jenis_batik = JENIS_BATIK_MAP.get(display_name, "Batik Tulis")
                
                batik_entry = models.Batik(
                    nama=b["nama"],
                    motif_utama=motif_utama,
                    jenis_acara=b["jenis_acara"],
                    jenis_batik=jenis_batik,
                    filosofi=b["filosofi"],
                    gambar=b["gambar"]
                )
                db.add(batik_entry)
                total_batik += 1

        db.commit()
        print(f"Sukses Seeding! Ditambahkan {total_ai_info} data 'BatikAIInfo' dan {total_batik} data 'Batik'.")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
    print("Seeder Selesai dengan Sukses!")
