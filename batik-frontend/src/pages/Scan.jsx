import { useState } from "react";
import CardBatik from "../components/CardBatik";
import { BASE_URL } from "../services/api";
import VtonModal from "../components/VtonModal";

const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "8px", verticalAlign: "middle", color: "#d4af37" }}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
  </svg>
);

export default function Scan() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBatik, setSelectedBatik] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showVtonModal, setShowVtonModal] = useState(false);

  const closeModal = () => setSelectedBatik(null);
  const closeResultModal = () => setShowResultModal(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null); // Reset result when new image is picked
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Silakan pilih gambar terlebih dahulu");

    const formData = new FormData();
    formData.append("file", image);

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Gagal memproses prediksi");
      }

      setResult(data);
      setShowResultModal(true); // Show popup immediately
    } catch (error) {
      alert(error.message || "Terjadi kesalahan saat mengirim ke sistem AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Batik Recognition</h1>
        <p style={styles.subtitle}>
          Analisis motif batik berbasis kecerdasan buatan
        </p>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div style={styles.mainLayout}>

        {/* LEFT: INFO PANEL */}
        <div style={styles.infoPanel}>
          <div style={styles.decorTop}></div>
          <h2 style={styles.infoTitle}>Dukungan Motif AI</h2>
          <p style={styles.infoDesc}>
            Sistem klasifikasi kami dilatih secara khusus untuk mengenali <strong>11 jenis motif batik</strong> berikut:
          </p>
          <ul style={styles.infoList}>
            <li style={styles.infoListLi}><strong>1. Bali</strong> - Khas dengan perpaduan ornamen tradisional & modern</li>
            <li style={styles.infoListLi}><strong>2. Betawi</strong> - Menampilkan ikon budaya seperti Ondel-ondel</li>
            <li style={styles.infoListLi}><strong>3. Celup</strong> - Motif jumputan/ikat celup yang penuh warna</li>
            <li style={styles.infoListLi}><strong>4. Cendrawasih</strong> - Keindahan burung Papua yang eksotis</li>
            <li style={styles.infoListLi}><strong>5. Kawung</strong> - Pola lingkaran geometris buah kolang-kaling</li>
            <li style={styles.infoListLi}><strong>6. Mega Mendung</strong> - Corak awan megah bergradasi khas Cirebon</li>
            <li style={styles.infoListLi}><strong>7. Parang</strong> - Motif garis diagonal melambang pantang menyerah</li>
            <li style={styles.infoListLi}><strong>8. Sekar</strong> - Keindahan buket bunga/tanaman yang rimbun</li>
            <li style={styles.infoListLi}><strong>9. Sidoluhur</strong> - Doa & harapan kemuliaan bagi pemakainya</li>
            <li style={styles.infoListLi}><strong>10. Sidomukti</strong> - Harapan kemakmuran & kebahagiaan lahir batin</li>
            <li style={styles.infoListLi}><strong>11. Tambal</strong> - Motif potongan kain perca bermakna memperbaiki diri</li>
          </ul>
          <div style={styles.infoFooter}>
            ✦ Pastikan motif batik terfokus dan memiliki pencahayaan cukup untuk hasil prediksi maksimal.
          </div>
        </div>

        {/* RIGHT: UPLOAD AREA */}
        <div style={styles.uploadCardWrapper}>
          <div style={styles.uploadCard}>
            <div style={styles.decorTop}></div>

            <label style={styles.uploadArea}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />

              {preview ? (
                <div style={styles.previewWrapper}>
                  <img
                    src={preview}
                    alt="preview"
                    style={styles.preview}
                  />

                  <div style={styles.previewOverlay}>
                    <span>Siap Dianalisis AI</span>
                  </div>
                </div>
              ) : (
                <div style={styles.placeholder}>
                  <div style={styles.iconCircle}>
                    Ai
                  </div>

                  <h3 style={styles.uploadTitle}>
                    Unggah Motif Batik
                  </h3>

                  <p style={styles.placeholderText}>
                    Klik atau tarik gambar batik ke area ini
                  </p>

                  <span style={styles.subPlaceholder}>
                    JPG • PNG • JPEG
                  </span>

                  <div style={styles.aiBadge}>
                    ✦ Powered by Batik Intelligence AI
                  </div>
                </div>
              )}
            </label>

            <button
              onClick={handleUpload}
              style={styles.button}
            >
              {loading
                ? "Menganalisis Motif..."
                : "Analisis Dengan AI"}
            </button>
          </div>
        </div>

      </div>

      {/* RESULT */}
      {result && (
        <div style={styles.resultSection}>
          <div style={styles.resultHeader}>
            <h2 style={styles.resultTitle}>
              {result.predicted_label}
            </h2>
            <span style={styles.confidence}>
              {(result.confidence * 100).toFixed(1)}% Confidence
            </span>
          </div>

          {result.matches?.length > 0 ? (
            <div style={styles.grid}>
              {result.matches.map((item) => (
                <CardBatik
                  key={item.id}
                  batik={item}
                  onClick={() => setSelectedBatik(item)}
                />
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              Data motif tidak ditemukan dalam katalog
            </div>
          )}
        </div>
      )}

      {/* RESULT MODAL (POPUP) */}
      {showResultModal && result && (
        <div style={styles.modalOverlay} onClick={closeResultModal}>
          <div style={styles.modalContentAI} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeaderAI}>
              <h2 style={styles.modalTitleAI}>Hasil Analisis AI</h2>
              <button onClick={closeResultModal} style={styles.closeBtnAI}>&times;</button>
            </div>

            <div style={styles.modalBodyAI}>
              <div style={styles.predictionHighlight}>
                <p style={styles.highlightText}>
                  Batik yang Anda scan teridentifikasi sebagai:
                </p>
                <h3 style={styles.highlightLabel}>{result.predicted_label}</h3>
                <div style={styles.confidenceBadge}>
                  Tingkat Keyakinan: {(result.confidence * 100).toFixed(1)}%
                </div>
              </div>

              {result.warning && (
                <div style={{...styles.warningBox, borderRadius: "12px", borderLeft: "none", borderTop: "5px solid #D4AF37"}}>
                  <strong>⚠️ Perhatian:</strong><br/>{result.warning}
                </div>
              )}

              <div style={styles.infoSectionAI}>
          <h4>Tentang Batik Ini</h4>
          <p style={styles.descriptionAI}>{result.description}</p>
        </div>
        {result.event_suggestions && result.event_suggestions.length > 0 && (
          <div style={styles.recommendSection}>
            <h4>Rekomendasi Acara</h4>
            <ul style={styles.recommendList}>
              {result.event_suggestions.map((event) => (
                <li key={event} style={styles.recommendItem}>{event}</li>
              ))}
            </ul>
          </div>
        )}
        <div style={{display: "flex", gap: "10px", marginTop: "15px"}}>
          <button 
            onClick={() => setShowVtonModal(true)} 
            style={{...styles.okButton, background: "linear-gradient(135deg, #D4AF37, #AA8120)"}}
          >
            Coba Virtual Try-On ✨
          </button>
          <button onClick={closeResultModal} style={{...styles.okButton, background: "rgba(255,255,255,0.1)", color: "#D4AF37", border: "1px solid #D4AF37"}}>
            Lihat Katalog Lengkap
          </button>
        </div>
            </div>
          </div>
        </div>
      )}

      {/* CATALOG DETAIL MODAL */}
      {selectedBatik && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <style>{`
            @keyframes modalSlideUp {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .modal-scroll-area::-webkit-scrollbar {
              width: 8px;
            }
            .modal-scroll-area::-webkit-scrollbar-track {
              background: #F9F5F0;
              border-radius: 10px;
            }
            .modal-scroll-area::-webkit-scrollbar-thumb {
              background: #D4AF37;
              border-radius: 10px;
            }
          `}</style>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeModal}>&times;</button>

            <div style={styles.modalFlex}>
              {/* Left: Image */}
              <div style={styles.modalImageWrapper}>
                <img
                  src={
                    selectedBatik.gambar?.startsWith("http")
                      ? selectedBatik.gambar
                      : `${BASE_URL}/${selectedBatik.gambar}`
                  }
                  alt={selectedBatik.nama}
                  style={styles.modalImg}
                  onError={(e) => e.target.src = "https://via.placeholder.com/600x800?text=Batik+Image"}
                />
              </div>

              {/* Right: Content */}
              <div style={styles.modalBody}>
                <div style={styles.modalHeader}>
                  <div>
                    <h2 style={styles.modalTitle}>
                      {selectedBatik.jenis_acara === "Batik Keraton" && <CrownIcon />}
                      {selectedBatik.nama}
                    </h2>
                    <span style={styles.modalBadge}>{selectedBatik.jenis_batik}</span>
                  </div>
                </div>

                {selectedBatik.jenis_acara === "Batik Keraton" && (
                  <div style={styles.warningBox}>
                    <strong>⚠️ Perhatian:</strong> Batik ini termasuk dalam kategori <strong>Batik Keraton</strong> yang memiliki aturan khusus. Batik ini hanya boleh digunakan oleh keturunan keraton jika berada di area keraton.
                  </div>
                )}

                <div style={styles.modalScrollArea} className="modal-scroll-area">
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalLabel}>Motif Utama</h4>
                    <p style={styles.modalText}>{selectedBatik.motif_utama || "Informasi belum tersedia"}</p>
                  </div>

                  <div style={styles.modalSection}>
                    <h4 style={styles.modalLabel}>Kategori / Jenis Acara</h4>
                    <p style={styles.modalText}>{selectedBatik.jenis_acara || "Informasi belum tersedia"}</p>
                  </div>

                  <div style={styles.modalSection}>
                    <h4 style={styles.modalLabel}>Filosofi</h4>
                    <p style={styles.modalText}>{selectedBatik.filosofi || "Informasi belum tersedia"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VTON Modal for Scanned Image */}
      {showVtonModal && result && preview && (
        <VtonModal 
          batik={{ nama: result.predicted_label, gambar: preview }} 
          onClose={() => setShowVtonModal(false)} 
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1E1A17 0%, #3E2723 50%, #5D4037 100%)",
    padding: "60px 20px",
    fontFamily: "Poppins, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "700",
    color: "#fff",
    fontFamily: "'Playfair Display', serif",
  },
  subtitle: {
    color: "#E0E0E0",
    marginTop: "10px",
  },

  resultSection: {
    marginTop: "60px",
    maxWidth: "1100px",
    marginInline: "auto",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  resultTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#fff",
    fontFamily: "'Playfair Display', serif",
  },
  confidence: {
    color: "#D4AF37",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },

  empty: {
    padding: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "10px",
    textAlign: "center",
    color: "#E0E0E0",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(44, 30, 22, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px",
    backdropFilter: "blur(5px)",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "1000px",
    maxHeight: "85vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
    overflow: "hidden",
    animation: "modalSlideUp 0.4s ease-out",
  },
  modalFlex: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    flexWrap: "wrap",
  },
  modalImageWrapper: {
    flex: "1.2",
    minWidth: "300px",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: "85vh",
  },
  modalImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  modalBody: {
    flex: "1",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    minWidth: "300px",
    maxHeight: "85vh",
    overflow: "hidden",
  },
  modalHeader: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  modalTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#2C1E16",
    margin: "0 0 10px 0",
    fontFamily: "'Playfair Display', serif",
  },
  modalBadge: {
    display: "inline-block",
    background: "#F9F5F0",
    color: "#8B5E34",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
    border: "1px solid rgba(139, 94, 52, 0.2)",
  },
  modalScrollArea: {
    overflowY: "auto",
    paddingRight: "10px",
    flex: 1,
  },
  closeBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    fontSize: "2rem",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    zIndex: 100,
    lineHeight: "1",
  },
  modalSection: {
    marginBottom: "20px",
  },
  modalLabel: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "800",
    color: "#8B5E34",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  modalText: {
    fontSize: "1rem",
    color: "#4a3b31",
    lineHeight: "1.7",
    margin: 0,
  },
  modalContentAI: {
    background: "#1E1A17",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "24px",
    maxWidth: "500px",
    width: "90%",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    animation: "modalSlideUp 0.3s ease",
  },
  modalHeaderAI: {
    padding: "20px 25px",
    background: "rgba(212, 175, 55, 0.1)",
    borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
    color: "#D4AF37",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitleAI: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "600",
    fontFamily: "Poppins, sans-serif",
  },
  closeBtnAI: {
    background: "none",
    border: "none",
    color: "#D4AF37",
    fontSize: "1.8rem",
    cursor: "pointer",
    lineHeight: 1,
  },
  modalBodyAI: {
    padding: "30px",
    textAlign: "center",
  },
  predictionHighlight: {
    marginBottom: "25px",
    padding: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(212, 175, 55, 0.2)",
  },
  highlightText: {
    margin: "0 0 10px 0",
    color: "#E0E0E0",
    fontSize: "0.9rem",
  },
  highlightLabel: {
    margin: "0 0 10px 0",
    fontSize: "2rem",
    color: "#fff",
    fontFamily: "'Playfair Display', serif",
  },
  confidenceBadge: {
    display: "inline-block",
    padding: "6px 12px",
    background: "rgba(212, 175, 55, 0.15)",
    color: "#D4AF37",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  infoSectionAI: {
    textAlign: "left",
    marginBottom: "25px",
    color: "#fff",
  },
  descriptionAI: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#E0E0E0",
  },
  okButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #D4AF37, #F4D03F)",
    color: "#1E1A17",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  warningBox: {
    background: "rgba(212, 175, 55, 0.1)",
    borderLeft: "5px solid #D4AF37",
    padding: "20px",
    borderRadius: "0 12px 12px 0",
    color: "#E0E0E0",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    marginBottom: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    textAlign: "left",
  },
  uploadCard: {
  maxWidth: "100%",
  margin: "0 auto",

  background:
    "linear-gradient(135deg,#4E342E,#2C1E16)",

  borderRadius: "30px",

  padding: "35px",

  border:
    "1px solid rgba(212,175,55,0.15)",

  boxShadow:
    "0 30px 80px rgba(0,0,0,0.35)",

  position: "relative",

  overflow: "hidden",
},

decorTop: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,

  height: "5px",

  background:
    "linear-gradient(90deg,#D4AF37,#F4D03F,#D4AF37)",
},

uploadArea: {
  minHeight: "420px",

  border:
    "2px dashed rgba(212,175,55,0.35)",

  borderRadius: "24px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  background:
    "rgba(255,255,255,0.04)",

  cursor: "pointer",

  transition: "0.3s",
},

placeholder: {
  textAlign: "center",
},

iconCircle: {
  width: "120px",
  height: "120px",

  borderRadius: "50%",

  background:
    "rgba(212,175,55,0.12)",

  border:
    "1px solid rgba(212,175,55,0.2)",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  fontSize: "3rem",

  margin: "0 auto 25px",
},

uploadTitle: {
  color: "#F8F4EE",

  fontSize: "2rem",

  marginBottom: "10px",

  fontFamily:
    "'Playfair Display', serif",
},

placeholderText: {
  color: "#F8F4EE",

  fontSize: "1.05rem",

  marginBottom: "10px",
},

subPlaceholder: {
  color: "#D4AF37",

  display: "block",

  marginBottom: "25px",
},

aiBadge: {
  display: "inline-block",

  padding: "10px 18px",

  borderRadius: "999px",

  background:
    "rgba(212,175,55,0.1)",

  color: "#D4AF37",

  fontSize: "0.9rem",

  border:
    "1px solid rgba(212,175,55,0.2)",
},

previewWrapper: {
  position: "relative",
  width: "100%",
},

preview: {
  width: "100%",
  height: "420px",

  objectFit: "cover",

  borderRadius: "18px",
},

previewOverlay: {
  position: "absolute",

  bottom: "15px",
  left: "15px",

  background:
    "rgba(0,0,0,0.6)",

  color: "#fff",

  padding: "10px 18px",

  borderRadius: "999px",

  backdropFilter: "blur(10px)",
},

button: {
  marginTop: "25px",

  width: "100%",

  padding: "18px",

  border: "none",

  borderRadius: "18px",

  cursor: "pointer",

  fontWeight: "700",

  fontSize: "1rem",

  color: "#1E1A17",

  background:
    "linear-gradient(135deg,#D4AF37,#F4D03F)",

  boxShadow:
    "0 15px 35px rgba(212,175,55,0.25)",
},
  mainLayout: {
    display: "flex",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  infoPanel: {
    flex: "1 1 350px",
    background: "linear-gradient(135deg, #2D1B10 0%, #1A0D07 100%)",
    borderRadius: "30px",
    padding: "35px",
    border: "1px solid rgba(212, 175, 55, 0.15)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  infoTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#D4AF37",
    fontFamily: "'Playfair Display', serif",
    marginBottom: "15px",
    marginTop: "10px",
  },
  infoDesc: {
    color: "#E0E0E0",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  infoList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flexGrow: 1,
  },
  infoListLi: {
    fontSize: "0.95rem",
    color: "#F8F4EE",
    lineHeight: "1.4",
    borderBottom: "1px solid rgba(212, 175, 55, 0.1)",
    paddingBottom: "8px",
  },
  infoFooter: {
    marginTop: "25px",
    fontSize: "0.85rem",
    color: "#D4AF37",
    fontStyle: "italic",
    lineHeight: "1.4",
    background: "rgba(212, 175, 55, 0.05)",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(212, 175, 55, 0.15)",
  },
  uploadCardWrapper: {
    flex: "1.3 1 450px",
  },
};