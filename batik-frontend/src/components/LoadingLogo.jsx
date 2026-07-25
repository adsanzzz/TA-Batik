import React from "react";
import { colors, fonts } from "../theme";

export default function LoadingLogo({ text = "Memuat...", size = 60 }) {
  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spinLogo {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulseText {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
          .spinning-logo {
            animation: spinLogo 2s infinite linear;
            filter: drop-shadow(0 0 15px rgba(3, 62, 238, 0.3));
          }
          .loading-text {
            animation: pulseText 1.5s infinite ease-in-out;
          }
        `}
      </style>
      <img 
        src="/logo.png" 
        alt="Loading..." 
        className="spinning-logo" 
        style={{ width: size, height: "auto", marginBottom: "15px" }} 
      />
      {text && <p className="loading-text" style={styles.text}>{text}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    width: "100%",
    boxSizing: "border-box",
  },
  text: {
    color: colors.blue,
    fontFamily: fonts.body,
    fontSize: "1rem",
    fontWeight: "500",
    letterSpacing: "1px",
    margin: 0
  }
};
