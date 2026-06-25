import { useState, useEffect } from "react";
import { getBatik, deleteBatik, updateBatik, BASE_URL } from "../../services/api";
import { getToken } from "../../services/auth";

export default function ManajemenBatik() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    getBatik()
      .then(setData)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus batik ${nama}?`)) return;

    try {
      const token = getToken();
      await deleteBatik(id, token);
      setMessage({ type: "success", text: `Batik ${nama} berhasil dihapus!` });
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: `Gagal menghapus batik ${nama}.` });
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
    if (editFile) {
      formData.append("file", editFile);
    }

    try {
      const token = getToken();
      await updateBatik(editForm.id, formData, token);
      setMessage({ type: "success", text: "Batik berhasil diupdate!" });
      closeEditModal();
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal mengupdate batik." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Background Dot Pattern */}
      <div style={styles.pattern}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Manajemen Data <span style={{ color: "#C8FF01" }}>Batik</span>
          </h1>
          <p style={styles.subtitle}>Kelola (Edit/Hapus) koleksi batik yang sudah ada di database.</p>
        </div>

        {message.text && (
          <div style={message.type === "success" ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p style={styles.loading}>Memuat data...</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Gambar</th>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Jenis Acara</th>
                  <th style={styles.th}>Jenis Batik</th>
                  <th style={styles.th}>Motif Utama</th>
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
                      <td style={styles.td}><strong>{item.nama}</strong></td>
                      <td style={styles.td}>
                        <span style={item.jenis_acara === "Batik Keraton" ? styles.badgeKeraton : styles.badgeUmum}>
                          {item.jenis_acara || "Batik Umum"}
                        </span>
                      </td>
                      <td style={styles.td}>{item.jenis_batik}</td>
                      <td style={styles.td}>{item.motif_utama}</td>
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
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#D0E0FF" }}>Tidak ada data koleksi batik.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL EDIT */}
        {editModal && editForm && (
          <div style={styles.modalOverlay} onClick={closeEditModal}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Edit Batik</h2>
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
                      <option value="Batik Umum">Batik Umum</option>
                      <option value="Batik Keraton">Batik Keraton</option>
                    </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Jenis Acara</label>
                    <select name="jenis_acara" value={editForm.jenis_acara} onChange={handleEditChange} style={styles.input} required>
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
                <div style={styles.formGroup}>
                  <label style={styles.label}>Filosofi Mendalam</label>
                  <textarea name="filosofi" value={editForm.filosofi} onChange={handleEditChange} style={styles.textarea} required />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ganti Gambar (Opsional)</label>
                  <input type="file" accept="image/*" onChange={handleEditFileChange} style={styles.input} />
                  <div style={{ marginTop: "10px", display: "flex", gap: "15px", alignItems: "flex-end" }}>
                     {!editPreview && (
                       <div>
                         <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#D0E0FF" }}>Gambar Lama:</p>
                         <img src={editForm.gambarLama?.startsWith("http") ? editForm.gambarLama : `${BASE_URL}/${editForm.gambarLama}`} alt="lama" style={styles.imgPreview} />
                       </div>
                     )}
                     {editPreview && (
                       <div>
                         <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#D0E0FF" }}>Gambar Baru:</p>
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
    background: "linear-gradient(135deg, #00117D 0%, #0122B4 100%)",
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
    opacity: 0.15,
    backgroundImage: `
      radial-gradient(circle at center,
      #C8FF01 2.5px,
      transparent 2.5px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0
  },
  container: {
    padding: "0 20px",
    width: "100%",
    maxWidth: "1100px",
    fontFamily: "'Poppins', sans-serif",
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
    color: "#ffffff",
    fontFamily: "'Playfair Display', serif",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#D0E0FF",
    fontSize: "1.1rem",
    fontWeight: "400",
  },
  loading: {
    textAlign: "center",
    color: "#C8FF01",
    fontWeight: "600",
    fontSize: "1.1rem",
    padding: "40px",
  },
  tableContainer: {
    overflowX: "auto",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  trHeader: {
    background: "rgba(255, 255, 255, 0.05)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
  },
  th: {
    padding: "20px 24px",
    textAlign: "left",
    color: "#C8FF01",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    letterSpacing: "0.5px",
  },
  trBody: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "background 0.2s",
  },
  td: {
    padding: "20px 24px",
    verticalAlign: "middle",
    color: "#ffffff",
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
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
  actionBtns: {
    display: "flex",
    gap: "10px",
  },
  editBtn: {
    padding: "8px 18px",
    background: "transparent",
    color: "#C8FF01",
    border: "1px solid #C8FF01",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.2s",
  },
  deleteBtn: {
    padding: "8px 18px",
    background: "transparent",
    color: "#ff7675",
    border: "1px solid #ff7675",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.2s",
  },
  successMsg: {
    background: "rgba(200, 255, 1, 0.1)",
    color: "#C8FF01",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600",
    textAlign: "center",
    border: "1px solid rgba(200, 255, 1, 0.3)",
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
  
  // MODAL EDIT STYLES
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 17, 125, 0.85)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    background: "#0122B4",
    width: "100%",
    maxWidth: "650px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    border: "1px solid rgba(200, 255, 1, 0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "15px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#ffffff",
    fontFamily: "'Playfair Display', serif",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#C8FF01",
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
    color: "#C8FF01",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px 15px",
    border: "2px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "12px",
    outline: "none",
    background: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },
  textarea: {
    padding: "12px 15px",
    border: "2px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "12px",
    outline: "none",
    background: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    fontSize: "0.95rem",
    minHeight: "120px",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  },
  imgPreview: {
    width: "150px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
  saveBtn: {
    padding: "14px 28px",
    background: "linear-gradient(90deg, #C8FF01 0%, #AEE600 100%)",
    color: "#00117D",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.95rem",
    boxShadow: "0 4px 15px rgba(200, 255, 1, 0.25)",
  }
};

