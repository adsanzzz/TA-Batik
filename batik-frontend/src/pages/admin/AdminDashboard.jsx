import { Link } from "react-router-dom";
import { useState } from "react";

// Professional SVG Icons (Styled to match the new theme)
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8FF01" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8FF01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const FrameIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8FF01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8FF01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8FF01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CpuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8FF01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export default function AdminDashboard() {
  const [hoverCard, setHoverCard] = useState(null);
  const [hoverButton, setHoverButton] = useState(null);

  return (
    <div style={styles.pageWrapper}>
      {/* Background Dot Pattern */}
      <div style={styles.pattern}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Admin <span style={{ color: "#C8FF01" }}>Dashboard</span>
          </h1>
          <p style={styles.subtitle}>Selamat datang di panel kendali utama sistem BatikAI</p>
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
            <Link 
              to="/admin/input" 
              style={{
                ...styles.actionButton,
                ...(hoverButton === 1 ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoverButton(1)}
              onMouseLeave={() => setHoverButton(null)}
            >
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
            <Link 
              to="/admin/manajemen" 
              style={{
                ...styles.actionButton,
                ...(hoverButton === 2 ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoverButton(2)}
              onMouseLeave={() => setHoverButton(null)}
            >
              Kelola Data
            </Link>
          </div>

          {/* Card 3: Manajemen Frame */}
          <div 
            style={{...styles.card, ...(hoverCard === 3 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(3)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <FrameIcon />
            </div>
            <h3 style={styles.cardTitle}>Manajemen Frame</h3>
            <p style={styles.cardDesc}>Upload dan kelola bingkai (frame) Photobox berformat PNG Transparan untuk digunakan pengguna.</p>
            <Link 
              to="/admin/manajemen-frame" 
              style={{
                ...styles.actionButton,
                ...(hoverButton === 3 ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoverButton(3)}
              onMouseLeave={() => setHoverButton(null)}
            >
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
              <InfoIcon />
            </div>
            <h3 style={styles.cardTitle}>Info Scan Batik</h3>
            <p style={styles.cardDesc}>Atur informasi dasar yang muncul saat hasil scan AI (11 kelas batik) ditampilkan ke pengguna.</p>
            <Link 
              to="/admin/manajemen-info-batik" 
              style={{
                ...styles.actionButton,
                ...(hoverButton === 4 ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoverButton(4)}
              onMouseLeave={() => setHoverButton(null)}
            >
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
              <UsersIcon />
            </div>
            <h3 style={styles.cardTitle}>Verifikasi Mitra</h3>
            <p style={styles.cardDesc}>Tinjau pengajuan pendaftaran akun Mitra baru. Terima atau tolak pengajuan mitra dagang.</p>
            <Link 
              to="/admin/verifikasi-mitra" 
              style={{
                ...styles.actionButton,
                ...(hoverButton === 5 ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoverButton(5)}
              onMouseLeave={() => setHoverButton(null)}
            >
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
              <CpuIcon />
            </div>
            <h3 style={styles.cardTitle}>Kontrol Model AI</h3>
            <p style={styles.cardDesc}>Upload model AI baru (.keras atau .h5) dan atur model mana yang akan aktif digunakan untuk klasifikasi batik.</p>
            <Link 
              to="/admin/manajemen-model" 
              style={{
                ...styles.actionButton,
                ...(hoverButton === 6 ? styles.actionButtonHover : {})
              }}
              onMouseEnter={() => setHoverButton(6)}
              onMouseLeave={() => setHoverButton(null)}
            >
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
    background: "linear-gradient(135deg, #00117D 0%, #0122B4 100%)", // Matches the premium blue theme
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "60px",
    paddingBottom: "60px",
    position: "relative",
    overflow: "hidden",
  },
  pattern: {
    position: "absolute",
    inset: 0,
    opacity: 0.15,
    backgroundImage: `
      radial-gradient(circle at center,
      #C8FF01 2.5px,
      transparent 2.5px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0
  },
  container: {
    padding: "0 20px",
    width: "100%",
    maxWidth: "1050px",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    zIndex: 1,
  },
  header: {
    marginBottom: "50px",
    textAlign: "center",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "800",
    color: "#ffffff",
    fontFamily: "'Playfair Display', serif",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#D0E0FF",
    fontSize: "1.1rem",
    fontWeight: "400",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    justifyContent: "center",
  },
  card: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease",
  },
  cardHover: {
    transform: "translateY(-6px)",
    boxShadow: "0 15px 35px rgba(200, 255, 1, 0.15)",
    borderColor: "rgba(200, 255, 1, 0.3)",
  },
  iconWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "rgba(200, 255, 1, 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "10px",
  },
  cardDesc: {
    color: "#D0E0FF",
    fontSize: "0.92rem",
    lineHeight: "1.6",
    marginBottom: "25px",
    flexGrow: 1,
  },
  actionButton: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    background: "linear-gradient(90deg, #C8FF01 0%, #AEE600 100%)",
    color: "#00117D",
    padding: "12px 24px",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(200, 255, 1, 0.25)",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
  },
  actionButtonHover: {
    background: "linear-gradient(90deg, #d4ff1a 0%, #b8f000 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(200, 255, 1, 0.4)",
  }
};
