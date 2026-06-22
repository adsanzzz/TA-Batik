import React, { useState } from "react";
import { generateGarment, executeVton, BASE_URL } from "../services/api";

export default function VtonModal({ batik, onClose }) {
  const [step, setStep] = useState(1);
  const [templateType, setTemplateType] = useState("male_shirt");
  const [loading, setLoading] = useState(false);
  const [generatedGarment, setGeneratedGarment] = useState(null);
  const [humanImage, setHumanImage] = useState(null);
  const [humanImagePreview, setHumanImagePreview] = useState(null);
  const [finalVtonResult, setFinalVtonResult] = useState(null);
  const [error, setError] = useState(null);

  const getBatikImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${BASE_URL}/${path}`;
  };

  const handleGenerateGarment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData
      const formData = new FormData();
      formData.append("template_type", templateType);
      
      // Because we only have the URL of the batik image in the frontend, 
      // we need to fetch it and convert it to a File blob to send via multipart/form-data.
      const imageUrl = getBatikImageUrl(batik.gambar);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
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

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>✨ Virtual Try-On</h2>
          <p style={styles.subtitle}>Motif: {batik.nama}</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={styles.stepContainer}>
          {/* STEP 1: Pilih Baju */}
          {step === 1 && (
            <div style={styles.stepBody}>
              <h3 style={styles.stepTitle}>Langkah 1: Pilih Model Pakaian</h3>
              <p style={styles.stepDesc}>Sistem AI kami akan "menjahit" motif batik ini menjadi pakaian yang kamu pilih secara virtual.</p>
              
              <div style={styles.templateOptions}>
                <div 
                  style={{...styles.optionCard, ...(templateType === "male_shirt" ? styles.optionActive : {})}}
                  onClick={() => setTemplateType("male_shirt")}
                >
                  <div style={styles.optionIcon}>👔</div>
                  <h4>Kemeja Pria</h4>
                  <p>Lengan Pendek Berkerah</p>
                </div>
                <div 
                  style={{...styles.optionCard, ...(templateType === "female_blouse" ? styles.optionActive : {})}}
                  onClick={() => setTemplateType("female_blouse")}
                >
                  <div style={styles.optionIcon}>👚</div>
                  <h4>Blus Wanita</h4>
                  <p>Atasan Lengan Pendek</p>
                </div>
              </div>

              <button 
                style={styles.primaryBtn} 
                onClick={handleGenerateGarment}
                disabled={loading}
              >
                {loading ? "Menjahit Baju... (Tunggu 5-15 detik) ⏳" : "Jahitkan Baju Sekarang 🪄"}
              </button>
            </div>
          )}

          {/* STEP 2: Upload Foto Diri */}
          {step === 2 && (
            <div style={styles.stepBody}>
              <h3 style={styles.stepTitle}>Langkah 2: Unggah Fotomu</h3>
              <p style={styles.stepDesc}>Baju berhasil dibuat! Sekarang unggah foto setengah badan atau seluruh badanmu yang menghadap ke depan.</p>
              
              <div style={styles.splitView}>
                <div style={styles.splitLeft}>
                  <p style={{...styles.stepDesc, textAlign: "center", marginBottom: "10px"}}>Baju Batik Kamu</p>
                  <div style={styles.garmentPreviewBox}>
                    <img src={generatedGarment} alt="Baju Batik" style={styles.garmentImg} />
                  </div>
                </div>

                <div style={styles.splitRight}>
                  <p style={{...styles.stepDesc, textAlign: "center", marginBottom: "10px"}}>Foto Diri Kamu</p>
                  <div style={styles.uploadBox}>
                    {humanImagePreview ? (
                      <div style={styles.imagePreviewContainer}>
                        <img src={humanImagePreview} alt="Preview" style={styles.previewImg} />
                        <button style={styles.changeImgBtn} onClick={() => { setHumanImage(null); setHumanImagePreview(null); }}>
                          Ganti Foto
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={styles.uploadIcon}>📷</span>
                        <p style={styles.uploadText}>Klik di sini untuk mengunggah fotomu</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleHumanImageChange}
                          style={styles.fileInput} 
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                style={{...styles.primaryBtn, marginTop: "30px"}} 
                onClick={handleExecuteVton}
                disabled={loading || !humanImage}
              >
                {loading ? "Memakaikan Baju... (Bisa memakan waktu 1 menit) ⏳" : "Pakai Baju Ini 👕"}
              </button>
            </div>
          )}

          {/* STEP 3: Hasil VTON */}
          {step === 3 && (
            <div style={styles.stepBody}>
              <h3 style={styles.stepTitle}>Selesai! Ini Penampilanmu</h3>
              <p style={styles.stepDesc}>Bagaimana menurutmu? Kemeja {batik.nama} ini sangat cocok untukmu!</p>
              
              <div style={styles.finalResultBox}>
                <img src={finalVtonResult} alt="Hasil Try-On" style={styles.finalResultImg} />
              </div>

              <div style={styles.actionRow}>
                <button 
                  style={styles.secondaryBtn} 
                  onClick={() => window.open(finalVtonResult, '_blank')}
                >
                  Lihat Gambar Penuh 🔍
                </button>
                <button style={styles.primaryBtn} onClick={onClose}>
                  Selesai ✓
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
    padding: "20px",
    backdropFilter: "blur(10px)",
  },
  modalContent: {
    background: "linear-gradient(135deg, #1E1A17 0%, #2A201A 100%)",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    border: "1px solid rgba(212,175,55,0.3)",
    overflowY: "auto",
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "2rem",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    transition: "background 0.3s",
    zIndex: 10,
  },
  modalHeader: {
    textAlign: "center",
    padding: "30px 20px 20px",
    borderBottom: "1px solid rgba(212,175,55,0.1)",
  },
  modalTitle: {
    fontSize: "2rem",
    color: "#D4AF37",
    margin: "0 0 5px 0",
    fontFamily: "'Playfair Display', serif",
  },
  subtitle: {
    color: "#E0E0E0",
    margin: 0,
    fontSize: "1rem",
  },
  errorBox: {
    margin: "20px 40px 0",
    padding: "15px",
    background: "rgba(255, 0, 0, 0.1)",
    borderLeft: "4px solid #ff4444",
    color: "#ffdddd",
    borderRadius: "0 8px 8px 0",
    fontSize: "0.9rem",
  },
  stepContainer: {
    padding: "30px 40px",
  },
  stepBody: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  stepTitle: {
    color: "#fff",
    fontSize: "1.5rem",
    marginBottom: "10px",
    marginTop: 0,
  },
  stepDesc: {
    color: "#ccc",
    fontSize: "0.95rem",
    textAlign: "center",
    marginBottom: "30px",
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
    background: "rgba(255, 255, 255, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "30px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    color: "#fff",
  },
  optionActive: {
    borderColor: "#D4AF37",
    background: "rgba(212, 175, 55, 0.1)",
    boxShadow: "0 8px 20px rgba(212, 175, 55, 0.2)",
  },
  optionIcon: {
    fontSize: "3rem",
    marginBottom: "15px",
  },
  primaryBtn: {
    background: "linear-gradient(90deg, #D4AF37 0%, #AA8120 100%)",
    color: "#1E1A17",
    border: "none",
    padding: "15px 40px",
    borderRadius: "30px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
    transition: "all 0.3s",
    fontFamily: "Poppins, sans-serif",
  },
  secondaryBtn: {
    background: "transparent",
    color: "#D4AF37",
    border: "2px solid #D4AF37",
    padding: "13px 30px",
    borderRadius: "30px",
    fontSize: "1rem",
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
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  garmentPreviewBox: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "15px",
    height: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed rgba(212,175,55,0.3)",
  },
  garmentImg: {
    maxHeight: "100%",
    maxWidth: "100%",
    objectFit: "contain",
    borderRadius: "8px",
  },
  uploadBox: {
    position: "relative",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "15px",
    height: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed rgba(255,255,255,0.3)",
    cursor: "pointer",
    overflow: "hidden",
    transition: "all 0.3s",
  },
  uploadIcon: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  uploadText: {
    color: "#aaa",
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
    position: "absolute",
    bottom: "10px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  finalResultBox: {
    width: "100%",
    maxWidth: "400px",
    height: "400px",
    background: "#000",
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "30px",
    border: "2px solid #D4AF37",
    boxShadow: "0 10px 30px rgba(212,175,55,0.2)",
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
