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
            "Anda adalah Pakar Batik & Asisten Budaya Indonesia yang ramah, sopan, dan sangat berpengetahuan.\n"
            "Tugas Anda adalah memberikan rekomendasi batik yang sangat sesuai berdasarkan pertanyaan pengguna "
            "dan data referensi resmi yang diberikan berikut ini.\n\n"
            "--- DATA REFERENSI BATIK RESMI ---\n"
            f"{context_str}\n"
            "-----------------------------------\n\n"
            "Petunjuk Jawaban:\n"
            "1. Jawablah langsung dalam Bahasa Indonesia yang santun, jelas, dan menarik.\n"
            "2. Gunakan informasi dari Data Referensi di atas untuk menjelaskan nama batik, motif, filosofi, dan kesesuaian acara.\n"
            "3. Jika ada detail tambahan yang berguna, sampaikan dengan gaya konsultan budaya.\n\n"
            f"Pertanyaan Pengguna: {req.query}\n\n"
            "Jawaban Rekomendasi Anda:"
        )

        # 4. Panggil LLM Qwen di Hugging Face
        llm_response = await rag_service.ask_qwen_llm(system_prompt)

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
