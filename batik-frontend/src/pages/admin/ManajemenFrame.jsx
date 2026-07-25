import { useState, useEffect } from "react";
import { getToken } from "../../services/auth";
import { BASE_URL } from "../../services/api";
import { colors, fonts } from "../../theme";

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "10px" }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export default function ManajemenFrame() {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({ nama: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);

  useEffect(() => {
    fetchFrames();
  }, []);

  const fetchFrames = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/frames`);
      const data = await response.json();
      setFrames(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    if (!file) {
      setMessage({ type: "error", text: "Silakan pilih file gambar motif." });
      return;
    }
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("nama", form.nama);
    formData.append("file", file);

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/admin/frames`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal mengupload frame");
      
      setMessage({ type: "success", text: "Frame berhasil ditambahkan!" });
      setForm({ nama: "" });
      setFile(null);
      setPreview(null);
      fetchFrames();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal menambahkan frame." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus frame ${nama}?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/admin/frames/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal menghapus");
      
      setMessage({ type: "success", text: `Frame ${nama} berhasil dihapus!` });
      fetchFrames();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: `Gagal menghapus frame ${nama}.` });
    }
  };

  return (
    <div style={styles.pageWrapper} className="mf-page">
      <style>{`
        @media (max-width: 1024px) {
          .mf-container { max-width: 100% !important; }
          .mf-title { font-size: 2.2rem !important; }
          .mf-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .mf-page { padding-top: 24px !important; padding-bottom: 32px !important; }
          .mf-container { padding: 0 16px !important; box-sizing: border-box !important; }
          .mf-title { font-size: 1.7rem !important; }
          .mf-subtitle { font-size: 0.98rem !important; }
          .mf-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .mf-card { padding: 20px !important; }
          .mf-input, .mf-upload { width: 100% !important; box-sizing: border-box !important; }
          .mf-submit { width: 100% !important; }
          .mf-frame-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 420px) {
          .mf-frame-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* Background Dot Pattern */}
      <div style={styles.pattern}></div>

      <div style={styles.container} className="mf-container">
        <div style={styles.header}>
          <h1 style={styles.title} className="mf-title">
            Manajemen Frame <span style={{ color: colors.blue }}>Photobox</span>
          </h1>
          <p style={styles.subtitle} className="mf-subtitle">Upload foto motif batik murni. Sistem akan otomatis menyulapnya menjadi bingkai (frame) Photobox.</p>
        </div>

        {message.text && (
          <div style={message.type === "success" ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </div>
        )}

        <div style={styles.contentGrid} className="mf-grid">
          {/* Upload Form */}
          <div style={styles.formContainer} className="mf-card">
            <h2 style={styles.sectionTitle}>Buat Frame Otomatis</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Frame</label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  placeholder="Contoh: Motif Mega Mendung"
                  onChange={handleChange}
                  style={styles.input}
                  className="mf-input"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Upload Foto Motif (JPG/PNG)</label>
                <div style={styles.uploadBox} className="mf-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={styles.fileLabel}>
                    {preview ? (
                      <div style={styles.previewContainer}>
                        <img src={preview} alt="Preview" style={styles.preview} />
                      </div>
                    ) : (
                      <div style={styles.uploadPlaceholder}>
                        <UploadIcon />
                        <span>Klik untuk unggah foto motif batik</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting || !file}
                className="mf-submit"
                onMouseEnter={() => setHoverBtn(true)}
                onMouseLeave={() => setHoverBtn(false)}
                style={{
                  ...(submitting || !file ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn),
                  ...(hoverBtn ? styles.submitBtnHover : {})
                }}
              >
                {submitting ? "Mengunggah..." : "Simpan Frame"}
              </button>
            </form>
          </div>

          {/* List Frames */}
          <div style={styles.listContainer} className="mf-card">
            <h2 style={styles.sectionTitle}>Daftar Frame Tersedia</h2>
            {loading ? (
              <p style={styles.loading}>Memuat frame...</p>
            ) : frames.length === 0 ? (
              <p style={styles.empty}>Belum ada frame yang diunggah.</p>
            ) : (
              <div style={styles.frameGrid} className="mf-frame-grid">
                {frames.map((frame) => (
                  <div key={frame.id} style={styles.frameCard}>
                    <img 
                      src={frame.gambar?.startsWith("http") ? frame.gambar : `${BASE_URL}/${frame.gambar}`} 
                      alt={frame.nama} 
                      style={styles.frameImg} 
                    />
                    <div style={styles.frameInfo}>
                      <span style={styles.frameName}>{frame.nama}</span>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(frame.id, frame.nama)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
    backgroundImage: `radial-gradient(${colors.blueSoft} 1px, transparent 0)`,
    backgroundSize: "24px 24px",
    paddingTop: "40px",
    paddingBottom: "60px",
  },
  container: {
    padding: "0 20px",
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: fonts.body,
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
    fontSize: "1.15rem",
    fontWeight: "500",
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
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600",
    textAlign: "center",
    border: "1px solid #ef4444",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    alignItems: "start",
  },
  formContainer: {
    background: colors.surface,
    padding: "30px",
    borderRadius: "24px",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
  },
  listContainer: {
    background: colors.surface,
    padding: "30px",
    borderRadius: "24px",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
  },
  sectionTitle: {
    fontSize: "1.5rem",
    color: colors.textHead,
    marginBottom: "25px",
    fontFamily: fonts.heading,
    fontWeight: "700",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
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
  },
  uploadBox: {
    width: "100%",
    height: "200px",
    border: `2px dashed ${colors.blueBorder}`,
    borderRadius: "15px",
    overflow: "hidden",
    position: "relative",
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
  previewContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  checkerboard: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundSize: "20px 20px",
    backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05)), linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05))",
    backgroundPosition: "0 0, 10px 10px",
    zIndex: 1,
  },
  preview: {
    position: "relative",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    zIndex: 2,
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: colors.textMuted,
    fontWeight: "500",
    gap: "8px",
  },
  submitBtn: {
    width: "100%",
    background: colors.blueGradient,
    color: colors.onBlue,
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    fontSize: "1.05rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: colors.shadowSm,
  },
  submitBtnHover: {
    background: colors.navy,
    color: colors.onBlue,
    transform: "translateY(-2px)",
    boxShadow: colors.shadow,
  },
  loading: {
    textAlign: "center",
    color: colors.blue,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    fontStyle: "italic",
  },
  frameGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  frameCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    height: "180px",
    display: "flex",
    flexDirection: "column",
    background: colors.surfaceAlt,
  },
  frameImg: {
    position: "relative",
    width: "100%",
    height: "140px",
    objectFit: "contain",
    zIndex: 2,
  },
  frameInfo: {
    background: colors.surface,
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `1px solid ${colors.border}`,
    zIndex: 3,
  },
  frameName: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: colors.textHead,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100px",
  },
  deleteBtn: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    border: "1px solid #ef4444",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  }
};
