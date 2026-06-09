import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerMitra } from "../services/api";

export default function RegisterMitra() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [store, setStore] = useState(""); // single store name
  const [buktiToko, setBuktiToko] = useState(null);
  const [ktp, setKtp] = useState(null);
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("Anda harus menyetujui pernyataan tidak mengunggah konten negatif.");
      return;
    }

    // Validate store name
    if (!store.trim()) {
      setError("Harap isi nama toko.");
      return;
    }

    if (!buktiToko || !ktp) {
      setError("Harap unggah Bukti Kepemilikan Toko dan KTP.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("nik", nik);
      formData.append("nama", nama);
      formData.append("nama_toko", store.trim());
      formData.append("bukti_kepemilikan", buktiToko);
      formData.append("ktp", ktp);

      await registerMitra(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Registrasi Berhasil</h2>
          <p style={styles.successMessage}>
            Pendaftaran Anda sebagai Mitra berhasil diajukan! Data Anda sedang dalam peninjauan oleh Admin. Anda akan diarahkan ke halaman Login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Registrasi Mitra Batik AI</h2>
        <p style={styles.subtitle}>
          Bergabunglah sebagai mitra untuk mempromosikan produk batik Anda dengan teknologi AI.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* USERNAME & PASSWORD */}
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username Baru</label>
              <input
                type="text"
                placeholder="Ex: tokobatiksolo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* NIK & NAMA */}
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>NIK KTP</label>
              <input
                type="text"
                placeholder="16-digit nomor NIK"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Lengkap (Sesuai KTP)</label>
              <input
                type="text"
                placeholder="Ex: Budi Santoso"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* NAMA TOKO */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Toko</label>
            <input
              type="text"
              placeholder="Nama Toko"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* FILE UPLOADS */}
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Upload KTP</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setKtp(e.target.files[0])}
                style={styles.fileInput}
                required
              />
              <span style={styles.fileHint}>Format: JPG, PNG, atau PDF</span>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Bukti Kepemilikan Toko</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setBuktiToko(e.target.files[0])}
                style={styles.fileInput}
                required
              />
              <span style={styles.fileHint}>Sertifikat, sewa tempat, atau SIUP</span>
            </div>
          </div>

          {/* CHECKBOX */}
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="agree-checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="agree-checkbox" style={styles.checkboxLabel}>
              Saya bersedia mematuhi aturan platform dan berjanji tidak akan mengunggah konten berbau negatif, ujaran kebencian, sara, pornografi, maupun produk ilegal.
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
          >
            {loading ? "Mengirim Pendaftaran..." : "Daftar Sekarang"}
          </button>
        </form>

        <div style={styles.loginSection}>
          <p style={styles.loginText}>Sudah punya akun?</p>
          <Link to="/login" style={styles.loginLink}>Login di sini</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    background: "linear-gradient(135deg, #FDFBF7 0%, #F4EAE0 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },
  card: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "700px",
    borderRadius: "24px",
    boxShadow: "0 10px 30px rgba(139, 94, 52, 0.08)",
    border: "1px solid rgba(139, 94, 52, 0.1)",
    padding: "40px",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "800",
    color: "#2C1E16",
    fontFamily: "'Playfair Display', serif",
    marginBottom: "10px",
    textAlign: "center",
  },
  subtitle: {
    color: "#636e72",
    fontSize: "1rem",
    textAlign: "center",
    marginBottom: "35px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: "1 1 280px",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#2C1E16",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid rgba(139, 94, 52, 0.15)",
    outline: "none",
    fontSize: "0.95rem",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  },
  storeInputRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "8px",
    alignItems: "center",
  },
  removeBtn: {
    background: "#ff7675",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  addBtn: {
    background: "transparent",
    color: "#8B5E34",
    border: "2px dashed #8B5E34",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "4px",
    alignSelf: "flex-start",
  },
  fileInput: {
    padding: "10px",
    borderRadius: "10px",
    border: "2px dashed rgba(139, 94, 52, 0.25)",
    backgroundColor: "#FAF8F5",
    cursor: "pointer",
  },
  fileHint: {
    fontSize: "0.75rem",
    color: "#7f8c8d",
    marginTop: "2px",
  },
  checkboxContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    marginTop: "10px",
  },
  checkbox: {
    marginTop: "4px",
    width: "18px",
    height: "18px",
    accentColor: "#8B5E34",
    cursor: "pointer",
  },
  checkboxLabel: {
    fontSize: "0.9rem",
    color: "#555",
    lineHeight: "1.4",
    cursor: "pointer",
  },
  submitBtn: {
    background: "#8B5E34",
    color: "white",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.3s, transform 0.2s",
    marginTop: "15px",
    boxShadow: "0 4px 15px rgba(139, 94, 52, 0.25)",
  },
  error: {
    background: "#ff767522",
    color: "#d63031",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #ff767555",
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  successIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#2ecc7122",
    color: "#2ecc71",
    fontSize: "2.5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px auto",
  },
  successMessage: {
    fontSize: "1.1rem",
    color: "#2C1E16",
    textAlign: "center",
    lineHeight: "1.6",
  },
  loginSection: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(139, 94, 52, 0.1)",
    textAlign: "center",
  },
  loginText: {
    color: "#636e72",
    fontSize: "0.85rem",
    marginBottom: "8px",
  },
  loginLink: {
    color: "#B98751",
    fontWeight: "700",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
};
