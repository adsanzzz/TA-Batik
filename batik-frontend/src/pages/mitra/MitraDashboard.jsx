import { Link } from "react-router-dom";
import { useState } from "react";
import { colors, fonts } from "../../theme";

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

export default function MitraDashboard() {
  const [hoverCard, setHoverCard] = useState(null);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Mitra Dashboard</h1>
          <p style={styles.subtitle}>Selamat datang di panel kendali Mitra BatikAI. Kelola produk batik Anda di sini.</p>
        </div>

        <div style={styles.grid}>
          {/* Card 1: Unggah Batik */}
          <div 
            style={{...styles.card, ...(hoverCard === 1 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(1)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <PlusIcon />
            </div>
            <h3 style={styles.cardTitle}>Unggah Batik Baru</h3>
            <p style={styles.cardDesc}>Upload motif batik dagangan Anda, sertakan filosofi menarik serta sematkan tautan Shopee / Tokopedia Anda.</p>
            <Link to="/mitra/input" style={styles.actionButton}>
              Unggah Batik
            </Link>
          </div>

          {/* Card 2: Kelola Batik */}
          <div 
            style={{...styles.card, ...(hoverCard === 2 ? styles.cardHover : {})}}
            onMouseEnter={() => setHoverCard(2)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div style={styles.iconWrapper}>
              <DatabaseIcon />
            </div>
            <h3 style={styles.cardTitle}>Kelola Batik Saya</h3>
            <p style={styles.cardDesc}>Tinjau katalog batik yang telah Anda unggah. Anda dapat mengedit tautan belanja atau menghapus batik yang tidak lagi dijual.</p>
            <Link to="/mitra/manajemen" style={styles.actionButton}>
              Kelola Batik
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
  },
  container: {
    padding: "0 20px",
    width: "100%",
    maxWidth: "900px",
    fontFamily: fonts.body,
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
    background: colors.surface,
    borderRadius: "24px",
    padding: "40px",
    boxShadow: colors.shadowSm,
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease",
  },
  cardHover: {
    transform: "translateY(-8px)",
    boxShadow: colors.shadow,
    borderColor: colors.blueBorder,
  },
  iconWrapper: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: colors.blueSoft,
    color: colors.blue,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: colors.textHead,
    marginBottom: "12px",
    fontFamily: fonts.body,
  },
  cardDesc: {
    color: colors.textBody,
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
    background: colors.blueGradient,
    color: colors.onBlue,
    padding: "14px 28px",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: colors.shadowSm,
    width: "100%",
    boxSizing: "border-box",
  },
};
