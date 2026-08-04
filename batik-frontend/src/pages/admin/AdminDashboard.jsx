import { Link } from "react-router-dom";
import { useState } from "react";
import { colors, fonts } from "../../theme";

// Professional SVG Icons (Styled to match the new theme)
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033EEE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const FrameIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CpuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export default function AdminDashboard() {
  const [hoverCard, setHoverCard] = useState(null);
  const [hoverButton, setHoverButton] = useState(null);

  return (
    <div style={styles.pageWrapper} className="admin-dash-page">
      <style>{`
        .admin-dash-page { box-sizing: border-box; }
        .admin-dash-page * { box-sizing: border-box; }
        @media (max-width: 1024px) {
          .admin-dash-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .admin-dash-page { padding-top: 32px !important; padding-bottom: 32px !important; }
          .admin-dash-container { padding: 0 16px !important; }
          .admin-dash-title { font-size: 2rem !important; }
          .admin-dash-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .admin-dash-card { padding: 24px !important; }
        }
      `}</style>
      {/* Background Dot Pattern */}
      <div style={styles.pattern}></div>

      <div style={styles.container} className="admin-dash-container">
        <div style={styles.header}>
          <h1 style={styles.title} className="admin-dash-title">
            Admin <span style={{ color: colors.blue }}>Dashboard</span>
          </h1>
          <p style={styles.subtitle}>Selamat datang di panel kendali utama sistem BatikAI</p>
        </div>

        <div style={styles.grid} className="admin-dash-grid">
          {/* Card 1: Input Batik */}
          <div 
            style={{...styles.card, ...(hoverCard === 1 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(1)}
            onMouseLeave={() => setHoverCard(null)}
            className="admin-dash-card"
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
            className="admin-dash-card"
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
            className="admin-dash-card"
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
            className="admin-dash-card"
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
            className="admin-dash-card"
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
            className="admin-dash-card"
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

          {/* Card 7: Rekap Ulasan */}
          <div
            style={{...styles.card, ...(hoverCard === 7 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(7)}
            onMouseLeave={() => setHoverCard(null)}
            className="admin-dash-card"
          >
            <div style={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Rekap Ulasan</h3>
            <p style={styles.cardDesc}>Lihat rating & masukan pengguna dari tiap fitur (Scan, VTON, AI Generative, Photobox, Rekomendasi AI).</p>
            <Link
              to="/admin/reviews"
              style={{...styles.actionButton, ...(hoverButton === 7 ? styles.actionButtonHover : {})}}
              onMouseEnter={() => setHoverButton(7)}
              onMouseLeave={() => setHoverButton(null)}
            >
              Lihat Ulasan
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
    background: "transparent",
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
    opacity: 0.5,
    backgroundImage: `
      radial-gradient(circle at center,
      ${colors.blueSoft2} 2.5px,
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
    fontFamily: fonts.body,
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
    color: colors.textHead,
    fontFamily: fonts.heading,
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: colors.textBody,
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
    background: colors.surface,
    borderRadius: "24px",
    padding: "30px",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease",
  },
  cardHover: {
    transform: "translateY(-6px)",
    boxShadow: colors.shadow,
    borderColor: colors.blueBorder,
  },
  iconWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: colors.blueSoft,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: colors.textHead,
    marginBottom: "10px",
  },
  cardDesc: {
    color: colors.textBody,
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
    background: colors.blueGradient,
    color: colors.onBlue,
    padding: "12px 24px",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: colors.shadowSm,
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
  },
  actionButtonHover: {
    background: colors.blueGradient,
    transform: "translateY(-2px)",
    boxShadow: colors.shadow,
  }
};
