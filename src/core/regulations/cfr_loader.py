import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

# Import Database and Models
from src.api.db import SessionLocal
from src.api.models import CFRTitle, CFRChapter, CFRPart, CFRSection


class CFRLoader:
    """Load and search CFR regulations directly from PostgreSQL"""

    def load_title(self, title_number: int) -> Optional[Dict[str, Any]]:
        """
        Load a specific CFR title from PostgreSQL
        """
        db = SessionLocal()
        try:
            title = db.query(CFRTitle).filter(CFRTitle.title_number == title_number).first()
            if not title:
                return None
            
            return {
                "title_number": title.title_number,
                "title_name": title.name,
                "amendment_date": title.amendment_date,
                "chapters": [] # Hierarchy handled by relationship queries if needed
            }
        finally:
            db.close()

    def list_all_titles(self) -> List[Dict[str, Any]]:
        """
        List all available CFR titles from DB
        """
        db = SessionLocal()
        try:
            titles = db.query(CFRTitle).order_by(CFRTitle.title_number).all()
            return [{
                "title_number": t.title_number,
                "title_name": t.name,
                "amendment_date": t.amendment_date
            } for t in titles]
        finally:
            db.close()

    def get_section(self, title_number: int, part_number: str, 
                   section_number: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific regulation section from DB
        """
        db = SessionLocal()
        try:
            # Construct the full_id used in migration: "45-164-164.312"
            target_id = f"{title_number}-{part_number}-{section_number}"
            section = db.query(CFRSection).filter(CFRSection.full_id == target_id).first()
            
            if not section:
                return None
            
            return {
                "id": section.full_id,
                "section_number": section.section_number,
                "heading": section.heading,
                "regulation_text": section.full_text.split("\n"),
                "citations": section.citations
            }
        finally:
            db.close()

    def search_regulations(self, query: str, title_number: Optional[int] = None,
                          limit: int = 50) -> List[Dict[str, Any]]:
        """
        Search regulations by text using PostgreSQL ILIKE
        """
        db = SessionLocal()
        try:
            search_filter = f"%{query}%"
            sql_query = db.query(CFRSection).filter(
                or_(
                    CFRSection.heading.ilike(search_filter),
                    CFRSection.full_text.ilike(search_filter)
                )
            )

            # Filter by title if provided
            if title_number:
                sql_query = sql_query.join(CFRPart).join(CFRChapter).join(CFRTitle).filter(
                    CFRTitle.title_number == title_number
                )

            sections = sql_query.limit(limit).all()
            
            return [{
                "id": s.full_id,
                "title_number": title_number, # Simplified match
                "section_number": s.section_number,
                "heading": s.heading,
                "match_type": "text"
            } for s in sections]
        finally:
            db.close()

    def get_regulation_by_id(self, reg_id: str) -> Optional[Dict[str, Any]]:
        """
        Get regulation by full ID (e.g., "45-164-164.312")
        """
        db = SessionLocal()
        try:
            section = db.query(CFRSection).filter(CFRSection.full_id == reg_id).first()
            if not section:
                return None
            return {
                "id": section.full_id,
                "heading": section.heading,
                "regulation_text": section.full_text.split("\n")
            }
        finally:
            db.close()


# Global instance
cfr_loader = CFRLoader()

# Convenience functions for router compatibility
def load_title(title_number: int) -> Optional[Dict]:
    return cfr_loader.load_title(title_number)

def search_cfr(query: str, title: Optional[int] = None) -> List[Dict]:
    return cfr_loader.search_regulations(query, title)

def get_regulation(reg_id: str) -> Optional[Dict]:
    return cfr_loader.get_regulation_by_id(reg_id)  