import { useEffect, useState, useRef } from "react";
import { getBatik, BASE_URL } from "@/services/api";
import CardBatik from "@/components/CardBatik";
import VtonModal from "@/components/VtonModal";

const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "8px", verticalAlign: "middle", color: "#d4af37" }}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
  </svg>
);

const CATEGORIES = ["Semua", "Bali", "Betawi", "Celup", "Cendrawasih", "Kawung", "Mega Mendung", "Parang", "Sekar", "Sidoluhur", "Sidomukti", "Tambal"];

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
    <div style={styles.container}>
      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-scroll-area::-webkit-scrollbar {
          width: 8px;
        }
        .modal-scroll-area::-webkit-scrollbar-track {
          background: #1E1A17;
          border-radius: 10px;
        }
        .modal-scroll-area::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 10px;
        }
        .modal-scroll-area::-webkit-scrollbar-thumb:hover {
          background: #EED786;
        }
        .search-input-focus:focus {
          border-color: #D4AF37 !important;
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.15) !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .filter-pill-hover:hover {
          border-color: #D4AF37 !important;
          color: #D4AF37 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.12) !important;
        }
        .pills-container-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div style={styles.header}>
        <h1 style={styles.title}>Koleksi <span style={styles.gold}>Batik Nusantara</span></h1>
        <p style={styles.subtitle}>Jelajahi berbagai motif batik dari seluruh penjuru Indonesia</p>
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
        <div style={styles.loading}>Memuat koleksi...</div>
      ) : filteredData.length > 0 ? (
        <div style={styles.grid}>
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
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "15px", opacity: 0.7 }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#D4AF37", fontStyle: "normal" }}>Tidak menemukan batik yang cocok.</p>
          <p style={{ margin: "5px 0 15px 0", fontSize: "0.9rem", color: "#E0E0E0" }}>Cobalah menggunakan kata kunci lain atau setel ulang filter.</p>
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
      {selectedBatik && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeModal}>&times;</button>
            
            <div style={styles.modalFlex}>
              {/* Left Side: Image */}
              <div style={styles.modalImageWrapper}>
                <img 
                  src={selectedBatik.gambar?.startsWith("http") ? selectedBatik.gambar : `${BASE_URL}/${selectedBatik.gambar}`} 
                  alt={selectedBatik.nama} 
                  style={styles.modalImg} 
                  onError={(e) => e.target.src = "https://via.placeholder.com/600x800?text=Batik+Image"}
                />
              </div>

              {/* Right Side: Content */}
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

                {/* VTON Button */}
                <button 
                  style={{
                    background: "linear-gradient(90deg, #D4AF37 0%, #AA8120 100%)",
                    color: "#1E1A17",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "30px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
                    marginBottom: "20px",
                    width: "fit-content",
                    fontFamily: "Poppins, sans-serif"
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
        </div>
      )}

      {/* VTON Modal */}
      {showVtonModal && selectedBatik && (
        <VtonModal 
          batik={selectedBatik} 
          onClose={() => setShowVtonModal(false)} 
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "60px 40px",
    background: "linear-gradient(135deg, #1E1A17 0%, #3E2723 50%, #5D4037 100%)",
    minHeight: "100vh",
    fontFamily: "Poppins, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "50px",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "700",
    color: "#fff",
    fontFamily: "'Playfair Display', serif",
  },
  gold: {
    color: "#D4AF37",
  },
  subtitle: {
    color: "#E0E0E0",
    fontSize: "1.1rem",
    marginTop: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "35px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  loading: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#D4AF37",
    marginTop: "100px",
  },
  empty: {
    textAlign: "center",
    marginTop: "100px",
    color: "#D4AF37",
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px",
    backdropFilter: "blur(8px)",
  },
  modalContent: {
    background: "#1E1A17",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "1000px",
    maxHeight: "85vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    overflow: "hidden", 
    animation: "modalSlideUp 0.4s ease-out",
    border: "1px solid rgba(212,175,55,0.2)",
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
    color: "#fff",
    margin: "0 0 10px 0",
    fontFamily: "'Playfair Display', serif",
    lineHeight: "1.2",
  },
  modalBadge: {
    display: "inline-block",
    background: "rgba(212, 175, 55, 0.1)",
    color: "#D4AF37",
    padding: "6px 16px",
    borderRadius: "30px",
    fontWeight: "700",
    fontSize: "0.9rem",
    border: "1px solid rgba(212, 175, 55, 0.3)",
  },
  modalScrollArea: {
    overflowY: "auto",
    paddingRight: "15px",
    flex: 1,
    scrollbarWidth: "thin",
    scrollbarColor: "#D4AF37 #1E1A17",
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "2.5rem",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
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
    color: "#D4AF37",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
  },
  modalText: {
    fontSize: "1.05rem",
    color: "#E0E0E0",
    lineHeight: "1.8",
    margin: 0,
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
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
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
  },
  searchInput: {
    width: "100%",
    padding: "16px 20px 16px 50px",
    fontSize: "1.05rem",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "30px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    outline: "none",
  },
  searchIcon: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#D4AF37",
    display: "flex",
    alignItems: "center",
  },
  clearBtn: {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(212, 175, 55, 0.15)",
    border: "none",
    color: "#D4AF37",
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
    color: "#D4AF37",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    paddingLeft: "4px",
    fontFamily: "Poppins, sans-serif",
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
    border: "1px solid rgba(212, 175, 55, 0.3)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#D4AF37",
    fontSize: "1.1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    fontWeight: "bold",
    lineHeight: 1,
    paddingBottom: "6px",
  },
  pill: {
    padding: "10px 22px",
    borderRadius: "25px",
    fontSize: "0.9rem",
    fontWeight: "600",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "Poppins, sans-serif",
    backdropFilter: "blur(5px)",
  },
  activePill: {
    background: "#D4AF37",
    color: "#1E1A17",
    border: "1px solid #D4AF37",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(212, 175, 55, 0.25)",
  },
  resultsCount: {
    fontSize: "0.9rem",
    color: "#E0E0E0",
    textAlign: "center",
    fontWeight: "400",
    fontFamily: "Poppins, sans-serif",
  },
  resetSearchBtn: {
    background: "#D4AF37",
    color: "#1E1A17",
    border: "none",
    padding: "12px 24px",
    borderRadius: "20px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
    fontFamily: "Poppins, sans-serif",
    boxShadow: "0 4px 15px rgba(212, 175, 55, 0.2)",
    transition: "all 0.3s",
  }
};
