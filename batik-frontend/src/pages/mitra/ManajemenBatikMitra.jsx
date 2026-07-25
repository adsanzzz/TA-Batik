import { useState, useEffect } from "react";
import { getMitraBatik, deleteBatikMitra, updateBatikMitra, BASE_URL } from "../../services/api";
import { getToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../../theme";

export default function ManajemenBatikMitra() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    const token = getToken();
    getMitraBatik(token)
      .then(setData)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus batik ${nama}?`)) return;

    try {
      const token = getToken();
      await deleteBatikMitra(id, token);
      setMessage({ type: "success", text: `Batik ${nama} berhasil dihapus!` });
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || `Gagal menghapus batik ${nama}.` });
    }
  };

  const openEditModal = (batik) => {
    setEditForm({
      id: batik.id,
      nama: batik.nama,
      jenis_acara: batik.jenis_acara || "Batik Umum",
      jenis_batik: batik.jenis_batik || "Batik Tulis",
      motif_utama: batik.motif_utama || "",
      filosofi: batik.filosofi || "",
      shopee_link: batik.shopee_link || "",
      tokopedia_link: batik.tokopedia_link || "",
      gambarLama: batik.gambar
    });
    setEditFile(null);
    setEditPreview(null);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setEditForm(null);
    setEditFile(null);
    setEditPreview(null);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditFile(file);
    if (file) {
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("nama", editForm.nama);
    formData.append("motif_utama", editForm.motif_utama);
    formData.append("jenis_acara", editForm.jenis_acara);
    formData.append("jenis_batik", editForm.jenis_batik);
    formData.append("filosofi", editForm.filosofi);
    formData.append("shopee_link", editForm.shopee_link);
    formData.append("tokopedia_link", editForm.tokopedia_link);
    if (editFile) {
      formData.append("file", editFile);
    }

    try {
      const token = getToken();
      await updateBatikMitra(editForm.id, formData, token);
      setMessage({ type: "success", text: "Batik berhasil diupdate!" });
      closeEditModal();
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Gagal mengupdate batik." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.pageWrapper} className="manaj-batik-wrapper">
      <style>{`
        .manaj-batik-container { box-sizing: border-box; }
        .manaj-batik-table { min-width: 700px; }
        @media (max-width: 1024px) {
          .manaj-batik-title { font-size: 2.2rem !important; }
        }
        @media (max-width: 640px) {
          .manaj-batik-wrapper { padding-top: 24px !important; padding-bottom: 32px !important; }
          .manaj-batik-container { padding: 0 16px !important; }
          .manaj-batik-title { font-size: 1.7rem !important; }
          .manaj-batik-subtitle { font-size: 1rem !important; }
          .manaj-batik-modal { padding: 24px !important; max-width: 90vw !important; max-height: 90vh !important; }
          .manaj-batik-modal-title { font-size: 1.4rem !important; }
        }
      `}</style>
      <div style={styles.container} className="manaj-batik-container">
        <div style={styles.header}>
          <button onClick={() => navigate("/mitra/dashboard")} style={styles.backBtn}>
            Kembali ke Dashboard
          </button>
          <h1 style={styles.title} className="manaj-batik-title">Kelola Data Batik</h1>
          <p style={styles.subtitle} className="manaj-batik-subtitle">Kelola (Edit/Hapus) koleksi batik yang telah Anda unggah.</p>
        </div>

        {message.text && (
          <div style={message.type === "success" ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p style={styles.loading}>Memuat data batik Anda...</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table} className="manaj-batik-table">
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Gambar</th>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Jenis Acara</th>
                  <th style={styles.th}>Jenis Batik</th>
                  <th style={styles.th}>Shopee</th>
                  <th style={styles.th}>Tokopedia</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const imgUrl = item.gambar?.startsWith("http") ? item.gambar : `${BASE_URL}/${item.gambar}`;
                  return (
                    <tr key={item.id} style={styles.trBody}>
                      <td style={styles.td}>
                        <img src={imgUrl} alt={item.nama} style={styles.imgMini} />
                      </td>
                      <td style={styles.td}><strong>{item.nama}</strong> <br/><small style={{color: colors.textMuted}}>{item.motif_utama}</small></td>
                      <td style={styles.td}>
                        <span style={item.jenis_acara === "Batik Keraton" ? styles.badgeKeraton : styles.badgeUmum}>
                          {item.jenis_acara || "Batik Umum"}
                        </span>
                      </td>
                      <td style={styles.td}>{item.jenis_batik}</td>
                      <td style={styles.td}>
                        {item.shopee_link ? <a href={item.shopee_link} target="_blank" rel="noreferrer" style={{color:'#d17b0f'}}>Ada</a> : "-"}
                      </td>
                      <td style={styles.td}>
                        {item.tokopedia_link ? <a href={item.tokopedia_link} target="_blank" rel="noreferrer" style={{color:'#1fb412'}}>Ada</a> : "-"}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <button style={styles.editBtn} onClick={() => openEditModal(item)}>Edit</button>
                          <button style={styles.deleteBtn} onClick={() => handleDelete(item.id, item.nama)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                      Belum ada data batik yang Anda unggah.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL EDIT */}
        {editModal && editForm && (
          <div style={styles.modalOverlay} onClick={closeEditModal}>
            <div style={styles.modalContent} className="manaj-batik-modal" onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle} className="manaj-batik-modal-title">Edit Detail Batik</h2>
                <button style={styles.closeBtn} onClick={closeEditModal}>&times;</button>
              </div>
              
              <form onSubmit={handleEditSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Batik</label>
                  <select name="nama" value={editForm.nama} onChange={handleEditChange} style={styles.input} required>
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
                <div style={styles.formGroup}>
                  <label style={styles.label}>Motif Utama</label>
                  <input type="text" name="motif_utama" value={editForm.motif_utama} onChange={handleEditChange} style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Jenis Batik</label>
                  <select name="jenis_batik" value={editForm.jenis_batik} onChange={handleEditChange} style={styles.input} required>
                    <option value="Batik Tulis">Batik Tulis</option>
                    <option value="Batik Cap">Batik Cap</option>
                    <option value="Batik Celup">Batik Celup</option>
                    <option value="Batik Lukis">Batik Lukis</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Jenis Acara</label>
                  <select name="jenis_acara" value={editForm.jenis_acara} onChange={handleEditChange} style={styles.input} required>
                    <option value="Batik Keraton">Batik Keraton</option>
                    <option value="Batik Umum">Batik Umum</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Link Shopee (Opsional)</label>
                  <input type="url" name="shopee_link" value={editForm.shopee_link} onChange={handleEditChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Link Tokopedia (Opsional)</label>
                  <input type="url" name="tokopedia_link" value={editForm.tokopedia_link} onChange={handleEditChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Deskripsi & Filosofi</label>
                  <textarea name="filosofi" value={editForm.filosofi} onChange={handleEditChange} style={styles.textarea} required />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ganti Gambar (Opsional)</label>
                  <input type="file" accept="image/*" onChange={handleEditFileChange} style={styles.input} />
                  <div style={{ marginTop: "10px", display: "flex", gap: "15px", alignItems: "flex-end" }}>
                     {!editPreview && (
                       <div>
                         <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: colors.textMuted }}>Gambar Lama:</p>
                         <img src={editForm.gambarLama?.startsWith("http") ? editForm.gambarLama : `${BASE_URL}/${editForm.gambarLama}`} alt="lama" style={styles.imgPreview} />
                       </div>
                     )}
                     {editPreview && (
                       <div>
                         <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: colors.textMuted }}>Gambar Baru:</p>
                         <img src={editPreview} alt="baru" style={styles.imgPreview} />
                       </div>
                     )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "30px" }}>
                  <button type="button" onClick={closeEditModal} style={styles.cancelBtn}>Batal</button>
                  <button type="submit" disabled={submitting} style={submitting ? {...styles.saveBtn, opacity: 0.7} : styles.saveBtn}>
                    {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
  },
  container: {
    padding: "0 20px",
    width: "100%",
    maxWidth: "1100px",
    fontFamily: fonts.body,
  },
  header: {
    marginBottom: "30px",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: colors.blue,
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "15px",
    padding: 0,
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
  },
  loading: {
    textAlign: "center",
    color: colors.blue,
    fontWeight: "600",
    fontSize: "1.1rem",
    padding: "40px",
  },
  tableContainer: {
    overflowX: "auto",
    background: colors.surface,
    borderRadius: "24px",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  trHeader: {
    background: colors.surfaceAlt,
    borderBottom: `1px solid ${colors.border}`,
  },
  th: {
    padding: "20px 24px",
    textAlign: "left",
    color: colors.textHead,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    letterSpacing: "0.5px",
  },
  trBody: {
    borderBottom: `1px solid ${colors.border}`,
    transition: "background 0.2s",
  },
  td: {
    padding: "20px 24px",
    verticalAlign: "middle",
    color: colors.textBody,
    fontSize: "0.95rem",
  },
  badgeKeraton: {
    background: "#fbc53122",
    color: "#e1b12c",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
    border: "1px solid #fbc531"
  },
  badgeUmum: {
    background: "#4cd13722",
    color: "#44bd32",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
    border: "1px solid #4cd137"
  },
  imgMini: {
    width: "100px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "12px",
    border: `1px solid ${colors.border}`,
  },
  actionBtns: {
    display: "flex",
    gap: "10px",
  },
  editBtn: {
    padding: "8px 18px",
    background: colors.surface,
    color: colors.blue,
    border: `1px solid ${colors.blue}`,
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.2s",
  },
  deleteBtn: {
    padding: "8px 18px",
    background: "#ffffff",
    color: "#d63031",
    border: "1px solid #d63031",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.2s",
  },
  successMsg: {
    background: colors.blueSoft,
    color: colors.textHead,
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
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    background: colors.surface,
    width: "100%",
    maxWidth: "650px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: colors.shadow,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "15px",
    borderBottom: `1px solid ${colors.border}`
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: "800",
    color: colors.textHead,
    fontFamily: fonts.heading,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: colors.textMuted,
    lineHeight: "1",
    transition: "color 0.2s",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
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
    padding: "12px 15px",
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    outline: "none",
    background: colors.surface,
    color: colors.textHead,
    fontSize: "0.95rem",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "12px 15px",
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    outline: "none",
    background: colors.surface,
    color: colors.textHead,
    fontSize: "0.95rem",
    minHeight: "120px",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  imgPreview: {
    width: "150px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "12px",
    border: `1px solid ${colors.border}`,
  },
  saveBtn: {
    padding: "14px 28px",
    background: colors.blueGradient,
    color: colors.onBlue,
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    boxShadow: colors.shadowSm,
    transition: "all 0.2s",
  },
  cancelBtn: {
    padding: "14px 28px",
    background: colors.surface,
    color: colors.textBody,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "all 0.2s",
  }
};
