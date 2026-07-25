import { useState, useEffect } from "react";
import { BASE_URL } from "../../services/api";
import { colors, fonts } from "../../theme";

const PRESET_CLASSES = [
    "Kawung", "Mega Mendung", "Parang", 
    "Sekarjagad", "Sidoluhur", "Sidomukti", 
    "Sidomulyo", "Srikraton", "Truntum", 
    "Tujuh Rupa", "Wahyu Tumurun"
];

export default function ManajemenInfoBatik() {
    const [infos, setInfos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ nama: PRESET_CLASSES[0], deskripsi: "" });
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchInfos();
    }, []);

    const fetchInfos = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/batik-ai-info`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setInfos(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch(`${BASE_URL}/admin/batik-ai-info`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setMessage("Informasi berhasil disimpan!");
                setFormData({ ...formData, deskripsi: "" });
                fetchInfos();
            }
        } catch (err) {
            setMessage("Gagal menyimpan data.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus informasi ini?")) return;
        try {
            await fetch(`${BASE_URL}/admin/batik-ai-info/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInfos();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <h1 style={styles.title}>Manajemen Info Scan Batik</h1>
                <p style={styles.subtitle}>Atur informasi dasar yang akan muncul saat pengguna melakukan scan AI.</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Pilih Jenis Batik AI:</label>
                        <select 
                            value={formData.nama} 
                            onChange={(e) => setFormData({...formData, nama: e.target.value})}
                            style={styles.select}
                        >
                            {PRESET_CLASSES.map(c => <option key={c} value={c} style={{background: "#FFFFFF", color: colors.textHead}}>{c}</option>)}
                        </select>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Informasi Dasar / Deskripsi Singkat:</label>
                        <textarea 
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                            placeholder="Contoh: Batik Parang merupakan salah satu motif batik tertua di Indonesia..."
                            style={styles.textarea}
                            required
                        />
                    </div>
                    <button type="submit" style={styles.button}>Simpan Informasi</button>
                    {message && <p style={styles.message}>{message}</p>}
                </form>

                <div style={styles.list}>
                    <h2 style={styles.listTitle}>Daftar Informasi Terdaftar</h2>
                    {loading ? <p style={styles.loading}>Memuat...</p> : (
                        <div style={styles.tableResponsive}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Nama Batik</th>
                                        <th style={styles.th}>Deskripsi</th>
                                        <th style={styles.th}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {infos.map(info => (
                                        <tr key={info.id} style={styles.tr}>
                                            <td style={styles.td}><strong>{info.nama}</strong></td>
                                            <td style={styles.td}>{info.deskripsi.substring(0, 100)}...</td>
                                            <td style={styles.td}>
                                                <button onClick={() => handleDelete(info.id)} style={styles.deleteBtn}>Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: "calc(100vh - 70px)",
        background: "transparent",
        backgroundImage: `radial-gradient(${colors.blueSoft} 1px, transparent 0)`,
        backgroundSize: "24px 24px",
        paddingTop: "40px",
        paddingBottom: "60px",
    },
    container: {
        padding: "0 20px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: fonts.body
    },
    title: {
        fontSize: "2.8rem",
        fontWeight: "800",
        color: colors.textHead,
        fontFamily: fonts.heading,
        marginBottom: "12px",
        letterSpacing: "-0.5px"
    },
    subtitle: {
        color: colors.textBody,
        fontSize: "1.15rem",
        fontWeight: "500",
        marginBottom: "40px"
    },
    form: {
        background: colors.surface,
        padding: "30px",
        borderRadius: "24px",
        border: `1px solid ${colors.border}`,
        boxShadow: colors.shadow,
        marginBottom: "40px"
    },
    inputGroup: {
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    label: {
        fontSize: "0.85rem",
        fontWeight: "700",
        color: colors.blue,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    select: {
        padding: "14px 15px",
        borderRadius: "12px",
        border: `1px solid ${colors.border}`,
        background: "#FFFFFF",
        color: colors.textHead,
        outline: "none",
        fontSize: "0.95rem"
    },
    textarea: {
        padding: "14px 15px",
        borderRadius: "12px",
        border: `1px solid ${colors.border}`,
        background: "#FFFFFF",
        color: colors.textHead,
        outline: "none",
        fontSize: "0.95rem",
        minHeight: "120px",
        fontFamily: "inherit"
    },
    button: {
        background: colors.blueGradient,
        color: colors.onBlue,
        border: "none",
        padding: "16px 24px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "700",
        width: "100%",
        fontSize: "1rem",
        boxShadow: colors.shadowSm
    },
    message: {
        marginTop: "15px",
        color: colors.blue,
        fontWeight: "600",
        textAlign: "center"
    },
    loading: {
        color: colors.blue,
        textAlign: "center"
    },
    list: {
        background: colors.surface,
        padding: "30px",
        borderRadius: "24px",
        border: `1px solid ${colors.border}`,
        boxShadow: colors.shadow
    },
    listTitle: {
        marginBottom: "20px",
        color: colors.textHead,
        fontFamily: fonts.heading,
        fontSize: "1.5rem",
        fontWeight: "700"
    },
    tableResponsive: {
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    tr: {
        borderBottom: `1px solid ${colors.border}`
    },
    th: {
        textAlign: "left",
        padding: "14px 12px",
        background: colors.surfaceAlt,
        color: colors.textHead,
        fontWeight: "700",
        fontSize: "0.9rem",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    td: {
        padding: "16px 12px",
        fontSize: "0.95rem",
        color: colors.textBody
    },
    deleteBtn: { 
        background: "rgba(239, 68, 68, 0.15)", 
        color: "#ef4444", 
        border: "1px solid #ef4444", 
        padding: "6px 12px", 
        borderRadius: "6px", 
        cursor: "pointer",
        fontWeight: "600"
    }
};
