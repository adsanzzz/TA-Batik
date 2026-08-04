import { useEffect, useState } from "react";
import { getReviews, getReviewSummary } from "../../services/api";
import { getToken } from "../../services/auth";
import { Link } from "react-router-dom";
import { colors, fonts } from "../../theme";

const FITUR_LABEL = {
  scan: "Scan AI",
  vton: "Virtual Try-On",
  generative: "AI Generative",
  photobox: "Photobox",
  rag: "Rekomendasi AI",
};

const Stars = ({ value, size = 16 }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} width={size} height={size} viewBox="0 0 24 24"
        fill={n <= Math.round(value) ? "#FBBF24" : "none"}
        stroke={n <= Math.round(value) ? "#F59E0B" : colors.border}
        strokeWidth="1.5" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </span>
);

export default function ManajemenReview() {
  const token = getToken();
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [sum, revs] = await Promise.all([
        getReviewSummary(token),
        getReviews(token, filter || undefined),
      ]);
      setSummary(sum);
      setReviews(revs);
    } catch (e) {
      console.error("gagal memuat review:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fmtDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return iso;
    }
  };

  return (
    <div style={styles.container} className="review-container">
      <style>{`
        @media (max-width: 1024px) { .review-container { padding: 32px 20px !important; } .review-title { font-size: 1.8rem !important; } }
        @media (max-width: 640px) {
          .review-grid { grid-template-columns: 1fr 1fr !important; }
          .review-table { min-width: 560px !important; }
        }
      `}</style>

      <Link to="/admin/dashboard" style={styles.back}>← Kembali ke Dashboard</Link>
      <h1 style={styles.title} className="review-title">Rekap Ulasan Pengguna</h1>
      <p style={styles.subtitle}>Rating & masukan dari user setiap kali mencoba fitur.</p>

      {loading ? (
        <p style={styles.muted}>Memuat...</p>
      ) : (
        <>
          {/* RINGKASAN */}
          {summary && (
            <>
              <div style={styles.overallCard}>
                <div>
                  <p style={styles.overallLabel}>Rating Keseluruhan</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={styles.overallNum}>{summary.avg_rating_overall.toFixed(1)}</span>
                    <Stars value={summary.avg_rating_overall} size={22} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={styles.overallLabel}>Total Ulasan</p>
                  <span style={styles.overallNum}>{summary.total_reviews}</span>
                </div>
              </div>

              <div style={styles.grid} className="review-grid">
                {Object.keys(FITUR_LABEL).map((f) => {
                  const s = summary.per_fitur[f];
                  return (
                    <div key={f} style={styles.statCard}>
                      <p style={styles.statFitur}>{FITUR_LABEL[f]}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={styles.statNum}>{s ? s.avg_rating.toFixed(1) : "-"}</span>
                        <Stars value={s ? s.avg_rating : 0} />
                      </div>
                      <p style={styles.statCount}>{s ? `${s.total} ulasan` : "belum ada"}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* FILTER */}
          <div style={styles.filterRow}>
            <button onClick={() => setFilter("")} style={filter === "" ? styles.pillActive : styles.pill}>Semua</button>
            {Object.keys(FITUR_LABEL).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={filter === f ? styles.pillActive : styles.pill}>
                {FITUR_LABEL[f]}
              </button>
            ))}
          </div>

          {/* DAFTAR ULASAN */}
          <div style={styles.tableWrap}>
            <table style={styles.table} className="review-table">
              <thead>
                <tr>
                  <th style={styles.th}>Fitur</th>
                  <th style={styles.th}>Rating</th>
                  <th style={styles.th}>Komentar</th>
                  <th style={styles.th}>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", color: colors.textMuted }}>Belum ada ulasan.</td></tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>{FITUR_LABEL[r.fitur] || r.fitur}</td>
                      <td style={styles.td}><Stars value={r.rating} /></td>
                      <td style={styles.td}>{r.komentar || <span style={{ color: colors.textMuted }}>-</span>}</td>
                      <td style={{ ...styles.td, whiteSpace: "nowrap", color: colors.textBody }}>{fmtDate(r.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "50px 40px", minHeight: "100vh", background: "transparent", fontFamily: fonts.body, maxWidth: 1100, margin: "0 auto", boxSizing: "border-box" },
  back: { color: colors.blue, textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" },
  title: { fontSize: "2.2rem", fontWeight: 700, color: colors.textHead, fontFamily: fonts.heading, margin: "12px 0 4px" },
  subtitle: { color: colors.textBody, marginBottom: 28 },
  muted: { color: colors.textMuted, marginTop: 40 },
  overallCard: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: colors.blueGradient || colors.blue, color: colors.onBlue,
    padding: "22px 26px", borderRadius: 18, marginBottom: 20, boxShadow: colors.shadow,
    background: colors.blue,
  },
  overallLabel: { margin: "0 0 6px", fontSize: "0.85rem", opacity: 0.9 },
  overallNum: { fontSize: "2rem", fontWeight: 800, lineHeight: 1 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 30 },
  statCard: { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: colors.shadowSm },
  statFitur: { margin: "0 0 8px", fontSize: "0.9rem", fontWeight: 700, color: colors.textHead },
  statNum: { fontSize: "1.5rem", fontWeight: 800, color: colors.navy },
  statCount: { margin: "4px 0 0", fontSize: "0.8rem", color: colors.textMuted },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  pill: { background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textBody, padding: "7px 16px", borderRadius: 999, fontSize: "0.85rem", fontWeight: 500, cursor: "pointer" },
  pillActive: { background: colors.blue, border: `1px solid ${colors.blue}`, color: colors.onBlue, padding: "7px 16px", borderRadius: 999, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" },
  tableWrap: { overflowX: "auto", background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16, boxShadow: colors.shadow },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 640 },
  th: { textAlign: "left", padding: "14px 16px", fontSize: "0.8rem", fontWeight: 800, color: colors.navy, textTransform: "uppercase", letterSpacing: "0.5px", background: colors.surfaceAlt, borderBottom: `1px solid ${colors.border}` },
  td: { padding: "12px 16px", fontSize: "0.9rem", color: colors.textHead, borderBottom: `1px solid ${colors.border}`, verticalAlign: "top" },
};
