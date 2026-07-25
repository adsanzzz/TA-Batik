import { useEffect, useState } from "react";
import { getBatik } from "@/services/api";
import CardBatik from "@/components/CardBatik";
import VtonModal from "@/components/VtonModal";
import Footer from "@/components/Footer";
import LoadingLogo from "@/components/LoadingLogo";
import { colors, fonts } from "../theme";

const SparklesIcon = ({ size = 28, color = colors.blue }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "8px" }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
    <path d="M12 12v9"></path>
    <path d="m16 16-4-4-4 4"></path>
  </svg>
);

export default function VirtualTryOn() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatik, setSelectedBatik] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUploadOwn = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    // VtonModal menerima URL blob: langsung, jadi cukup bungkus jadi objek batik
    setSelectedBatik({ nama: "Batik Milik Anda", gambar: url });
    e.target.value = ""; // reset agar file yang sama bisa dipilih lagi
  };

  const handleCloseModal = () => {
    if (selectedBatik?.gambar?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedBatik.gambar);
    }
    setSelectedBatik(null);
  };

  useEffect(() => {
    getBatik()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const filteredData = data.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.nama?.toLowerCase() || "").includes(q) ||
      (item.motif_utama?.toLowerCase() || "").includes(q) ||
      (item.jenis_batik?.toLowerCase() || "").includes(q) ||
      (item.jenis_acara?.toLowerCase() || "").includes(q)
    );
  });

  return (
    <>
      <div style={styles.container} className="vton-page-container">
        <style>{`
          .vton-upload-card:hover {
            border-color: #033EEE !important;
            background: rgba(3, 62, 238, 0.04) !important;
            transform: translateY(-2px);
          }
          @media (max-width: 1024px) {
            .vton-page-container { padding: 40px 20px !important; }
            .vton-page-title { font-size: 2.2rem !important; }
          }
          @media (max-width: 640px) {
            .vton-upload-card { flex-direction: column !important; text-align: center !important; }
            .vton-upload-card span { margin-left: 0 !important; }
          }
          @media (max-width: 768px) {
            .vton-page-title { font-size: 1.8rem !important; }
            .vton-page-grid {
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
              gap: 15px !important;
            }
          }
        `}</style>

        <div style={styles.header}>
          <div style={styles.badge}>
            <SparklesIcon size={16} /> Fitur AI
          </div>
          <h1 style={styles.title} className="vton-page-title">
            Virtual <span style={styles.gold}>Try-On</span> Batik
          </h1>
          <p style={styles.subtitle}>
            Pilih salah satu motif batik di bawah, lalu sistem AI kami akan
            "menjahitnya" menjadi pakaian dan memakaikannya ke fotomu secara virtual.
          </p>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari motif batik untuk dicoba..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              className="search-input-focus"
            />
          </div>
        </div>

        {/* UPLOAD BATIK SENDIRI */}
        <div style={styles.uploadSection}>
          <label style={styles.uploadCard} className="vton-upload-card">
            <UploadCloudIcon />
            <div>
              <p style={styles.uploadTitle}>Unggah Motif Batik Sendiri</p>
              <p style={styles.uploadHint}>
                Punya foto motif batik sendiri? Unggah di sini (JPG / PNG) dan langsung dicoba secara virtual.
              </p>
            </div>
            <span style={styles.uploadBtn}>Pilih Gambar</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadOwn}
              style={{ display: "none" }}
            />
          </label>
          <div style={styles.dividerRow}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>atau pilih dari katalog</span>
            <span style={styles.dividerLine}></span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <LoadingLogo text="Memuat motif batik..." size={200} />
          </div>
        ) : filteredData.length === 0 ? (
          <div style={styles.empty}>
            <h3 style={{ color: colors.textHead, marginBottom: "5px" }}>Motif tidak ditemukan</h3>
            <p style={{ margin: 0, color: colors.textBody }}>Coba kata kunci lain.</p>
          </div>
        ) : (
          <div style={styles.grid} className="vton-page-grid">
            {filteredData.map((batik) => (
              <CardBatik
                key={batik.id}
                batik={batik}
                onClick={() => setSelectedBatik(batik)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {selectedBatik && (
        <VtonModal batik={selectedBatik} onClose={handleCloseModal} />
      )}
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
  header: {
    textAlign: "center",
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 18px",
    border: `1px solid ${colors.blueBorder}`,
    borderRadius: "999px",
    color: colors.blue,
    background: colors.blueSoft,
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "18px",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "700",
    fontFamily: fonts.heading,
    color: colors.textHead,
    paddingTop: "6px",
    paddingBottom: "6px",
    lineHeight: "1.3",
    margin: 0,
  },
  gold: {
    color: colors.blue,
  },
  subtitle: {
    color: colors.textBody,
    fontSize: "1.05rem",
    marginTop: "12px",
    maxWidth: "620px",
    lineHeight: 1.7,
  },
  searchWrapper: {
    position: "relative",
    marginTop: "28px",
    width: "100%",
    maxWidth: "480px",
  },
  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    color: colors.textMuted,
    display: "flex",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "14px 20px 14px 48px",
    borderRadius: "999px",
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textHead,
    fontSize: "0.95rem",
    fontFamily: fonts.body,
    outline: "none",
    boxSizing: "border-box",
    boxShadow: colors.shadowSm,
    transition: "all 0.3s",
  },
  uploadSection: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    position: "relative",
    zIndex: 1,
  },
  uploadCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "22px 26px",
    background: colors.surface,
    border: `2px dashed ${colors.blueBorder}`,
    borderRadius: "18px",
    cursor: "pointer",
    transition: "all 0.25s",
    boxShadow: colors.shadowSm,
    flexWrap: "wrap",
  },
  uploadTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    color: colors.textHead,
    fontFamily: fonts.heading,
  },
  uploadHint: {
    margin: "4px 0 0",
    fontSize: "0.88rem",
    color: colors.textBody,
    lineHeight: 1.5,
    maxWidth: "620px",
  },
  uploadBtn: {
    marginLeft: "auto",
    background: colors.blue,
    color: colors.onBlue,
    padding: "11px 26px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "0.92rem",
    whiteSpace: "nowrap",
    boxShadow: "0 6px 16px rgba(3, 62, 238, 0.22)",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "26px auto 0",
    maxWidth: "480px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
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
    marginTop: "60px",
  },
  empty: {
    textAlign: "center",
    marginTop: "80px",
    color: colors.textBody,
  },
};
