import { BASE_URL } from "../services/api";
import { colors, fonts } from "../theme";

const CrownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
  </svg>
);

export default function CardBatik({ batik, onClick }) {
  // Jika path gambar sudah lengkap (http/https), jangan tambahkan BASE_URL. 
  // Jika hanya berupa path lokal (misal: uploads/abc.jpg), tambahkan BASE_URL.
  const imageUrl = batik.gambar?.startsWith("http") 
    ? batik.gambar 
    : `${BASE_URL}/${batik.gambar}`;

  return (
    <>
    <style>{`
      .batik-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .batik-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 18px 40px rgba(3, 62, 238, 0.18) !important;
        border-color: rgba(3, 62, 238, 0.4) !important;
      }
      @media (max-width: 768px) {
        .batik-card-content {
          padding: 16px !important;
        }
        .batik-card-title {
          font-size: 1.15rem !important;
        }
        .batik-card-text {
          font-size: 0.85rem !important;
        }
      }
    `}</style>
    <div style={styles.card} className="batik-card" onClick={onClick}>
      <img
        src={imageUrl || "https://via.placeholder.com/300"}
        alt={batik.nama}
        style={styles.image}
      />

      <div style={styles.content} className="batik-card-content">
        <h3 style={styles.title} className="batik-card-title">{batik.nama}</h3>

        {/* Semua label dijadikan satu baris agar rapi & tidak patah di tengah kata */}
        <div style={styles.badgeRow}>
          {batik.jenis_acara === "Batik Keraton" && (
            <span style={{ ...styles.badgeBase, ...styles.keratonBadge }}>
              <CrownIcon /> Batik Keraton
            </span>
          )}
          {batik.jenis_batik && (
            <span style={{ ...styles.badgeBase, ...styles.badge }}>{batik.jenis_batik}</span>
          )}
          {batik.jenis_acara && batik.jenis_acara !== "Batik Keraton" && (
            <span style={{ ...styles.badgeBase, ...styles.eventBadge }}>{batik.jenis_acara}</span>
          )}
          <span style={{ ...styles.badgeBase, ...styles.uploaderBadge }}>
            {batik.mitra_id ? `Store: ${batik.nama_toko}` : "Admin"}
          </span>
        </div>
        <p style={styles.text} className="batik-card-text"><strong>Motif Utama:</strong> {batik.motif_utama}</p>
        <p style={styles.text} className="batik-card-text"><strong>Jenis Acara:</strong> {batik.jenis_acara}</p>
        <p style={styles.text} className="batik-card-text"><strong>Filosofi:</strong> {batik.filosofi}</p>

        {/* E-Commerce Shop Links */}
        {(batik.shopee_link || batik.tokopedia_link) && (
          <div style={styles.shopSection}>
            <span style={{ fontSize: '0.8rem', color: colors.blue, fontWeight: 'bold' }}>Beli di Toko Mitra:</span>
            <div style={styles.shopBtns}>
              {batik.shopee_link && (
                <a
                  href={batik.shopee_link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={styles.shopeeBtn}
                >
                  Shopee
                </a>
              )}
              {batik.tokopedia_link && (
                <a
                  href={batik.tokopedia_link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={styles.tokopediaBtn}
                >
                  Tokopedia
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

const styles = {
  card: {
    background: colors.surface,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`,
    transition: "transform 0.3s ease, boxShadow 0.3s ease",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },
  content: {
    padding: "24px",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: colors.textHead,
    margin: 0,
    fontFamily: fonts.heading,
    lineHeight: "1.35",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "6px",
    margin: "10px 0 14px",
  },
  // Dasar semua badge: tinggi & radius seragam, teks tidak patah di tengah
  badgeBase: {
    display: "inline-flex",
    alignItems: "center",
    maxWidth: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "0.72rem",
    fontWeight: "700",
    lineHeight: 1.5,
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid transparent",
  },
  badge: {
    color: colors.blue,
    background: colors.blueSoft,
    borderColor: colors.blueBorder,
    letterSpacing: "0.3px",
  },
  eventBadge: {
    color: colors.onBlue,
    background: colors.navy,
    fontWeight: "600",
  },
  keratonBadge: {
    color: colors.blue,
    background: colors.blueSoft,
    borderColor: colors.blueBorder,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  uploaderBadge: {
    color: colors.textMuted,
    background: colors.surfaceAlt,
    borderColor: colors.border,
    fontWeight: "600",
  },
  text: {
    fontSize: "0.9rem",
    color: colors.textBody,
    lineHeight: "1.6",
    margin: "6px 0",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  shopSection: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  shopBtns: {
    display: "flex",
    gap: "10px",
  },
  shopeeBtn: {
    flex: 1,
    textAlign: "center",
    textDecoration: "none",
    background: "#EE4D2D",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
  tokopediaBtn: {
    flex: 1,
    textAlign: "center",
    textDecoration: "none",
    background: "#03AC0E",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
};
