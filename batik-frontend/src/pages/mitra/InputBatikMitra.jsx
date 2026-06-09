import { useState } from "react";
import { createBatikMitra } from "../../services/api";
import { getToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#8B5E34", marginBottom: "10px" }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export default function InputBatikMitra() {
  const [form, setForm] = useState({
    nama: "",
    motif_utama: "",
    jenis_acara: "Batik Umum",
    jenis_batik: "Batik Tulis",
    filosofi: "",
    shopee_link: "",
    tokopedia_link: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("nama", form.nama);
    formData.append("motif_utama", form.motif_utama);
    formData.append("jenis_acara", form.jenis_acara);
    formData.append("jenis_batik", form.jenis_batik);
    formData.append("filosofi", form.filosofi);
    formData.append("shopee_link", form.shopee_link);
    formData.append("tokopedia_link", form.tokopedia_link);
    formData.append("file", file);

    try {
      const token = getToken();
      await createBatikMitra(formData, token);
      setMessage({ type: "success", text: "Batik Anda berhasil diunggah!" });
      setTimeout(() => {
        navigate("/mitra/manajemen");
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Gagal mengunggah batik. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate("/mitra/dashboard")} style={styles.backBtn}>
            ← Kembali ke Dashboard
          </button>
          <h1 style={styles.title}>Unggah Koleksi Batik</h1>
          <p style={styles.subtitle}>Bagikan keindahan motif batik Anda ke publik dengan link toko e-commerce.</p>
        </div>

        {message.text && (
          <div style={message.type === "success" ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama/Motif Batik (Sesuai Kategori Model AI)</label>
              <select
                name="nama"
                value={form.nama}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="" disabled>-- Pilih Jenis Motif Batik --</option>
                <option value="Bali">Bali</option>
                <option value="Betawi">Betawi</option>
                <option value="Celup">Celup</option>
                <option value="Cendrawasih">Cendrawasih</option>
                <option value="Ceplok">Ceplok</option>
                <option value="Ciamis">Ciamis</option>
                <option value="Garutan">Garutan</option>
                <option value="Gentongan">Gentongan</option>
                <option value="Kawung">Kawung</option>
                <option value="Keraton">Keraton</option>
                <option value="Lasem">Lasem</option>
                <option value="Mega Mendung">Mega Mendung</option>
                <option value="Parang">Parang</option>
                <option value="Pekalongan">Pekalongan</option>
                <option value="Priangan">Priangan</option>
                <option value="Sekar">Sekar</option>
                <option value="Sidoluhur">Sidoluhur</option>
                <option value="Sidomukti">Sidomukti</option>
                <option value="Sogan">Sogan</option>
                <option value="Tambal">Tambal</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Motif Detail</label>
              <input
                type="text"
                name="motif_utama"
                value={form.motif_utama}
                placeholder="Contoh: Awan Mega Mendung Biru, Lereng Sogan"
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Jenis Batik</label>
              <select
                name="jenis_batik"
                value={form.jenis_batik}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="Batik Tulis">Batik Tulis</option>
                <option value="Batik Cap">Batik Cap</option>
                <option value="Batik Celup">Batik Celup</option>
                <option value="Batik Lukis">Batik Lukis</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Jenis Acara</label>
              <select
                name="jenis_acara"
                value={form.jenis_acara}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="Batik Keraton">Batik Keraton</option>
                <option value="Batik Umum">Batik Umum</option>
              </select>
            </div>
          </div>

          {/* E-COMMERCE LINKS */}
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Link Shopee (Opsional)</label>
              <input
                type="url"
                name="shopee_link"
                value={form.shopee_link}
                placeholder="https://shopee.co.id/nama-toko-anda/produk"
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Link Tokopedia (Opsional)</label>
              <input
                type="url"
                name="tokopedia_link"
                value={form.tokopedia_link}
                placeholder="https://tokopedia.com/toko-anda/produk"
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={styles.label}>Deskripsi & Filosofi</label>
            <textarea
              name="filosofi"
              value={form.filosofi}
              placeholder="Ceritakan sejarah atau filosofi menarik di balik kain batik ini..."
              onChange={handleChange}
              style={styles.textarea}
              required
            />
          </div>

          <div style={styles.uploadSection}>
            <label style={styles.label}>Foto Produk Batik</label>
            <div style={styles.uploadBox}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInput}
                id="file-upload"
                required={!preview}
              />
              <label htmlFor="file-upload" style={styles.fileLabel}>
                {preview ? (
                  <img src={preview} alt="Preview" style={styles.preview} />
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <UploadIcon />
                    <span>Klik atau seret gambar ke sini</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.submitBtn, opacity: 0.7} : styles.submitBtn}
          >
            {loading ? "Mengunggah..." : "Unggah Batik"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "calc(100vh - 70px)",
    background: "linear-gradient(135deg, #FDFBF7 0%, #F4EAE0 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "40px",
    paddingBottom: "60px",
  },
  container: {
    padding: "0 20px",
    width: "100%",
    maxWidth: "900px",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: "30px",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#8B5E34",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "15px",
    padding: 0,
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "800",
    color: "#2C1E16",
    fontFamily: "'Playfair Display', serif",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#5a4a42",
    fontSize: "1.15rem",
  },
  form: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "24px",
    boxShadow: "0 4px 20px rgba(139, 94, 52, 0.05)",
    border: "1px solid rgba(139, 94, 52, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#8B5E34",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid rgba(139, 94, 52, 0.2)",
    outline: "none",
    fontSize: "0.95rem",
    background: "#fafafa",
    color: "#2C1E16",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid rgba(139, 94, 52, 0.2)",
    outline: "none",
    fontSize: "0.95rem",
    minHeight: "130px",
    background: "#fafafa",
    color: "#2C1E16",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  uploadBox: {
    position: "relative",
    width: "100%",
    height: "250px",
    border: "2px dashed rgba(139, 94, 52, 0.3)",
    borderRadius: "15px",
    overflow: "hidden",
    background: "#fafafa",
  },
  fileInput: {
    display: "none",
  },
  fileLabel: {
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
    color: "#5a4a42",
    fontWeight: "500",
    fontSize: "1rem",
  },
  submitBtn: {
    marginTop: "15px",
    background: "#8B5E34",
    color: "white",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(139, 94, 52, 0.25)",
  },
  successMsg: {
    background: "rgba(139, 94, 52, 0.1)",
    color: "#2C1E16",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600",
    textAlign: "center",
    border: "1px solid rgba(139, 94, 52, 0.3)",
  },
  errorMsg: {
    background: "#ff767522",
    color: "#d63031",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600",
    textAlign: "center",
    border: "1px solid #ff7675",
  }
};
