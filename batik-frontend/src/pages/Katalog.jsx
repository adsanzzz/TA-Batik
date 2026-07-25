import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { colors, fonts } from "../theme";
import { getBatik, BASE_URL } from "@/services/api";
import CardBatik from "@/components/CardBatik";
import VtonModal from "@/components/VtonModal";
import Footer from "@/components/Footer";
import LoadingLogo from "@/components/LoadingLogo";

const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "8px", verticalAlign: "middle", color: colors.blue }}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
  </svg>
);

const CATEGORIES = ["Semua", "Bali", "Betawi", "Celup", "Cendrawasih", "Kawung", "Mega Mendung", "Parang", "Sekar", "Sidoluhur", "Sidomukti", "Tambal"];

const SparklesIcon = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "8px" }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" opacity="0.6"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" opacity="0.6"/>
  </svg>
);

export default function Katalog() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatik, setSelectedBatik] = useState(null);
  const [showVtonModal, setShowVtonModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const pillsRef = useRef(null);

  const scrollPills = (direction) => {
    const el = pillsRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -180 : 180, behavior: "smooth" });
  };

  const updateScrollState = () => {
    const el = pillsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    getBatik()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const closeModal = () => {
    setSelectedBatik(null);
    setShowVtonModal(false);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = 
      (item.nama?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
      (item.motif_utama?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.jenis_batik?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.jenis_acara?.toLowerCase() || "").includes(searchQuery.toLowerCase());
                          
    const matchesCategory = 
      selectedCategory === "Semua" || 
      (item.nama?.toLowerCase() || "").includes(selectedCategory.toLowerCase());
                            
    return matchesSearch && matchesCategory;
  });

  return (
    <>
    <div style={styles.container} className="katalog-container">
      {/* Background Pattern */}

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
        .modal-scroll-area::-webkit-scrollbar-thumb:hover {
          background: #0A46D6;
          border-radius: 10px;
        }
        .search-input-focus:focus {
          border-color: #033EEE !important;
          box-shadow: 0 8px 30px rgba(3, 62, 238, 0.12) !important;
          background: #FFFFFF !important;
        }
        .filter-pill-hover:hover {
          border-color: #033EEE !important;
          color: #033EEE !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(3, 62, 238, 0.12) !important;
        }
        .pills-container-scroll::-webkit-scrollbar {
          display: none;
        }

        /* RESPONSIVE DESIGN (TABLET & MOBILE) */
        @media (max-width: 1024px) {
          .katalog-container { padding: 40px 20px !important; }
          .katalog-title { font-size: 2.2rem !important; }
          .katalog-grid { gap: 20px !important; }
        }

        @media (max-width: 768px) {
          .katalog-subtitle {
            max-width: 250px !important;
            margin: 0 auto !important;
            line-height: 1.4 !important;
          }
          .katalog-title { font-size: 1.8rem !important; }
          .katalog-grid { 
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important; 
            gap: 15px !important; 
          }
          .katalog-modal-content {
            max-height: 90vh !important;
            border-radius: 16px !important;
          }
          .katalog-modal-flex { flex-direction: column !important; }
          .katalog-modal-img-wrapper { 
            flex: none !important; 
            min-width: 100% !important; 
            height: 25vh !important; 
            max-height: 25vh !important; 
          }
          .katalog-modal-body { 
            padding: 15px !important; 
            min-width: 100% !important; 
          }
          .katalog-modal-title { font-size: 1.3rem !important; }
          .close-btn-responsive { 
            top: 5px !important; 
            right: 10px !important; 
            width: 35px !important; 
            height: 35px !important; 
            font-size: 2rem !important;
          }
          .search-input-focus {
            font-size: 0.9rem !important;
            padding: 12px 15px 12px 45px !important;
          }
        }
      `}</style>
      <div style={styles.header}>
        <img src="/logo.png" alt="Logo" style={styles.logoImage} />
        <h1 style={styles.title} className="katalog-title">
          <SparklesIcon size={28} color={colors.blue} /> Koleksi <span style={styles.gold}>Batik Nusantara</span>
        </h1>
        <p style={styles.subtitle} className="katalog-subtitle">Jelajahi berbagai motif batik dari seluruh penjuru Indonesia</p>
      </div>

      {/* FILTER BARU YANG MODERN DAN INTERAKTIF */}
      {!loading && (
        <div style={styles.filterContainer}>
          <div style={styles.searchWrapper}>
            <div style={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama batik, motif, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              className="search-input-focus"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                style={styles.clearBtn}
                title="Hapus pencarian"
              >
                &times;
              </button>
            )}
          </div>

          <div style={styles.pillsSection}>
            <span style={styles.pillsLabel}>Filter Daerah:</span>
            <div style={styles.pillsRow}>
              {/* Arrow Left */}
              <button
                onClick={() => scrollPills("left")}
                style={{
                  ...styles.arrowBtn,
                  opacity: canScrollLeft ? 1 : 0.25,
                  pointerEvents: canScrollLeft ? "auto" : "none",
                }}
                title="Geser ke kiri"
              >
                &#8592;
              </button>

              {/* Pills */}
              <div
                ref={pillsRef}
                style={styles.pillsWrapper}
                className="pills-container-scroll"
                onScroll={updateScrollState}
              >
                {CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        ...styles.pill,
                        ...(isActive ? styles.activePill : {})
                      }}
                      className={isActive ? "" : "filter-pill-hover"}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Arrow Right */}
              <button
                onClick={() => scrollPills("right")}
                style={{
                  ...styles.arrowBtn,
                  opacity: canScrollRight ? 1 : 0.25,
                  pointerEvents: canScrollRight ? "auto" : "none",
                }}
                title="Geser ke kanan"
              >
                &#8594;
              </button>
            </div>
          </div>

          <div style={styles.resultsCount}>
            Menampilkan <strong>{filteredData.length}</strong> dari <strong>{data.length}</strong> koleksi batik
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", width: "100%" }}>
          <LoadingLogo text="Memuat koleksi..." />
        </div>
      ) : filteredData.length > 0 ? (
        <div style={styles.grid} className="katalog-grid">
          {filteredData.map((item) => (
            <CardBatik 
              key={item.id} 
              batik={item} 
              onClick={() => setSelectedBatik(item)} 
            />
          ))}
        </div>
      ) : (
        <div style={{ ...styles.empty, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "15px", opacity: 0.7 }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: colors.textHead, fontStyle: "normal" }}>Tidak menemukan batik yang cocok.</p>
          <p style={{ margin: "5px 0 15px 0", fontSize: "0.9rem", color: colors.textBody }}>Cobalah menggunakan kata kunci lain atau setel ulang filter.</p>
          <button 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Semua");
            }} 
            style={styles.resetSearchBtn}
          >
            Setel Ulang Filter
          </button>
        </div>
      )}

      {/* Modal Detail Batik */}
      {selectedBatik && createPortal(
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} className="katalog-modal-content" onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} className="close-btn-responsive" onClick={closeModal}>&times;</button>
            
            <div style={styles.modalFlex} className="katalog-modal-flex">
              {/* Left Side: Image */}
              <div style={styles.modalImageWrapper} className="katalog-modal-img-wrapper">
                <img 
                  src={selectedBatik.gambar?.startsWith("http") ? selectedBatik.gambar : `${BASE_URL}/${selectedBatik.gambar}`} 
                  alt={selectedBatik.nama} 
                  style={styles.modalImg} 
                  onError={(e) => e.target.src = "https://via.placeholder.com/600x800?text=Batik+Image"}
                />
              </div>

              {/* Right Side: Content */}
              <div style={styles.modalBody} className="katalog-modal-body">
                <div style={styles.modalHeader}>
                  <div>
                    <h2 style={styles.modalTitle} className="katalog-modal-title">
                      {selectedBatik.jenis_acara === "Batik Keraton" && <CrownIcon />}
                      {selectedBatik.nama}
                    </h2>
                    <span style={styles.modalBadge}>{selectedBatik.jenis_batik}</span>
                  </div>
                </div>

                {/* VTON Button */}
                <button 
                  style={{
                    background: colors.blueGradient,
                    color: colors.onBlue,
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "30px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: colors.shadowSm,
                    marginBottom: "20px",
                    width: "fit-content",
                    fontFamily: fonts.body
                  }}
                  onClick={() => setShowVtonModal(true)}
                >
                  Coba Virtual Try-On ✨
                </button>
                
                {selectedBatik.jenis_acara === "Batik Keraton" && (
                  <div style={styles.warningBox}>
                    <strong>⚠️ Perhatian:</strong> Batik ini termasuk dalam kategori <strong>Batik Keraton</strong> yang memiliki aturan khusus. Batik ini hanya boleh digunakan oleh keturunan keraton jika berada di area keraton.
                  </div>
                )}

                <div style={styles.modalScrollArea} className="modal-scroll-area">
                  <div style={styles.modalSection}>
                    <span style={styles.modalLabel}>Motif Utama</span>
                    <p style={styles.modalText}>{selectedBatik.motif_utama || "Informasi belum tersedia"}</p>
                  </div>
                  <div style={styles.modalSection}>
                    <span style={styles.modalLabel}>Kategori / Jenis Acara</span>
                    <p style={styles.modalText}>{selectedBatik.jenis_acara || "Informasi belum tersedia"}</p>
                  </div>
                  <div style={styles.modalSection}>
                    <span style={styles.modalLabel}>Filosofi Mendalam</span>
                    <p style={styles.modalText}>{selectedBatik.filosofi || "Informasi belum tersedia"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* VTON Modal */}
      {showVtonModal && selectedBatik && (
        <VtonModal 
          batik={selectedBatik} 
          onClose={() => setShowVtonModal(false)} 
        />
      )}
    </div>
    <Footer />
    </>
  );
}

const styles = {
  container: {
    padding: "60px 40px",
    minHeight: "100vh",
    background: "transparent",
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
    fontSize: "1.1rem",
    marginTop: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "35px",
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  loading: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: colors.blue,
    marginTop: "100px",
  },
  empty: {
    textAlign: "center",
    marginTop: "100px",
    color: colors.textBody,
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 25, 80, 0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: "20px",
    backdropFilter: "blur(8px)",
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
    animation: "modalSlideUp 0.4s ease-out",
    border: `1px solid ${colors.border}`,
  },
  modalFlex: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    flexWrap: "wrap",
  },
  modalImageWrapper: {
    flex: "1.2",
    minWidth: "350px",
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
    minWidth: "350px",
    maxHeight: "85vh",
    overflow: "hidden",
  },
  modalHeader: {
    marginBottom: "25px",
  },
  modalTitle: {
    fontSize: "2.2rem",
    color: colors.textHead,
    margin: "0 0 10px 0",
    fontFamily: fonts.heading,
    lineHeight: "1.2",
  },
  modalBadge: {
    display: "inline-block",
    background: colors.blueSoft,
    color: colors.blue,
    padding: "6px 16px",
    borderRadius: "30px",
    fontWeight: "700",
    fontSize: "0.9rem",
    border: `1px solid ${colors.blueBorder}`,
  },
  modalScrollArea: {
    overflowY: "auto",
    paddingRight: "15px",
    flex: 1,
    scrollbarWidth: "thin",
    scrollbarColor: `${colors.blue} ${colors.surfaceAlt}`,
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "2.5rem",
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: colors.textHead,
    zIndex: 100,
    lineHeight: "1",
    transition: "background 0.3s",
  },
  modalSection: {
    marginBottom: "25px",
  },
  modalLabel: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: "800",
    color: colors.blue,
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
  },
  modalText: {
    fontSize: "1.05rem",
    color: colors.textBody,
    lineHeight: "1.8",
    margin: 0,
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
  },
  filterContainer: {
    maxWidth: "800px",
    margin: "0 auto 40px auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "0 10px",
  },
  searchWrapper: {
    position: "relative",
    width: "100%",
    zIndex: 10,
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 20px 16px 50px",
    fontSize: "1.05rem",
    border: `1px solid ${colors.border}`,
    borderRadius: "30px",
    background: colors.surface,
    backdropFilter: "blur(10px)",
    color: colors.textHead,
    fontFamily: fonts.body,
    transition: "all 0.3s ease",
    boxShadow: colors.shadowSm,
    outline: "none",
  },
  searchIcon: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    color: colors.blue,
    display: "flex",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "none",
  },
  clearBtn: {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    background: colors.blueSoft2,
    border: "none",
    color: colors.blue,
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
  pillsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  pillsLabel: {
    fontSize: "0.8rem",
    fontWeight: "700",
    color: colors.blue,
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    paddingLeft: "4px",
    fontFamily: fonts.body,
  },
  pillsRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  pillsWrapper: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    padding: "4px 2px 10px 2px",
    scrollbarWidth: "none",
    flex: 1,
  },
  arrowBtn: {
    flexShrink: 0,
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: `1px solid ${colors.blueBorder}`,
    background: colors.surface,
    color: colors.blue,
    fontSize: "1.1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: colors.shadowSm,
    fontWeight: "bold",
    lineHeight: 1,
    paddingBottom: "6px",
  },
  pill: {
    padding: "10px 22px",
    borderRadius: "25px",
    fontSize: "0.9rem",
    fontWeight: "600",
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textBody,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: fonts.body,
    backdropFilter: "blur(5px)",
  },
  activePill: {
    background: colors.blueGradient,
    color: colors.onBlue,
    border: `1px solid ${colors.blue}`,
    transform: "translateY(-2px)",
    boxShadow: colors.shadowSm,
  },
  resultsCount: {
    fontSize: "0.9rem",
    color: colors.textBody,
    textAlign: "center",
    fontWeight: "400",
    fontFamily: fonts.body,
  },
  resetSearchBtn: {
    background: colors.blueGradient,
    color: colors.onBlue,
    border: "none",
    padding: "12px 24px",
    borderRadius: "20px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
    fontFamily: fonts.body,
    boxShadow: colors.shadowSm,
    transition: "all 0.3s",
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
