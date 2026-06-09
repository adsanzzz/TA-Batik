import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";

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
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 75px)",
    background: "#fafafa",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(139, 94, 52, 0.08)",
    border: "1px solid rgba(139, 94, 52, 0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#2C1E16",
    marginBottom: "10px",
    fontFamily: "'Playfair Display', serif",
  },
  subtitle: {
    color: "#636e72",
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
    color: "#2C1E16",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "2px solid rgba(139, 94, 52, 0.1)",
    outline: "none",
    fontSize: "1rem",
    color: "#2C1E16",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  },
  inputFocus: {
    borderColor: "#B98751",
    boxShadow: "0 0 0 4px rgba(185, 135, 81, 0.1)",
  },
  button: {
    background: "#B98751",
    color: "white",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s",
    boxShadow: "0 4px 15px rgba(185, 135, 81, 0.3)",
    marginTop: "10px",
  },
  error: {
    background: "#ff767522",
    color: "#d63031",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "0.85rem",
    border: "1px solid #ff767555",
  },
  registerSection: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(139, 94, 52, 0.1)",
    textAlign: "center",
  },
  registerText: {
    color: "#636e72",
    fontSize: "0.85rem",
    marginBottom: "8px",
  },
  registerLink: {
    color: "#B98751",
    fontWeight: "700",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
};
