import { useEffect, useState } from "react";
import { getPendingMitras, updateMitraStatus, BASE_URL } from "../../services/api";
import { getToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../../theme";

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
    background: "transparent",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
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
    margin: "10px 0",
  },
  subtitle: {
    color: colors.textBody,
    fontSize: "1rem",
  },
  error: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #ef4444",
    marginBottom: "20px",
  },
  loader: {
    textAlign: "center",
    padding: "50px",
    fontSize: "1.1rem",
    color: colors.textBody,
  },
  emptyState: {
    background: colors.surface,
    borderRadius: "24px",
    padding: "50px",
    textAlign: "center",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadowSm,
    color: colors.textBody,
  },
  tableContainer: {
    background: colors.surface,
    borderRadius: "24px",
    overflow: "hidden",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeaderRow: {
    background: colors.surfaceAlt,
    borderBottom: `2px solid ${colors.border}`,
  },
  th: {
    padding: "16px 20px",
    fontWeight: "700",
    color: colors.textHead,
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: `1px solid ${colors.border}`,
    "&:last-child": {
      borderBottom: "none",
    }
  },
  td: {
    padding: "18px 20px",
    fontSize: "0.95rem",
    color: colors.textBody,
    verticalAlign: "middle",
  },
  fileLink: {
    color: colors.blue,
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  actionGroup: {
    display: "flex",
    gap: "10px",
  },
  approveBtn: {
    background: colors.success,
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  rejectBtn: {
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
