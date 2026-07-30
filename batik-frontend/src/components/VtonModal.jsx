import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { generateGarment, generateGarmentByUrl, executeVton, BASE_URL } from "../services/api";
import { colors, fonts } from "../theme";

const MaleShirtIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={active ? colors.blue : colors.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "10px"}}>
    <path d="M4 10l-2-2 3-5h14l3 5-2 2"></path>
    <path d="M7 6v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6"></path>
    <path d="M12 3v5"></path>
  </svg>
);

const FemaleBlouseIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={active ? colors.blue : colors.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "10px"}}>
    <path d="M5 8l-2 3a2 2 0 0 0 2 2h2v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7h2a2 2 0 0 0 2-2l-2-3c-1.5-2.25-3-3-5-3-2 0-2 2-4 2s-2-2-4-2c-2 0-3.5.75-5 3z"></path>
  </svg>
);

const RESPONSIVE_CSS = `
  .vton-option-card:hover {
    border-color: #033EEE !important;
    transform: translateY(-3px);
    box-shadow: 0 10px 26px rgba(3, 62, 238, 0.14);
  }
  @media (max-width: 768px) {
    .vton-modal-content * {
      box-sizing: border-box !important;
    }
    .vton-modal-content {
      border-radius: 16px !important;
      max-height: 90vh !important;
      padding-bottom: 20px !important;
    }
    .vton-split-view {
      flex-direction: column !important;
      gap: 20px !important;
      overflow-y: auto !important;
      align-items: center !important;
    }
    .vton-split-left, .vton-split-right {
      width: 100% !important;
      flex: none !important;
    }
    .vton-template-options {
      flex-direction: column !important;
      gap: 15px !important;
      align-items: center !important;
    }
    .vton-option-card {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    .vton-step-container {
      padding: 10px 15px 15px !important;
      overflow-y: auto;
      max-height: calc(90vh - 60px);
    }
    .vton-garment-box, .vton-upload-box {
      height: 200px !important;
    }
    .vton-final-box {
      height: 300px !important;
    }
    .vton-upload-option-group {
      width: auto !important;
      flex: 1 !important;
      padding: 24px 8px !important;
    }
    .vton-upload-options {
      flex-direction: row !important;
      gap: 10px !important;
      align-items: center !important;
      width: 100% !important;
    }
    .vton-upload-option-group svg {
      width: 32px !important;
      height: 32px !important;
      margin-bottom: 6px !important;
    }
    .vton-upload-text {
      font-size: 0.8rem !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .vton-step-title {
      font-size: 1.2rem !important;
    }
    .vton-modal-title {
      font-size: 1.1rem !important;
    }
    .vton-header {
      padding: 20px 15px !important;
    }
    .vton-close-btn {
      top: 15px !important;
      right: 15px !important;
      width: 32px !important;
      height: 32px !important;
      font-size: 1.2rem !important;
    }
  }
`;

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "15px", opacity: 0.7}}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "10px", opacity: 0.7}}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

export default function VtonModal({ batik, onClose }) {
  const [step, setStep] = useState(1);
  const [templateType, setTemplateType] = useState("male_shirt");
  const [loading, setLoading] = useState(false);
  const [generatedGarment, setGeneratedGarment] = useState(null);
  const [humanImage, setHumanImage] = useState(null);
  const [humanImagePreview, setHumanImagePreview] = useState(null);
  const [finalVtonResult, setFinalVtonResult] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Kamera tidak dapat diakses. Pastikan Anda telah memberikan izin kamera.");
          setIsCameraActive(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  const startCamera = () => {
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        setHumanImage(file);
        setHumanImagePreview(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const getBatikImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${BASE_URL}/${path}`;
  };

  const handleGenerateGarment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData - kirim URL gambar batik, biarkan backend yang download
      const formData = new FormData();
      formData.append("template_type", templateType);
      
      const imageUrl = getBatikImageUrl(batik.gambar);
      
      // Coba fetch gambar dulu dari browser
      let blob;
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Image not found: ${response.status}`);
        blob = await response.blob();
      } catch (fetchErr) {
        // Jika gambar tidak bisa diakses dari browser (404 di VPS),
        // kirim URL-nya saja ke backend agar backend yang download
        console.warn("[VTON] Browser tidak bisa fetch gambar batik, kirim URL ke backend:", imageUrl);
        // Kirim sebagai JSON object (BUKAN FormData!)
        const result = await generateGarmentByUrl({
          batik_image_url: imageUrl,
          template_type: templateType
        });
        if (result.status === "success" && result.garment_image_url) {
          setGeneratedGarment(result.garment_image_url);
          setStep(2);
        } else {
          throw new Error("Gagal mendapatkan gambar baju dari server.");
        }
        return;
      }


      const file = new File([blob], "batik.jpg", { type: blob.type });
      formData.append("batik_image", file);

      // Call API
      const result = await generateGarment(formData);
      
      if (result.status === "success" && result.garment_image_url) {
        setGeneratedGarment(result.garment_image_url);
        setStep(2);
      } else {
        throw new Error("Gagal mendapatkan gambar baju dari server.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memproses baju virtual. Pastikan Replicate / n8n berjalan dengan baik.");
    } finally {
      setLoading(false);
    }
  };


  const handleHumanImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHumanImage(file);
      setHumanImagePreview(URL.createObjectURL(file));
    }
  };

  const handleExecuteVton = async () => {
    if (!humanImage) {
      setError("Silakan unggah foto dirimu terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("human_image", humanImage);
      formData.append("garment_image_url", generatedGarment);
      formData.append("template_type", templateType);

      const result = await executeVton(formData);

      if (result.status === "success" && result.vton_result_url) {
        setFinalVtonResult(result.vton_result_url);
        setStep(3);
      } else {
        throw new Error("Gagal memproses Virtual Try-On.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat mengeksekusi VTON. Pastikan saldo Replicate mencukupi.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div style={styles.modalOverlay} onClick={handleClose}>
      <style>{RESPONSIVE_CSS}</style>
      <div style={styles.modalContent} className="vton-modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader} className="vton-header">
          <div style={{ textAlign: "left" }}>
            <h2 style={styles.modalTitle} className="vton-modal-title">Virtual Try-On</h2>
            <p style={styles.subtitle}>Motif: {batik.nama}</p>
          </div>
          <button style={styles.closeBtn} className="vton-close-btn" onClick={handleClose}>&times;</button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={styles.stepContainer} className="vton-step-container">
          {/* STEP 1: Pilih Baju */}
          {step === 1 && (
            <div style={styles.stepBody}>
              <h3 style={styles.stepTitle} className="vton-step-title">Langkah 1: Pilih Model Pakaian</h3>
              <p style={styles.stepDesc}>Sistem AI kami akan "menjahit" motif batik ini menjadi pakaian yang kamu pilih secara virtual.</p>
              
              <div style={styles.templateOptions} className="vton-template-options">
                <div 
                  style={{...styles.optionCard, ...(templateType === "male_shirt" ? styles.optionActive : {})}}
                  className="vton-option-card"
                  onClick={() => setTemplateType("male_shirt")}
                >
                  <MaleShirtIcon active={templateType === "male_shirt"} />
                  <h4 style={{...styles.optionTitle, ...(templateType === "male_shirt" ? {color: colors.blue} : {})}}>Kemeja Pria</h4>
                  <p style={styles.optionDesc}>Lengan Pendek Berkerah</p>
                </div>
                <div 
                  style={{...styles.optionCard, ...(templateType === "female_blouse" ? styles.optionActive : {})}}
                  className="vton-option-card"
                  onClick={() => setTemplateType("female_blouse")}
                >
                  <FemaleBlouseIcon active={templateType === "female_blouse"} />
                  <h4 style={{...styles.optionTitle, ...(templateType === "female_blouse" ? {color: colors.blue} : {})}}>Blus Wanita</h4>
                  <p style={styles.optionDesc}>Atasan Lengan Pendek</p>
                </div>
              </div>

              <button 
                style={styles.primaryBtn} 
                onClick={handleGenerateGarment}
                disabled={loading}
              >
                {loading ? "Memproses Model... (Tunggu 5-15 detik)" : "Terapkan Model Pakaian"}
              </button>
            </div>
          )}

          {/* STEP 2: Upload Foto Diri */}
          {step === 2 && (
            <div style={styles.stepBody}>
              <h3 style={styles.stepTitle} className="vton-step-title">Langkah 2: Unggah Fotomu</h3>
              <p style={styles.stepDesc}>Baju berhasil dibuat! Sekarang unggah foto setengah badan atau seluruh badanmu yang menghadap ke depan.</p>
              
              <div style={styles.splitView} className="vton-split-view">
                <div style={styles.splitLeft} className="vton-split-left">
                  <p style={{...styles.stepDesc, textAlign: "center", marginBottom: "10px"}}>Baju Batik Kamu</p>
                  <div style={styles.garmentPreviewBox} className="vton-garment-box">
                    <img src={generatedGarment} alt="Baju Batik" style={styles.garmentImg} />
                  </div>
                </div>

                <div style={styles.splitRight} className="vton-split-right">
                  <p style={{...styles.stepDesc, textAlign: "center", marginBottom: "10px"}}>Foto Diri Kamu</p>
                  <div style={styles.uploadBox} className="vton-upload-box">
                    {humanImagePreview ? (
                      <div style={styles.imagePreviewContainer}>
                        <img src={humanImagePreview} alt="Preview" style={styles.previewImg} />
                        <div style={styles.changeImgActions}>
                          <button style={styles.changeImgBtn} onClick={() => { setHumanImage(null); setHumanImagePreview(null); }}>
                            Ganti Foto
                          </button>
                          <button style={styles.changeImgBtn} onClick={() => { setHumanImage(null); setHumanImagePreview(null); startCamera(); }}>
                            Ambil Ulang (Kamera)
                          </button>
                        </div>
                      </div>
                    ) : isCameraActive ? (
                      <div style={styles.cameraContainer}>
                        <video ref={videoRef} autoPlay playsInline style={styles.previewImg} />
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                        <div style={styles.cameraActions}>
                          <button style={styles.captureBtn} onClick={capturePhoto}>Ambil Foto</button>
                          <button style={styles.cancelBtn} onClick={stopCamera}>Batal</button>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.uploadOptions} className="vton-upload-options">
                        <div style={styles.uploadOptionGroup} className="vton-upload-option-group">
                          <UploadIcon />
                          <p style={styles.uploadText} className="vton-upload-text">Dari Galeri</p>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleHumanImageChange}
                            style={styles.fileInput} 
                          />
                        </div>
                        <div style={styles.orDivider}>atau</div>
                        <div style={styles.uploadOptionGroup} className="vton-upload-option-group" onClick={startCamera}>
                          <CameraIcon />
                          <p style={styles.uploadText} className="vton-upload-text">Dari Kamera</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                style={{...styles.primaryBtn, marginTop: "15px"}} 
                onClick={handleExecuteVton}
                disabled={loading || !humanImage}
              >
                {loading ? "Memakaikan Baju... (Bisa memakan waktu 1 menit)" : "Pakai Baju Ini"}
              </button>
            </div>
          )}

          {/* STEP 3: Hasil VTON */}
          {step === 3 && (
            <div style={{ ...styles.splitView, alignItems: "center", width: "100%" }} className="vton-split-view">
              <div style={{ ...styles.splitLeft, alignItems: "center" }} className="vton-split-left">
                <div style={{ ...styles.finalResultBox, margin: 0, width: "100%" }} className="vton-final-box">
                  <img src={finalVtonResult} alt="Hasil Try-On" style={styles.finalResultImg} />
                </div>
              </div>

              <div style={{ ...styles.splitRight, alignItems: "flex-start", justifyContent: "center", paddingLeft: "10px" }} className="vton-split-right">
                <h3 style={{ ...styles.stepTitle, textAlign: "left", marginTop: 0, marginBottom: "15px", width: "100%" }}>Selesai! Ini Penampilanmu</h3>
                <p style={{ ...styles.stepDesc, textAlign: "left", maxWidth: "100%", marginBottom: "30px", lineHeight: "1.6" }}>
                  Bagaimana menurutmu? Kemeja Batik Hibrida AI ini sangat cocok untukmu!
                </p>
                
                <div style={styles.actionRow}>
                  <button 
                    style={styles.secondaryBtn} 
                    onClick={() => window.open(finalVtonResult, '_blank')}
                  >
                    Lihat Gambar Penuh
                  </button>
                  <button style={styles.primaryBtn} onClick={onClose}>
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 25, 80, 0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10001,
    padding: "20px",
    backdropFilter: "blur(10px)",
  },
  modalContent: {
    background: colors.surface,
    borderRadius: "24px",
    width: "100%",
    maxWidth: "1050px",
    maxHeight: "95vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxShadow: colors.shadow,
    border: `1px solid ${colors.border}`,
    overflow: "hidden",
    fontFamily: fonts.body,
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "1.4rem",
    background: colors.blueSoft,
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: colors.blue,
    zIndex: 100,
    lineHeight: "1",
    transition: "all 0.3s",
  },
  modalHeader: {
    padding: "20px 25px",
    background: colors.surfaceAlt,
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  modalTitle: {
    fontSize: "1.35rem",
    color: colors.textHead,
    margin: 0,
    fontWeight: "700",
    fontFamily: fonts.body,
    paddingRight: "40px", // space for absolute close button
  },
  subtitle: {
    color: colors.textBody,
    margin: "3px 0 0 0",
    fontSize: "0.85rem",
  },
  errorBox: {
    margin: "15px 40px 0",
    padding: "12px",
    background: "rgba(226, 59, 78, 0.08)",
    borderLeft: `4px solid ${colors.danger}`,
    color: colors.danger,
    borderRadius: "0 8px 8px 0",
    fontSize: "0.85rem",
  },
  stepContainer: {
    padding: "15px 30px 20px",
  },
  stepBody: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  stepTitle: {
    color: colors.textHead,
    fontSize: "1.3rem",
    marginBottom: "5px",
    marginTop: 0,
  },
  stepDesc: {
    color: colors.textBody,
    fontSize: "0.88rem",
    textAlign: "center",
    marginBottom: "15px",
    maxWidth: "500px",
  },
  templateOptions: {
    display: "flex",
    gap: "20px",
    width: "100%",
    justifyContent: "center",
    marginBottom: "40px",
  },
  optionCard: {
    flex: 1,
    maxWidth: "250px",
    minHeight: "190px",
    background: colors.surface,
    border: `2px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px 16px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    color: colors.textHead,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  optionActive: {
    borderColor: colors.blue,
    background: colors.blueSoft,
    boxShadow: colors.shadowSm,
  },
  optionTitle: {
    margin: "6px 0 8px",
    fontSize: "1.05rem",
    fontWeight: 700,
    fontFamily: fonts.body,
    color: colors.textHead,
  },
  optionDesc: {
    margin: 0,
    fontSize: "0.85rem",
    lineHeight: 1.4,
    color: colors.textBody,
  },
  optionIcon: {
    fontSize: "3rem",
    marginBottom: "15px",
  },
  primaryBtn: {
    background: colors.blueGradient,
    color: colors.onBlue,
    border: "none",
    padding: "12px 35px",
    borderRadius: "30px",
    fontSize: "1.05rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: colors.shadowSm,
    transition: "all 0.3s",
    fontFamily: fonts.body,
  },
  secondaryBtn: {
    background: "transparent",
    color: colors.blue,
    border: `2px solid ${colors.blue}`,
    padding: "10px 25px",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  splitView: {
    display: "flex",
    gap: "30px",
    width: "100%",
    justifyContent: "center",
    alignItems: "stretch",
  },
  splitLeft: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  splitRight: {
    flex: 1.6,
    display: "flex",
    flexDirection: "column",
  },
  garmentPreviewBox: {
    background: colors.surfaceAlt,
    borderRadius: "16px",
    padding: "15px",
    height: "270px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px dashed ${colors.blueBorder}`,
  },
  garmentImg: {
    maxHeight: "100%",
    maxWidth: "100%",
    objectFit: "contain",
    borderRadius: "8px",
  },
  uploadBox: {
    position: "relative",
    background: colors.surfaceAlt,
    borderRadius: "16px",
    padding: "15px",
    height: "270px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: `1px dashed ${colors.border}`,
    cursor: "pointer",
    overflow: "hidden",
    transition: "all 0.3s",
  },
  uploadIcon: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  uploadText: {
    color: colors.textMuted,
    fontSize: "0.9rem",
    textAlign: "center",
    padding: "0 20px",
  },
  fileInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: {
    maxHeight: "100%",
    maxWidth: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
  changeImgBtn: {
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  changeImgActions: {
    position: "absolute",
    bottom: "10px",
    display: "flex",
    gap: "10px",
  },
  cameraContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraActions: {
    position: "absolute",
    bottom: "10px",
    display: "flex",
    gap: "10px",
  },
  captureBtn: {
    background: colors.blue,
    color: colors.onBlue,
    border: "none",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "rgba(255,0,0,0.8)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  uploadOptions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    width: "100%",
    height: "100%",
  },
  uploadOptionGroup: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    background: colors.surfaceAlt,
    border: `1px dashed ${colors.border}`,
    borderRadius: "12px",
    width: "80%",
    cursor: "pointer",
    transition: "0.3s",
  },
  orDivider: {
    color: colors.textMuted,
    fontSize: "0.8rem",
  },
  finalResultBox: {
    width: "100%",
    maxWidth: "400px",
    height: "450px",
    background: colors.surfaceAlt,
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "30px",
    border: `2px solid ${colors.blue}`,
    boxShadow: colors.shadow,
  },
  finalResultImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  actionRow: {
    display: "flex",
    gap: "15px",
  }
};
