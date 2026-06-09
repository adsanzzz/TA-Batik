import { useEffect, useState } from "react";
import { getPendingMitras, updateMitraStatus, BASE_URL } from "../../services/api";
import { getToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";

export default function VerifikasiMitra() {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of mitra currently being updated
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = getToken();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingMitras(token);
      setPendingList(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data pengajuan mitra.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      await updateMitraStatus(id, action, token);
      // Remove from list
      setPendingList(prev => prev.filter(item => item.id !== id));
      alert(`Pendaftaran Mitra berhasil ${action === "approve" ? "disetujui" : "ditolak"}.`);
    } catch (err) {
      alert(err.message || "Gagal memproses aksi.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate("/admin/dashboard")} style={styles.backBtn}>
            ← Kembali ke Dashboard
          </button>
          <h1 style={styles.title}>Verifikasi Pengajuan Mitra</h1>
          <p style={styles.subtitle}>Tinjau berkas pendaftar sebelum memberikan izin masuk platform.</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loader}>Memuat pendaftar...</div>
        ) : pendingList.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>Tidak Ada Pengajuan Pending</h3>
            <p>Semua pendaftaran mitra telah diproses.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Nama (KTP)</th>
                  <th style={styles.th}>NIK</th>
                  <th style={styles.th}>Toko</th>
                  <th style={styles.th}>Berkas KTP</th>
                  <th style={styles.th}>Berkas Bukti</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((mitra) => (
                  <tr key={mitra.id} style={styles.tableRow}>
                    <td style={styles.td}><strong>{mitra.username}</strong></td>
                    <td style={styles.td}>{mitra.nama}</td>
                    <td style={styles.td}>{mitra.nik}</td>
                    <td style={styles.td}>{mitra.nama_toko}</td>
                    <td style={styles.td}>
                      <a
                        href={`${BASE_URL}/${mitra.ktp}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.fileLink}
                      >
                        Lihat KTP ↗
                      </a>
                    </td>
                    <td style={styles.td}>
                      <a
                        href={`${BASE_URL}/${mitra.bukti_kepemilikan}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.fileLink}
                      >
                        Lihat Bukti ↗
                      </a>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleAction(mitra.id, "approve")}
                          style={styles.approveBtn}
                        >
                          Approve
                        </button>
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleAction(mitra.id, "reject")}
                          style={styles.rejectBtn}
                        >
                          Reject
                        </button>
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
  );
}

const styles = {
  pageWrapper: {
    minHeight: "calc(100vh - 70px)",
    background: "linear-gradient(135deg, #FDFBF7 0%, #F4EAE0 100%)",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
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
    fontSize: "2.4rem",
    fontWeight: "800",
    color: "#2C1E16",
    fontFamily: "'Playfair Display', serif",
    margin: "10px 0",
  },
  subtitle: {
    color: "#5a4a42",
    fontSize: "1rem",
  },
  error: {
    background: "#ff767522",
    color: "#d63031",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #ff767555",
    marginBottom: "20px",
  },
  loader: {
    textAlign: "center",
    padding: "50px",
    fontSize: "1.1rem",
    color: "#8B5E34",
  },
  emptyState: {
    background: "white",
    borderRadius: "16px",
    padding: "50px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(139, 94, 52, 0.04)",
    border: "1px solid rgba(139, 94, 52, 0.08)",
  },
  tableContainer: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 8px 25px rgba(139, 94, 52, 0.06)",
    border: "1px solid rgba(139, 94, 52, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeaderRow: {
    background: "#F9F5F0",
    borderBottom: "2px solid rgba(139, 94, 52, 0.15)",
  },
  th: {
    padding: "16px 20px",
    fontWeight: "700",
    color: "#2C1E16",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid rgba(139, 94, 52, 0.08)",
    "&:last-child": {
      borderBottom: "none",
    }
  },
  td: {
    padding: "18px 20px",
    fontSize: "0.95rem",
    color: "#2C1E16",
    verticalAlign: "middle",
  },
  fileLink: {
    color: "#8B5E34",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.9rem",
    "&:hover": {
      textDecoration: "underline",
    }
  },
  actionGroup: {
    display: "flex",
    gap: "10px",
  },
  approveBtn: {
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "background 0.2s",
    "&:hover": {
      background: "#27ae60",
    }
  },
  rejectBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "background 0.2s",
    "&:hover": {
      background: "#c0392b",
    }
  }
};
