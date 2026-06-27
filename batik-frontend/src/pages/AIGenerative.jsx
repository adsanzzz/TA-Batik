import React, { useState } from "react";
import VtonModal from "../components/VtonModal";
import Footer from "../components/Footer";
import LoadingLogo from "../components/LoadingLogo";

// --- CUSTOM SVG ICONS FOR PROFESSIONAL UI ---
const SparklesIcon = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" opacity="0.6"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" opacity="0.6"/>
  </svg>
);

const DiceIcon = ({ size = 18, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <path d="M12 12h.01"/>
    <path d="M8 8h.01"/>
    <path d="M8 16h.01"/>
    <path d="M16 8h.01"/>
    <path d="M16 16h.01"/>
  </svg>
);

const WandIcon = ({ size = 18, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
    <path d="m19 2 3 3L6 21l-3-3L19 2Z"/>
    <path d="m19 8 2-2"/>
    <path d="m14 3 2 2"/>
    <path d="m15 10 3.5 3.5"/>
  </svg>
);

const SaveIcon = ({ size = 16, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const ShirtIcon = ({ size = 16, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
    <path d="M20.38 3.46 16 7.5l-1-1h-6l-1 1-4.38-4.04a1 1 0 0 0-1.62.77v15.35a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4.23a1 1 0 0 0-1.62-.77Z"/>
    <path d="M10 6h4"/>
    <path d="M12 6v12"/>
  </svg>
);

const UploadIcon = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
);

export default function AIGenerative() {
  const [activeTab, setActiveTab] = useState("stylegan"); // "stylegan" | "nst"

  // --- STATE FOR MODE 1 (STYLEGAN SEED) ---
  const [seedA, setSeedA] = useState(42);
  const [seedB, setSeedB] = useState(128);
  const [weight, setWeight] = useState(0.5);
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // --- STATE FOR MODE 2 (NST UPLOAD) ---
  const [contentFile, setContentFile] = useState(null);
  const [styleFile, setStyleFile] = useState(null);
  const [contentPreview, setContentPreview] = useState(null);
  const [stylePreview, setStylePreview] = useState(null);
  const [styleStrength, setStyleStrength] = useState(1.0);
  const [preserveColor, setPreserveColor] = useState(false);

  // --- SHARED STATE FOR RESULTS ---
  const [imageMixed, setImageMixed] = useState(null);
  const [loadingMixed, setLoadingMixed] = useState(false);
  const [showVton, setShowVton] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveForm, setSaveForm] = useState({
    nama: "",
    motif_utama: "Hasil AI Blending",
    jenis_acara: "Formal",
    jenis_batik: "Batik AI Modern",
    filosofi: "Motif batik hibrida unik hasil pencampuran gaya kecerdasan buatan."
  });

  const BASE_URL = "http://127.0.0.1:8000";

  // Mode 1: Generate A
  const handleGenerateA = async () => {
    try {
      setLoadingA(true);
      const res = await fetch(`${BASE_URL}/stylegan/generate?seed=${seedA}`);
      if (!res.ok) throw new Error("Gagal");
      const data = await res.json();
      if (data.status === "success") {
        setImageA(data.image_url);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses model. Pastikan server backend sudah jalan.");
    } finally {
      setLoadingA(false);
    }
  };

  // Mode 1: Generate B
  const handleGenerateB = async () => {
    try {
      setLoadingB(true);
      const res = await fetch(`${BASE_URL}/stylegan/generate?seed=${seedB}`);
      if (!res.ok) throw new Error("Gagal");
      const data = await res.json();
      if (data.status === "success") {
        setImageB(data.image_url);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses model. Pastikan server backend sudah jalan.");
    } finally {
      setLoadingB(false);
    }
  };

  // Mode 1: Mix Seeds
  const handleMixSeeds = async () => {
    try {
      setLoadingMixed(true);
      setIsSaved(false);
      const res = await fetch(
        `${BASE_URL}/stylegan/mix?seed_a=${seedA}&seed_b=${seedB}&weight=${weight}`
      );
      if (!res.ok) throw new Error("Gagal");
      const data = await res.json();
      if (data.status === "success") {
        setImageMixed(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${data.image_url}`);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses percampuran latent. Pastikan backend sudah menyala.");
    } finally {
      setLoadingMixed(false);
    }
  };

  // Mode 2: Handle File Upload Selection
  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    if (target === "content") {
      setContentFile(file);
      setContentPreview(URL.createObjectURL(file));
    } else {
      setStyleFile(file);
      setStylePreview(URL.createObjectURL(file));
    }
  };

  // Mode 2: Run NST Blend
  const handleNSTBlend = async () => {
    if (!contentFile || !styleFile) return;

    try {
      setLoadingMixed(true);
      setIsSaved(false);
      
      const formData = new FormData();
      formData.append("content_image", contentFile);
      formData.append("style_image", styleFile);
      formData.append("style_strength", styleStrength);
      formData.append("preserve_color", preserveColor);

      const res = await fetch(`${BASE_URL}/stylegan/nst-blend`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Gagal");
      const data = await res.json();
      if (data.status === "success") {
        setImageMixed(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${data.image_url}`);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses style transfer. Pastikan backend sudah menyala.");
    } finally {
      setLoadingMixed(false);
    }
  };

  const handleRandomSeedA = () => setSeedA(Math.floor(Math.random() * 100000));
  const handleRandomSeedB = () => setSeedB(Math.floor(Math.random() * 100000));

  const handleSaveToCatalog = async (e) => {
    e.preventDefault();
    if (!imageMixed) return;
    
    try {
      setSaveLoading(true);
      
      // Fetch the generated image and convert it to a file blob for Multipart Form Data
      const response = await fetch(imageMixed);
      const blob = await response.blob();
      const file = new File([blob], "batik_ai.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("nama", saveForm.nama || `Batik Hibrida AI Seed ${seedA}-${seedB}`);
      formData.append("motif_utama", saveForm.motif_utama);
      formData.append("jenis_acara", saveForm.jenis_acara);
      formData.append("jenis_batik", saveForm.jenis_batik);
      formData.append("filosofi", saveForm.filosofi);
      formData.append("file", file); // FastAPI parameter expects "file"

      const role = localStorage.getItem("role") || "admin";
      const endpoint = role === "mitra" ? `${BASE_URL}/mitra/batik` : `${BASE_URL}/admin/batik`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.detail || `HTTP Error ${res.status}`);
      }
      
      const data = await res.json();
      alert("Batik berhasil disimpan ke katalog!");
      setIsSaved(true);
      setSavedData(data);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan batik. Harap login terlebih dahulu sebagai Admin/Mitra.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
    <div style={styles.container}>
      {/* Background Pattern */}

      <header style={styles.header}>
        <img src="/logo.png" alt="Logo SV UNS" style={styles.logoImage} />
        <h1 style={styles.title}>
          <SparklesIcon size={28} color="#C8FF01" /> AI Batik <span style={styles.gold}>Generative</span>
        </h1>
        <p style={styles.subtitle}>
          Padukan karakteristik estetika dari dua motif batik berbeda untuk menciptakan pola batik baru yang unik.
        </p>
      </header>

      {/* TAB NAVIGATION */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => {
            setActiveTab("stylegan");
            setImageMixed(null);
          }}
          style={{
            ...styles.tabBtn,
            ...(activeTab === "stylegan" ? styles.activeTabBtn : {})
          }}
        >
          Pencampuran Latent (StyleGAN2)
        </button>
        <button
          onClick={() => {
            setActiveTab("nst");
            setImageMixed(null);
          }}
          style={{
            ...styles.tabBtn,
            ...(activeTab === "nst" ? styles.activeTabBtn : {})
          }}
        >
          Pencampuran Bebas (Upload Foto)
        </button>
      </div>

      <div style={styles.layoutContainer}>
        
        {/* ============================================================== */}
        {/* TAB 1: STYLEGAN2 MIXER */}
        {/* ============================================================== */}
        {activeTab === "stylegan" && (
          <div style={styles.leftColumn}>
            <h2 style={styles.sectionTitle}>1. Pilih Motif Sumber</h2>
            
            {/* PANEL BATIK A */}
            <div style={styles.patternCard}>
              <div style={styles.cardHeader}>
                <span style={styles.badge}>Motif Utama A</span>
                <div style={styles.seedWrapper}>
                  <label style={styles.seedLabel}>Seed:</label>
                  <input
                    type="number"
                    value={seedA}
                    onChange={(e) => setSeedA(Number(e.target.value))}
                    style={styles.seedInput}
                  />
                  <button onClick={handleRandomSeedA} style={styles.iconBtn} title="Acak Seed">
                    <DiceIcon size={16} color="#C8FF01" />
                  </button>
                </div>
              </div>
              <div style={styles.previewBox}>
                {loadingA ? (
                  <LoadingLogo text="Menghasilkan..." size={40} />
                ) : imageA ? (
                  <img src={imageA} alt="Batik A" style={styles.previewImage} />
                ) : (
                  <span style={styles.placeholderText}>Generate untuk melihat motif</span>
                )}
              </div>
              <button onClick={handleGenerateA} disabled={loadingA} style={styles.btnAction}>
                {loadingA ? "Memproses..." : "Generate Motif A"}
              </button>
            </div>

            {/* PANEL BATIK B */}
            <div style={styles.patternCard}>
              <div style={styles.cardHeader}>
                <span style={styles.badge}>Motif Utama B</span>
                <div style={styles.seedWrapper}>
                  <label style={styles.seedLabel}>Seed:</label>
                  <input
                    type="number"
                    value={seedB}
                    onChange={(e) => setSeedB(Number(e.target.value))}
                    style={styles.seedInput}
                  />
                  <button onClick={handleRandomSeedB} style={styles.iconBtn} title="Acak Seed">
                    <DiceIcon size={16} color="#C8FF01" />
                  </button>
                </div>
              </div>
              <div style={styles.previewBox}>
                {loadingB ? (
                  <LoadingLogo text="Menghasilkan..." size={40} />
                ) : imageB ? (
                  <img src={imageB} alt="Batik B" style={styles.previewImage} />
                ) : (
                  <span style={styles.placeholderText}>Generate untuk melihat motif</span>
                )}
              </div>
              <button onClick={handleGenerateB} disabled={loadingB} style={styles.btnAction}>
                {loadingB ? "Memproses..." : "Generate Motif B"}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: NST UPLOAD MIXER */}
        {/* ============================================================== */}
        {activeTab === "nst" && (
          <div style={styles.leftColumn}>
            <h2 style={styles.sectionTitle}>1. Upload Foto Batik</h2>

            {/* UPLOAD BATIK KONTEN (STRUKTUR) */}
            <div style={styles.patternCard}>
              <div style={styles.cardHeader}>
                <span style={styles.badge}>Batik Konten (Struktur Pola)</span>
              </div>
              <div style={styles.previewBox}>
                {contentPreview ? (
                  <img src={contentPreview} alt="Content" style={styles.previewImage} />
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <UploadIcon size={24} color="#C8FF01" />
                    <span style={styles.placeholderText} style={{ marginTop: "8px" }}>
                      Upload Batik Pola Dasar
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "content")}
                  style={styles.fileInput}
                />
              </div>
              <button 
                onClick={() => document.getElementById("content-input")?.click()} 
                style={styles.btnAction}
              >
                Pilih File Pola
              </button>
              <input
                id="content-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "content")}
                style={{ display: "none" }}
              />
            </div>

            {/* UPLOAD BATIK GAYA (WARNA/TEKSTUR) */}
            <div style={styles.patternCard}>
              <div style={styles.cardHeader}>
                <span style={styles.badge}>Batik Style (Tekstur & Warna)</span>
              </div>
              <div style={styles.previewBox}>
                {stylePreview ? (
                  <img src={stylePreview} alt="Style" style={styles.previewImage} />
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <UploadIcon size={24} color="#C8FF01" />
                    <span style={styles.placeholderText} style={{ marginTop: "8px" }}>
                      Upload Batik Warna/Tekstur
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => document.getElementById("style-input")?.click()} 
                style={styles.btnAction}
              >
                Pilih File Gaya
              </button>
              <input
                id="style-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "style")}
                style={{ display: "none" }}
              />
            </div>
          </div>
        )}

        {/* KOLOM KANAN: KONTROL DAN HASIL BLENDING */}
        <div style={styles.rightColumn}>
          <h2 style={styles.sectionTitle}>2. Padukan & Tinjau Hasil</h2>
          
          <div style={styles.mixControlCard}>
            {activeTab === "stylegan" ? (
              <>
                <div style={styles.sliderGroup}>
                  <div style={styles.sliderHeaders}>
                    <span>Dominasi Motif A</span>
                    <span style={styles.mixPercentage}>
                      {Math.round((1 - weight) * 100)}% A : {Math.round(weight * 100)}% B
                    </span>
                    <span>Dominasi Motif B</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    style={styles.rangeSlider}
                  />
                </div>

                <button
                  onClick={handleMixSeeds}
                  disabled={loadingMixed || !imageA || !imageB}
                  style={{
                    ...styles.btnMix,
                    opacity: (!imageA || !imageB) ? 0.5 : 1,
                    cursor: (!imageA || !imageB) ? "not-allowed" : "pointer"
                  }}
                >
                  <WandIcon size={16} color="#161311" /> {loadingMixed ? "Sedang Memadukan..." : "Padukan Kedua Motif"}
                </button>
                
                {!imageA || !imageB ? (
                  <p style={styles.hintText}>✦ Harap generate Motif A & B terlebih dahulu di kolom kiri</p>
                ) : null}
              </>
            ) : (
              <>
                <div style={styles.sliderGroup}>
                  <div style={styles.sliderHeaders}>
                    <span>Batik Asli</span>
                    <span style={styles.mixPercentage}>
                      Intensitas Motif Baru: {Math.round(styleStrength * 100)}%
                    </span>
                    <span>Batik Baru</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={styleStrength}
                    onChange={(e) => setStyleStrength(Number(e.target.value))}
                    style={styles.rangeSlider}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0 25px 0", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    id="preserve-color-check"
                    checked={preserveColor}
                    onChange={(e) => setPreserveColor(e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "#C8FF01",
                      cursor: "pointer"
                    }}
                  />
                  <label htmlFor="preserve-color-check" style={{ color: "#E0E0E0", fontSize: "0.95rem", cursor: "pointer", userSelect: "none" }}>
                    Pertahankan Skema Warna Asli Pola Dasar
                  </label>
                </div>

                <button
                  onClick={handleNSTBlend}
                  disabled={loadingMixed || !contentFile || !styleFile}
                  style={{
                    ...styles.btnMix,
                    opacity: (!contentFile || !styleFile) ? 0.5 : 1,
                    cursor: (!contentFile || !styleFile) ? "not-allowed" : "pointer"
                  }}
                >
                  <WandIcon size={16} color="#161311" /> {loadingMixed ? "Sedang Mentransfer Gaya..." : "Padukan Gaya Gambar"}
                </button>
                
                {!contentFile || !styleFile ? (
                  <p style={styles.hintText}>✦ Harap upload kedua foto batik terlebih dahulu</p>
                ) : null}
              </>
            )}
          </div>

          {/* PREVIEW HASIL CAMPURAN */}
          <div style={styles.resultCard}>
            <div style={styles.resultWrapper}>
              <div style={styles.bigPreviewBox}>
                {loadingMixed ? (
                  <LoadingLogo 
                    text={activeTab === "stylegan" ? "Memproses perpaduan latent space..." : "Memproses transfer gaya saraf (NST)..."} 
                    size={50} 
                  />
                ) : imageMixed ? (
                  <img src={imageMixed} alt="Batik Hibrida" style={styles.mixedImage} />
                ) : (
                  <span style={styles.placeholderText}>Klik tombol "Padukan" untuk melihat hasil</span>
                )}
              </div>

              {imageMixed && !loadingMixed && (
                <div style={styles.metaPanel}>
                  {localStorage.getItem("token") && (localStorage.getItem("role") === "admin" || localStorage.getItem("role") === "mitra") ? (
                    <form onSubmit={handleSaveToCatalog} style={styles.saveForm}>
                      <h3 style={styles.formTitle}>
                        <SaveIcon size={18} color="#C8FF01" /> Simpan Motif Baru
                      </h3>
                      
                      <div style={styles.fieldGroup}>
                        <label style={styles.fieldLabel}>Nama Motif Batik</label>
                        <input
                          type="text"
                          placeholder="Masukkan nama batik baru..."
                          value={saveForm.nama}
                          onChange={(e) => setSaveForm({...saveForm, nama: e.target.value})}
                          style={styles.textInput}
                          required
                        />
                      </div>
                      
                      <div style={styles.rowFields}>
                        <div style={styles.fieldGroup} style={{flex: 1}}>
                          <label style={styles.fieldLabel}>Acara</label>
                          <select
                            value={saveForm.jenis_acara}
                            onChange={(e) => setSaveForm({...saveForm, jenis_acara: e.target.value})}
                            style={styles.selectInput}
                          >
                            <option value="Formal">Formal</option>
                            <option value="Pernikahan">Pernikahan</option>
                            <option value="Acara Adat">Acara Adat</option>
                            <option value="Kasual">Kasual</option>
                          </select>
                        </div>
                        <div style={styles.fieldGroup} style={{flex: 1}}>
                          <label style={styles.fieldLabel}>Metode Pembuatan</label>
                          <select
                            value={saveForm.jenis_batik}
                            onChange={(e) => setSaveForm({...saveForm, jenis_batik: e.target.value})}
                            style={styles.selectInput}
                          >
                            <option value="Batik AI Modern">Batik AI Modern</option>
                            <option value="Batik Tulis">Batik Tulis</option>
                            <option value="Batik Cap">Batik Cap</option>
                          </select>
                        </div>
                      </div>

                      <div style={styles.actionButtons}>
                        <button type="submit" disabled={saveLoading || isSaved} style={styles.btnSave}>
                          <SaveIcon size={14} color="#161311" /> {saveLoading ? "Menyimpan..." : isSaved ? "Tersimpan di Katalog ✓" : "Simpan ke Katalog"}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setShowVton(true)}
                          style={styles.btnTryOn}
                        >
                          <ShirtIcon size={14} color="#C8FF01" /> Virtual Try-On
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ width: "100%", padding: "10px 0" }}>
                      <button
                        type="button"
                        onClick={() => setShowVton(true)}
                        style={styles.btnSave}
                      >
                        <ShirtIcon size={16} color="#00117D" /> Mulai Virtual Try-On
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVton && (
        <VtonModal
          batik={{
            nama: saveForm.nama || `Batik Hibrida AI`,
            gambar: imageMixed.replace(`${BASE_URL}/`, "")
          }}
          onClose={() => setShowVton(false)}
        />
      )}
    </div>
    <Footer />
    </>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    padding: "60px 40px",
    color: "#F8F4EE",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    overflow: "hidden"
  },
  pattern: {
    position: "absolute",
    inset: 0,
    opacity: 0.18,
    backgroundImage: `
      radial-gradient(circle at center,
      #C8FF01 2.5px,
      transparent 2.5px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0
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
  title: {
    fontSize: "2.8rem",
    fontFamily: "'Playfair Display', serif",
    background: "linear-gradient(to bottom, #FFFFFF, #D0DBFF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
    fontWeight: "700",
    paddingTop: "10px",
    paddingBottom: "10px",
    lineHeight: "1.3",
  },
  gold: {
    color: "#C8FF01",
    WebkitTextFillColor: "#C8FF01",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#D0E0FF",
    maxWidth: "650px",
    margin: "0 auto",
    lineHeight: "1.5"
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "35px"
  },
  tabBtn: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(200, 255, 1, 0.2)",
    color: "#D0E0FF",
    padding: "10px 24px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s"
  },
  activeTabBtn: {
    background: "#C8FF01",
    color: "#00117D",
    border: "1px solid #C8FF01",
    boxShadow: "0 4px 15px rgba(200, 255, 1, 0.25)"
  },
  layoutContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "35px",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap",
    position: "relative",
    zIndex: 1
  },
  leftColumn: {
    flex: "1 1 420px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  rightColumn: {
    flex: "1.2 1 500px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  sectionTitle: {
    fontSize: "1.2rem",
    color: "#C8FF01",
    fontFamily: "'Playfair Display', serif",
    borderBottom: "1px solid rgba(200, 255, 1, 0.2)",
    paddingBottom: "8px",
    marginBottom: "5px",
    fontWeight: "600"
  },
  patternCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    position: "relative"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  badge: {
    background: "rgba(200, 255, 1, 0.08)",
    border: "1px solid rgba(200, 255, 1, 0.3)",
    color: "#C8FF01",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600"
  },
  seedWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "5px"
  },
  seedLabel: {
    fontSize: "0.8rem",
    color: "#aaa"
  },
  seedInput: {
    width: "75px",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    padding: "3px 6px",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "0.85rem"
  },
  iconBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    transition: "background 0.2s"
  },
  previewBox: {
    height: "240px",
    background: "rgba(0, 0, 0, 0.4)",
    borderRadius: "10px",
    border: "1px dashed rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative"
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  placeholderText: {
    color: "#666",
    fontSize: "0.85rem",
    textAlign: "center",
    padding: "0 10px"
  },
  spinner: {
    color: "#C8FF01",
    fontSize: "0.85rem",
    fontWeight: "500"
  },
  btnAction: {
    background: "rgba(200, 255, 1, 0.1)",
    border: "1px solid #C8FF01",
    color: "#C8FF01",
    padding: "10px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.25s",
    boxShadow: "0 4px 15px rgba(200, 255, 1, 0.15)"
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  fileInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer"
  },
  mixControlCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    alignItems: "center"
  },
  sliderGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  sliderHeaders: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    color: "#aaa",
    fontWeight: "500"
  },
  mixPercentage: {
    color: "#C8FF01",
    fontWeight: "600"
  },
  rangeSlider: {
    width: "100%",
    accentColor: "#C8FF01",
    cursor: "pointer"
  },
  btnMix: {
    background: "linear-gradient(90deg, #C8FF01 0%, #AEE600 100%)",
    color: "#00117D",
    border: "none",
    padding: "12px 28px",
    borderRadius: "20px",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 15px rgba(200, 255, 1, 0.2)",
    transition: "transform 0.2s"
  },
  hintText: {
    fontSize: "0.85rem",
    color: "#C8FF01",
    fontStyle: "italic",
    lineHeight: "1.4",
    margin: 0,
    width: "100%",
    textAlign: "center",
  },
  resultCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  resultWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  bigPreviewBox: {
    height: "440px",
    width: "100%",
    background: "#000",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  mixedImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  metaPanel: {
    background: "rgba(0,0,0,0.2)",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.04)"
  },
  saveForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  formTitle: {
    fontSize: "1.05rem",
    color: "#fff",
    margin: "0 0 5px 0",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  fieldLabel: {
    fontSize: "0.8rem",
    color: "#999"
  },
  textInput: {
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "0.85rem"
  },
  rowFields: {
    display: "flex",
    gap: "15px"
  },
  selectInput: {
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    cursor: "pointer",
    width: "100%"
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "8px"
  },
  btnSave: {
    flex: 1,
    background: "#C8FF01",
    color: "#00117D",
    border: "none",
    padding: "10px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "background 0.2s"
  },
  btnTryOn: {
    flex: 1,
    background: "transparent",
    border: "1.5px solid #C8FF01",
    color: "#C8FF01",
    padding: "9px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "background 0.2s"
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
