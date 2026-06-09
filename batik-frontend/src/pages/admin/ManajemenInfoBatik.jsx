import { useState, useEffect } from "react";
import { BASE_URL } from "../../services/api";

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
        <div style={styles.container}>
            <h1 style={styles.title}>Manajemen Info Scan Batik</h1>
            <p style={styles.subtitle}>Atur informasi dasar yang akan muncul saat pengguna melakukan scan AI.</p>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label>Pilih Jenis Batik AI:</label>
                    <select 
                        value={formData.nama} 
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        style={styles.select}
                    >
                        {PRESET_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div style={styles.inputGroup}>
                    <label>Informasi Dasar / Deskripsi Singkat:</label>
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
                {loading ? <p>Memuat...</p> : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tr}>
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
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { padding: "40px 20px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
    title: { fontSize: "2.2rem", fontWeight: "800", color: "#2C1E16", fontFamily: "'Playfair Display', serif" },
    subtitle: { color: "#636e72", marginBottom: "30px" },
    form: { background: "#fff", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "40px" },
    inputGroup: { marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px" },
    select: { padding: "12px", borderRadius: "10px", border: "1px solid #ddd" },
    textarea: { padding: "12px", borderRadius: "10px", border: "1px solid #ddd", minHeight: "100px" },
    button: { background: "#8B5E34", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
    message: { marginTop: "15px", color: "#27ae60", fontWeight: "600" },
    list: { background: "#fff", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
    listTitle: { marginBottom: "20px", color: "#2C1E16" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "12px", borderBottom: "2px solid #eee", color: "#8B5E34" },
    td: { padding: "12px", borderBottom: "1px solid #eee", fontSize: "0.95rem" },
    deleteBtn: { background: "#e74c3c", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }
};
