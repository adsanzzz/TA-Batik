import { Link } from "react-router-dom";
import { colors, fonts } from "../theme";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <style>{`
        /* RESPONSIVE FOOTER */
        @media (max-width: 768px) {
          .footer-inner {
            padding: 40px 20px 20px !important;
          }
          .footer-row {
            gap: 30px !important;
            flex-direction: column !important;
          }
          .footer-bottom-inner {
            flex-direction: column !important;
            text-align: center !important;
            gap: 15px !important;
          }
        }
      `}</style>
      <div style={styles.inner} className="footer-inner">
        <div style={styles.row} className="footer-row">

          {/* COL 1: Logo + Desc */}
          <div style={styles.col}>
            <div style={styles.logoWrapper}>
              <img src="/logo.png" alt="Trisara" style={styles.logoImg} />
              <span style={styles.logoText}>Trisara</span>
            </div>
            <p style={styles.desc}>
              Platform kecerdasan buatan untuk mengenali, mempelajari, dan
              melestarikan keindahan motif Batik Nusantara.
            </p>
            <div style={styles.tagBadge}>
              ✦ Artificial Intelligence for Indonesian Heritage
            </div>
          </div>

          {/* COL 2: Navigation */}
          <div style={styles.col}>
            <h6 style={styles.widgetTitle}>NAVIGASI</h6>
            <ul style={styles.navList}>
              <li><Link to="/" style={styles.navLink}>Beranda</Link></li>
              <li><Link to="/katalog" style={styles.navLink}>Katalog Batik</Link></li>
              <li><Link to="/scan" style={styles.navLink}>Scan AI</Link></li>
              <li><Link to="/generative" style={styles.navLink}>AI Generative</Link></li>
              <li><Link to="/photobox" style={styles.navLink}>Photobox</Link></li>
            </ul>
          </div>

          {/* COL 3: Contact */}
          <div style={styles.col}>
            <h6 style={styles.widgetTitle}>KONTAK</h6>
            <p style={styles.contactText}>
              Universitas Sebelas Maret<br />
              Surakarta, Jawa Tengah
            </p>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomInner} className="footer-bottom-inner">
          <p style={styles.copyright}>
            © 2026 Trisara — Universitas Sebelas Maret · Hak Cipta Dilindungi
          </p>
          <ul style={styles.socialList}>
            <li>
              <a href="#" target="_blank" rel="noreferrer" style={styles.socialLink} title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noreferrer" style={styles.socialLink} title="Twitter / X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noreferrer" style={styles.socialLink} title="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Footer Pattern Image */}
      <img src="/footer-pattern.png" alt="Footer Pattern" style={styles.footerPattern} />
    </footer>
  );
}

const styles = {
  footer: {
    fontFamily: fonts.body,
    position: "relative",
    zIndex: 10,
    overflow: "hidden", // Ensure pattern doesn't overflow
    background: colors.surfaceAlt,
    borderTop: `1px solid ${colors.border}`,
  },
  footerPattern: {
    width: "100%",
    height: "auto",
    display: "block",
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: -1,
    opacity: 0.25, // Adjustable depending on design
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "50px 40px 40px",
  },
  row: {
    display: "flex",
    gap: "60px",
    flexWrap: "wrap",
  },
  col: {
    flex: "1 1 220px",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
  },
  logoImg: {
    width: "44px",
    height: "44px",
    objectFit: "contain",
    filter: "drop-shadow(0 2px 8px rgba(3, 62, 238, 0.2))",
  },
  logoText: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: colors.navy,
    fontFamily: fonts.heading,
  },
  desc: {
    color: colors.textBody,
    fontSize: "1rem",
    lineHeight: "1.75",
    marginBottom: "16px",
    marginTop: 0,
  },
  tagBadge: {
    display: "inline-block",
    padding: "8px 16px",
    border: `1px solid ${colors.blueBorder}`,
    borderRadius: "20px",
    color: colors.blue,
    background: colors.blueSoft,
    fontSize: "0.85rem",
    lineHeight: "1.5",
  },
  widgetTitle: {
    color: colors.navy,
    fontSize: "0.9rem",
    fontWeight: "800",
    letterSpacing: "1.5px",
    marginBottom: "16px",
    marginTop: 0,
    textTransform: "uppercase",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: "8px",
  },
  navList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  navLink: {
    color: colors.textBody,
    textDecoration: "none",
    fontSize: "1rem",
    transition: "color 0.2s ease",
  },
  contactText: {
    color: colors.textBody,
    fontSize: "1rem",
    lineHeight: "1.7",
    margin: 0,
  },
  bottomBar: {
    borderTop: `1px solid ${colors.border}`,
    background: "rgba(3, 62, 238, 0.04)",
  },
  bottomInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "18px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  copyright: {
    color: colors.textMuted,
    fontSize: "0.9rem",
    margin: 0,
  },
  socialList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  socialLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: `1px solid ${colors.blueBorder}`,
    color: colors.blue,
    background: colors.surface,
    textDecoration: "none",
  },
};
