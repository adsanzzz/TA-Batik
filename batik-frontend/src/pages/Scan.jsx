import { useState } from "react";
import { createPortal } from "react-dom";
import { colors, fonts } from "../theme";
import CardBatik from "../components/CardBatik";
import { BASE_URL } from "../services/api";
import VtonModal from "../components/VtonModal";
import Footer from "../components/Footer";
import LoadingLogo from "../components/LoadingLogo";

const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "8px", verticalAlign: "middle", color: colors.blue }}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
  </svg>
);

const API_URL = `${BASE_URL}/api/predict`;

const SparklesIcon = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "8px" }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" opacity="0.6"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" opacity="0.6"/>
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

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/predict`, {
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
    <>
    <div style={styles.container} className="scan-container">
      {/* Background Pattern */}
      <style>{`
        .scan-container * {
          box-sizing: border-box !important;
        }
        /* RESPONSIVE DESIGN FOR SCAN AI */
        @media (max-width: 1024px) {
          .scan-container { padding: 40px 20px !important; }
          .scan-layout { gap: 20px !important; }
          .scan-info-panel { padding: 25px !important; }
        }

        @media (max-width: 768px) {
          .scan-subtitle {
            max-width: 250px !important;
            margin: 0 auto !important;
            line-height: 1.4 !important;
          }
          .scan-container { padding: 25px 15px 15px !important; }
          .scan-title { font-size: 1.8rem !important; }
          .scan-layout { 
            flex-direction: column-reverse !important; 
            gap: 25px !important;
          }
          .scan-info-panel { 
            flex: 1 1 100% !important; 
            min-width: 100% !important; 
            padding: 20px !important; 
            border-radius: 20px !important;
          }
          .scan-upload-wrapper { 
            flex: 1 1 100% !important; 
            min-width: 100% !important; 
          }
          .scan-preview { height: 280px !important; }
          .scan-upload-card {
            padding: 20px !important;
            border-radius: 20px !important;
          }
          .scan-upload-area {
            min-height: 300px !important;
            border-radius: 18px !important;
          }
          .scan-icon-circle {
            width: 80px !important;
            height: 80px !important;
            font-size: 2.2rem !important;
            margin-bottom: 15px !important;
          }
          .scan-upload-title {
            font-size: 1.5rem !important;
          }
          
          /* Modal Adjustments */
          .scan-modal-content { max-height: 90vh !important; }
          .scan-modal-flex { flex-direction: column !important; }
          .scan-modal-img-wrapper { max-height: 35vh !important; min-width: 100% !important; flex: none !important; }
          .scan-modal-body { padding: 20px !important; min-width: 100% !important; }
        }
      `}</style>      {/* HEADER */}
      <div style={styles.header}>
        <img src="/logo.png" alt="Logo" style={styles.logoImage} />
        <h1 style={styles.title} className="scan-title">
          <SparklesIcon size={28} color={colors.blue} /> Batik <span style={styles.gold}>Recognition</span>
        </h1>
        <p style={styles.subtitle} className="scan-subtitle">
          Analisis motif batik berbasis kecerdasan buatan
        </p>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div style={styles.mainLayout} className="scan-layout">

        {/* LEFT: INFO PANEL */}
        <div style={styles.infoPanel} className="scan-info-panel">
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
            Pastikan motif batik terfokus dan memiliki pencahayaan cukup untuk hasil prediksi maksimal.
          </div>
        </div>

        {/* RIGHT: UPLOAD AREA */}
        <div style={styles.uploadCardWrapper} className="scan-upload-wrapper">
          <div style={styles.uploadCard} className="scan-upload-card">

            <label style={styles.uploadArea} className="scan-upload-area">
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
                    className="scan-preview"
                  />

                  <div style={styles.previewOverlay}>
                    <span>Siap Dianalisis AI</span>
                  </div>
                </div>
              ) : (
                <div style={styles.placeholder}>
                  <div style={styles.iconCircle} className="scan-icon-circle">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>

                  <h3 style={styles.uploadTitle} className="scan-upload-title">
                    Unggah Motif Batik
                  </h3>

                  <p style={styles.placeholderText}>
                    Klik atau tarik gambar batik ke area ini
                  </p>

                  <span style={styles.subPlaceholder}>
                    JPG • PNG • JPEG
                  </span>

                  <div style={styles.aiBadge}>
                    Powered by Batik Intelligence AI
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

      {/* LOADING OVERLAY */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <LoadingLogo text="AI sedang menganalisis motif batik Anda..." size={80} />
        </div>
      )}

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
      {showResultModal && result && createPortal(
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
                <div style={{ marginTop: "15px", color: colors.danger, fontSize: "0.95rem", lineHeight: "1.6" }}>
                  <strong>Perhatian:</strong> {result.warning}
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
            style={{...styles.okButton, background: colors.blueGradient, color: colors.onBlue}}
          >
            Coba Virtual Try-On
          </button>
          <button onClick={closeResultModal} style={{...styles.okButton, background: colors.surface, color: colors.blue, border: `1px solid ${colors.blueBorder}`}}>
            Lihat Katalog Lengkap
          </button>
        </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CATALOG DETAIL MODAL */}
      {selectedBatik && createPortal(
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
              background: #EEF3FF;
              border-radius: 10px;
            }
            .modal-scroll-area::-webkit-scrollbar-thumb {
              background: #033EEE;
              border-radius: 10px;
            }
          `}</style>
          <div style={styles.modalContent} className="scan-modal-content" onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeModal}>&times;</button>

            <div style={styles.modalFlex} className="scan-modal-flex">
              {/* Left Side: Uploaded Image */}
              <div style={styles.modalImageWrapper} className="scan-modal-img-wrapper">
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
              <div style={styles.modalBody} className="scan-modal-body">
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
                    <strong>Perhatian:</strong> Batik ini termasuk dalam kategori <strong>Batik Keraton</strong> yang memiliki aturan khusus. Batik ini hanya boleh digunakan oleh keturunan keraton jika berada di area keraton.
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
        </div>,
        document.body
      )}

      {/* VTON Modal for Scanned Image */}
      {showVtonModal && result && preview && (
        <VtonModal 
          batik={{ nama: result.predicted_label, gambar: preview }} 
          onClose={() => setShowVtonModal(false)} 
        />
      )}

      {/* FOOTER */}
    </div>
    <Footer />
    </>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "60px 40px",
    background: "transparent",
    color: colors.textBody,
    fontFamily: fonts.body,
    position: "relative",
    overflow: "hidden",
  },
  pattern: {
    position: "absolute",
    inset: 0,
    opacity: 0.18,
    backgroundImage: `
      radial-gradient(circle at center,
      ${colors.blue} 2.5px,
      transparent 2.5px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 1
  },
  logoImage: {
    height: "55px",
    width: "auto",
    marginBottom: "15px",
    filter: "drop-shadow(0px 4px 10px rgba(10,25,80,0.12))"
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "700",
    fontFamily: fonts.heading,
    color: colors.textHead,
    WebkitTextFillColor: colors.textHead,
    paddingTop: "10px",
    paddingBottom: "10px",
    lineHeight: "1.3",
  },
  gold: {
    color: colors.blue,
    WebkitTextFillColor: colors.blue,
  },
  subtitle: {
    color: colors.textBody,
    marginTop: "10px",
  },

  resultSection: {
    marginTop: "60px",
    maxWidth: "1100px",
    marginInline: "auto",
    position: "relative",
    zIndex: 1,
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  resultTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    fontFamily: fonts.heading,
    color: colors.textHead,
    WebkitTextFillColor: colors.textHead,
    paddingTop: "10px",
    paddingBottom: "10px",
    lineHeight: "1.3",
  },
  confidence: {
    color: colors.blue,
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },

  empty: {
    padding: "20px",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "10px",
    textAlign: "center",
    color: colors.textBody,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 25, 80, 0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px",
    backdropFilter: "blur(5px)",
  },
  modalContent: {
    background: colors.surface,
    borderRadius: "24px",
    width: "100%",
    maxWidth: "1000px",
    maxHeight: "85vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxShadow: colors.shadow,
    overflow: "hidden",
    border: `1px solid ${colors.border}`,
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
    color: colors.textHead,
    margin: "0 0 10px 0",
    fontFamily: fonts.heading,
  },
  modalBadge: {
    display: "inline-block",
    background: colors.blueSoft,
    color: colors.blue,
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
    border: `1px solid ${colors.blueBorder}`,
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
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: colors.textHead,
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
    color: colors.blue,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  modalText: {
    fontSize: "1rem",
    color: colors.textBody,
    lineHeight: "1.7",
    margin: 0,
  },
  modalContentAI: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "24px",
    maxWidth: "650px",
    width: "90%",
    overflow: "hidden",
    boxShadow: colors.shadow,
    animation: "modalSlideUp 0.3s ease",
  },
  modalHeaderAI: {
    padding: "20px 25px",
    background: colors.surfaceAlt,
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textHead,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitleAI: {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: "700",
    fontFamily: fonts.body,
  },
  closeBtnAI: {
    background: "none",
    border: "none",
    color: colors.blue,
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
    background: colors.blueSoft,
    borderRadius: "16px",
    border: `1px solid ${colors.blueBorder}`,
  },
  highlightText: {
    margin: "0 0 10px 0",
    color: colors.textBody,
    fontSize: "0.9rem",
  },
  highlightLabel: {
    margin: "0 0 10px 0",
    fontSize: "2rem",
    color: colors.textHead,
    fontFamily: fonts.heading,
  },
  confidenceBadge: {
    display: "inline-block",
    padding: "6px 12px",
    background: colors.blueSoft2,
    color: colors.blue,
    border: `1px solid ${colors.blueBorder}`,
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  infoSectionAI: {
    textAlign: "left",
    marginBottom: "25px",
    color: colors.textHead,
  },
  descriptionAI: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: colors.textBody,
  },
  okButton: {
    width: "100%",
    padding: "14px",
    background: colors.blueGradient,
    color: colors.onBlue,
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  warningBox: {
    background: colors.blueSoft,
    borderLeft: `5px solid ${colors.blue}`,
    padding: "20px",
    borderRadius: "0 12px 12px 0",
    color: colors.textBody,
    fontSize: "0.95rem",
    lineHeight: "1.6",
    marginBottom: "25px",
    boxShadow: colors.shadowSm,
    textAlign: "left",
  },
  uploadCard: {
    background: colors.surface,
    backdropFilter: "blur(12px)",
    borderRadius: "30px",
    padding: "35px",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
    position: "relative",
    maxWidth: "100%",
    margin: "0 auto",
    overflow: "hidden",
  },

  decorTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "5px",
    background: colors.blueGradient,
  },

  uploadArea: {
    minHeight: "420px",
    border: `2px dashed ${colors.blueBorder}`,
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: colors.surfaceAlt,
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
    background: colors.blueSoft,
    border: `1px solid ${colors.blueBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
    margin: "0 auto 25px",
    color: colors.blue,
  },

  uploadTitle: {
    color: colors.textHead,
    fontSize: "2rem",
    marginBottom: "10px",
    fontFamily: fonts.heading,
  },

  placeholderText: {
    color: colors.textBody,
    fontSize: "1.05rem",
    marginBottom: "10px",
  },

  subPlaceholder: {
    color: colors.blue,
    display: "block",
    marginBottom: "25px",
  },

  aiBadge: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: "999px",
    background: colors.blueSoft,
    color: colors.blue,
    fontSize: "0.9rem",
    border: `1px solid ${colors.blueBorder}`,
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
    background: "rgba(0,0,0,0.6)",
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
    color: colors.onBlue,
    background: colors.blueGradient,
    boxShadow: colors.shadow,
  },
  mainLayout: {
    display: "flex",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap",
    alignItems: "stretch",
    position: "relative",
    zIndex: 1,
  },
  infoPanel: {
    flex: "1 1 350px",
    background: colors.surface,
    backdropFilter: "blur(12px)",
    borderRadius: "30px",
    padding: "35px",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  infoTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: colors.textHead,
    fontFamily: fonts.heading,
    marginBottom: "15px",
    marginTop: "10px",
  },
  infoDesc: {
    color: colors.textBody,
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
    color: colors.textBody,
    lineHeight: "1.4",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: "8px",
  },
  infoFooter: {
    marginTop: "25px",
    fontSize: "0.85rem",
    color: colors.blue,
    fontStyle: "italic",
    lineHeight: "1.4",
    background: colors.blueSoft,
    padding: "12px 18px",
    borderRadius: "12px",
    border: `1px solid ${colors.blueBorder}`,
  },
  uploadCardWrapper: {
    flex: "1.3 1 450px",
  },
  recommendSection: {
    marginTop: "20px",
    textAlign: "left",
  },
  recommendTitle: {
    color: colors.textHead,
    fontSize: "1rem",
    marginBottom: "10px",
  },
  recommendList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    listStyle: "none",
    padding: 0,
  },
  recommendItem: {
    background: colors.blueSoft,
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    color: colors.blue,
    border: `1px solid ${colors.blueBorder}`,
  },
  footerContainer: {
    width: "100%",
    maxWidth: "1200px",
    margin: "50px auto 10px auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderTop: `1px solid ${colors.border}`,
    paddingTop: "30px"
  },
  footerImage: {
    width: "100%",
    maxWidth: "850px",
    height: "auto",
    borderRadius: "16px",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`
  }
};