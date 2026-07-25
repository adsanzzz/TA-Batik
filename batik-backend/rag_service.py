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
    
    search_results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k
    )

    matches = []
    for hit in search_results:
        matches.append({
            "score": hit.score,
            "payload": hit.payload
        })
    return matches

async def ask_qwen_llm(prompt: str) -> str:
    """
    Menembak API Hugging Face Inference untuk model Qwen/Qwen2.5-7B-Instruct.
    """
    token = os.getenv("HF_TOKEN")
    if not token:
        # Fallback jika token belum diisi di .env
        return "⚠️ HF_TOKEN belum dikonfigurasi di file .env. Harap masukkan token Hugging Face Anda."

    url = f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 512,
            "temperature": 0.7,
            "return_full_text": False
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            return f"Error dari Hugging Face API ({response.status_code}): {response.text}"
        
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "").strip()
        elif isinstance(result, dict) and "generated_text" in result:
            return result["generated_text"].strip()
        else:
            return str(result)
