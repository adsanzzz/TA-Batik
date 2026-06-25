import { useEffect, useState } from "react";
import { getModels, uploadModel, activateModel, deactivateAllModels, deleteModel } from "../../services/api";
import { getToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";

export default function ManajemenModel() {
  const [modelsList, setModelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modelName, setModelName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const navigate = useNavigate();

  const token = getToken();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getModels(token);
      setModelsList(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data model.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!modelName.trim()) {
      setError("Nama model harus diisi.");
      return;
    }
    if (!selectedFile) {
      setError("File model (.keras atau .h5) harus dipilih.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("name", modelName);
    formData.append("file", selectedFile);

    try {
      await uploadModel(formData, token);
      setSuccessMsg("Model berhasil diupload.");
      setModelName("");
      setSelectedFile(null);
      
      // Clear file input
      const fileInput = document.getElementById("model-file-input");
      if (fileInput) fileInput.value = "";

      // Refresh list
      await fetchModels();
    } catch (err) {
      setError(err.message || "Gagal mengupload model.");
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id) => {
    setActionLoadingId(id);
    setError("");
    setSuccessMsg("");
    try {
      await activateModel(id, token);
      setSuccessMsg("Model berhasil diaktifkan.");
      await fetchModels();
    } catch (err) {
      setError(err.message || "Gagal mengaktifkan model.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeactivateAll = async () => {
    setActionLoadingId("deactivate-all");
    setError("");
    setSuccessMsg("");
    try {
      await deactivateAllModels(token);
      setSuccessMsg("Kembali menggunakan model bawaan.");
      await fetchModels();
    } catch (err) {
      setError(err.message || "Gagal menonaktifkan model.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus model ini?")) {
      return;
    }
    setActionLoadingId(id);
    setError("");
    setSuccessMsg("");
    try {
      await deleteModel(id, token);
      setSuccessMsg("Model berhasil dihapus.");
      await fetchModels();
    } catch (err) {
      setError(err.message || "Gagal menghapus model.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Check if any custom uploaded model is currently active
  const isAnyCustomModelActive = modelsList.some((m) => m.is_active);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <button onClick={() => navigate("/admin/dashboard")} style={styles.backBtn}>
            ← Kembali ke Dashboard
          </button>
          <h1 style={styles.title}>Kontrol Model AI</h1>
          <p style={styles.subtitle}>Upload model klasifikasi baru dan atur model mana yang akan aktif digunakan.</p>
        </div>

        {/* FEEDBACK STATUS */}
        {error && <div style={styles.error}>{error}</div>}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        {/* UPLOAD PANEL */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Upload Model Baru</h3>
          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Model</label>
              <input
                type="text"
                placeholder="Contoh: MobileNetV3 Batik Baru V2"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                style={styles.input}
                disabled={uploading}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>File Model (.keras / .h5)</label>
              <input
                id="model-file-input"
                type="file"
                accept=".keras,.h5"
                onChange={handleFileChange}
                style={styles.fileInput}
                disabled={uploading}
              />
              <span style={styles.helperText}>Pastikan file yang diupload memiliki ekstensi .keras atau .h5 yang valid.</span>
            </div>
            <button type="submit" style={styles.uploadBtn} disabled={uploading}>
              {uploading ? "Mengupload..." : "Upload & Simpan"}
            </button>
          </form>
        </div>

        {/* LIST OF MODELS */}
        <div style={styles.listSection}>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Daftar Model Klasifikasi</h3>
            {isAnyCustomModelActive && (
              <button 
                onClick={handleDeactivateAll} 
                style={styles.resetBtn}
                disabled={actionLoadingId === "deactivate-all"}
              >
                {actionLoadingId === "deactivate-all" ? "Memproses..." : "Kembali ke Model Bawaan"}
              </button>
            )}
          </div>

          {loading ? (
            <div style={styles.loader}>Memuat daftar model...</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Model</th>
                    <th style={styles.th}>Nama File</th>
                    <th style={styles.th}>Tanggal Upload</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>                  {/* Default / Baseline model */}
                  <tr style={{...styles.tableRow, backgroundColor: !isAnyCustomModelActive ? "rgba(200, 255, 1, 0.05)" : "transparent"}}>
                    <td style={styles.td}>
                      <strong>Model Bawaan (Baseline)</strong>
                      <div style={styles.subText}>Default MobileNetV3</div>
                    </td>
                    <td style={styles.td}>model_batik_final_mbv3.keras</td>
                    <td style={styles.td}>-</td>
                    <td style={styles.td}>
                      {!isAnyCustomModelActive ? (
                        <span style={styles.activeBadge}>Aktif</span>
                      ) : (
                        <span style={styles.inactiveBadge}>Standby</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{color: "#8395a7", fontSize: "0.85rem", fontStyle: "italic"}}>Sistem Utama</span>
                    </td>
                  </tr>

                  {/* Uploaded models */}
                  {modelsList.map((m) => (
                    <tr 
                      key={m.id} 
                      style={{
                        ...styles.tableRow, 
                        backgroundColor: m.is_active ? "rgba(200, 255, 1, 0.05)" : "transparent"
                      }}
                    >
                      <td style={styles.td}>
                        <strong>{m.name}</strong>
                      </td>
                      <td style={styles.td}>{m.filename}</td>
                      <td style={styles.td}>
                        {new Date(m.uploaded_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td style={styles.td}>
                        {m.is_active ? (
                          <span style={styles.activeBadge}>Aktif</span>
                        ) : (
                          <span style={styles.inactiveBadge}>Standby</span>
                        )}
                        {!m.file_exists && (
                          <div style={{color: "#ef4444", fontSize: "0.75rem", marginTop: "4px"}}>* File tidak ditemukan</div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          {!m.is_active && (
                            <button
                              disabled={actionLoadingId !== null}
                              onClick={() => handleActivate(m.id)}
                              style={styles.activateBtn}
                            >
                              {actionLoadingId === m.id ? "..." : "Aktifkan"}
                            </button>
                          )}
                          {!m.is_active && (
                            <button
                              disabled={actionLoadingId !== null}
                              onClick={() => handleDelete(m.id)}
                              style={styles.deleteBtn}
                            >
                              {actionLoadingId === m.id ? "..." : "Hapus"}
                            </button>
                          )}
                          {m.is_active && (
                            <span style={{color: "#C8FF01", fontSize: "0.85rem", fontWeight: "600"}}>Aktif Digunakan</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "calc(100vh - 70px)",
    background: "radial-gradient(circle at 10% 20%, #00117D 0%, #000B4D 90%)",
    backgroundImage: "radial-gradient(circle at 10% 20%, #00117D 0%, #000B4D 90%), radial-gradient(rgba(200, 255, 1, 0.15) 1px, transparent 0)",
    backgroundSize: "100% 100%, 24px 24px",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: "30px",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#C8FF01",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "15px",
    padding: 0,
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "800",
    color: "#ffffff",
    fontFamily: "'Outfit', sans-serif",
    margin: "10px 0",
  },
  subtitle: {
    color: "#C8FF01",
    fontSize: "1.05rem",
  },
  error: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #ef4444",
    marginBottom: "20px",
  },
  success: {
    background: "rgba(200, 255, 1, 0.1)",
    color: "#C8FF01",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(200, 255, 1, 0.3)",
    marginBottom: "20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "30px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "35px",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
    fontFamily: "'Outfit', sans-serif",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#C8FF01",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    outline: "none",
    fontSize: "0.95rem",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#ffffff",
  },
  fileInput: {
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#ffffff",
    cursor: "pointer",
  },
  helperText: {
    fontSize: "0.8rem",
    color: "#ffffff",
    opacity: 0.7,
    marginTop: "2px",
  },
  uploadBtn: {
    alignSelf: "flex-start",
    background: "#C8FF01",
    color: "#00117D",
    border: "none",
    padding: "16px 28px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.95rem",
  },
  listSection: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resetBtn: {
    background: "transparent",
    border: "1px solid #C8FF01",
    color: "#C8FF01",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  loader: {
    textAlign: "center",
    padding: "40px",
    fontSize: "1rem",
    color: "#C8FF01",
  },
  tableContainer: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeaderRow: {
    borderBottom: "2px solid rgba(255, 255, 255, 0.08)",
  },
  th: {
    padding: "16px 20px",
    fontWeight: "700",
    color: "#C8FF01",
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  td: {
    padding: "18px 20px",
    fontSize: "0.95rem",
    color: "#ffffff",
    verticalAlign: "middle",
  },
  subText: {
    fontSize: "0.8rem",
    color: "#ffffff",
    opacity: 0.6,
    marginTop: "2px",
    fontWeight: "normal",
  },
  activeBadge: {
    background: "rgba(200, 255, 1, 0.15)",
    color: "#C8FF01",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "inline-block",
  },
  inactiveBadge: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    opacity: 0.8,
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "inline-block",
  },
  actionGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  activateBtn: {
    background: "#C8FF01",
    color: "#00117D",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  deleteBtn: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    border: "1px solid #ef4444",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
  }
};
