import { useState } from "react";
import { createBatik, BASE_URL } from "../../services/api";
import { getToken } from "../../services/auth";
import { colors, fonts } from "../../theme";

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "10px" }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export default function InputBatik() {
  const [form, setForm] = useState({
    nama: "",
    motif_utama: "",
    jenis_acara: "Pernikahan",
    jenis_batik: "Batik Tulis",
    filosofi: "",
    shopee_link: "",
    tokopedia_link: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hoverBtn, setHoverBtn] = useState(false);

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
      await fetch(`${BASE_URL}/admin/batik`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setMessage({ type: "success", text: "Batik berhasil ditambahkan ke database!" });
      setForm({ nama: "", motif_utama: "", jenis_acara: "Pernikahan", jenis_batik: "Batik Tulis", filosofi: "", shopee_link: "", tokopedia_link: "" });
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal menambahkan batik. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Background Dot Pattern */}
      <div style={styles.pattern}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Input Koleksi <span style={{ color: colors.blue }}>Batik</span>
          </h1>
          <p style={styles.subtitle}>Tambahkan data batik baru ke dalam katalog sistem.</p>
        </div>

        {message.text && (
          <div style={message.type === "success" ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Batik</label>
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
              <label style={styles.label}>Motif Utama</label>
              <input
                type="text"
                name="motif_utama"
                value={form.motif_utama}
                placeholder="Contoh: Awan, Lereng, Parang"
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
                <option value="Batik Umum">Batik Umum</option>
                <option value="Batik Keraton">Batik Keraton</option>
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
                <option value="Pernikahan">Pernikahan</option>
                <option value="Acara Adat">Acara Adat</option>
                <option value="Acara Formal">Acara Formal</option>
                <option value="Seminar">Seminar</option>
                <option value="Kantor">Kantor</option>
                <option value="Festival Budaya">Festival Budaya</option>
                <option value="Acara Keluarga">Acara Keluarga</option>
                <option value="Acara Sosial">Acara Sosial</option>
                <option value="Acara Santai">Acara Santai</option>
                <option value="Acara Kreatif">Acara Kreatif</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={styles.label}>Filosofi Mendalam</label>
            <textarea
              name="filosofi"
              value={form.filosofi}
              placeholder="Jelaskan nilai filosofis dibalik motif ini..."
              onChange={handleChange}
              style={styles.textarea}
              required
            />
          </div>

          {/* Shopee & Tokopedia Links */}
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Link Shopee (Opsional)</label>
              <input
                type="url"
                name="shopee_link"
                value={form.shopee_link}
                placeholder="https://shopee.co.id/..."
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
                placeholder="https://tokopedia.com/..."
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.uploadSection}>
            <label style={styles.label}>Foto Batik</label>
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
                    <span>Klik atau seret gambar ke area ini</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            style={{
              ...(loading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn),
              ...(hoverBtn ? styles.submitBtnHover : {})
            }}
          >
            {loading ? "Menyimpan..." : "Simpan ke Database"}
          </button>
        </form>
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
    paddingTop: "40px",
    paddingBottom: "60px",
    position: "relative",
    overflow: "hidden",
  },
  pattern: {
    position: "absolute",
    inset: 0,
    opacity: 0.06,
    backgroundImage: `
      radial-gradient(circle at center,
      ${colors.blue} 2.5px,
      transparent 2.5px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0
  },
  container: {
    padding: "0 20px",
    width: "100%",
    maxWidth: "850px",
    fontFamily: fonts.body,
    position: "relative",
    zIndex: 1,
  },
  header: {
    marginBottom: "40px",
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
  form: {
    background: colors.surface,
    padding: "40px",
    borderRadius: "24px",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
    color: colors.blue,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "14px 15px",
    borderRadius: "12px",
    border: `1px solid ${colors.border}`,
    outline: "none",
    fontSize: "0.95rem",
    background: "#FFFFFF",
    color: colors.textHead,
    transition: "all 0.3s ease",
  },
  textarea: {
    padding: "14px 15px",
    borderRadius: "12px",
    border: `1px solid ${colors.border}`,
    outline: "none",
    fontSize: "0.95rem",
    minHeight: "130px",
    background: "#FFFFFF",
    color: colors.textHead,
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  },
  uploadBox: {
    position: "relative",
    width: "100%",
    height: "250px",
    border: `2px dashed ${colors.blueBorder}`,
    borderRadius: "15px",
    overflow: "hidden",
    transition: "all 0.3s ease",
    background: colors.blueSoft,
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
    color: colors.textMuted,
    fontWeight: "500",
    fontSize: "1rem",
  },
  submitBtn: {
    marginTop: "15px",
    background: colors.blueGradient,
    color: colors.onBlue,
    padding: "16px",
    borderRadius: "30px",
    border: "none",
    fontSize: "1.05rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: colors.shadowSm,
    letterSpacing: "0.5px",
  },
  submitBtnHover: {
    background: colors.navy,
    color: colors.onBlue,
    boxShadow: colors.shadow,
    transform: "translateY(-2px)",
  },
  successMsg: {
    background: colors.blueSoft,
    color: colors.blue,
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600",
    textAlign: "center",
    border: `1px solid ${colors.blueBorder}`,
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