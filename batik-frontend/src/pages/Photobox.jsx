import { useState, useEffect, useRef, useCallback } from "react";
import { BASE_URL } from "../services/api";
import jsPDF from "jspdf";

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
        <rect x="4" y="4" width="52" height="72" rx="3" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 2, label: "2 Foto", desc: "Duo",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="52" height="34" rx="3" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
        <rect x="4" y="42" width="52" height="34" rx="3" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 3, label: "3 Foto", desc: "Strip",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="52" height="22" rx="3" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
        <rect x="4" y="30" width="52" height="22" rx="3" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
        <rect x="4" y="56" width="52" height="22" rx="3" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
      </svg>
    )
  },
  {
    count: 4, label: "4 Foto", desc: "Grid",
    preview: () => (
      <svg viewBox="0 0 60 80" style={{ width: 60, height: 80 }}>
        <rect x="4" y="4" width="24" height="34" rx="2" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
        <rect x="32" y="4" width="24" height="34" rx="2" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
        <rect x="4" y="42" width="24" height="34" rx="2" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
        <rect x="32" y="42" width="24" height="34" rx="2" fill="#E8D5C4" stroke="#8B5E34" strokeWidth="2" />
      </svg>
    )
  },
];

const FRAME_COLORS = [
  { id: "none", label: "Tanpa Frame", color: null, textColor: "#6b7280" },
  { id: "white", label: "Putih Bersih", color: "#ffffff", border: "#e5e7eb", textColor: "#1f2937" },
  { id: "cream", label: "Krem Batik", color: "#FDF6EC", border: "#D4AF37", textColor: "#5a3e28" },
  { id: "dark", label: "Cokelat Tua", color: "#2C1E16", border: "#8B5E34", textColor: "#D4AF37" },
  { id: "gold", label: "Emas Megah", color: "#D4AF37", border: "#a8872a", textColor: "#2C1E16" },
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
        ctx.strokeStyle = selectedApiFrame ? "#D4AF37" : (selectedColor.border || "#D4AF37");
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, photoW, photoH, 8);
        ctx.stroke();
      }
    }

    // Watermark
    ctx.font = `bold ${Math.round(canvasH * 0.022)}px 'Playfair Display', serif`;
    ctx.fillStyle = selectedColor.color === "#ffffff" || !selectedColor.color
      ? "rgba(139,94,52,0.5)"
      : "rgba(255,255,255,0.4)";
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
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.6);opacity:0} }
        @keyframes countdown-pop { 0%{transform:scale(1.5);opacity:0} 60%{transform:scale(0.95);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes flash { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
        @keyframes slide-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        .photobox-card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 20px 50px rgba(139,94,52,0.18) !important; border-color: #D4AF37 !important; }
        .frame-opt:hover { transform: scale(1.05); }
        .btn-primary:hover { background: #a8872a !important; transform: translateY(-1px); }
        .btn-secondary:hover { background: #f5e6d3 !important; }
        .btn-dark:hover { background: #1a1008 !important; transform: translateY(-1px); }
        .capture-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 8px 30px rgba(212,175,55,0.5) !important; }
        .capture-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={S.header}>
        <p style={S.headerBadge}>✦ BatikAI</p>
        <h1 style={S.headerTitle}>Photobox <span style={{ color: "#D4AF37" }}>Nusantara</span></h1>
        <p style={S.headerSub}>Abadikan momen indah dengan bingkai batik khas Indonesia</p>
      </div>

      {/* ─── Step Indicator ─── */}
      <div style={S.stepBar}>
        {["Pilih Layout", "Sesi Foto", "Pilih Bingkai", "Simpan"].map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} style={S.stepItem}>
              <div style={{ ...S.stepCircle, ...(done ? S.stepDone : active ? S.stepActive : S.stepFuture) }}>
                {done ? <IconCheck /> : n}
              </div>
              <span style={{ ...S.stepLabel, color: active ? "#D4AF37" : done ? "#8B5E34" : "#b0a090" }}>{label}</span>
              {i < 3 && <div style={{ ...S.stepLine, background: done ? "#D4AF37" : "#e8d5c4" }} />}
            </div>
          );
        })}
      </div>

      {/* ═══ STEP 1: LAYOUT ═══ */}
      {step === 1 && (
        <div style={{ ...S.contentBox, animation: "slide-in 0.4s ease" }}>
          <h2 style={S.sectionTitle}>Pilih Jumlah Foto</h2>
          <p style={S.sectionSub}>Tentukan berapa banyak foto yang ingin masuk dalam satu bingkai</p>
          <div style={S.layoutGrid}>
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
          <div style={S.cameraWrap}>
            <div style={S.cameraBox}>
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
            <div style={S.cameraControls}>
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
            <p style={{ textAlign: "center", color: "#8B5E34", fontSize: "0.85rem", marginTop: 8 }}>
              💡 Klik tombol lalu bersiaplah — hitung mundur 3 detik akan dimulai
            </p>
          </div>

          {/* Strip preview */}
          <div style={S.stripPanel}>
            <h3 style={S.stripTitle}>Foto Terambil ({photos.length}/{layout.count})</h3>
            <div style={S.stripList}>
              {Array.from({ length: layout.count }).map((_, i) => (
                <div key={i} style={S.stripSlot}>
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
        <div style={{ ...S.frameLayout, animation: "slide-in 0.4s ease" }}>
          {/* Preview */}
          <div style={S.previewPanel}>
            <div style={S.previewBox}>
              {finalCollage
                ? <img src={finalCollage} alt="preview" style={S.previewImg} />
                : <div style={{ color: "#aaa", textAlign: "center" }}>Memuat preview...</div>
              }
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className="btn-secondary" style={S.btnSecondary} onClick={restart}><IconRetake />&nbsp;Mulai Ulang</button>
              <button className="btn-primary" style={S.btnPrimary} onClick={confirmFrame}>
                Gunakan Bingkai ini &rarr;
              </button>
            </div>
          </div>

          {/* Frame selector */}
          <div style={S.frameSidebar}>
            <h3 style={S.sidebarTitle}>🎨 Pilih Warna Bingkai</h3>
            <div style={S.frameColorGrid}>
              {FRAME_COLORS.map(fc => (
                <div
                  key={fc.id}
                  className="frame-opt"
                  style={{
                    ...S.frameColorChip,
                    background: fc.color || "#f9f9f9",
                    border: selectedColor.id === fc.id ? "3px solid #D4AF37" : "2px solid rgba(0,0,0,0.1)",
                    boxShadow: selectedColor.id === fc.id ? "0 0 0 2px #D4AF37" : "none",
                  }}
                  onClick={() => { setSelectedColor(fc); setSelectedApiFrame(null); }}
                  title={fc.label}
                >
                  {selectedColor.id === fc.id && (
                    <div style={{ position: "absolute", top: 4, right: 4, background: "#D4AF37", borderRadius: "50%", padding: 2 }}>
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
                        border: selectedApiFrame?.id === fr.id ? "3px solid #D4AF37" : "2px solid transparent",
                        boxShadow: selectedApiFrame?.id === fr.id ? "0 4px 16px rgba(212,175,55,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
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
            <div style={S.resultBadge}>🎉 Foto siap diunduh!</div>
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
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "calc(100vh - 70px)",
    background: "linear-gradient(145deg, #FDFBF7 0%, #F4EAE0 60%, #FDFBF7 100%)",
    fontFamily: "'Inter', sans-serif",
    paddingBottom: 60,
  },
  header: {
    textAlign: "center",
    padding: "48px 20px 24px",
  },
  headerBadge: {
    display: "inline-block",
    background: "linear-gradient(90deg, #8B5E34, #D4AF37)",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    padding: "4px 16px",
    borderRadius: 20,
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.8rem",
    fontWeight: 700,
    color: "#2C1E16",
    margin: "0 0 10px",
  },
  headerSub: {
    color: "#8B5E34",
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
    background: "linear-gradient(135deg, #D4AF37, #a8872a)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(212,175,55,0.4)",
  },
  stepDone: {
    background: "#8B5E34",
    color: "#fff",
  },
  stepFuture: {
    background: "#f0e8de",
    color: "#b0a090",
    border: "2px solid #e8d5c4",
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
    color: "#2C1E16",
    marginBottom: 6,
  },
  sectionSub: {
    color: "#8B5E34",
    fontSize: "0.95rem",
    marginBottom: 32,
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
  },
  layoutCard: {
    background: "#fff",
    borderRadius: 20,
    padding: "32px 20px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    border: "2px solid #f0e8de",
    boxShadow: "0 6px 24px rgba(139,94,52,0.06)",
    transition: "all 0.25s ease",
  },
  layoutPreview: {
    marginBottom: 16,
  },
  layoutBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#D4AF37",
    background: "#FDF6EC",
    padding: "3px 10px",
    borderRadius: 20,
    marginBottom: 8,
  },
  layoutLabel: {
    color: "#2C1E16",
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
    color: "#D4AF37",
    fontFamily: "'Playfair Display', serif",
    animation: "countdown-pop 0.5s ease",
    textShadow: "0 4px 20px rgba(212,175,55,0.5)",
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
    background: "#D4AF37",
    borderColor: "#D4AF37",
    boxShadow: "0 0 8px rgba(212,175,55,0.6)",
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
    background: "linear-gradient(135deg, #D4AF37, #a8872a)",
    color: "#fff",
    border: "none",
    padding: "14px 32px",
    borderRadius: 50,
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 24px rgba(212,175,55,0.35)",
    transition: "all 0.2s",
    gap: 8,
  },

  // Strip panel
  stripPanel: {
    flex: "0 0 180px",
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: "20px 16px",
    border: "1px solid rgba(139,94,52,0.1)",
    boxShadow: "0 8px 24px rgba(139,94,52,0.06)",
    minWidth: 160,
  },
  stripTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#8B5E34",
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
    background: "#f5ece0",
    border: "2px dashed #D4AF37",
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
    color: "#c8a97a",
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
    background: "#eee",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
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
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: "22px 18px",
    border: "1px solid rgba(139,94,52,0.1)",
    boxShadow: "0 8px 24px rgba(139,94,52,0.06)",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#2C1E16",
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
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 70,
  },
  frameChipLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    textAlign: "center",
    background: "rgba(0,0,0,0.15)",
    borderRadius: 6,
    padding: "2px 6px",
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
    background: "#f0f0f0",
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
    background: "rgba(255,255,255,0.9)",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#2C1E16",
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
    background: "linear-gradient(90deg, #8B5E34, #D4AF37)",
    color: "#fff",
    padding: "8px 24px",
    borderRadius: 30,
    fontWeight: 700,
    fontSize: "0.9rem",
    marginBottom: 20,
    boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
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
    background: "linear-gradient(135deg, #D4AF37, #a8872a)",
    color: "#fff",
    border: "none",
    padding: "13px 28px",
    borderRadius: 50,
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
    transition: "all 0.2s",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#fff",
    color: "#8B5E34",
    border: "2px solid #e8d5c4",
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
    background: "#2C1E16",
    color: "#D4AF37",
    border: "none",
    padding: "13px 28px",
    borderRadius: 50,
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(44,30,22,0.2)",
    transition: "all 0.2s",
  },
};
