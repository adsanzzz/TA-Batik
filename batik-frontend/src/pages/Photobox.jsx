import { useState, useEffect, useRef, useCallback } from "react";
import { BASE_URL } from "../services/api";
import jsPDF from "jspdf";
import Footer from "../components/Footer";

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


const SparklesIcon = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "8px" }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" opacity="0.6"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" opacity="0.6"/>
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
        <rect x="4" y="4" width="52" height="72" rx="3" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 2, label: "2 Foto", desc: "Duo",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="52" height="34" rx="3" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
        <rect x="4" y="42" width="52" height="34" rx="3" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 3, label: "3 Foto", desc: "Strip",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="52" height="22" rx="3" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
        <rect x="4" y="30" width="52" height="22" rx="3" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
        <rect x="4" y="56" width="52" height="22" rx="3" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 4, label: "4 Foto", desc: "Grid",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="24" height="34" rx="2" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
        <rect x="32" y="4" width="24" height="34" rx="2" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
        <rect x="4" y="42" width="24" height="34" rx="2" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
        <rect x="32" y="42" width="24" height="34" rx="2" fill="rgba(200, 255, 1, 0.08)" stroke="#C8FF01" strokeWidth="2" />
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

/* ─── Main Component ─────────────────────────────────────── */
export default function Photobox() {
  const [step, setStep] = useState(1); // 1=layout, 2=capture, 3=frame, 4=result
  const [layout, setLayout] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedColor, setSelectedColor] = useState(FRAME_COLORS[0]);
  const [apiFrames, setApiFrames] = useState([]);
  const [selectedApiFrame, setSelectedApiFrame] = useState(null);
  const [finalCollage, setFinalCollage] = useState(null);

  const [countdown, setCountdown] = useState(null); // null | 3 | 2 | 1 | "📸"
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const countdownRef = useRef(null);
  const layoutRef = useRef(null); // selalu simpan layout terbaru agar tidak stale di async callback

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
    layoutRef.current = lay; // set ref SEBELUM async apapun
    setLayout(lay);
    setPhotos([]);
    setStep(2);
    await startCamera();
  };

  /* ── Capture foto (tidak pakai useCallback agar tidak stale) ── */
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

    // Gunakan layoutRef.current agar tidak stale di dalam async callback
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
        setCountdown("📸");
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

  /* ── Build Collage ── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const buildCollage = useCallback(async () => {
    if (photos.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Portrait strip layout (for 1,2,3) or grid (for 4)
    const currentLayout = layoutRef.current;
    if (!currentLayout) return;
    const isGrid = currentLayout.count === 4;
    const cols = isGrid ? 2 : 1;
    const rows = isGrid ? 2 : currentLayout.count;

    const photoW = 600;
    const photoH = 400;
    const gap = 16;
    const padX = 60;
    const padY = 60;

    const canvasW = padX * 2 + cols * photoW + (cols - 1) * gap;
    const canvasH = padY * 2 + rows * photoH + (rows - 1) * gap;

    canvas.width = canvasW;
    canvas.height = canvasH;

    // Background
    if (selectedApiFrame) {
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      frameImg.src = selectedApiFrame.gambar?.startsWith("http")
        ? selectedApiFrame.gambar
        : `${BASE_URL}/${selectedApiFrame.gambar}`;
      await new Promise(r => { frameImg.onload = r; frameImg.onerror = r; });
      ctx.drawImage(frameImg, 0, 0, canvasW, canvasH);
    } else if (selectedColor.color) {
      ctx.fillStyle = selectedColor.color;
      ctx.fillRect(0, 0, canvasW, canvasH);
      // Decorative border
      ctx.strokeStyle = selectedColor.border || selectedColor.color;
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, canvasW - 32, canvasH - 32);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // Draw photos
    for (let i = 0; i < photos.length; i++) {
      const img = new Image();
      img.src = photos[i];
      await new Promise(r => { img.onload = r; });

      const col = isGrid ? i % 2 : 0;
      const row = isGrid ? Math.floor(i / 2) : i;
      const x = padX + col * (photoW + gap);
      const y = padY + row * (photoH + gap);

      // object-fit: cover
      const ar = img.width / img.height;
      const ar2 = photoW / photoH;
      let sx, sy, sw, sh;
      if (ar > ar2) { sh = img.height; sw = sh * ar2; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw / ar2; sx = 0; sy = (img.height - sh) / 2; }

      // Rounded clip
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, photoW, photoH, 8);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, x, y, photoW, photoH);
      ctx.restore();

      // Gold border on photos
      if (selectedColor.id !== "none" || selectedApiFrame) {
        ctx.strokeStyle = selectedApiFrame ? "#C8FF01" : (selectedColor.border || "#C8FF01");
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, photoW, photoH, 8);
        ctx.stroke();
      }
    }

    // Watermark
    const isLightColor = (hex) => {
      if (!hex) return true;
      const c = hex.replace("#", "");
      if (c.length < 6) return true;
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 155;
    };

    ctx.font = `bold ${Math.round(canvasH * 0.022)}px 'Playfair Display', serif`;
    const bgColor = selectedApiFrame ? null : (selectedColor.color || "#ffffff");
    ctx.fillStyle = isLightColor(bgColor)
      ? "rgba(90, 62, 40, 0.6)"
      : "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "center";
    ctx.fillText("✦ BatikAI Photobox ✦", canvasW / 2, canvasH - padY / 2);

    setFinalCollage(canvas.toDataURL("image/png"));
  }, [photos, selectedColor, selectedApiFrame, layout]);

  useEffect(() => {
    if (step === 3 || step === 4) buildCollage();
  }, [step, selectedColor, selectedApiFrame]);

  /* ── Step 3 → 4 ── */
  const confirmFrame = async () => {
    await buildCollage();
    setStep(4);
  };

  /* ── Download ── */
  const downloadPNG = () => {
    if (!finalCollage) return;
    const a = document.createElement("a");
    a.href = finalCollage;
    a.download = "BatikAI_Photobox.png";
    a.click();
  };
  const downloadPDF = () => {
    if (!finalCollage || !canvasRef.current) return;
    const { width, height } = canvasRef.current;
    const pdf = new jsPDF({ orientation: width > height ? "landscape" : "portrait", unit: "px", format: [width, height] });
    pdf.addImage(finalCollage, "PNG", 0, 0, width, height);
    pdf.save("BatikAI_Photobox.pdf");
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
  };

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <>
    <div style={S.page} className="photobox-page">
      {/* Background Pattern */}
      <style>{`
        .photobox-page * {
          box-sizing: border-box !important;
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.6);opacity:0} }
        @keyframes countdown-pop { 0%{transform:scale(1.5);opacity:0} 60%{transform:scale(0.95);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes flash { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
        @keyframes slide-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        .photobox-card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 20px 50px rgba(200, 255, 1, 0.15) !important; border-color: #C8FF01 !important; }
        .frame-opt:hover { transform: scale(1.05); }
        .btn-primary:hover { background: #a8872a !important; transform: translateY(-1px); }
        .btn-secondary:hover { background: #f5e6d3 !important; }
        .btn-dark:hover { background: #1a1008 !important; transform: translateY(-1px); }
        .capture-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 8px 30px rgba(212,175,55,0.5) !important; }
        .capture-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* RESPONSIVE DESIGN FOR PHOTOBOX */
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
          .photobox-subtitle {
            max-width: 250px !important;
            margin: 0 auto !important;
            line-height: 1.4 !important;
          }
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
          
          .photobox-frame-color-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)) !important; }
        }
      `}</style>

      {/* ─── Header ─── */}
      <div style={S.header}>
        <img src="/logo.png" alt="Logo" style={S.logoImage} />
        <h1 style={S.headerTitle} className="photobox-header-title">
          <SparklesIcon size={28} color="#C8FF01" /> Photobox <span style={{ color: "#C8FF01", WebkitTextFillColor: "#C8FF01" }}>Nusantara</span>
        </h1>
        <p style={S.headerSub} className="photobox-subtitle">Abadikan momen indah dengan bingkai batik khas Indonesia</p>
      </div>

      {/* ─── Step Indicator ─── */}
      <div style={S.stepBar} className="photobox-step-bar">
        {["Pilih Layout", "Sesi Foto", "Pilih Bingkai", "Simpan"].map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} style={S.stepItem} className="photobox-step-item">
              <div style={{ ...S.stepCircle, ...(done ? S.stepDone : active ? S.stepActive : S.stepFuture) }}>
                {done ? <IconCheck /> : n}
              </div>
              <span style={{ ...S.stepLabel, color: active ? "#C8FF01" : done ? "#D0DBFF" : "#b0a090" }}>{label}</span>
              {i < 3 && <div className="photobox-step-line" style={{ ...S.stepLine, background: done ? "#C8FF01" : "rgba(255,255,255,0.15)" }} />}
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
          {/* Camera view */}
          <div style={S.cameraLayout} className="photobox-camera-layout">
            <div style={S.cameraBox} className="photobox-camera-box">
              <video ref={videoRef} autoPlay playsInline muted style={S.video} />
              {/* Countdown overlay */}
              {countdown !== null && (
                <div style={S.countdownOverlay}>
                  <div style={S.countdownNum}>{countdown}</div>
                </div>
              )}
              {/* Flash effect */}
              {flash && <div style={S.flashEffect} />}
              {/* Progress dots */}
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
            <p style={{ textAlign: "center", color: "#C8FF01", fontSize: "0.85rem", marginTop: 8 }}>
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
                : <div style={{ color: "#aaa", textAlign: "center" }}>Memuat preview...</div>
              }
            </div>
            <div className="photobox-action-btns" style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className="btn-secondary" style={S.btnSecondary} onClick={restart}><IconRetake />&nbsp;Mulai Ulang</button>
              <button className="btn-primary" style={S.btnPrimary} onClick={confirmFrame}>
                Gunakan Bingkai ini &rarr;
              </button>
            </div>
          </div>

          {/* Frame selector */}
          <div style={S.frameSidebar} className="photobox-frame-sidebar">
            <h3 style={S.sidebarTitle}>Pilih Warna Bingkai</h3>
            <div style={S.frameColorGrid} className="photobox-frame-color-grid">
              {FRAME_COLORS.map(fc => (
                <div
                  key={fc.id}
                  className="frame-opt"
                  style={{
                    ...S.frameColorChip,
                    background: fc.color || "#f9f9f9",
                    border: selectedColor.id === fc.id ? "3px solid #C8FF01" : "2px solid rgba(0,0,0,0.1)",
                    boxShadow: selectedColor.id === fc.id ? "0 0 0 2px #C8FF01" : "none",
                  }}
                  onClick={() => { setSelectedColor(fc); setSelectedApiFrame(null); }}
                  title={fc.label}
                >
                  {selectedColor.id === fc.id && (
                    <div style={{ position: "absolute", top: 4, right: 4, background: "#C8FF01", borderRadius: "50%", padding: 2, color: "#00117D" }}>
                      <IconCheck />
                    </div>
                  )}
                  <span style={{ ...S.frameChipLabel, color: fc.textColor }}>{fc.label}</span>
                </div>
              ))}
            </div>

            {apiFrames.length > 0 && (
              <>
                <h3 style={{ ...S.sidebarTitle, marginTop: 24 }}>🖼️ Bingkai Custom</h3>
                <div style={S.apiFrameList}>
                  {apiFrames.map(fr => (
                    <div
                      key={fr.id}
                      className="frame-opt"
                      style={{
                        ...S.apiFrameItem,
                        border: selectedApiFrame?.id === fr.id ? "3px solid #C8FF01" : "2px solid transparent",
                        boxShadow: selectedApiFrame?.id === fr.id ? "0 4px 16px rgba(200,255,1,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                      onClick={() => { setSelectedApiFrame(fr); setSelectedColor(FRAME_COLORS[0]); }}
                    >
                      <img
                        src={fr.gambar?.startsWith("http") ? fr.gambar : `${BASE_URL}/${fr.gambar}`}
                        alt={fr.nama}
                        style={S.apiFrameThumb}
                      />
                      <span style={S.apiFrameName}>{fr.nama}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ STEP 4: RESULT ═══ */}
      {step === 4 && (
        <div style={{ ...S.resultLayout, animation: "slide-in 0.4s ease" }}>
          <div style={S.resultBox}>
            <div style={S.resultBadge}>Foto siap diunduh!</div>
            <div style={S.resultImgWrap}>
              {finalCollage && <img src={finalCollage} alt="hasil photobox" style={S.resultImg} />}
            </div>
            <div style={S.resultActions}>
              <button className="btn-dark" style={S.btnDark} onClick={downloadPNG}>
                <IconDownload />&nbsp; Download PNG
              </button>
              <button className="btn-primary" style={S.btnPrimary} onClick={downloadPDF}>
                <IconDownload />&nbsp; Download PDF
              </button>
            </div>
            <button className="btn-secondary" style={{ ...S.btnSecondary, marginTop: 16 }} onClick={restart}>
              <IconRetake />&nbsp; Buat Foto Baru
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
    <Footer />
    </>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    padding: "60px 40px",
    color: "#F8F4EE",
    position: "relative",
    overflow: "hidden",
  },
  pattern: {
    position: "absolute",
    inset: 0,
    opacity: 0.25,
    backgroundImage: `
      radial-gradient(circle at center,
      #C8FF01 2.5px,
      transparent 2.5px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
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
    filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.25))"
  },
  headerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.8rem",
    fontWeight: 700,
    background: "linear-gradient(to bottom, #FFFFFF, #D0DBFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 10px",
    paddingTop: "10px",
    paddingBottom: "10px",
    lineHeight: "1.3",
  },
  headerSub: {
    color: "#D0E0FF",
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
    maxWidth: 640,
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
    background: "linear-gradient(135deg, #C8FF01, #AEE600)",
    color: "#00117D",
    boxShadow: "0 4px 14px rgba(200,255,1,0.4)",
  },
  stepDone: {
    background: "#0122B4",
    color: "#fff",
    border: "2px solid #C8FF01",
  },
  stepFuture: {
    background: "#0122B4",
    color: "#D0E0FF",
    border: "2px solid rgba(255,255,255,0.15)",
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
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.7rem",
    background: "linear-gradient(to bottom, #FFFFFF, #D0DBFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 6,
    paddingTop: "5px",
    paddingBottom: "5px",
    lineHeight: "1.3",
  },
  sectionSub: {
    color: "#D0E0FF",
    fontSize: "0.95rem",
    marginBottom: 32,
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
  },
  layoutCard: {
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: "32px 20px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    border: "1.5px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    transition: "all 0.25s ease",
  },
  layoutPreview: {
    marginBottom: 16,
  },
  layoutBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#C8FF01",
    background: "rgba(200, 255, 1, 0.08)",
    padding: "3px 10px",
    borderRadius: 20,
    marginBottom: 8,
  },
  layoutLabel: {
    color: "#fff",
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
  cameraWrap: {
    flex: "1 1 580px",
  },
  cameraBox: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    background: "#111",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
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
    color: "#C8FF01",
    fontFamily: "'Playfair Display', serif",
    animation: "countdown-pop 0.5s ease",
    textShadow: "0 4px 20px rgba(200,255,1,0.5)",
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
    background: "#C8FF01",
    borderColor: "#C8FF01",
    boxShadow: "0 0 8px rgba(200,255,1,0.6)",
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
    background: "linear-gradient(135deg, #C8FF01, #AEE600)",
    color: "#00117D",
    border: "none",
    padding: "14px 32px",
    borderRadius: 50,
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 24px rgba(200,255,1,0.35)",
    transition: "all 0.2s",
    gap: 8,
  },

  // Strip panel
  stripPanel: {
    flex: "0 0 180px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: "20px 16px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    minWidth: 160,
  },
  stripTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#C8FF01",
    textAlign: "center",
    marginBottom: 14,
    margin: "0 0 14px",
  },
  stripList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  stripSlot: {
    width: "100%",
    aspectRatio: "16/9",
    borderRadius: 10,
    overflow: "hidden",
    background: "rgba(0,0,0,0.3)",
    border: "2px dashed #C8FF01",
  },
  stripImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  stripEmpty: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#D0E0FF",
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
    background: "#0122B4",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  previewImg: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  frameSidebar: {
    flex: "0 0 260px",
    background: "#0122B4",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: "22px 18px",
    border: "1px solid rgba(200, 255, 1, 0.2)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: 14,
    margin: "0 0 14px",
    fontFamily: "'Playfair Display', serif",
  },
  frameColorGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  frameColorChip: {
    position: "relative",
    borderRadius: 12,
    padding: "14px 8px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  frameChipLabel: {
    fontSize: "0.72rem",
    fontWeight: 700,
    textAlign: "center",
  },
  apiFrameList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  apiFrameItem: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s",
    height: 80,
    background: "rgba(0,0,0,0.2)",
  },
  apiFrameThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  apiFrameName: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(0,0,0,0.6)",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#fff",
    padding: "4px 8px",
    textAlign: "center",
  },

  // Step 4
  resultLayout: {
    maxWidth: 720,
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
    background: "linear-gradient(90deg, #C8FF01, #AEE600)",
    color: "#00117D",
    padding: "8px 24px",
    borderRadius: 30,
    fontWeight: 700,
    fontSize: "0.9rem",
    marginBottom: 20,
    boxShadow: "0 4px 16px rgba(200,255,1,0.3)",
  },
  resultImgWrap: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    marginBottom: 24,
  },
  resultImg: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  resultActions: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  // Buttons
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(135deg, #C8FF01, #AEE600)",
    color: "#00117D",
    border: "none",
    padding: "13px 28px",
    borderRadius: 50,
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(200,255,1,0.3)",
    transition: "all 0.2s",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    border: "2.5px solid rgba(255, 255, 255, 0.2)",
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
    background: "#00117D",
    color: "#C8FF01",
    border: "none",
    padding: "13px 28px",
    borderRadius: 50,
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,17,125,0.2)",
    transition: "all 0.2s",
  },
  footerContainer: {
    width: "100%",
    maxWidth: "1200px",
    margin: "50px auto 10px auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    paddingTop: "30px"
  },
  footerImage: {
    width: "100%",
    maxWidth: "850px",
    height: "auto",
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  }
};
