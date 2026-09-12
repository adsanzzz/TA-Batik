import { useState, useEffect, useRef, useCallback } from "react";
import { BASE_URL, uploadPhotoboxTemp } from "../services/api";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import Footer from "../components/Footer";
import { colors, fonts } from "../theme";

/* ─── Icons ─────────────────────────────────────────────── */
const IconCamera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconRetake = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-3" />
  </svg>
);
const IconPrint = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
const IconQR = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
    <rect x="3" y="16" width="5" height="5" /><line x1="21" y1="21" x2="16" y2="21" />
    <line x1="21" y1="16" x2="21" y2="18" /><line x1="16" y1="16" x2="18" y2="16" />
    <line x1="9" y1="3" x2="9" y2="9" /><line x1="3" y1="9" x2="9" y2="9" />
  </svg>
);

const SparklesIcon = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "8px" }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" opacity="0.6"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" opacity="0.6"/>
  </svg>
);

const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ─── Layout previews ────────────────────────────────────── */
const LAYOUTS = [
  {
    count: 1, label: "1 Foto", desc: "Single",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="52" height="72" rx="3" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 2, label: "2 Foto", desc: "Duo",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="52" height="34" rx="3" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
        <rect x="4" y="42" width="52" height="34" rx="3" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 3, label: "3 Foto", desc: "Strip",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="52" height="22" rx="3" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
        <rect x="4" y="30" width="52" height="22" rx="3" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
        <rect x="4" y="56" width="52" height="22" rx="3" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 4, label: "4 Foto", desc: "Grid",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="24" height="34" rx="2" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
        <rect x="32" y="4" width="24" height="34" rx="2" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
        <rect x="4" y="42" width="24" height="34" rx="2" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
        <rect x="32" y="42" width="24" height="34" rx="2" fill="rgba(3, 62, 238, 0.07)" stroke="#033EEE" strokeWidth="2" />
      </svg>
    )
  },
];

const FRAME_COLORS = [
  { id: "none", label: "Tanpa Frame", color: null, textColor: "#6b7280" },
  { id: "white", label: "Putih Bersih", color: "#ffffff", border: "#e5e7eb", textColor: "#1f2937" },
  { id: "cream", label: "Krem Nusantara", color: "#EADBC8", border: "#D2B48C", textColor: "#5a3e28" },
  { id: "dark", label: "Biru Kegelapan", color: "#00117D", border: "#0122B4", textColor: "#C8FF01" },
  { id: "gold", label: "Lime UNS", color: "#C8FF01", border: "#AEE600", textColor: "#00117D" },
  { id: "batik", label: "Batik Merah", color: "#8B1A1A", border: "#5a0f0f", textColor: "#FDF6EC" },
  { id: "sage", label: "Hijau Sage", color: "#4a7c59", border: "#2d5a3d", textColor: "#f0faf4" },
  { id: "indigo", label: "Biru Nusantara", color: "#2d3a6b", border: "#1a2350", textColor: "#e8ecff" },
];

/* ─── Teks kolom koran — Batik Nusantara ─── */
const BATIK_ARTICLES = [
  "Batik merupakan warisan budaya Indonesia yang telah diakui UNESCO sebagai Warisan Budaya Tak Benda sejak 2 Oktober 2009. Motif batik mengandung filosofi mendalam tentang kehidupan, alam, dan nilai-nilai luhur nenek moyang.",
  "Setiap helai kain batik menyimpan cerita panjang tentang keindahan dan kearifan lokal. Proses pembuatannya yang teliti dengan canting atau cap mencerminkan kesabaran dan ketelitian pengrajin batik Indonesia.",
  "Trisara hadir sebagai jembatan digital yang menghubungkan kekayaan batik tradisional dengan teknologi modern. Dengan kecerdasan buatan, kami membantu melestarikan dan memperkenalkan batik kepada generasi muda Indonesia.",
];

/* ─── Teks kolom koran — Surakarta Edition ─── */
const SURAKARTA_ARTICLES = [
  "Surakarta, dikenal sebagai Kota Solo, adalah salah satu kota tertua di Pulau Jawa. Didirikan pada tahun 1745, kota ini tumbuh di bawah naungan Keraton Kasunanan Surakarta yang menjadi pusat kebudayaan Jawa selama berabad-abad.",
  "Kota Solo menyimpan kekayaan seni dan tradisi yang luar biasa. Wayang kulit, gamelan, tari Bedhaya, serta upacara adat Sekaten menjadi warisan leluhur yang terus dilestarikan warga Solo dengan penuh kebanggaan hingga hari ini.",
  "Kuliner Solo terkenal di seluruh nusantara. Nasi liwet, serabi, timlo, dan sate kere adalah sajian khas yang mencerminkan keramahan dan kekayaan cita rasa lokal masyarakat Surakarta yang hangat dan bersahaja.",
];

/* ─── Palet tunggal template cetak: putih klasik (optimal printer thermal) ─── */
const PAPER = { bg: "#ffffff", text: "#000000", accent: "#000000", divider: "#000000" };

/* ─── Rincian "item" struk — Surakarta Edition ─── */
const RECEIPT_ITEMS = [
  { name: "Batik Sogan Keraton",    qty: "x1",  price: "WARISAN" },
  { name: "Gamelan & Wayang Kulit", qty: "x1",  price: "ADILUHUNG" },
  { name: "Nasi Liwet & Serabi",    qty: "x1",  price: "NGANGENI" },
  { name: "Sugeng Rawuh ing Solo",  qty: "x99", price: "TAK TERNILAI" },
];

/* ─── roundRect polyfill (Safari < 15.4 / older browsers) ── */
if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + w - radius, y);
    this.quadraticCurveTo(x + w, y, x + w, y + radius);
    this.lineTo(x + w, y + h - radius);
    this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    this.lineTo(x + radius, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}

/* ─── Helper: draw image greyscale to canvas ctx ── */
function drawGreyscale(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  // Draw offscreen, apply greyscale filter, draw to main canvas
  const offscreen = document.createElement("canvas");
  offscreen.width = dw;
  offscreen.height = dh;
  const offCtx = offscreen.getContext("2d");
  offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
  const imageData = offCtx.getImageData(0, 0, dw, dh);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = avg;
  }
  offCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(offscreen, dx, dy, dw, dh);
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Photobox() {
  const [step, setStep] = useState(1); // 1=layout, 2=capture, 3=frame, 4=result
  const [layout, setLayout] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedColor, setSelectedColor] = useState(FRAME_COLORS[0]);
  const [apiFrames, setApiFrames] = useState([]);
  const [selectedApiFrame, setSelectedApiFrame] = useState(null);
  const [finalCollage, setFinalCollage] = useState(null);
  const [useNewspaper, setUseNewspaper] = useState(false);
  // "general" | "surakarta"
  const [newspaperTemplate, setNewspaperTemplate] = useState("general");
  const [newspaperGreyscale, setNewspaperGreyscale] = useState(false);
  const [newspaperTitle, setNewspaperTitle] = useState("TRISARA × SIF 2026");
  const [newspaperSub, setNewspaperSub] = useState("Momen Indah Batik Nusantara");
  const [newspaperQuote, setNewspaperQuote] = useState("");

  const [countdown, setCountdown] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);

  // QR Code state
  const [qrUrl, setQrUrl] = useState(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const printCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const countdownRef = useRef(null);
  const layoutRef = useRef(null);

  // Fetch API frames
  useEffect(() => {
    fetch(`${BASE_URL}/frames`)
      .then(r => r.json())
      .then(d => setApiFrames(Array.isArray(d) ? d : []))
      .catch(() => {});
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (step === 2 && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step]);

  /* ── Camera ── */
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      alert("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin kamera.");
    }
  };
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  /* ── Step 1 → 2 ── */
  const handleSelectLayout = async (lay) => {
    layoutRef.current = lay;
    setLayout(lay);
    setPhotos([]);
    setStep(2);
    await startCamera();
  };

  /* ── Capture foto ── */
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const tmp = document.createElement("canvas");
    tmp.width = video.videoWidth || 1280;
    tmp.height = video.videoHeight || 720;
    const ctx = tmp.getContext("2d");
    ctx.translate(tmp.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, tmp.width, tmp.height);
    const dataUrl = tmp.toDataURL("image/png");

    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const currentLayout = layoutRef.current;
    setPhotos(prev => {
      const next = [...prev, dataUrl];
      if (currentLayout && next.length >= currentLayout.count) {
        stopCamera();
        setTimeout(() => setStep(3), 400);
      }
      return next;
    });
  };

  /* ── Countdown ── */
  const triggerCountdown = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    let n = 3;
    setCountdown(n);
    countdownRef.current = setInterval(() => {
      n--;
      if (n > 0) {
        setCountdown(n);
      } else {
        clearInterval(countdownRef.current);
        setCountdown("SMILE!");
        setTimeout(() => {
          capturePhoto();
          setCountdown(null);
          setIsCapturing(false);
        }, 400);
      }
    }, 1000);
  };

  /* ── Retake last photo ── */
  const retakePhoto = () => {
    setPhotos(prev => prev.slice(0, -1));
    if (!streamRef.current) startCamera();
  };

  /* ── Build Standard Collage (bingkai warna photobooth) ── */
  const buildCollage = useCallback(async () => {
    if (photos.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const currentLayout = layoutRef.current;
    if (!currentLayout) return;
    const isGrid = currentLayout.count === 4;
    const cols = isGrid ? 2 : 1;
    const rows = isGrid ? 2 : currentLayout.count;

    const DISPLAY = "'Playfair Display', Georgia, serif";
    const SANS = "'Poppins', 'Helvetica Neue', Arial, sans-serif";

    const photoW = 600;
    const photoH = 400;
    const gap = 18;
    const padX = 52;

    const canvasW = padX * 2 + cols * photoW + (cols - 1) * gap;
    // skala ornamen & tipografi mengikuti lebar kanvas (grid 2x2 jauh lebih lebar dari strip)
    const k = Math.min(1.55, Math.max(1, canvasW / 704));
    const mount = Math.round(8 * k);        // tepi "kertas foto" putih
    const padTop = Math.round(104 * k);     // area kop
    const padBottom = Math.round(152 * k);  // area brand

    const canvasH = padTop + padBottom + rows * photoH + (rows - 1) * gap;
    canvas.width = canvasW;
    canvas.height = canvasH;

    const plain = !selectedApiFrame && !selectedColor.color;   // opsi "Tanpa Frame"
    const bgColor = selectedColor.color || "#ffffff";
    const ink = selectedColor.textColor || "#1f2937";
    const accent = selectedColor.border || "#D8DEEC";

    const isLightColor = (hex) => {
      if (!hex) return true;
      const c = hex.replace("#", "");
      if (c.length < 6) return true;
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 155;
    };
    const light = isLightColor(bgColor);

    /* helper: lebar teks ber-letterspacing */
    const measureSpaced = (text, spacing) => {
      const chars = [...text];
      return chars.reduce((a, c) => a + ctx.measureText(c).width, 0) + spacing * (chars.length - 1);
    };

    /* helper: gambar teks ber-letterspacing, rata tengah */
    const spacedText = (text, cx, baseline, spacing) => {
      const total = measureSpaced(text, spacing);
      let x = cx - total / 2;
      ctx.textAlign = "left";
      for (const c of [...text]) {
        ctx.fillText(c, x, baseline);
        x += ctx.measureText(c).width + spacing;
      }
    };

    /* helper: motif parang samar (garis diagonal) */
    const batikBand = (bx, by, bw, bh, color, alpha) => {
      if (bh <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
      ctx.clip();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (let i = -bh; i < bw + bh; i += Math.round(24 * k)) {
        ctx.beginPath();
        ctx.moveTo(bx + i, by + bh);
        ctx.lineTo(bx + i + bh * 0.75, by);
        ctx.stroke();
      }
      ctx.restore();
    };

    /* helper: ornamen belah ketupat */
    const diamond = (cx, cy, r, fill, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
    };

    /* ── LATAR BINGKAI ── */
    if (selectedApiFrame) {
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      frameImg.src = selectedApiFrame.gambar?.startsWith("http")
        ? selectedApiFrame.gambar
        : `${BASE_URL}/${selectedApiFrame.gambar}`;
      await new Promise(r => { frameImg.onload = r; frameImg.onerror = r; });
      ctx.drawImage(frameImg, 0, 0, canvasW, canvasH);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // gradasi halus biar warna nggak flat
      const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
      grad.addColorStop(0, light ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.10)");
      grad.addColorStop(0.5, "rgba(255,255,255,0)");
      grad.addColorStop(1, light ? "rgba(0,0,0,0.045)" : "rgba(0,0,0,0.20)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);

      if (!plain) {
        // motif parang di area kop & kaki
        batikBand(0, 0, canvasW, padTop - 26 * k, accent, 0.16);
        batikBand(0, canvasH - padBottom + 26 * k, canvasW, padBottom - 26 * k, accent, 0.16);
      }

      // keyline + ornamen sudut
      const inset = Math.round(20 * k);
      ctx.save();
      ctx.globalAlpha = plain ? 0.55 : 0.9;
      ctx.strokeStyle = plain ? accent : accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(inset, inset, canvasW - inset * 2, canvasH - inset * 2);
      ctx.restore();
      const corners = [[inset, inset], [canvasW - inset, inset], [inset, canvasH - inset], [canvasW - inset, canvasH - inset]];
      for (const [cx, cy] of corners) diamond(cx, cy, 7 * k, accent, plain ? 0.6 : 1);
    }

    /* ── KOP: garis — nama acara — garis ── */
    if (!selectedApiFrame) {
      const headBase = Math.round(64 * k);
      const tag = "PHOTOBOX NUSANTARA";
      const tagSp = 6 * k;
      ctx.font = `bold ${Math.round(21 * k)}px ${SANS}`;
      const tagW = measureSpaced(tag, tagSp);
      const railGap = 26 * k;
      const railStart = 58 * k;
      const railW = (canvasW / 2 - tagW / 2 - railGap) - railStart;
      if (railW > 24) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = ink;
        ctx.fillRect(railStart, headBase - 8 * k, railW, 2 * k);
        ctx.fillRect(canvasW - railStart - railW, headBase - 8 * k, railW, 2 * k);
        ctx.restore();
      }
      ctx.fillStyle = ink;
      spacedText(tag, canvasW / 2, headBase, tagSp);
    }

    /* ── FOTO ── */
    for (let i = 0; i < photos.length; i++) {
      const img = new Image();
      img.src = photos[i];
      await new Promise(r => { img.onload = r; });

      const col = isGrid ? i % 2 : 0;
      const row = isGrid ? Math.floor(i / 2) : i;
      const x = padX + col * (photoW + gap);
      const y = padTop + row * (photoH + gap);

      const ar = img.width / img.height;
      const ar2 = photoW / photoH;
      let sx, sy, sw, sh;
      if (ar > ar2) { sh = img.height; sw = sh * ar2; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw / ar2; sx = 0; sy = (img.height - sh) / 2; }

      // "kertas foto" putih + bayangan (dilewati saat Tanpa Frame agar tetap bersih)
      if (!plain) {
        ctx.save();
        ctx.shadowColor = light ? "rgba(12,27,77,0.22)" : "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 20 * k;
        ctx.shadowOffsetY = 7 * k;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(x - mount, y - mount, photoW + mount * 2, photoH + mount * 2, 14);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, photoW, photoH, 9);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, x, y, photoW, photoH);
      ctx.restore();

      // hairline tipis di tepi foto
      ctx.strokeStyle = "rgba(12,27,77,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + 0.5, y + 0.5, photoW - 1, photoH - 1, 9);
      ctx.stroke();
    }

    /* ── KAKI: ornamen + wordmark + tanggal ── */
    const footTop = padTop + rows * photoH + (rows - 1) * gap;
    const today = new Date();
    const dateStr = today.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
    const metaTxt = `${dateStr}   ·   ${photos.length} FOTO`;

    if (selectedApiFrame) {
      // bingkai custom sudah punya desain sendiri → watermark halus saja
      ctx.font = `bold ${Math.round(24 * k)}px ${DISPLAY}`;
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.textAlign = "center";
      ctx.fillText("Trisara", canvasW / 2, footTop + 74 * k);
    } else {
      const ornY = footTop + 34 * k;
      diamond(canvasW / 2, ornY, 6 * k, ink, 0.85);
      diamond(canvasW / 2 - 22 * k, ornY, 4 * k, ink, 0.5);
      diamond(canvasW / 2 + 22 * k, ornY, 4 * k, ink, 0.5);
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = ink;
      ctx.fillRect(canvasW / 2 - 150 * k, ornY - 1, 110 * k, 2 * k);
      ctx.fillRect(canvasW / 2 + 40 * k, ornY - 1, 110 * k, 2 * k);
      ctx.restore();

      ctx.fillStyle = ink;
      ctx.font = `bold ${Math.round(46 * k)}px ${DISPLAY}`;
      ctx.textAlign = "center";
      ctx.fillText("Trisara", canvasW / 2, footTop + 86 * k);

      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = ink;
      ctx.font = `600 ${Math.round(18 * k)}px ${SANS}`;
      spacedText(metaTxt, canvasW / 2, footTop + 118 * k, 2.5 * k);
      ctx.restore();
    }

    setFinalCollage(canvas.toDataURL("image/png"));
  }, [photos, selectedColor, selectedApiFrame]);

  /* ── Build Newspaper Collage (koran 58mm — Nusantara Edition) ── */
  const buildNewspaperCollage = useCallback(async () => {
    if (photos.length === 0 || !canvasRef.current) return;

    // 58mm @203dpi = 464px; pakai 580px agar tajam saat di-scale ke printer
    const W = 580;
    const PAD = 22;
    const innerW = W - PAD * 2;
    const DISPLAY = "'Playfair Display', Georgia, serif";
    const SERIF = "Georgia, 'Times New Roman', serif";
    const NC = PAPER;

    // Load images first
    const loadedImgs = [];
    for (const photoUrl of photos) {
      const img = new Image();
      img.src = photoUrl;
      await new Promise(r => { img.onload = r; });
      loadedImgs.push(img);
    }

    // Foto tunggal/ganda dibuat 4:3 (lega, seperti koran), 3+ dibuat 16:9 agar ringkas
    const photoSlotW = innerW;
    const photoRatio = loadedImgs.length <= 2 ? 3 / 4 : 9 / 16;
    const photoSlotH = Math.round(photoSlotW * photoRatio);

    // Digambar ke kanvas offscreen longgar, lalu dipotong tepat setinggi isi
    const off = document.createElement("canvas");
    off.width = W;
    off.height = 900 + (photoSlotH + 10) * loadedImgs.length;
    const ctx = off.getContext("2d");
    ctx.fillStyle = NC.bg;
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.textBaseline = "alphabetic";

    let y = PAD;

    /* helper: garis horizontal */
    const rule = (h, gap) => {
      ctx.fillStyle = NC.divider;
      ctx.fillRect(PAD, y, innerW, h);
      y += gap;
    };

    /* helper: garis ganda ala koran (tebal + tipis) */
    const doubleRule = (gap = 12) => {
      ctx.fillStyle = NC.divider;
      ctx.fillRect(PAD, y, innerW, 3);
      ctx.fillRect(PAD, y + 6, innerW, 1);
      y += gap;
    };

    /* helper: wrap teks + auto-shrink agar pas maksimal N baris */
    const fitLines = (text, maxW, maxLines, startSize, minSize, weight = "bold", font = DISPLAY) => {
      for (let size = startSize; size >= minSize; size--) {
        ctx.font = `${weight} ${size}px ${font}`;
        const words = text.split(/\s+/).filter(Boolean);
        const lines = [];
        let cur = "";
        let overflow = false;
        for (const w of words) {
          const test = cur ? `${cur} ${w}` : w;
          if (ctx.measureText(test).width > maxW) {
            if (!cur) { overflow = true; break; }
            lines.push(cur);
            cur = w;
          } else {
            cur = test;
          }
        }
        if (overflow) continue;
        if (cur) lines.push(cur);
        if (lines.length <= maxLines) return { size, lines };
      }
      ctx.font = `${weight} ${minSize}px ${font}`;
      return { size: minSize, lines: [text] };
    };

    /* helper: teks kolom rata kanan-kiri (justify) ala koran */
    const drawJustified = (text, x, top, colW, lineH) => {
      ctx.textAlign = "left";
      const words = text.split(/\s+/).filter(Boolean);
      const lines = [];
      let cur = [];
      for (const w of words) {
        const test = cur.concat(w).join(" ");
        if (ctx.measureText(test).width > colW && cur.length) {
          lines.push(cur);
          cur = [w];
        } else {
          cur.push(w);
        }
      }
      if (cur.length) lines.push(cur);

      let cy = top;
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i];
        const isLast = i === lines.length - 1;
        if (isLast || parts.length === 1) {
          ctx.fillText(parts.join(" "), x, cy);
        } else {
          const textW = parts.reduce((a, w) => a + ctx.measureText(w).width, 0);
          const space = (colW - textW) / (parts.length - 1);
          let wx = x;
          for (const w of parts) {
            ctx.fillText(w, wx, cy);
            wx += ctx.measureText(w).width + space;
          }
        }
        cy += lineH;
      }
      return cy;
    };

    const isSurakarta = newspaperTemplate === "surakarta";

    /* ── MASTHEAD: SPECIAL EDITION | JUDUL | DAILY REPORT ── */
    const sideW = 74;
    ctx.fillStyle = NC.text;
    ctx.font = `bold 12px ${SERIF}`;
    ctx.textAlign = "left";
    ctx.fillText("SPECIAL", PAD, y + 14);
    ctx.fillText("EDITION", PAD, y + 28);
    ctx.textAlign = "right";
    ctx.fillText("DAILY", W - PAD, y + 14);
    ctx.fillText("REPORT", W - PAD, y + 28);

    const mastTxt = (newspaperTitle || "TRISARA × SIF 2026").trim();
    const mast = fitLines(mastTxt, innerW - sideW * 2 - 16, 1, 34, 13, "bold");
    ctx.font = `bold ${mast.size}px ${DISPLAY}`;
    ctx.textAlign = "center";
    ctx.fillText(mast.lines[0], W / 2, y + 27);
    y += 40;

    doubleRule(14);

    /* ── BARIS TAG: KATEGORI · SLOGAN · TANGGAL ── */
    const today = new Date();
    const dateStr = today.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    ctx.fillStyle = NC.text;
    ctx.font = `bold 9.5px ${SERIF}`;
    ctx.textAlign = "left";
    ctx.fillText(isSurakarta ? "KOTA SURAKARTA" : "BATIK NUSANTARA", PAD, y + 10);
    ctx.textAlign = "center";
    ctx.fillText(isSurakarta ? "KOTA BUDAYA JAWA TENGAH" : "WARISAN BUDAYA TAK BENDA UNESCO", W / 2, y + 10);
    ctx.textAlign = "right";
    ctx.fillText(dateStr, W - PAD, y + 10);
    y += 18;

    rule(2.5, 16);

    /* ── HEADLINE BESAR ── */
    const headline = (newspaperSub || "MOMEN INDAH ANDA").toUpperCase();
    const head = fitLines(headline, innerW - 6, 3, 52, 20, "bold");
    ctx.font = `bold ${head.size}px ${DISPLAY}`;
    ctx.fillStyle = NC.accent;
    ctx.textAlign = "center";
    const headLineH = Math.round(head.size * 1.06);
    for (const line of head.lines) {
      y += headLineH;
      ctx.fillText(line, W / 2, y);
    }
    y += 14;

    rule(2.5, 12);

    /* ── FOTO ── */
    for (let i = 0; i < loadedImgs.length; i++) {
      const img = loadedImgs[i];
      const ar = img.width / img.height;
      const ar2 = photoSlotW / photoSlotH;
      let sx, sy, sw, sh;
      if (ar > ar2) { sh = img.height; sw = sh * ar2; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw / ar2; sx = 0; sy = (img.height - sh) / 2; }

      ctx.save();
      if (newspaperGreyscale) ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, sx, sy, sw, sh, PAD, y, photoSlotW, photoSlotH);
      ctx.restore();

      ctx.strokeStyle = NC.divider;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(PAD, y, photoSlotW, photoSlotH);
      y += photoSlotH + (i === loadedImgs.length - 1 ? 0 : 8);
    }
    y += 16;

    /* ── KUTIPAN ── */
    rule(1.5, 10);
    const defaultQuote = isSurakarta
      ? `"Surakarta, kota seribu warisan budaya yang tak lekang oleh waktu."`
      : `"Mengabadikan momen indah bersama dalam kenangan yang abadi."`;
    const quoteTxt = (newspaperQuote ? `"${newspaperQuote}"` : defaultQuote).toUpperCase();
    const q = fitLines(quoteTxt, innerW - 10, 3, 15, 10, "bold", SERIF);
    ctx.font = `bold ${q.size}px ${SERIF}`;
    ctx.fillStyle = NC.accent;
    ctx.textAlign = "center";
    const qLineH = Math.round(q.size * 1.45);
    for (const line of q.lines) {
      y += qLineH;
      ctx.fillText(line, W / 2, y);
    }
    y += 10;
    rule(2.5, 16);

    /* ── 3 KOLOM ARTIKEL (rata kanan-kiri) ── */
    const articleSet = isSurakarta ? SURAKARTA_ARTICLES : BATIK_ARTICLES;
    const numCols = 3;
    const colGap = 12;
    const colW = (innerW - colGap * (numCols - 1)) / numCols;
    const bodyLineH = 12.5;

    let colBottom = y;
    for (let c = 0; c < numCols; c++) {
      const cx = PAD + c * (colW + colGap);
      ctx.font = `9px ${SERIF}`;
      ctx.fillStyle = NC.text;
      colBottom = Math.max(colBottom, drawJustified(articleSet[c] || articleSet[0], cx, y + 9, colW, bodyLineH));
    }

    // garis pemisah antar kolom, seragam setinggi kolom terpanjang
    const colRuleH = colBottom - y - bodyLineH + 6;
    ctx.fillStyle = NC.divider;
    for (let c = 0; c < numCols - 1; c++) {
      const cx = PAD + c * (colW + colGap);
      ctx.fillRect(cx + colW + colGap / 2 - 0.5, y, 1, colRuleH);
    }
    y = colBottom + 4;

    /* ── FOOTER MASTHEAD ── */
    doubleRule(18);
    ctx.fillStyle = NC.text;
    ctx.font = `bold 10px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.fillText(
      isSurakarta ? "SOLO, THE SPIRIT OF JAVA  ·  MATUR NUWUN" : "BATIK NUSANTARA  ·  TERIMA KASIH ATAS KUNJUNGAN ANDA",
      W / 2, y + 10
    );
    y += 18;
    ctx.font = `italic 9px ${SERIF}`;
    ctx.fillText(`EDISI KHUSUS ${dateStr}  ·  ${loadedImgs.length} LEMBAR FOTO`, W / 2, y + 8);
    y += 14;
    rule(3, 6);

    /* ── Potong kanvas tepat setinggi isi ── */
    const canvas = canvasRef.current;
    canvas.width = W;
    canvas.height = Math.min(Math.round(y + PAD), off.height);
    const outCtx = canvas.getContext("2d");
    outCtx.fillStyle = NC.bg;
    outCtx.fillRect(0, 0, canvas.width, canvas.height);
    outCtx.drawImage(off, 0, 0);

    setFinalCollage(canvas.toDataURL("image/png"));
  }, [photos, newspaperTitle, newspaperSub, newspaperQuote, newspaperTemplate, newspaperGreyscale]);

  /* ── Build Receipt Collage (struk kasir 58mm — Surakarta Edition) ── */
  const buildReceiptCollage = useCallback(async () => {
    if (photos.length === 0 || !canvasRef.current) return;

    const W = 580;
    const PAD = 26;
    const innerW = W - PAD * 2;
    const MONO = "'Courier New', 'Consolas', monospace";
    const P = PAPER;

    // Load images first
    const loadedImgs = [];
    for (const photoUrl of photos) {
      const img = new Image();
      img.src = photoUrl;
      await new Promise(r => { img.onload = r; });
      loadedImgs.push(img);
    }

    const photoSlotW = innerW;
    const photoSlotH = Math.round(photoSlotW * 3 / 4); // slot 4:3
    const photoH = photoSlotH * loadedImgs.length + 34 * loadedImgs.length;

    // Digambar dulu ke kanvas offscreen yang longgar, lalu dipotong sesuai isi
    const off = document.createElement("canvas");
    off.width = W;
    off.height = 1500 + photoH;
    const ctx = off.getContext("2d");
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.textBaseline = "alphabetic";

    let y = PAD;

    /* helper: garis putus-putus ala struk */
    const dashed = (gap = 18) => {
      ctx.save();
      ctx.strokeStyle = P.divider;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD, y + 0.5);
      ctx.lineTo(W - PAD, y + 0.5);
      ctx.stroke();
      ctx.restore();
      y += gap;
    };

    /* helper: garis ganda (===) */
    const double = (gap = 20) => {
      ctx.fillStyle = P.divider;
      ctx.fillRect(PAD, y, innerW, 2);
      ctx.fillRect(PAD, y + 5, innerW, 2);
      y += gap;
    };

    /* helper: baris kiri – kanan */
    const row = (left, right, { size = 12.5, bold = false, gap = 21 } = {}) => {
      ctx.font = `${bold ? "bold " : ""}${size}px ${MONO}`;
      ctx.fillStyle = P.text;
      ctx.textAlign = "left";
      ctx.fillText(left, PAD, y);
      ctx.textAlign = "right";
      ctx.fillText(right, W - PAD, y);
      y += gap;
    };

    /* helper: baris item (nama – qty – harga) */
    const itemRow = (name, qty, price, { size = 12.5, bold = false, gap = 21 } = {}) => {
      ctx.font = `${bold ? "bold " : ""}${size}px ${MONO}`;
      ctx.fillStyle = P.text;
      ctx.textAlign = "left";
      ctx.fillText(name, PAD, y);
      ctx.textAlign = "center";
      ctx.fillText(qty, PAD + innerW * 0.66, y);
      ctx.textAlign = "right";
      ctx.fillText(price, W - PAD, y);
      y += gap;
    };

    /* helper: teks tengah, otomatis wrap */
    const center = (text, { size = 12.5, bold = false, italic = false, gap = 19 } = {}) => {
      ctx.font = `${italic ? "italic " : ""}${bold ? "bold " : ""}${size}px ${MONO}`;
      ctx.fillStyle = P.text;
      ctx.textAlign = "center";
      const words = String(text).split(" ");
      let line = "";
      for (let i = 0; i < words.length; i++) {
        const test = line ? `${line} ${words[i]}` : words[i];
        if (ctx.measureText(test).width > innerW && line) {
          ctx.fillText(line, W / 2, y);
          y += gap;
          line = words[i];
        } else {
          line = test;
        }
      }
      ctx.fillText(line, W / 2, y);
      y += gap;
    };

    /* ── KOP STRUK ───────────────────────────────────────── */
    y += 16;
    center("*** SUGENG RAWUH ING SOLO ***", { size: 12, bold: true, gap: 30 });

    // Judul besar: menyusut otomatis agar selalu pas selebar struk
    const titleTxt = (newspaperTitle || "KOTA SURAKARTA").toUpperCase();
    let titleSize = 30;
    ctx.font = `bold ${titleSize}px ${MONO}`;
    while (ctx.measureText(titleTxt).width > innerW && titleSize > 13) {
      titleSize -= 1;
      ctx.font = `bold ${titleSize}px ${MONO}`;
    }
    center(titleTxt, { size: titleSize, bold: true, gap: 30 });

    center("Kota Budaya Jawa Tengah", { size: 11.5, gap: 17 });
    center("Keraton Kasunanan · Pura Mangkunegaran", { size: 11, gap: 17 });
    center("Berdiri 17 Februari 1745", { size: 11.5, gap: 24 });
    dashed();

    /* ── META TRANSAKSI ──────────────────────────────────── */
    const now = new Date();
    const p2 = n => String(n).padStart(2, "0");
    const noStruk = `SKA-${String(now.getFullYear()).slice(2)}${p2(now.getMonth() + 1)}${p2(now.getDate())}-${p2(now.getHours())}${p2(now.getMinutes())}${p2(now.getSeconds())}`;
    row("No. Struk", noStruk, { size: 11.5 });
    row("Tanggal", `${p2(now.getDate())}/${p2(now.getMonth() + 1)}/${now.getFullYear()}  ${p2(now.getHours())}:${p2(now.getMinutes())}`, { size: 11.5 });
    row("Lokasi", "SOLO, JAWA TENGAH", { size: 11.5 });
    row("Lembar", `${loadedImgs.length} FOTO KENANGAN`, { size: 11.5, gap: 24 });
    double(24);

    /* ── BANNER ──────────────────────────────────────────── */
    center(`** ${(newspaperSub || "Kota Budaya Jawa Tengah").toUpperCase()} **`, { size: 15, bold: true, gap: 24 });
    double(26);

    /* ── FOTO ────────────────────────────────────────────── */
    for (let i = 0; i < loadedImgs.length; i++) {
      const img = loadedImgs[i];
      const ar = img.width / img.height;
      const ar2 = photoSlotW / photoSlotH;
      let sx, sy, sw, sh;
      if (ar > ar2) { sh = img.height; sw = sh * ar2; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw / ar2; sx = 0; sy = (img.height - sh) / 2; }

      ctx.save();
      if (newspaperGreyscale) ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, sx, sy, sw, sh, PAD, y, photoSlotW, photoSlotH);
      ctx.restore();

      ctx.strokeStyle = P.divider;
      ctx.lineWidth = 2;
      ctx.strokeRect(PAD, y, photoSlotW, photoSlotH);
      y += photoSlotH + 15;

      ctx.font = `10.5px ${MONO}`;
      ctx.fillStyle = P.text;
      ctx.textAlign = "left";
      ctx.fillText(`FOTO ${i + 1}/${loadedImgs.length}`, PAD, y);
      ctx.textAlign = "right";
      ctx.fillText(newspaperGreyscale ? "MODE B/W" : "MODE WARNA", W - PAD, y);
      y += 19;
    }
    dashed();

    /* ── RINCIAN "TRANSAKSI" ─────────────────────────────── */
    itemRow("ITEM", "QTY", "HARGA", { size: 11, bold: true, gap: 17 });
    dashed();
    itemRow("Kenangan Kota Solo", `x${loadedImgs.length}`, "GRATIS");
    for (const it of RECEIPT_ITEMS) itemRow(it.name, it.qty, it.price);
    y += 3;
    dashed();
    row("SUBTOTAL", "Rp 0", { size: 12 });
    row("DISKON KEBAHAGIAAN", "100%", { size: 12 });
    row("PPN KENANGAN", "Rp 0", { size: 12, gap: 24 });
    double(26);
    row("TOTAL", "TAK TERHINGGA", { size: 17, bold: true, gap: 28 });
    double(24);
    row("TUNAI", "SENYUM & TAWA", { size: 12 });
    row("KEMBALI", "KENANGAN ABADI", { size: 12, gap: 24 });
    dashed(22);

    /* ── KUTIPAN ─────────────────────────────────────────── */
    const quote = newspaperQuote
      ? `"${newspaperQuote}"`
      : `"Surakarta, kota seribu warisan budaya yang tak lekang oleh waktu."`;
    center(quote, { size: 12.5, italic: true, bold: true, gap: 20 });
    y += 6;
    dashed(24);

    /* ── BARCODE DEKORATIF + FOOTER ──────────────────────── */
    const bcH = 54;
    const bcW = Math.round(innerW * 0.82);
    const bcX = Math.round((W - bcW) / 2);
    let bx = bcX;
    let seed = noStruk.split("").reduce((a, c) => a + c.charCodeAt(0), 7);
    ctx.fillStyle = P.text;
    while (bx < bcX + bcW - 2) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const barW = 1 + (seed % 4);
      const gapW = 1 + ((seed >> 6) % 3);
      if (bx + barW > bcX + bcW) break;
      ctx.fillRect(bx, y, barW, bcH);
      bx += barW + gapW;
    }
    y += bcH + 17;
    center(noStruk, { size: 11, gap: 26 });

    center("MATUR NUWUN SAMPUN RAWUH", { size: 12.5, bold: true, gap: 20 });
    center("Terima kasih telah berkunjung ke Solo", { size: 11, gap: 17 });
    center("Solo, The Spirit of Java", { size: 11, gap: 22 });
    dashed(16);
    center("*** BUKTI KENANGAN, BUKAN BUKTI BAYAR ***", { size: 10, gap: 12 });

    /* ── Potong kanvas sesuai tinggi isi ─────────────────── */
    const canvas = canvasRef.current;
    canvas.width = W;
    canvas.height = Math.min(Math.round(y + PAD), off.height);
    const outCtx = canvas.getContext("2d");
    outCtx.fillStyle = P.bg;
    outCtx.fillRect(0, 0, canvas.width, canvas.height);
    outCtx.drawImage(off, 0, 0);

    setFinalCollage(canvas.toDataURL("image/png"));
  }, [photos, newspaperTitle, newspaperSub, newspaperQuote, newspaperGreyscale]);

  /* ── Pilih renderer sesuai template cetak ── */
  const buildPrintCollage = useCallback(async () => {
    if (newspaperTemplate === "surakarta") return buildReceiptCollage();
    return buildNewspaperCollage();
  }, [newspaperTemplate, buildReceiptCollage, buildNewspaperCollage]);

  useEffect(() => {
    if (step === 3 || step === 4) {
      if (useNewspaper) buildPrintCollage();
      else buildCollage();
    }
  }, [step, selectedColor, selectedApiFrame, useNewspaper, newspaperTitle, newspaperSub, newspaperQuote, newspaperTemplate, newspaperGreyscale]);

  /* ── Step 3 → 4 ── */
  const confirmFrame = async () => {
    // Build collage first, wait for canvas to be populated
    if (useNewspaper) await buildPrintCollage();
    else await buildCollage();
    // Grab data URL immediately after build (canvas is synchronously ready)
    const collageDataUrl = canvasRef.current?.toDataURL("image/png") || null;
    setStep(4);
    // Upload for QR Code
    setUploadingQr(true);
    setQrUrl(null);
    setQrError(null);
    try {
      if (collageDataUrl) {
        const result = await uploadPhotoboxTemp(collageDataUrl);
        // qr_url dari backend sudah absolut & pakai IP yang bisa diakses HP;
        // fallback ke BASE_URL untuk backend versi lama
        setQrUrl(result.qr_url || `${BASE_URL}${result.download_url}`);
      }
    } catch (err) {
      setQrError("Gagal generate QR. Download manual tetap tersedia.");
    } finally {
      setUploadingQr(false);
    }
  };



  /* ── Copy link hasil foto ── */
  const copyQrLink = async () => {
    if (!qrUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(qrUrl);
      } else {
        // fallback: clipboard API hanya tersedia di secure context (https/localhost)
        const ta = document.createElement("textarea");
        ta.value = qrUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Salin link ini:", qrUrl);
    }
  };

  /* ── Download ── */
  const downloadPNG = () => {
    if (!finalCollage) return;
    const a = document.createElement("a");
    a.href = finalCollage;
    a.download = "Trisara_Photobox.png";
    a.click();
  };
  const downloadPDF = () => {
    if (!finalCollage || !canvasRef.current) return;
    const { width, height } = canvasRef.current;
    const pdf = new jsPDF({ orientation: width > height ? "landscape" : "portrait", unit: "px", format: [width, height] });
    pdf.addImage(finalCollage, "PNG", 0, 0, width, height);
    pdf.save("Trisara_Photobox.pdf");
  };

  /* ── Print (thermal) ── */
  const handlePrint = () => {
    if (!finalCollage) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trisara Photobox Print</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 58mm;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img {
            width: 58mm;
            height: auto;
            display: block;
            filter: grayscale(100%) contrast(1.1);
          }
          @media print {
            body { width: 58mm; }
          }
        </style>
      </head>
      <body>
        <img src="${finalCollage}" />
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 400);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  /* ── Restart ── */
  const restart = () => {
    stopCamera();
    setStep(1);
    setLayout(null);
    setPhotos([]);
    setFinalCollage(null);
    setSelectedColor(FRAME_COLORS[0]);
    setSelectedApiFrame(null);
    setCountdown(null);
    setIsCapturing(false);
    setUseNewspaper(false);
    setNewspaperTemplate("general");
    setNewspaperGreyscale(false);
    setNewspaperTitle("TRISARA × SIF 2026");
    setNewspaperSub("Momen Indah Batik Nusantara");
    setNewspaperQuote("");
    setQrUrl(null);
    setQrError(null);
    setLinkCopied(false);
  };

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <>
    <div style={S.page} className="photobox-page">
      <style>{`
        .photobox-page * { box-sizing: border-box !important; }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.6);opacity:0} }
        @keyframes countdown-pop { 0%{transform:scale(1.5);opacity:0} 60%{transform:scale(0.95);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes flash { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
        @keyframes slide-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        @keyframes qr-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(3,62,238,0.3)} 50%{box-shadow:0 0 0 12px rgba(3,62,238,0)} }
        .photobox-card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 20px 50px rgba(10, 25, 80, 0.14) !important; border-color: #033EEE !important; }
        /* Swatch bingkai warna */
        .swatch { display:flex; flex-direction:column; align-items:center; gap:7px; padding:0; margin:0; background:none; border:none; cursor:pointer; font:inherit; -webkit-tap-highlight-color:transparent; }
        .swatch-preview { position:relative; display:flex; align-items:center; justify-content:center; width:100%; aspect-ratio:1/1; border-radius:13px; border:2px solid #E1E7F5; box-shadow:0 1px 3px rgba(12,27,77,0.08); transition:transform .18s ease, box-shadow .18s ease, outline-color .18s ease; outline:2.5px solid transparent; outline-offset:2px; overflow:hidden; }
        .swatch:hover .swatch-preview { transform:translateY(-3px); box-shadow:0 8px 18px rgba(12,27,77,0.16); }
        .swatch.active .swatch-preview { outline-color:#033EEE; box-shadow:0 8px 20px rgba(3,62,238,0.26); }
        .swatch-photo { width:56%; height:62%; border-radius:3px; background:linear-gradient(135deg,#C9D3E8 0%,#F4F7FF 55%,#DCE4F5 100%); box-shadow:inset 0 0 0 1px rgba(12,27,77,0.10); }
        .swatch-photo.stack { box-shadow:inset 0 0 0 1px rgba(12,27,77,0.10), 0 0 0 3px rgba(255,255,255,0.45); }
        .swatch-check { position:absolute; top:4px; right:4px; width:19px; height:19px; border-radius:50%; background:#033EEE; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(3,62,238,0.45); }
        .swatch-check svg { width:12px !important; height:12px !important; }
        .swatch-label { font-size:0.68rem; font-weight:700; color:#3A4360; text-align:center; line-height:1.25; letter-spacing:0.1px; }
        .swatch.active .swatch-label { color:#033EEE; }

        /* Kartu bingkai custom dari API */
        .frame-card { display:flex; flex-direction:column; gap:6px; padding:0; margin:0; background:none; border:none; cursor:pointer; font:inherit; text-align:center; }
        .frame-card-thumb { position:relative; width:100%; aspect-ratio:3/4; border-radius:13px; overflow:hidden; border:2px solid #E1E7F5; background:#EEF3FF; box-shadow:0 1px 3px rgba(12,27,77,0.08); transition:transform .18s ease, box-shadow .18s ease, outline-color .18s ease; outline:2.5px solid transparent; outline-offset:2px; }
        .frame-card:hover .frame-card-thumb { transform:translateY(-3px); box-shadow:0 8px 18px rgba(12,27,77,0.16); }
        .frame-card.active .frame-card-thumb { outline-color:#033EEE; box-shadow:0 8px 20px rgba(3,62,238,0.26); }
        .frame-card.active .swatch-label { color:#033EEE; }
        .btn-primary:hover { background: #0A46D6 !important; transform: translateY(-1px); }
        .btn-secondary:hover { background: #EEF3FF !important; }
        .btn-dark:hover { background: #000B4D !important; transform: translateY(-1px); }
        .btn-newspaper:hover { background: #111 !important; transform: translateY(-1px); }
        .btn-copy:hover { background: #EEF3FF !important; transform: translateY(-1px); }
        .capture-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 8px 30px rgba(3,62,238,0.35) !important; }
        .capture-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .qr-box { animation: qr-pulse 2.5s infinite; }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }

        /* Newspaper toggle tab */
        .frame-tab { cursor:pointer; padding: 8px 18px; border-radius: 30px; font-size: 0.82rem; font-weight: 700; border: 2px solid #E1E7F5; transition: all 0.2s; }
        .frame-tab.active { background: #000; color: #fff; border-color: #000; }
        .frame-tab:not(.active) { background: #fff; color: #333; }
        .frame-tab:not(.active):hover { border-color: #033EEE; color: #033EEE; }

        /* Newspaper input */
        .np-input { width:100%; border: 1.5px solid #E1E7F5; border-radius: 10px; padding: 8px 12px; font-size: 0.85rem; font-family: 'Georgia', serif; color: #111; background: #fafafa; transition: border 0.2s; }
        .np-input:focus { outline:none; border-color: #033EEE; background:#fff; }

        @media (max-width: 1024px) {
          .photobox-page { padding: 40px 20px !important; }
          .photobox-layout-grid { gap: 20px !important; }
          .photobox-frame-layout { flex-direction: column !important; align-items: center !important; }
          .photobox-preview-panel { flex: 1 1 auto !important; width: 100% !important; }
          .photobox-frame-sidebar { width: 100% !important; max-width: 100% !important; margin-top: 20px !important; }
        }
        @media (max-width: 768px) {
          .photobox-action-btns { flex-direction: column !important; width: 100% !important; }
          .photobox-action-btns > button { width: 100% !important; justify-content: center !important; }
          .photobox-subtitle { max-width: 250px !important; margin: 0 auto !important; line-height: 1.4 !important; }
          .photobox-page { padding: 30px 15px !important; }
          .photobox-header-title { font-size: 2rem !important; }
          .photobox-step-bar { flex-wrap: wrap !important; row-gap: 20px !important; }
          .photobox-step-item { min-width: 50% !important; }
          .photobox-step-line { display: none !important; }
          .photobox-camera-layout { flex-direction: column !important; }
          .photobox-camera-box { min-width: 100% !important; }
          .photobox-strip-panel { min-width: 100% !important; flex-direction: row !important; padding: 15px !important; }
          .photobox-strip-list { flex-direction: row !important; overflow-x: auto !important; gap: 10px !important; padding-bottom: 5px !important; }
          .photobox-strip-slot { min-width: 110px !important; flex-shrink: 0 !important; }
          .photobox-camera-controls { flex-wrap: wrap !important; justify-content: center !important; }
          .capture-btn { width: 100% !important; }
          .photobox-frame-color-grid { grid-template-columns: repeat(auto-fill, minmax(74px, 1fr)) !important; }
          .result-grid { flex-direction: column !important; align-items: center !important; }
          .qr-section { width: 100% !important; }
        }
      `}</style>

      {/* ─── Header ─── */}
      <div style={S.header}>
        <img src="/logo.png" alt="Logo" style={S.logoImage} />
        <h1 style={S.headerTitle} className="photobox-header-title">
          <SparklesIcon size={28} color={colors.blue} /> Photobox <span style={{ color: colors.blue }}>Nusantara</span>
        </h1>
        <p style={S.headerSub} className="photobox-subtitle">Abadikan momen indah dengan bingkai batik khas Indonesia</p>
      </div>

      {/* ─── Step Indicator ─── */}
      <div style={S.stepBar} className="photobox-step-bar">
        {["Pilih Layout", "Sesi Foto", "Pilih Bingkai", "Simpan & Cetak"].map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} style={S.stepItem} className="photobox-step-item">
              <div style={{ ...S.stepCircle, ...(done ? S.stepDone : active ? S.stepActive : S.stepFuture) }}>
                {done ? <IconCheck /> : n}
              </div>
              <span style={{ ...S.stepLabel, color: active ? colors.blue : done ? colors.textBody : colors.textMuted }}>{label}</span>
              {i < 3 && <div className="photobox-step-line" style={{ ...S.stepLine, background: done ? colors.blue : colors.border }} />}
            </div>
          );
        })}
      </div>

      {/* ═══ STEP 1: LAYOUT ═══ */}
      {step === 1 && (
        <div style={{ ...S.contentBox, animation: "slide-in 0.4s ease" }}>
          <h2 style={S.sectionTitle}>Pilih Jumlah Foto</h2>
          <p style={S.sectionSub}>Tentukan berapa banyak foto yang ingin masuk dalam satu bingkai</p>
          <div style={S.layoutGrid} className="photobox-layout-grid">
            {LAYOUTS.map(lay => (
              <div key={lay.count} className="photobox-card" style={S.layoutCard} onClick={() => handleSelectLayout(lay)}>
                <div style={S.layoutPreview}>{lay.preview()}</div>
                <div style={S.layoutBadge}>{lay.desc}</div>
                <h3 style={S.layoutLabel}>{lay.label}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ STEP 2: CAPTURE ═══ */}
      {step === 2 && (
        <div style={{ ...S.captureLayout, animation: "slide-in 0.4s ease" }}>
          <div style={S.cameraWrap} className="photobox-camera-layout">
            <div style={S.cameraBox} className="photobox-camera-box">
              <video ref={videoRef} autoPlay playsInline muted style={S.video} />
              {countdown !== null && (
                <div style={S.countdownOverlay}>
                  <div style={S.countdownNum}>{countdown}</div>
                </div>
              )}
              {flash && <div style={S.flashEffect} />}
              <div style={S.progressDots}>
                {Array.from({ length: layout.count }).map((_, i) => (
                  <div key={i} style={{ ...S.dot, ...(i < photos.length ? S.dotFilled : {}) }} />
                ))}
              </div>
            </div>
            <div style={S.cameraControls} className="photobox-camera-controls">
              <button className="btn-secondary" style={S.btnSecondary} onClick={restart}>Batal</button>
              {photos.length > 0 && (
                <button className="btn-secondary" style={S.btnSecondary} onClick={retakePhoto} disabled={isCapturing}>
                  <IconRetake /> &nbsp;Foto Ulang
                </button>
              )}
              <button
                id="btn-capture"
                className="capture-btn"
                style={S.captureBtn}
                onClick={triggerCountdown}
                disabled={isCapturing || photos.length >= layout.count}
              >
                <IconCamera />
                <span style={{ marginLeft: 8 }}>
                  {isCapturing ? "Bersiap..." : `Ambil Foto ${photos.length + 1}/${layout.count}`}
                </span>
              </button>
            </div>
            <p style={{ textAlign: "center", color: colors.blue, fontSize: "0.85rem", marginTop: 8 }}>
              Klik tombol lalu bersiaplah — hitung mundur 3 detik akan dimulai
            </p>
          </div>

          {/* Strip preview */}
          <div style={S.stripPanel} className="photobox-strip-panel">
            <h3 style={S.stripTitle}>Foto Terambil ({photos.length}/{layout.count})</h3>
            <div style={S.stripList} className="photobox-strip-list">
              {Array.from({ length: layout.count }).map((_, i) => (
                <div key={i} style={S.stripSlot} className="photobox-strip-slot">
                  {photos[i]
                    ? <img src={photos[i]} alt={`foto ${i + 1}`} style={S.stripImg} />
                    : <div style={S.stripEmpty}><IconCamera /><span style={{ fontSize: "0.7rem", marginTop: 4 }}>Foto {i + 1}</span></div>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: FRAME ═══ */}
      {step === 3 && (
        <div style={{ ...S.frameLayout, animation: "slide-in 0.4s ease" }} className="photobox-frame-layout">
          {/* Preview */}
          <div style={S.previewPanel} className="photobox-preview-panel">
            <div style={S.previewBox}>
              {finalCollage
                ? <img src={finalCollage} alt="preview" style={S.previewImg} />
                : <div style={{ color: colors.textMuted, textAlign: "center" }}>Memuat preview...</div>
              }
            </div>
            <div className="photobox-action-btns" style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className="btn-secondary" style={S.btnSecondary} onClick={restart}><IconRetake />&nbsp;Mulai Ulang</button>
              <button className="btn-primary" style={S.btnPrimary} onClick={confirmFrame}>
                Gunakan Bingkai ini →
              </button>
            </div>
          </div>

          {/* Frame selector sidebar */}
          <div style={S.frameSidebar} className="photobox-frame-sidebar">
            {/* Tab: Standard vs Newspaper */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <button className={`frame-tab ${!useNewspaper ? "active" : ""}`} onClick={() => setUseNewspaper(false)}>
                Bingkai Warna
              </button>
              <button className={`frame-tab ${useNewspaper ? "active" : ""}`} onClick={() => setUseNewspaper(true)}>
                Template Cetak
              </button>
            </div>

            {!useNewspaper ? (
              <>
                <div style={S.sectionHead}>
                  <h3 style={{ ...S.sidebarTitle, margin: 0 }}>Warna Bingkai</h3>
                  <span style={S.sectionCount}>{FRAME_COLORS.length} pilihan</span>
                </div>
                <div style={S.frameColorGrid} className="photobox-frame-color-grid">
                  {FRAME_COLORS.map(fc => {
                    const active = !selectedApiFrame && selectedColor.id === fc.id;
                    return (
                      <button
                        key={fc.id}
                        type="button"
                        title={fc.label}
                        aria-pressed={active}
                        className={`swatch ${active ? "active" : ""}`}
                        onClick={() => { setSelectedColor(fc); setSelectedApiFrame(null); }}
                      >
                        <span
                          className="swatch-preview"
                          style={{
                            background: fc.color || "#fff",
                            backgroundImage: fc.color
                              ? undefined
                              : "repeating-linear-gradient(45deg, #EEF3FF 0 6px, #ffffff 6px 12px)",
                            borderColor: fc.border || colors.border,
                          }}
                        >
                          <span className={`swatch-photo ${fc.color ? "stack" : ""}`} />
                          {active && <span className="swatch-check"><IconCheck /></span>}
                        </span>
                        <span className="swatch-label">{fc.label}</span>
                      </button>
                    );
                  })}
                </div>

                {apiFrames.length > 0 && (
                  <>
                    <div style={{ ...S.sectionHead, marginTop: 22 }}>
                      <h3 style={{ ...S.sidebarTitle, margin: 0 }}>Bingkai Custom</h3>
                      <span style={S.sectionCount}>{apiFrames.length} bingkai</span>
                    </div>
                    <div style={S.apiFrameList}>
                      {apiFrames.map(fr => {
                        const active = selectedApiFrame?.id === fr.id;
                        return (
                          <button
                            key={fr.id}
                            type="button"
                            title={fr.nama}
                            aria-pressed={active}
                            className={`frame-card ${active ? "active" : ""}`}
                            onClick={() => { setSelectedApiFrame(fr); setSelectedColor(FRAME_COLORS[0]); }}
                          >
                            <span className="frame-card-thumb">
                              <img
                                src={fr.gambar?.startsWith("http") ? fr.gambar : `${BASE_URL}/${fr.gambar}`}
                                alt={fr.nama}
                                style={S.apiFrameThumb}
                              />
                              {active && <span className="swatch-check"><IconCheck /></span>}
                            </span>
                            <span className="swatch-label">{fr.nama}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Newspaper template editor */
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={S.sectionHead}>
                  <h3 style={{ ...S.sidebarTitle, margin: 0 }}>Template Cetak</h3>
                  <span style={S.sectionCount}>2 gaya</span>
                </div>

                {/* Pilih gaya template */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={`frame-tab ${newspaperTemplate === "general" ? "active" : ""}`}
                    style={{ flex: 1, padding: "9px 6px", fontSize: "0.76rem" }}
                    onClick={() => {
                      setNewspaperTemplate("general");
                      setNewspaperTitle("TRISARA × SIF 2026");
                      setNewspaperSub("Momen Indah Batik Nusantara");
                    }}
                  >
                    Koran
                  </button>
                  <button
                    type="button"
                    className={`frame-tab ${newspaperTemplate === "surakarta" ? "active" : ""}`}
                    style={{ flex: 1, padding: "9px 6px", fontSize: "0.76rem" }}
                    onClick={() => {
                      setNewspaperTemplate("surakarta");
                      setNewspaperTitle("KOTA SURAKARTA");
                      setNewspaperSub("Kota Budaya Jawa Tengah");
                    }}
                  >
                    Struk
                  </button>
                </div>

                {/* Mode foto */}
                <div>
                  <label style={S.npLabel}>Mode Foto</label>
                  <div style={S.segment}>
                    {[{ val: false, label: "Berwarna" }, { val: true, label: "Greyscale" }].map(opt => (
                      <button
                        key={String(opt.val)}
                        type="button"
                        onClick={() => setNewspaperGreyscale(opt.val)}
                        style={{
                          ...S.segmentBtn,
                          background: newspaperGreyscale === opt.val ? colors.blue : "transparent",
                          color: newspaperGreyscale === opt.val ? "#fff" : colors.textMuted,
                          boxShadow: newspaperGreyscale === opt.val ? "0 2px 8px rgba(3,62,238,0.25)" : "none",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={S.npLabel}>Judul Utama</label>
                  <input
                    className="np-input"
                    value={newspaperTitle}
                    onChange={e => setNewspaperTitle(e.target.value.slice(0, 40))}
                    placeholder={newspaperTemplate === "surakarta" ? "KOTA SURAKARTA" : "TRISARA × SIF 2026"}
                    maxLength={40}
                  />
                  {newspaperTitle.length > 32 && <span style={S.npHint}>{newspaperTitle.length}/40</span>}
                </div>

                <div>
                  <label style={S.npLabel}>{newspaperTemplate === "surakarta" ? "Banner" : "Headline"}</label>
                  <input
                    className="np-input"
                    value={newspaperSub}
                    onChange={e => setNewspaperSub(e.target.value.slice(0, 60))}
                    placeholder={newspaperTemplate === "surakarta" ? "Kota Budaya Jawa Tengah" : "Momen Indah Anda"}
                    maxLength={60}
                  />
                  {newspaperSub.length > 48 && <span style={S.npHint}>{newspaperSub.length}/60</span>}
                </div>

                <div>
                  <label style={S.npLabel}>Kutipan <span style={S.npOptional}>opsional</span></label>
                  <textarea
                    className="np-input"
                    value={newspaperQuote}
                    onChange={e => setNewspaperQuote(e.target.value.slice(0, 120))}
                    placeholder={newspaperTemplate === "surakarta"
                      ? "Surakarta, kota seribu warisan budaya..."
                      : "Tuliskan sesuatu yang berkesan..."}
                    rows={3}
                    maxLength={120}
                    style={{ resize: "vertical", minHeight: 62 }}
                  />
                  {newspaperQuote.length > 96 && <span style={S.npHint}>{newspaperQuote.length}/120</span>}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ═══ STEP 4: RESULT ═══ */}
      {step === 4 && (
        <div style={{ ...S.resultLayout, animation: "slide-in 0.4s ease" }}>
          <div style={S.resultBox}>
            <div style={S.resultBadge}>
              {useNewspaper ? (newspaperTemplate === "surakarta" ? "Struk Kenangan Siap!" : "Template Koran Siap!") : "Foto Siap Diunduh!"}
            </div>

            {/* Restart button — prominent, above grid */}
            <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <button className="btn-secondary" style={{ ...S.btnSecondary }} onClick={restart}>
                <IconRetake />&nbsp; Mulai Foto Baru
              </button>
            </div>

            {/* Main result flex: preview + QR */}
            <div className="result-grid" style={{ display: "flex", gap: 28, width: "100%", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
              {/* Preview */}
              <div style={{ flex: "1 1 320px", maxWidth: 500 }}>
                <div style={S.resultImgWrap}>
                  {finalCollage && <img src={finalCollage} alt="hasil photobox" style={S.resultImg} />}
                </div>
                {/* Action buttons */}
                <div style={S.resultActions}>
                  <button className="btn-dark" style={S.btnDark} onClick={downloadPNG}>
                    <IconDownload />&nbsp; Download PNG
                  </button>
                  <button className="btn-primary" style={S.btnPrimary} onClick={downloadPDF}>
                    <IconDownload />&nbsp; Download PDF
                  </button>
                </div>
                {useNewspaper && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                    <button className="btn-newspaper" style={S.btnNewspaper} onClick={handlePrint}>
                      <IconPrint />&nbsp; Cetak ke Printer Thermal
                    </button>
                  </div>
                )}
              </div>

              {/* QR Code Section */}
              <div className="qr-section" style={S.qrSection}>
                <div style={S.qrCard}>
                  <div style={S.qrHeader}>
                    <IconQR />
                    <span style={{ marginLeft: 8, fontWeight: 700, fontSize: "0.95rem" }}>Scan & Download</span>
                  </div>
                  <p style={S.qrDesc}>
                    Scan QR dengan HP untuk membuka halaman foto kamu, lalu tekan unduh di sana.
                  </p>

                  {uploadingQr && (
                    <div style={S.qrLoading}>
                      <div style={S.spinner} />
                      <span style={{ fontSize: "0.82rem", color: colors.textMuted, marginTop: 8 }}>Menyiapkan QR...</span>
                    </div>
                  )}

                  {qrUrl && !uploadingQr && (
                    <div className="qr-box" style={S.qrBox}>
                      <QRCodeSVG
                        value={qrUrl}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                  )}

                  {qrError && !uploadingQr && (
                    <div style={S.qrError}>{qrError}</div>
                  )}

                  {qrUrl && (
                    <div style={S.qrMeta}>
                      <button
                        type="button"
                        className="btn-copy"
                        style={{
                          ...S.btnCopy,
                          ...(linkCopied ? S.btnCopyDone : {}),
                        }}
                        onClick={copyQrLink}
                      >
                        {linkCopied ? <><IconCheck /> &nbsp;Link Tersalin</> : <><IconLink /> &nbsp;Copy Link</>}
                      </button>
                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={S.qrOpenLink}
                      >
                        Buka halaman foto →
                      </a>
                      <span style={S.qrExpiry}>Link berlaku <strong>24 jam</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <canvas ref={printCanvasRef} style={{ display: "none" }} />
    </div>
    <Footer />
    </>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100vh",
    fontFamily: fonts.body,
    padding: "60px 40px",
    background: "transparent",
    color: colors.textBody,
    position: "relative",
    overflow: "hidden",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 1
  },
  logoImage: {
    height: "55px",
    width: "auto",
    marginBottom: "15px",
    filter: "drop-shadow(0px 4px 10px rgba(10,25,80,0.12))"
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: "2.8rem",
    fontWeight: 700,
    color: colors.textHead,
    margin: "0 0 10px",
    paddingTop: "10px",
    paddingBottom: "10px",
    lineHeight: "1.3",
  },
  headerSub: {
    color: colors.textBody,
    fontSize: "1rem",
    fontWeight: 500,
    margin: 0,
  },

  // Step bar
  stepBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    margin: "0 auto 40px",
    maxWidth: 700,
    padding: "0 20px",
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.9rem",
    transition: "all 0.3s",
    zIndex: 1,
  },
  stepActive: {
    background: colors.blueGradient,
    color: colors.onBlue,
    boxShadow: colors.shadowSm,
  },
  stepDone: {
    background: colors.blue,
    color: colors.onBlue,
    border: `2px solid ${colors.blue}`,
  },
  stepFuture: {
    background: colors.surfaceAlt,
    color: colors.textMuted,
    border: `2px solid ${colors.border}`,
  },
  stepLabel: {
    fontSize: "0.72rem",
    fontWeight: 600,
    marginTop: 6,
    whiteSpace: "nowrap",
  },
  stepLine: {
    position: "absolute",
    top: 18,
    left: "50%",
    width: "100%",
    height: 2,
    transition: "background 0.3s",
    zIndex: 0,
  },

  // Step 1
  contentBox: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "0 20px",
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: "1.7rem",
    color: colors.textHead,
    marginBottom: 6,
    paddingTop: "5px",
    paddingBottom: "5px",
    lineHeight: "1.3",
  },
  sectionSub: {
    color: colors.textBody,
    fontSize: "0.95rem",
    marginBottom: 32,
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
  },
  layoutCard: {
    background: colors.surface,
    borderRadius: 20,
    padding: "32px 20px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    border: `1.5px solid ${colors.border}`,
    boxShadow: colors.shadow,
    transition: "all 0.25s ease",
  },
  layoutPreview: { marginBottom: 16 },
  layoutBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: colors.blue,
    background: colors.blueSoft,
    padding: "3px 10px",
    borderRadius: 20,
    marginBottom: 8,
  },
  layoutLabel: {
    color: colors.textHead,
    fontSize: "1.05rem",
    fontWeight: 700,
    margin: 0,
  },

  // Step 2
  captureLayout: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  cameraWrap: { flex: "1 1 580px" },
  cameraBox: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    background: "#111",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: colors.shadow,
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)",
    display: "block",
  },
  countdownOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.45)",
    zIndex: 10,
  },
  countdownNum: {
    fontSize: "6rem",
    fontWeight: 900,
    color: colors.blue,
    fontFamily: fonts.heading,
    animation: "countdown-pop 0.5s ease",
    textShadow: "0 4px 20px rgba(3,62,238,0.4)",
  },
  flashEffect: {
    position: "absolute",
    inset: 0,
    background: "white",
    animation: "flash 0.3s ease forwards",
    zIndex: 20,
    pointerEvents: "none",
  },
  progressDots: {
    position: "absolute",
    bottom: 14,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 10,
    zIndex: 5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.3)",
    border: "2px solid rgba(255,255,255,0.6)",
    transition: "all 0.3s",
  },
  dotFilled: {
    background: colors.blue,
    borderColor: colors.blue,
    boxShadow: "0 0 8px rgba(3,62,238,0.5)",
  },
  cameraControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 20,
    flexWrap: "wrap",
  },
  captureBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: colors.blueGradient,
    color: colors.onBlue,
    border: "none",
    padding: "14px 32px",
    borderRadius: 50,
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: colors.shadowSm,
    transition: "all 0.2s",
    gap: 8,
  },

  // Strip panel
  stripPanel: {
    flex: "0 0 180px",
    background: colors.surface,
    borderRadius: 20,
    padding: "20px 16px",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
    minWidth: 160,
  },
  stripTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: colors.blue,
    textAlign: "center",
    marginBottom: 14,
    margin: "0 0 14px",
  },
  stripList: { display: "flex", flexDirection: "column", gap: 12 },
  stripSlot: {
    width: "100%",
    aspectRatio: "16/9",
    borderRadius: 10,
    overflow: "hidden",
    background: colors.surfaceAlt,
    border: `2px dashed ${colors.blueBorder}`,
  },
  stripImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  stripEmpty: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: colors.textMuted,
    opacity: 0.6,
  },

  // Step 3
  frameLayout: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    gap: 28,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  previewPanel: {
    flex: "1 1 520px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  previewBox: {
    width: "100%",
    background: colors.surfaceAlt,
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  previewImg: { width: "100%", height: "auto", display: "block" },
  frameSidebar: {
    flex: "0 0 280px",
    background: colors.surface,
    borderRadius: 20,
    padding: "22px 18px",
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
    maxHeight: "85vh",
    overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: colors.textHead,
    marginBottom: 14,
    margin: "0 0 14px",
    fontFamily: fonts.heading,
  },
  sectionHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: colors.textMuted,
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 20,
    padding: "3px 9px",
    whiteSpace: "nowrap",
  },
  frameColorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },
  apiFrameList: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },
  apiFrameThumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  segment: {
    display: "flex",
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 30,
    padding: 3,
    gap: 3,
    marginTop: 4,
  },
  segmentBtn: {
    flex: 1,
    padding: "7px 0",
    borderRadius: 26,
    border: "none",
    fontWeight: 700,
    fontSize: "0.78rem",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "inherit",
  },
  npOptional: {
    fontSize: "0.68rem",
    fontWeight: 600,
    color: colors.textMuted,
  },

  // Newspaper inputs
  npLabel: {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: colors.textHead,
    marginBottom: 5,
  },
  npHint: {
    fontSize: "0.7rem",
    color: colors.textMuted,
    display: "block",
    marginTop: 3,
    textAlign: "right",
  },

  // Step 4
  resultLayout: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "center",
  },
  resultBox: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
  },
  resultBadge: {
    background: colors.blueGradient,
    color: colors.onBlue,
    padding: "8px 24px",
    borderRadius: 30,
    fontWeight: 700,
    fontSize: "0.9rem",
    marginBottom: 24,
    boxShadow: colors.shadowSm,
  },
  resultImgWrap: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: colors.shadow,
    marginBottom: 18,
    border: `1px solid ${colors.border}`,
  },
  resultImg: { width: "100%", height: "auto", display: "block" },
  resultActions: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },

  // QR Section
  qrSection: {
    flex: "0 0 240px",
    minWidth: 220,
  },
  qrCard: {
    background: colors.surface,
    borderRadius: 20,
    padding: "22px 18px",
    border: `1.5px solid ${colors.border}`,
    boxShadow: colors.shadow,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  qrHeader: {
    display: "flex",
    alignItems: "center",
    color: colors.textHead,
    marginBottom: 10,
    fontFamily: fonts.heading,
  },
  qrDesc: {
    fontSize: "0.8rem",
    color: colors.textBody,
    lineHeight: 1.5,
    marginBottom: 16,
  },
  qrBox: {
    padding: 8,
    background: "#fff",
    borderRadius: 12,
    border: `2px solid ${colors.border}`,
    marginBottom: 14,
  },
  qrLoading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 0",
  },
  spinner: {
    width: 36,
    height: 36,
    border: `3px solid ${colors.border}`,
    borderTop: `3px solid ${colors.blue}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  btnCopy: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1.5px solid ${colors.blue}`,
    background: "#fff",
    color: colors.blue,
    fontSize: "0.8rem",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.18s",
  },
  btnCopyDone: {
    background: colors.blue,
    borderColor: colors.blue,
    color: "#fff",
  },
  qrOpenLink: {
    display: "block",
    marginTop: 10,
    fontSize: "0.74rem",
    fontWeight: 600,
    color: colors.blue,
    textDecoration: "none",
  },
  qrExpiry: {
    display: "block",
    marginTop: 8,
    fontSize: "0.7rem",
    color: colors.textMuted,
  },
  qrError: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: "0.78rem",
    color: "#c0392b",
    marginBottom: 10,
  },
  qrMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },

  // Buttons
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: colors.blueGradient,
    color: colors.onBlue,
    border: "none",
    padding: "13px 28px",
    borderRadius: 50,
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: colors.shadowSm,
    transition: "all 0.2s",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: colors.surface,
    color: colors.textBody,
    border: `1.5px solid ${colors.border}`,
    padding: "13px 22px",
    borderRadius: 50,
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnDark: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: colors.navy,
    color: colors.onBlue,
    border: "none",
    padding: "13px 28px",
    borderRadius: 50,
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: colors.shadowSm,
    transition: "all 0.2s",
  },
  btnNewspaper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1a1a1a",
    color: "#ffffff",
    border: "none",
    padding: "13px 28px",
    borderRadius: 50,
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
    transition: "all 0.2s",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.02em",
  },
};
