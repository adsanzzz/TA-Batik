import { useState } from "react";
import { submitReview } from "../services/api";
import { colors, fonts } from "../theme";

const StarIcon = ({ filled, size = 34 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#FBBF24" : "none"}
    stroke={filled ? "#F59E0B" : colors.border}
    strokeWidth="1.5"
    strokeLinejoin="round"
    strokeLinecap="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/**
 * Prompt review muncul setelah user memakai sebuah fitur.
 * props: fitur ("scan"|"vton"|"generative"|"photobox"|"rag"), label (nama tampilan)
 */
export default function FeedbackPrompt({ fitur, label }) {
  const key = `trisara_review_${fitur}`;
  const [hidden, setHidden] = useState(() => {
    try { return sessionStorage.getItem(key) === "1"; } catch { return false; }
  });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (hidden) return null;

  const remember = () => { try { sessionStorage.setItem(key, "1"); } catch { /* noop */ } };
  const dismiss = () => { remember(); setHidden(true); };

  const kirim = async () => {
    if (rating < 1) return;
    setLoading(true);
    try {
      await submitReview({ fitur, rating, komentar });
      remember();
      setDone(true);
    } catch (e) {
      console.error("submit review gagal:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      {done ? (
        <div style={styles.thanksWrap}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p style={styles.thanks}>Makasih atas ulasanmu! Masukanmu membantu kami.</p>
        </div>
      ) : (
        <>
          <p style={styles.title}>Gimana pengalamanmu pakai {label || "fitur ini"}?</p>
          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                style={styles.starBtn}
                aria-label={`${n} bintang`}
              >
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
          <div style={styles.actions}>
            <button type="button" onClick={dismiss} style={styles.dismissBtn}>
              Nanti aja
            </button>
            <button
              type="button"
              onClick={kirim}
              disabled={rating < 1 || loading}
              style={{ ...styles.submitBtn, opacity: rating < 1 || loading ? 0.5 : 1, cursor: rating < 1 ? "not-allowed" : "pointer" }}
            >
              {loading ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    marginTop: "20px",
    padding: "20px 22px",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    boxShadow: colors.shadowSm,
    fontFamily: fonts.body,
    textAlign: "center",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "1rem",
    fontWeight: 600,
    color: colors.textHead,
  },
  stars: {
    display: "flex",
    justifyContent: "center",
    gap: "4px",
    marginBottom: "12px",
  },
  starBtn: {
    background: "none",
    border: "none",
    padding: "2px",
    cursor: "pointer",
    lineHeight: 0,
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textHead,
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    resize: "vertical",
    outline: "none",
    marginBottom: "12px",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },
  dismissBtn: {
    background: "transparent",
    border: `1px solid ${colors.border}`,
    color: colors.textBody,
    padding: "9px 20px",
    borderRadius: "999px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  submitBtn: {
    background: colors.blue,
    color: colors.onBlue,
    border: "none",
    padding: "9px 24px",
    borderRadius: "999px",
    fontSize: "0.9rem",
    fontWeight: 700,
    boxShadow: "0 6px 16px rgba(3, 62, 238, 0.22)",
  },
  thanksWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  thanks: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 600,
    color: colors.textHead,
  },
};
