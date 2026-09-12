from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal
from typing import Optional, List, Dict, Any
import rag_service

router = APIRouter(prefix="/api/rag", tags=["RAG Batik Recommendation"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RecommendationRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

@router.post("/reindex")
def reindex_vector_db(db: Session = Depends(get_db)):
    """
    Endpoint untuk mengekstrak data batik dari PostgreSQL
    dan menyimpannya ke Qdrant Vector Database.
    """
    try:
        result = rag_service.seed_database_to_qdrant(db)
        return {
            "message": "Berhasil melakukan indexing data batik ke Qdrant Vector DB!",
            "details": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan indexing ke Qdrant: {str(e)}")

@router.post("/recommend")
async def get_batik_recommendation(req: RecommendationRequest):
    """
    Endpoint RAG Rekomendasi Batik:
    1. Mencari konteks batik terdekat di Qdrant Vector DB (menggunakan Nomic Embeddings).
    2. Menyusun prompt RAG dengan data pendukung.
    3. Memanggil LLM Qwen/Qwen2.5-7B-Instruct di Hugging Face.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Pertanyaan/Query tidak boleh kosong.")

    try:
        # 1. Retrieval dari Qdrant
        retrieved_items = rag_service.search_similar_batik(req.query, top_k=req.top_k)

        # 2. Susun Konteks
        context_str = ""
        for i, item in enumerate(retrieved_items, 1):
            payload = item.get("payload", {})
            content = payload.get("content", "")
            context_str += f"\n[Data Batik #{i}]\n{content}\n"

        if not context_str:
            context_str = "Tidak ditemukan data batik yang spesifik di database."

        # 3. Susun Prompt RAG untuk Qwen
        system_prompt = (
            "Kamu asisten batik yang santai, ramah, dan langsung ke intinya. "
            "Pakai Bahasa Indonesia sehari-hari yang gampang dipahami. "
            "JANGAN formal/kaku seperti surat resmi, JANGAN pakai sapaan berlebihan "
            "seperti 'Terhormat', 'Salam hormat', atau 'sekali hormat saya'.\n\n"
            "--- DATA BATIK (satu-satunya sumbermu) ---\n"
            f"{context_str}\n"
            "------------------------------------------\n\n"
            "Aturan menjawab:\n"
            "1. HANYA gunakan batik dari DATA di atas. DILARANG mengarang nama atau filosofi batik yang tidak ada di data.\n"
            "2. Kalau data kosong atau tidak ada yang cocok, bilang jujur: 'Maaf, belum ada batik yang pas di database untuk itu.'\n"
            "3. Langsung ke inti: sebutkan 1-3 batik yang paling cocok. Tiap batik cukup 1-2 kalimat "
            "(nama batik + kenapa cocok + makna singkatnya). Boleh pakai poin bernomor.\n"
            "4. Singkat, hangat, mudah dipahami. Nggak usah basa-basi panjang atau pembukaan/penutup bertele-tele.\n\n"
            f"Pertanyaan: {req.query}\n\n"
            "Jawabanmu:"
        )

        # 4. Panggil LLM Qwen di Hugging Face (dengan fallback cerdas jika token HF belum diizinkan)
        llm_response = await rag_service.ask_qwen_llm(system_prompt, fallback_items=retrieved_items)

        return {
            "status": "success",
            "query": req.query,
            "recommendation": llm_response,
            "retrieved_context": retrieved_items
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal memproses rekomendasi RAG: {str(e)}")
