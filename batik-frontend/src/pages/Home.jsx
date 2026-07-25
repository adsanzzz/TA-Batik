import heroImage from '../assets/depan.png';
import Footer from '../components/Footer';
import { colors, fonts } from '../theme';

export default function Home() {
  return (
    <section style={styles.hero}>
      {/* Background Pattern */}
      <style>{`
        /* RESPONSIVE DESIGN FOR HOME */
        .home-script { user-select: none; }
        @media (max-width: 1024px) {
          .home-script { top: 5% !important; bottom: auto !important; font-size: 15vw !important; opacity: 0.4 !important; }
          .home-content { padding: 40px 5% !important; flex-direction: column !important; justify-content: center !important; gap: 40px !important; text-align: center !important; }
          .home-left { flex: none !important; width: 100% !important; display: flex !important; flex-direction: column !important; align-items: center !important; }
          .home-right { flex: none !important; width: 100% !important; max-width: 600px !important; margin: 0 auto !important; }
          .home-title { font-size: 2.8rem !important; }
        }

        @media (max-width: 768px) {
          .home-content { padding: 30px 20px !important; gap: 30px !important; margin-top: 20px !important; }
          .home-title { font-size: 2.1rem !important; line-height: 1.25 !important; }
          .home-subtitle { font-size: 0.9rem !important; margin-bottom: 25px !important; }
          .home-badge { 
            font-size: 0.78rem !important; 
            padding: 8px 14px !important; 
            margin-bottom: 20px !important;
            white-space: normal !important;
            text-align: center !important;
            max-width: 90% !important;
          }
          .home-image-container {
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
          }
          .home-image-container > div:first-child {
            inset: -10px !important;
            border-radius: 20px !important;
          }
          .home-buttons { 
            display: flex !important;
            flex-direction: column !important; 
            align-items: center !important; 
            width: 100% !important; 
            max-width: 280px !important; 
            margin: 0 auto !important; 
            gap: 12px !important; 
            box-sizing: border-box !important;
          }
          .home-primary-btn, .home-secondary-btn { 
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important; 
            box-sizing: border-box !important;
            padding: 14px 28px !important; 
          }
        }
      `}</style>
      <div style={styles.content} className="home-content">
        {/* Decorative script watermark ala ASKARA — bawah, center */}
        <span style={styles.scriptWatermark} className="home-script">Nusantara</span>
        {/* LEFT */}
        <div style={styles.left} className="home-left">
          <div style={styles.badge} className="home-badge">
            Artificial Intelligence for Indonesian Heritage
          </div>

          <h1 style={styles.title} className="home-title">
            Mengenali Keindahan
            <br />
            <span style={styles.gold}>Batik Nusantara</span>
            <br />
            Dengan Teknologi AI
          </h1>

          <p style={styles.subtitle} className="home-subtitle">
            Temukan identitas motif batik secara otomatis, pelajari filosofi
            yang terkandung di dalamnya, dan dapatkan rekomendasi penggunaan
            batik berdasarkan budaya serta makna tradisionalnya.
          </p>

          <div style={styles.buttons} className="home-buttons">
            <a href="/scan" style={styles.primaryBtn} className="home-primary-btn">
              Mulai Identifikasi
            </a>

            <a href="/katalog" style={styles.secondaryBtn} className="home-secondary-btn">
              Jelajahi Katalog
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right} className="home-right">
          <div style={styles.imageContainer} className="home-image-container">
            <div style={styles.goldBorder}></div>

            <img
              src={heroImage}
              alt="Batik Intelligence"
              style={styles.image}
            />

            <div style={styles.glow}></div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

const styles = {
  hero: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: fonts.body,
  },

  scriptWatermark: {
    position: 'absolute',
    // Di band bawah hero, center — mengisi ruang kosong di atas footer
    bottom: '48px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'Dancing Script', cursive",
    fontSize: 'clamp(3rem, 13vw, 9rem)',
    lineHeight: 1.2,
    fontWeight: 700,
    // Efek shine: streak putih bergerak melintasi teks
    backgroundImage:
      'linear-gradient(100deg, #A9BAEC 0%, #A9BAEC 38%, #FFFFFF 50%, #A9BAEC 62%, #A9BAEC 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    animation: 'shineText 5s linear infinite',
    opacity: 0.55,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 0,
  },

  pattern: {
    position: 'absolute',
    inset: 0,
    opacity: 0.18,
    backgroundImage: `
      radial-gradient(circle at center,
      rgba(3, 62, 238, 0.08) 2.5px,
      transparent 2.5px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 0,
  },

  content: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8% 140px',
    position: 'relative',
    zIndex: 2,
  },

  left: {
    flex: 1,
    color: colors.textBody,
    animation: 'fadeUp 0.8s ease-out both',
    position: 'relative',
    zIndex: 1,
  },

  badge: {
    display: 'inline-block',
    padding: '10px 18px',
    border: `1px solid ${colors.blueBorder}`,
    borderRadius: '999px',
    color: colors.blue,
    background: colors.blueSoft,
    marginBottom: '30px',
    fontWeight: 500,
  },

  title: {
    fontFamily: fonts.heading,
    fontSize: '3.2rem',
    lineHeight: '1.25',
    marginBottom: '22px',
    fontWeight: 700,
    color: colors.textHead,
    paddingTop: '6px',
    paddingBottom: '6px',
  },

  gold: {
    color: colors.blue,
  },

  subtitle: {
    maxWidth: '620px',
    color: colors.textBody,
    fontSize: '1rem',
    lineHeight: 1.75,
    marginBottom: '36px',
  },

  buttons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '60px',
  },

  primaryBtn: {
    textDecoration: 'none',
    background: colors.blueGradient,
    color: colors.onBlue,
    padding: '16px 34px',
    borderRadius: '50px',
    fontWeight: '700',
    boxShadow: '0 12px 30px rgba(3, 62, 238, 0.28)',
    transition: '0.3s',
  },

  secondaryBtn: {
    textDecoration: 'none',
    border: `1px solid ${colors.blueBorder}`,
    color: colors.navy,
    padding: '16px 34px',
    borderRadius: '50px',
    background: colors.surface,
    fontWeight: 600,
  },

  stats: {
    display: 'flex',
    gap: '60px',
    color: colors.textBody,
  },

  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },

  imageContainer: {
    position: 'relative',
    width: '480px',
    animation: 'floatY 6s ease-in-out infinite',
  },

  goldBorder: {
    position: 'absolute',
    inset: '-15px',
    border: `2px solid ${colors.blueBorder}`,
    borderRadius: '30px',
  },

  image: {
    width: '100%',
    borderRadius: '25px',
    display: 'block',
    boxShadow: '0 30px 80px rgba(10, 25, 80, 0.18)',
    position: 'relative',
    zIndex: 2,
  },

  glow: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: colors.blue,
    filter: 'blur(120px)',
    opacity: 0.15,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};
