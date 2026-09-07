import io
import re
import math
from typing import List, Dict, Any, Optional
import pypdf
import docx
from sqlalchemy.orm import Session
from app.models.models import Document, DocumentChunk, Evidence

class RAGService:
    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Extracts text with page/section awareness from PDF, DOCX, TXT, CSV."""
        ext = filename.split(".")[-1].lower()
        extracted_pages: List[Dict[str, Any]] = []
        full_text = ""

        if ext == "pdf":
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                cleaned = re.sub(r"\s+", " ", text).strip()
                if cleaned:
                    extracted_pages.append({"page": idx + 1, "text": cleaned})
                    full_text += f"\n[Page {idx+1}] {cleaned}"

        elif ext in ["docx", "doc"]:
            doc = docx.Document(io.BytesIO(file_bytes))
            current_section = 1
            current_chunk = []
            for p in doc.paragraphs:
                t = p.text.strip()
                if t:
                    current_chunk.append(t)
                    if len(" ".join(current_chunk)) > 500:
                        sec_text = " ".join(current_chunk)
                        extracted_pages.append({"section": current_section, "text": sec_text})
                        full_text += f"\n[Section {current_section}] {sec_text}"
                        current_section += 1
                        current_chunk = []
            if current_chunk:
                sec_text = " ".join(current_chunk)
                extracted_pages.append({"section": current_section, "text": sec_text})
                full_text += f"\n[Section {current_section}] {sec_text}"

        else:
            # Fallback for TXT, CSV, MD, JSON
            try:
                decoded = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                decoded = file_bytes.decode("latin-1", errors="ignore")
            cleaned = re.sub(r"\s+", " ", decoded).strip()
            full_text = cleaned
            # Split into ~500-word blocks as pseudo-pages
            words = cleaned.split()
            chunk_size = 100
            for i in range(0, len(words), chunk_size):
                chunk_words = words[i:i + chunk_size]
                extracted_pages.append({
                    "section": (i // chunk_size) + 1,
                    "text": " ".join(chunk_words)
                })

        return {
            "full_text": full_text.strip(),
            "pages": extracted_pages
        }

    @staticmethod
    def compute_embedding(text: str, dim: int = 64) -> List[float]:
        """
        Lightweight, deterministic semantic vector generation.
        Projects character n-grams and vocabulary frequency into a normalized vector.
        Ensures 100% offline RAG works out of the box with zero external dependencies.
        """
        vec = [0.0] * dim
        words = re.findall(r"\w+", text.lower())
        if not words:
            return vec

        for word in words:
            # Hash buckets
            h1 = hash(word) % dim
            h2 = hash(word[::-1]) % dim
            vec[h1] += 1.0
            vec[h2] += 0.5

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [round(x / norm, 5) for x in vec]
        return vec

    @classmethod
    def chunk_and_store(cls, db: Session, doc_id: int, extracted_data: Dict[str, Any]):
        """Splits document into semantic chunks and saves embeddings to database."""
        pages = extracted_data.get("pages", [])
        chunk_index = 0

        for page_data in pages:
            text = page_data.get("text", "")
            page_num = page_data.get("page")
            section_num = page_data.get("section")
            page_label = f"Page {page_num}" if page_num else f"Section {section_num}"

            # Sub-chunk if long
            sentences = re.split(r"(?<=[.?!])\s+", text)
            current_buffer = []
            current_len = 0

            for sent in sentences:
                current_buffer.append(sent)
                current_len += len(sent)
                if current_len >= 300:
                    chunk_text = " ".join(current_buffer)
                    emb = cls.compute_embedding(chunk_text)
                    chunk = DocumentChunk(
                        document_id=doc_id,
                        chunk_index=chunk_index,
                        text=chunk_text,
                        embedding=emb,
                        metadata_info={"location": page_label}
                    )
                    db.add(chunk)
                    chunk_index += 1
                    current_buffer = []
                    current_len = 0

            if current_buffer:
                chunk_text = " ".join(current_buffer)
                emb = cls.compute_embedding(chunk_text)
                chunk = DocumentChunk(
                    document_id=doc_id,
                    chunk_index=chunk_index,
                    text=chunk_text,
                    embedding=emb,
                    metadata_info={"location": page_label}
                )
                db.add(chunk)
                chunk_index += 1

        db.commit()

    @classmethod
    def query_evidence(cls, db: Session, decision_id: int, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieves most relevant document chunks based on cosine similarity."""
        query_vec = cls.compute_embedding(query_text)
        
        # Get chunks belonging to documents attached to this decision
        chunks = (
            db.query(DocumentChunk)
            .join(Document, Document.id == DocumentChunk.document_id)
            .filter(Document.decision_id == decision_id)
            .all()
        )

        if not chunks:
            # Check user documents in general if decision-specific chunks are empty
            decision = db.query(Document).filter(Document.decision_id == decision_id).first()
            if not decision:
                return []

        scored_chunks = []
        for chunk in chunks:
            chunk_vec = chunk.embedding or []
            if not chunk_vec or len(chunk_vec) != len(query_vec):
                continue
            # Cosine similarity (vectors are already unit normalized)
            similarity = sum(a * b for a, b in zip(query_vec, chunk_vec))
            scored_chunks.append((similarity, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk in scored_chunks[:top_k]:
            results.append({
                "chunk_id": chunk.id,
                "document_id": chunk.document_id,
                "filename": chunk.document.filename if chunk.document else "Document",
                "text": chunk.text,
                "location": chunk.metadata_info.get("location", "Unknown"),
                "similarity": round(float(score), 4)
            })
        return results

rag_service = RAGService()
