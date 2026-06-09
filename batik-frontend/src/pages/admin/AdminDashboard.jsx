import { Link } from "react-router-dom";
import { useState } from "react";

// Professional SVG Icons
const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const DatabaseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

export default function AdminDashboard() {
  const [hoverCard, setHoverCard] = useState(null);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Selamat datang di panel kendali utama BatikAI</p>
        </div>

        <div style={styles.grid}>
          {/* Card 1: Input Batik */}
          <div 
            style={{...styles.card, ...(hoverCard === 1 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(1)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <PlusIcon />
            </div>
            <h3 style={styles.cardTitle}>Input Batik Baru</h3>
            <p style={styles.cardDesc}>Tambahkan entri data motif batik baru, termasuk gambar, asal, dan maknanya ke dalam sistem.</p>
            <Link to="/admin/input" style={styles.actionButton}>
              Input Data
            </Link>
          </div>

          {/* Card 2: Manajemen Batik */}
          <div 
            style={{...styles.card, ...(hoverCard === 2 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(2)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <DatabaseIcon />
            </div>
            <h3 style={styles.cardTitle}>Manajemen Batik</h3>
            <p style={styles.cardDesc}>Kelola koleksi batik yang ada. Anda dapat melihat, mengubah, atau menghapus data secara langsung.</p>
            <Link to="/admin/manajemen" style={styles.actionButton}>
              Kelola Data
            </Link>
          </div>
          <div 
            style={{...styles.card, ...(hoverCard === 3 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(3)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Manajemen Frame</h3>
            <p style={styles.cardDesc}>Upload dan kelola bingkai (frame) Photobox berformat PNG Transparan untuk digunakan pengguna.</p>
            <Link to="/admin/frames" style={styles.actionButton}>
              Kelola Frame
            </Link>
          </div>

          {/* Card 4: Info Scan Batik AI */}
          <div 
            style={{...styles.card, ...(hoverCard === 4 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(4)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Info Scan Batik</h3>
            <p style={styles.cardDesc}>Atur informasi dasar yang muncul saat hasil scan AI (11 kelas batik) ditampilkan ke pengguna.</p>
            <Link to="/admin/info-scan" style={styles.actionButton}>
              Kelola Info Scan
            </Link>
          </div>

          {/* Card 5: Verifikasi Mitra */}
          <div 
            style={{...styles.card, ...(hoverCard === 5 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(5)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Verifikasi Mitra</h3>
            <p style={styles.cardDesc}>Tinjau pengajuan pendaftaran akun Mitra baru. Terima atau tolak pengajuan mitra dagang.</p>
            <Link to="/admin/verifikasi-mitra" style={styles.actionButton}>
              Verifikasi Mitra
            </Link>
          </div>

          {/* Card 6: Kontrol Model AI */}
          <div 
            style={{...styles.card, ...(hoverCard === 6 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(6)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Kontrol Model AI</h3>
            <p style={styles.cardDesc}>Upload model AI baru (.keras atau .h5) dan atur model mana yang akan aktif digunakan untuk klasifikasi batik.</p>
            <Link to="/admin/models" style={styles.actionButton}>
              Kelola Model
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "calc(100vh - 70px)",
    background: "linear-gradient(135deg, #FDFBF7 0%, #F4EAE0 100%)", // Elegant bright warm gradient
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "60px",
    paddingBottom: "60px",
  },
  container: {
    padding: "0 20px",
    width: "100%",
    maxWidth: "900px",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: "50px",
    textAlign: "center",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "800",
    color: "#2C1E16",
    fontFamily: "'Playfair Display', serif",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#5a4a42",
    fontSize: "1.15rem",
    fontWeight: "400",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "35px",
    justifyContent: "center",
  },
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(139, 94, 52, 0.05)",
    border: "1px solid rgba(139, 94, 52, 0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease",
  },
  cardHover: {
    transform: "translateY(-8px)",
    boxShadow: "0 15px 35px rgba(139, 94, 52, 0.12)",
    borderColor: "rgba(139, 94, 52, 0.2)",
  },
  iconWrapper: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: "#F9F5F0",
    color: "#8B5E34",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#2C1E16",
    marginBottom: "12px",
    fontFamily: "'Inter', sans-serif",
  },
  cardDesc: {
    color: "#636e72",
    fontSize: "1rem",
    lineHeight: "1.6",
    marginBottom: "30px",
    flexGrow: 1,
  },
  actionButton: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    background: "#8B5E34",
    color: "white",
    padding: "14px 28px",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(139, 94, 52, 0.25)",
    width: "100%",
    boxSizing: "border-box",
  },
};
