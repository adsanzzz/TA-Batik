import os
import httpx
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import models
from database import SessionLocal

# Qdrant client & SentenceTransformers
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL_ID = os.getenv("HF_MODEL_ID", "Qwen/Qwen2.5-7B-Instruct")

COLLECTION_NAME = "batik_knowledge"

# Lazy-loaded singletons
_qdrant_client = None
_embed_model = None

def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        print(f"[RAG] Connecting to Qdrant at {QDRANT_HOST}:{QDRANT_PORT}...")
        _qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    return _qdrant_client

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        print("[RAG] Loading SentenceTransformer nomic-embed-text-v1.5...")
        from sentence_transformers import SentenceTransformer
        _embed_model = SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True)
    return _embed_model

def get_text_embedding(text: str, is_query: bool = False) -> List[float]:
    """
    Sesuai dokumentasi Nomic Embed:
    - Dokument/Teks Database harus diawali prefix: 'search_document: '
    - Pertanyaan/Query User harus diawali prefix: 'search_query: '
    """
    prefix = "search_query: " if is_query else "search_document: "
    full_text = f"{prefix}{text.strip()}"
    model = get_embed_model()
    embedding = model.encode(full_text)
    return embedding.tolist()

def init_qdrant_collection():
    """
    Membuat collection Qdrant jika belum ada.
    Nomic Embed v1.5 menghasilkan vektor berdimensi 768.
    """
    client = get_qdrant_client()
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in collections:
        print(f"[RAG] Creating Qdrant collection '{COLLECTION_NAME}' (768 dimensions)...")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(
                size=768,
                distance=qmodels.Distance.COSINE
            )
        )

def seed_database_to_qdrant(db: Session) -> Dict[str, Any]:
    """
    Mengekstrak data dari PostgreSQL (Tabel Batik dan BatikAIInfo),
    mengubahnya jadi vektor embedding, dan menyimpannya di Qdrant.
    """
    client = get_qdrant_client()
    init_qdrant_collection()

    batiks = db.query(models.Batik).all()
    ai_infos = db.query(models.BatikAIInfo).all()

    points = []
    point_id = 1

    # 1. Index data dari tabel Batik
    for b in batiks:
        content = (
            f"Nama Batik: Batik {b.nama}. "
            f"Motif Utama: {b.motif_utama or 'Tidak spesifik'}. "
            f"Jenis Acara: {b.jenis_acara or 'Semua Acara'}. "
            f"Jenis Batik: {b.jenis_batik or 'Batik Tulis/Cap'}. "
            f"Filosofi dan Makna: {b.filosofi or '-'}"
        )
        vector = get_text_embedding(content, is_query=False)
        payload = {
            "source": "batik_catalog",
            "db_id": b.id,
            "nama": b.nama,
            "motif_utama": b.motif_utama,
            "jenis_acara": b.jenis_acara,
            "filosofi": b.filosofi,
            "content": content
        }
        points.append(qmodels.PointStruct(id=point_id, vector=vector, payload=payload))
        point_id += 1

    # 2. Index data dari tabel BatikAIInfo
    for info in ai_infos:
        content = f"Informasi Edukasi Batik {info.nama}: {info.deskripsi}"
        vector = get_text_embedding(content, is_query=False)
        payload = {
            "source": "batik_ai_info",
            "db_id": info.id,
            "nama": info.nama,
            "deskripsi": info.deskripsi,
            "content": content
        }
        points.append(qmodels.PointStruct(id=point_id, vector=vector, payload=payload))
        point_id += 1

    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    return {
        "status": "success",
        "total_batik_indexed": len(batiks),
        "total_ai_info_indexed": len(ai_infos),
        "total_vectors": len(points)
    }

def search_similar_batik(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Mencari konteks batik paling mirip di Qdrant berdasarkan query user.
    """
    client = get_qdrant_client()
    init_qdrant_collection()

    query_vector = get_text_embedding(query, is_query=True)
    
    if hasattr(client, "query_points"):
        response = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=top_k
        )
        search_results = response.points
    else:
        search_results = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=top_k
        )

    matches = []
    for hit in search_results:
        matches.append({
            "score": getattr(hit, "score", 0.0),
            "payload": getattr(hit, "payload", {})
        })
    return matches

async def ask_qwen_llm(prompt: str, fallback_items: List[Dict[str, Any]] = None) -> str:
    """
    Menembak API Hugging Face Inference untuk model Qwen/Qwen2.5-7B-Instruct.
    Jika token HF bermasalah/403, akan otomatis merangkai rekomendasi cerdas dari data Qdrant.
    """
    token = os.getenv("HF_TOKEN")
    
    if token:
        try:
            from huggingface_hub import InferenceClient
            client = InferenceClient(model=HF_MODEL_ID, token=token)
            response = client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                max_tokens=512,
                temperature=0.7
            )
            if response and response.choices and response.choices[0].message.content:
                return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[RAG] InferenceClient failed: {e}")

        # Try direct HTTP v1 OpenAI-compatible endpoint on HF
        try:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": HF_MODEL_ID,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 512,
                "temperature": 0.7
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post("https://router.huggingface.co/v1/chat/completions", json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"[RAG] Direct HTTP failed: {e}")

    # Fallback RAG Synthesizer (jika HF Token belum diizinkan/error)
    if fallback_items and len(fallback_items) > 0:
        recommendations = ["Berdasarkan pencarian pencocokan makna & filosofi batik di basis data kami, berikut rekomendasi batik yang paling sesuai untuk Anda:\n"]
        for idx, item in enumerate(fallback_items, 1):
            payload = item.get("payload", {})
            nama = payload.get("nama", "Batik Nusantara")
            motif = payload.get("motif_utama", "Klasik")
            acara = payload.get("jenis_acara", "Umum")
            filosofi = payload.get("filosofi", "-")
            
            recommendations.append(
                f"{idx}. Batik {nama}\n"
                f"   • Motif Utama: {motif}\n"
                f"   • Peruntukan: Acara {acara}\n"
                f"   • Filosofi & Makna: {filosofi}\n"
            )
        recommendations.append("💡 Tips: Pilih motif di atas yang paling selaras dengan harapan dan nuansa acara Anda.")
        return "\n".join(recommendations)

    return "Maaf, belum ditemukan rekomendasi batik yang cocok untuk pertanyaan Anda. Cobalah kata kunci lain seperti 'pernikahan', 'lamaran', atau 'wisuda'."

