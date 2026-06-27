import { BASE_URL } from "../services/api";

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
        box-shadow: 0 15px 40px rgba(200, 255, 1, 0.25) !important;
        border-color: #C8FF01 !important;
      }
      @media (max-width: 768px) {
        .batik-card-header {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 10px !important;
        }
        .batik-card-badges {
          align-self: flex-start !important;
          margin-top: 5px !important;
        }
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
        <div style={styles.header} className="batik-card-header">
          <div>
            <h3 style={styles.title} className="batik-card-title">{batik.nama}</h3>
            {batik.jenis_acara === "Batik Keraton" && (
              <div style={styles.keratonBadge}>
                <CrownIcon /> Batik Keraton
              </div>
            )}
            {/* Uploader badge */}
            {batik.mitra_id ? (
              <div style={styles.uploaderBadge}>Store: {batik.nama_toko}</div>
            ) : (
              <div style={styles.uploaderBadge}>Admin</div>
            )}
          </div>
          <div className="batik-card-badges">
            <span style={styles.badge}>{batik.jenis_batik}</span>
            <span style={styles.eventBadge}>{batik.jenis_acara}</span>
          </div>
        </div>
        <p style={styles.text} className="batik-card-text"><strong>Motif Utama:</strong> {batik.motif_utama}</p>
        <p style={styles.text} className="batik-card-text"><strong>Jenis Acara:</strong> {batik.jenis_acara}</p>
        <p style={styles.text} className="batik-card-text"><strong>Filosofi:</strong> {batik.filosofi}</p>

        {/* E-Commerce Shop Links */}
        {(batik.shopee_link || batik.tokopedia_link) && (
          <div style={styles.shopSection}>
            <span style={{ fontSize: '0.8rem', color: '#C8FF01', fontWeight: 'bold' }}>Beli di Toko Mitra:</span>
            <div style={styles.shopBtns}>
              {batik.shopee_link && (
                <a
                  href={batik.shopee_link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={styles.shopeeBtn}
                >
                  Shopee ↗
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
                  Tokopedia ↗
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
    background: "linear-gradient(135deg, #0122B4 0%, #022692 100%)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
    border: "1px solid rgba(200, 255, 1, 0.15)",
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    fontFamily: "'Playfair Display', serif",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#C8FF01",
    background: "rgba(200, 255, 1, 0.08)",
    padding: "4px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(200, 255, 1, 0.25)",
    letterSpacing: "0.5px",
    alignSelf: "flex-start",
    marginRight: "8px",
  },
  eventBadge: {
    fontSize: "0.7rem",
    fontWeight: "600",
    color: "#fff",
    background: "rgba(0,0,0,0.5)",
    padding: "3px 10px",
    borderRadius: "16px",
  },
  keratonBadge: {
    display: "inline-flex",
    alignItems: "center",
    marginTop: "8px",
    fontSize: "0.7rem",
    fontWeight: "bold",
    color: "#C8FF01",
    background: "rgba(200, 255, 1, 0.08)",
    border: "1px solid rgba(200, 255, 1, 0.35)",
    padding: "2px 8px",
    borderRadius: "12px",
    textTransform: "uppercase",
  },
  uploaderBadge: {
    marginTop: "6px",
    fontSize: "0.75rem",
    color: "#fff",
    background: "rgba(0,0,0,0.3)",
    padding: "4px 8px",
    borderRadius: "8px",
    display: "inline-block",
  },
  text: {
    fontSize: "0.9rem",
    color: "#E0E0E0",
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
    borderTop: "1px solid rgba(200, 255, 1, 0.1)",
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