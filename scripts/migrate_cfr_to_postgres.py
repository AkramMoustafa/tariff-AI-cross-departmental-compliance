import sys
import os
import json
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.api.db import SessionLocal, engine, Base
from sqlalchemy.orm import Session
from src.api.db import SessionLocal, engine, Base
from src.api.models import CFRTitle, CFRChapter, CFRPart, CFRSection
from src.core.regulations.cfr_loader import CFRLoader

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def migrate_title(title_number: int):
    db = SessionLocal()
    loader = CFRLoader()
    
    print(f"Loading Title {title_number} from JSON...")
    data = loader.load_title(title_number)
    
    if not data:
        print(f"Skipping Title {title_number} (Not found)")
        db.close()
        return

    # CHECK IF EXISTS FIRST
    existing_title = db.query(CFRTitle).filter(CFRTitle.title_number == data["title_number"]).first()
    if existing_title:
        print(f" Title {title_number} already exists in DB. Skipping to avoid duplicates.")
        db.close()
        return

   
    title = CFRTitle(
        title_number=data["title_number"],
        name=data.get("title_name"),
        amendment_date=data.get("amendment_date")
    )
    db.add(title)
    db.commit()
    db.refresh(title)


    # 2. Process Hierarchy
    count_sections = 0
    
    for ch_data in data.get("chapters", []):
        chapter = CFRChapter(
            title_id=title.id,
            chapter_id_code=ch_data.get("chapter_id"),
            heading=ch_data.get("chapter_heading")
        )
        db.add(chapter)
        db.commit()
        db.refresh(chapter)

        for p_data in ch_data.get("parts", []):
            part = CFRPart(
                chapter_id=chapter.id,
                part_number=p_data.get("part_number"),
                heading=p_data.get("part_heading")
            )
            db.add(part)
            db.commit()
            db.refresh(part)

            sections_to_add = []
            for s_data in p_data.get("sections", []):
                # Construct full ID if missing from JSON, or use existing
                full_id = s_data.get("id") or f"{title_number}-{p_data['part_number']}-{s_data['section_number']}"
                
                text_combined = "\n".join(s_data.get("regulation_text", []))
                
                sections_to_add.append(CFRSection(
                    part_id=part.id,
                    full_id=full_id,
                    section_number=s_data.get("section_number"),
                    heading=s_data.get("heading"),
                    full_text=text_combined,
                    citations=s_data.get("citations", [])
                ))
            
            db.bulk_save_objects(sections_to_add)
            count_sections += len(sections_to_add)
            db.commit()

    print(f"✅ Migrated Title {title_number}: {count_sections} sections added.")
    db.close()

if __name__ == "__main__":
    # Loop from 1 to 50 (range stops BEFORE the second number, so use 51)
    for i in range(1, 51): 
        try:
            migrate_title(i)
        except Exception as e:
            print(f"Failed to migrate Title {i}: {e}")