import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import Footer from "../components/Footer";
import { colors, fonts } from "../theme";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(username, password);
      if (res.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.role === "mitra") {
        navigate("/mitra/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <p style={styles.subtitle}>Masuk sebagai Admin atau Mitra BatikAI</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedInput("username")}
              onBlur={() => setFocusedInput(null)}
              placeholder="username"
              style={{
                ...styles.input,
                ...(focusedInput === "username" ? styles.inputFocus : {})
              }}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(focusedInput === "password" ? styles.inputFocus : {})
              }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.button, opacity: 0.7} : styles.button}
          >
            {loading ? "Logging in..." : "Login Now"}
          </button>
        </form>

        <div style={styles.registerSection}>
          <p style={styles.registerText}>Ingin menjual batik di platform ini?</p>
          <Link to="/register-mitra" style={styles.registerLink}>
            Daftar sebagai Mitra Batik AI
          </Link>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 75px)",
    padding: "60px 20px",
    background: "transparent",
    fontFamily: fonts.body,
  },
  card: {
    background: colors.surface,
    padding: "40px",
    borderRadius: "20px",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`,
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  title: {
    fontSize: "2.3rem",
    fontWeight: "800",
    color: colors.textHead,
    marginBottom: "10px",
    fontFamily: fonts.heading,
  },
  subtitle: {
    color: colors.textBody,
    marginBottom: "30px",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.85rem",
    fontWeight: "700",
    color: colors.textBody,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    outline: "none",
    fontSize: "1rem",
    color: colors.textHead,
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    backgroundColor: colors.surface,
  },
  inputFocus: {
    borderColor: colors.blue,
    boxShadow: `0 0 0 4px ${colors.blueSoft}`,
  },
  button: {
    background: colors.blueGradient,
    color: colors.onBlue,
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s",
    boxShadow: colors.shadowSm,
    marginTop: "10px",
  },
  error: {
    background: "#ff767522",
    color: "#ff7675",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "0.85rem",
    border: "1px solid #ff767555",
  },
  registerSection: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: `1px solid ${colors.border}`,
    textAlign: "center",
  },
  registerText: {
    color: colors.textMuted,
    fontSize: "0.85rem",
    marginBottom: "8px",
  },
  registerLink: {
    color: colors.blue,
    fontWeight: "700",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  footerContainer: {
    width: "100%",
    maxWidth: "850px",
    margin: "50px auto 10px auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderTop: `1px solid ${colors.border}`,
    paddingTop: "30px"
  },
  footerImage: {
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    borderRadius: "16px",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`
  }
};
