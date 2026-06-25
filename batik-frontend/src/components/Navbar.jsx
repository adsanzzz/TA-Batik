import { Link } from "react-router-dom";
import { isAuthenticated, logout, getRole } from "../services/auth";
import logo from "../assets/logo.png";

export default function Navbar() {
  const auth = isAuthenticated();
  const role = getRole();

  return (
    <nav style={styles.nav}>
      {/* LOGO */}
      <div style={styles.logoWrapper}>
        <img
          src={logo}
          alt="Batik AI"
          style={styles.logoImg}
        />
        <span style={styles.logoText}>BatikAI</span>
      </div>

      {/* MENU */}
      <div style={styles.links}>
        <Link to="/" style={styles.link} className="nav-link">
          Home
        </Link>

        <Link to="/katalog" style={styles.link} className="nav-link">
          Katalog
        </Link>

        <Link to="/scan" style={styles.link} className="nav-link">
          Scan AI
        </Link>

        <Link to="/mixer" style={styles.link} className="nav-link">
          AI Mixer
        </Link>

        <Link to="/photobox" style={styles.link} className="nav-link">
          Photobox
        </Link>

        {auth ? (
          <>
            {role === "admin" && (
              <Link to="/admin/dashboard" style={styles.adminLink}>
                Admin Panel
              </Link>
            )}
            {role === "mitra" && (
              <Link to="/mitra/dashboard" style={styles.adminLink}>
                Mitra Panel
              </Link>
            )}

            <button onClick={logout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register-mitra" style={styles.mitraBtn}>
              Daftar Mitra
            </Link>
            <Link to="/login" style={styles.loginBtn}>
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 50px",
    height: "70px",

    background: "rgba(30, 26, 23, 0.92)",
    backdropFilter: "blur(12px)",

    boxShadow: "0 2px 20px rgba(0,0,0,0.25)",
    borderBottom: "1px solid rgba(212,175,55,0.15)",

    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoImg: {
    width: "40px",
    height: "40px",
    objectFit: "cover",
  },

  logoText: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#D4AF37",
    fontFamily: "'Playfair Display', serif",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },

  link: {
    textDecoration: "none",
    color: "#F8F4EE",
    fontWeight: "500",
    fontSize: "0.95rem",
    position: "relative",
    paddingBottom: "4px",
  },

  adminLink: {
    textDecoration: "none",
    color: "#D4AF37",
    fontWeight: "600",
    fontSize: "0.95rem",
  },

  loginBtn: {
    textDecoration: "none",

    background: "#D4AF37",
    color: "#1E1A17",

    padding: "8px 20px",
    borderRadius: "20px",

    fontSize: "0.9rem",
    fontWeight: "600",

    transition: "all 0.3s ease",
  },

  mitraBtn: {
    textDecoration: "none",
    border: "1px solid #D4AF37",
    color: "#D4AF37",
    padding: "7px 18px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },

  logoutBtn: {
    background: "transparent",

    border: "1px solid #D4AF37",
    color: "#D4AF37",

    padding: "6px 16px",
    borderRadius: "20px",

    cursor: "pointer",

    fontSize: "0.85rem",
    fontWeight: "600",

    transition: "all 0.3s ease",
  },
};