import heroImage from '../assets/depan.png';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <section style={styles.hero}>
      {/* Background Pattern */}


      <div style={styles.content}>
        {/* LEFT */}
        <div style={styles.left}>
          <div style={styles.badge}>
            ✦ Artificial Intelligence for Indonesian Heritage
          </div>

          <h1 style={styles.title}>
            Mengenali Keindahan
            <br />
            <span style={styles.gold}>Batik Nusantara</span>
            <br />
            Dengan Teknologi AI
          </h1>

          <p style={styles.subtitle}>
            Temukan identitas motif batik secara otomatis, pelajari filosofi
            yang terkandung di dalamnya, dan dapatkan rekomendasi penggunaan
            batik berdasarkan budaya serta makna tradisionalnya.
          </p>

          <div style={styles.buttons}>
            <a href="/scan" style={styles.primaryBtn}>
              Mulai Identifikasi →
            </a>

            <a href="/katalog" style={styles.secondaryBtn}>
              Jelajahi Katalog
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <div style={styles.imageContainer}>
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
    fontFamily: 'Poppins, sans-serif',
  },

  pattern: {
    position: 'absolute',
    inset: 0,
    opacity: 0.18,
    backgroundImage: `
      radial-gradient(circle at center,
      #C8FF01 2.5px,
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
    padding: '0 8%',
    position: 'relative',
    zIndex: 2,
  },

  left: {
    flex: 1,
    color: 'white',
  },

  badge: {
    display: 'inline-block',
    padding: '10px 18px',
    border: '1px solid rgba(200, 255, 1, 0.3)',
    borderRadius: '999px',
    color: '#C8FF01',
    background: 'rgba(200, 255, 1, 0.08)',
    marginBottom: '30px',
    backdropFilter: 'blur(10px)',
  },

  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '4.5rem',
    lineHeight: '1.3',
    marginBottom: '25px',
    fontWeight: 700,
    background: 'linear-gradient(to bottom, #FFFFFF, #D0DBFF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    paddingTop: '10px',
    paddingBottom: '10px',
  },

  gold: {
    color: '#C8FF01',
    WebkitTextFillColor: '#C8FF01',
  },

  subtitle: {
    maxWidth: '650px',
    color: '#D0DBFF',
    fontSize: '1.1rem',
    lineHeight: 1.8,
    marginBottom: '40px',
  },

  buttons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '60px',
  },

  primaryBtn: {
    textDecoration: 'none',
    background: '#C8FF01',
    color: '#00117D',
    padding: '16px 34px',
    borderRadius: '50px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(200, 255, 1, 0.25)',
    transition: '0.3s',
  },

  secondaryBtn: {
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '16px 34px',
    borderRadius: '50px',
    backdropFilter: 'blur(10px)',
    background: 'rgba(255,255,255,0.05)',
  },

  stats: {
    display: 'flex',
    gap: '60px',
    color: 'white',
  },

  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },

  imageContainer: {
    position: 'relative',
    width: '550px',
  },

  goldBorder: {
    position: 'absolute',
    inset: '-15px',
    border: '2px solid rgba(200, 255, 1, 0.5)',
    borderRadius: '30px',
  },

  image: {
    width: '100%',
    borderRadius: '25px',
    display: 'block',
    boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
    position: 'relative',
    zIndex: 2,
  },

  glow: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: '#C8FF01',
    filter: 'blur(120px)',
    opacity: 0.25,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};
