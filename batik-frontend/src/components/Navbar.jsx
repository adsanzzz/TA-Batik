import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAuthenticated, logout, getRole } from "../services/auth";
import { colors, fonts } from "../theme";

export default function Navbar() {
  const location = useLocation(); // Triggers re-render on route changes to refresh auth status
  const auth = isAuthenticated();
  const role = getRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
    <nav style={styles.nav} className="navbar-container">
      <style>{`
        /* RESPONSIVE NAVBAR */
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 9999;
          width: 44px;
          height: 44px;
          padding: 0;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }

        .hamburger-btn span {
          display: block;
          width: 24px;
          height: 2.5px;
          background-color: #00117D;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.77, 0, 0.175, 1);
        }

        .hamburger-btn.open span:nth-child(1) {
          transform: translateY(8.5px) rotate(45deg);
        }
        .hamburger-btn.open span:nth-child(2) {
          opacity: 0;
          transform: translateX(-10px);
        }
        .hamburger-btn.open span:nth-child(3) {
          transform: translateY(-8.5px) rotate(-45deg);
        }
        
        /* GLOBAL FIX FOR MOBILE HORIZONTAL SCROLL */
        body {
          overflow-x: hidden;
          width: 100%;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 20px !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: #FFFFFF !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
          .navbar-links {
            position: fixed;
            top: 0;
            right: 0;
            transform: translateX(100%);
            width: 80%;
            max-width: 320px;
            height: 100vh;
            background: linear-gradient(160deg, #FFFFFF 0%, #EAF0FF 100%);
            backdrop-filter: blur(20px);
            border-left: 1px solid #E1E7F5;
            flex-direction: column;
            justify-content: flex-start;
            padding-top: 100px;
            transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
            box-shadow: -10px 0 30px rgba(10,25,80,0.12);
            z-index: 9998;
          }
          .navbar-links.open {
            transform: translateX(0);
          }
          .nav-link {
            width: 100%;
            text-align: center;
            padding: 18px !important;
            font-size: 1.25rem !important;
            border-bottom: 1px solid #E1E7F5;
            color: #0C1B4D !important;
          }
          .nav-btn-outline, .nav-btn-primary {
            width: 85% !important;
            text-align: center;
            padding: 14px !important;
            font-size: 1.1rem !important;
            margin: 15px auto !important;
            display: block;
          }
        }
      `}</style>
      {/* LOGO */}
      <Link to="/" style={{ ...styles.logoWrapper, textDecoration: "none" }}>
        <img
          src="/logo.png"
          alt="Trisara"
          style={styles.logoImg}
        />
        <span style={styles.logoText}>Trisara</span>
      </Link>

      {/* HAMBURGER BTN */}
      <button 
        className={`hamburger-btn ${isMobileMenuOpen ? "open" : ""}`} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* MENU */}
      <div style={styles.links} className={`navbar-links ${isMobileMenuOpen ? "open" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
        <Link to="/" style={isActive("/") ? styles.linkActive : styles.link} className="nav-link">
          Home
        </Link>

        <Link to="/katalog" style={isActive("/katalog") ? styles.linkActive : styles.link} className="nav-link">
          Katalog
        </Link>

        <Link to="/scan" style={isActive("/scan") ? styles.linkActive : styles.link} className="nav-link">
          Scan AI
        </Link>

        <Link to="/generative" style={isActive("/generative") ? styles.linkActive : styles.link} className="nav-link">
          AI Generative
        </Link>

        <Link to="/photobox" style={isActive("/photobox") ? styles.linkActive : styles.link} className="nav-link">
          Photobox
        </Link>

        {auth ? (
          <>
            {role === "admin" && (
              <Link to="/admin/dashboard" style={styles.adminLink} className="nav-link">
                Admin Panel
              </Link>
            )}
            {role === "mitra" && (
              <Link to="/mitra/dashboard" style={styles.adminLink} className="nav-link">
                Mitra Panel
              </Link>
            )}

            <button onClick={logout} style={styles.logoutBtn} className="nav-btn-outline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.loginBtn} className="nav-btn-primary">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>

    {isMobileMenuOpen && (
      <div 
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 999 }}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}
    </>
  );
}
const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 32px",
    height: "68px",

    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",

    boxShadow: colors.shadowSm,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",

    position: "sticky",
    top: "16px",
    zIndex: 9999,
    margin: "16px auto 0",
    maxWidth: "1200px",
    width: "calc(100% - 40px)",
    boxSizing: "border-box",
  },

  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoImg: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
    borderRadius: "8px",
    filter: "drop-shadow(0 2px 8px rgba(3, 62, 238, 0.2))",
  },

  logoText: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: colors.navy,
    fontFamily: fonts.heading,
    letterSpacing: "0.5px",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  link: {
    textDecoration: "none",
    color: colors.textBody,
    fontWeight: "500",
    fontSize: "0.95rem",
    position: "relative",
    padding: "8px 16px",
    borderRadius: "999px",
    transition: "all 0.25s ease",
  },

  linkActive: {
    textDecoration: "none",
    color: colors.onBlue,
    fontWeight: "600",
    fontSize: "0.95rem",
    position: "relative",
    padding: "8px 18px",
    borderRadius: "999px",
    background: colors.blue,
    boxShadow: "0 6px 16px rgba(3, 62, 238, 0.28)",
  },

  adminLink: {
    textDecoration: "none",
    color: colors.blue,
    fontWeight: "600",
    fontSize: "0.95rem",
    padding: "8px 16px",
  },

  loginBtn: {
    textDecoration: "none",

    background: colors.blueGradient,
    color: colors.onBlue,

    padding: "9px 22px",
    borderRadius: "999px",

    fontSize: "0.9rem",
    fontWeight: "600",

    boxShadow: "0 6px 16px rgba(3, 62, 238, 0.25)",
    transition: "all 0.3s ease",
  },

  mitraBtn: {
    textDecoration: "none",
    border: `1px solid ${colors.blueBorder}`,
    color: colors.blue,
    padding: "8px 18px",
    borderRadius: "999px",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },

  logoutBtn: {
    background: "transparent",

    border: `1px solid ${colors.blueBorder}`,
    color: colors.blue,

    padding: "7px 18px",
    borderRadius: "999px",

    cursor: "pointer",

    fontSize: "0.85rem",
    fontWeight: "600",

    transition: "all 0.3s ease",
  },
};