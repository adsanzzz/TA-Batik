import { useState } from "react";
import { submitReview } from "../services/api";
import { colors, fonts } from "../theme";

const FITUR = [
  { id: "scan", label: "Scan AI" },
  { id: "vton", label: "Virtual Try-On" },
  { id: "generative", label: "AI Generative" },
  { id: "photobox", label: "Photobox" },
  { id: "rag", label: "Rekomendasi AI" },
];

const StarIcon = ({ filled, size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={filled ? "#FBBF24" : "none"}
    stroke={filled ? "#F59E0B" : colors.border}
    strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SmallStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function FloatingReview() {
  const [open, setOpen] = useState(false);
  const [fitur, setFitur] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => { setFitur(""); setRating(0); setHover(0); setKomentar(""); setDone(false); };
  const close = () => { setOpen(false); setTimeout(reset, 250); };

  const kirim = async () => {
    if (!fitur || rating < 1) return;
    setLoading(true);
    try {
      await submitReview({ fitur, rating, komentar });
      setDone(true);
    } catch (e) {
      console.error("submit review gagal:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={styles.fab} className="floating-review-fab">
        <SmallStar />
        <span style={styles.fabText}>Beri Rating</span>
      </button>

      {open && (
        <div style={styles.overlay} onClick={close}>
          <style>{`
            @keyframes frModalUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
            @media (max-width: 640px) {
              .floating-review-fab span { display: none; }
              .floating-review-fab { padding: 14px !important; border-radius: 50% !important; }
            }
          `}</style>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={close} style={styles.closeBtn} aria-label="Tutup">&times;</button>

            {done ? (
              <div style={styles.doneWrap}>
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <h3 style={styles.doneTitle}>Makasih atas ulasanmu!</h3>
                <p style={styles.doneDesc}>Masukanmu sangat membantu pengembangan Trisara.</p>
                <button type="button" onClick={close} style={styles.submitBtn}>Tutup</button>
              </div>
            ) : (
              <>
                <h3 style={styles.title}>Beri Rating Fitur</h3>
                <p style={styles.subtitle}>Fitur mana yang mau kamu nilai?</p>

                <div style={styles.pills}>
                  {FITUR.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFitur(f.id)}
                      style={fitur === f.id ? styles.pillActive : styles.pill}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div style={{ ...styles.stars, opacity: fitur ? 1 : 0.4, pointerEvents: fitur ? "auto" : "none" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" style={styles.starBtn}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      aria-label={`${n} bintang`}>
                      <StarIcon filled={(hover || rating) >= n} />
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Ada masukan atau komentar? (opsional)"
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  style={styles.textarea}
                  rows={2}
                />

                <button
                  type="button"
                  onClick={kirim}
                  disabled={!fitur || rating < 1 || loading}
                  style={{ ...styles.submitBtn, width: "100%", opacity: (!fitur || rating < 1 || loading) ? 0.5 : 1, cursor: (!fitur || rating < 1) ? "not-allowed" : "pointer" }}
                >
                  {loading ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: 9000,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: colors.surface,
    color: colors.textHead,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "12px 18px",
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(10, 25, 80, 0.16)",
  },
  fabText: { lineHeight: 1 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 25, 80, 0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10050,
    padding: "20px",
    fontFamily: fonts.body,
  },
  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "440px",
    background: colors.surface,
    borderRadius: "20px",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
    padding: "28px 26px",
    textAlign: "center",
    animation: "frModalUp 0.28s ease-out",
    boxSizing: "border-box",
  },
  closeBtn: {
    position: "absolute",
    top: "14px",
    right: "16px",
    background: colors.surfaceAlt,
    border: "none",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    fontSize: "1.3rem",
    lineHeight: 1,
    color: colors.blue,
    cursor: "pointer",
  },
  title: { margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 700, color: colors.textHead, fontFamily: fonts.heading },
  subtitle: { margin: "0 0 16px", fontSize: "0.9rem", color: colors.textBody },
  pills: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginBottom: "18px" },
  pill: { background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textBody, padding: "7px 14px", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer" },
  pillActive: { background: colors.blueSoft, border: `1px solid ${colors.blue}`, color: colors.blue, padding: "7px 14px", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" },
  stars: { display: "flex", justifyContent: "center", gap: "4px", marginBottom: "16px", transition: "opacity 0.2s" },
  starBtn: { background: "none", border: "none", padding: "2px", cursor: "pointer", lineHeight: 0 },
  textarea: { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${colors.border}`, background: colors.surface, color: colors.textHead, fontFamily: fonts.body, fontSize: "0.9rem", resize: "vertical", outline: "none", marginBottom: "16px" },
  submitBtn: { background: colors.blue, color: colors.onBlue, border: "none", padding: "11px 24px", borderRadius: "999px", fontSize: "0.92rem", fontWeight: 700, boxShadow: "0 6px 16px rgba(3, 62, 238, 0.22)", cursor: "pointer" },
  doneWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "10px 0" },
  doneTitle: { margin: 0, fontSize: "1.15rem", fontWeight: 700, color: colors.textHead },
  doneDesc: { margin: "0 0 8px", fontSize: "0.9rem", color: colors.textBody },
};
