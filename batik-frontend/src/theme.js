// =============================================================
//  TRISARA THEME TOKENS — Light / ASKARA-inspired, blue accent
//  Sumber warna terpusat. Ganti nilai di sini untuk re-brand.
// =============================================================

export const colors = {
  // Backgrounds (cream → biru, terang)
  bg: "#FDFAF4",
  bgGradient: "linear-gradient(165deg, #FDFAF4 0%, #EAF0FF 55%, #CFDDFF 100%)",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF3FF",   // putih-kebiruan (dulu cream) — nyatu dgn bg biru

  // Blue accent scale (menggantikan lime + ungu)
  navy: "#00117D",        // deep — heading kuat & tombol solid
  navyDark: "#000B4D",
  blue: "#033EEE",        // bright accent — link, ikon, state aktif, tombol
  blue600: "#0A46D6",
  // Tombol pakai warna biru solid (samakan dengan warna font biru)
  blueGradient: "#033EEE",

  // Accent tints (menggantikan rgba lime)
  blueSoft: "rgba(3, 62, 238, 0.07)",
  blueSoft2: "rgba(3, 62, 238, 0.12)",
  blueBorder: "rgba(3, 62, 238, 0.22)",

  // Text
  textHead: "#0C1B4D",    // heading deep navy
  textBody: "#54617A",    // body slate-gray
  textMuted: "#8A93A6",
  onBlue: "#FFFFFF",      // teks di atas tombol biru

  // Structure
  border: "#E1E7F5",      // cool light border (dulu cream)
  shadow: "0 12px 40px rgba(10, 25, 80, 0.10)",
  shadowSm: "0 4px 18px rgba(10, 25, 80, 0.08)",

  // Decorative script watermark (mis. "Selamat Datang")
  script: "#CBD4F2",

  // Status / brand (tetap)
  danger: "#E23B4E",
  success: "#12A150",
  shopee: "#EE4D2D",
  tokopedia: "#03AC0E",
};

export const fonts = {
  heading: "'Playfair Display', serif",
  body: "'Poppins', sans-serif",
  script: "'Playfair Display', serif",
};
