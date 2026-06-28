from uuid import uuid4

import duckdb

from app.models.article import ArticleSection, ArticleSectionCreate, ArticleSectionUpdate, ArticleSectionRef


class DuckDBArticleSectionRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def _row_to_section(self, row: tuple, columns: list[str]) -> ArticleSection:
        return ArticleSection(**dict(zip(columns, row)))

    def _row_to_ref(self, row: tuple, columns: list[str]) -> ArticleSectionRef:
        return ArticleSectionRef(**dict(zip(columns, row)))

    def create(self, user_id: str, article_id: str, data: ArticleSectionCreate) -> ArticleSection:
        section_id = uuid4().hex
        self.db.execute(
            "INSERT INTO article_sections (id, user_id, article_id, position, title, brief) VALUES (?, ?, ?, ?, ?, ?)",
            [section_id, user_id, article_id, data.position, data.title, data.brief],
        )
        return self.get_by_id(section_id)

    def get_by_id(self, section_id: str) -> ArticleSection | None:
        result = self.db.execute("SELECT * FROM article_sections WHERE id = ?", [section_id])
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        return self._row_to_section(row, columns) if row else None

    def list_by_article(self, article_id: str) -> list[ArticleSection]:
        result = self.db.execute(
            "SELECT * FROM article_sections WHERE article_id = ? ORDER BY position", [article_id]
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_section(row, columns) for row in result.fetchall()]

    def update(self, section_id: str, data: ArticleSectionUpdate) -> ArticleSection | None:
        updates = data.model_dump(exclude_none=True)
        if not updates:
            return self.get_by_id(section_id)
        if "content" in updates:
            content = updates["content"]
            updates["word_count"] = len(content.split()) if content else 0
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [section_id]
        self.db.execute(f"UPDATE article_sections SET {set_clause}, updated_at = now() WHERE id = ?", values)
        return self.get_by_id(section_id)

    def delete(self, section_id: str) -> bool:
        self.db.execute("DELETE FROM article_section_refs WHERE section_id = ?", [section_id])
        result = self.db.execute("DELETE FROM article_sections WHERE id = ? RETURNING id", [section_id])
        return result.fetchone() is not None

    # --- Section Refs ---

    def add_ref(self, section_id: str, ref_id: str, ref_type: str) -> ArticleSectionRef:
        ref_link_id = uuid4().hex
        self.db.execute(
            "INSERT INTO article_section_refs (id, section_id, ref_id, ref_type) VALUES (?, ?, ?, ?)",
            [ref_link_id, section_id, ref_id, ref_type],
        )
        return self.get_ref_by_id(ref_link_id)

    def get_ref_by_id(self, ref_link_id: str) -> ArticleSectionRef | None:
        result = self.db.execute("SELECT * FROM article_section_refs WHERE id = ?", [ref_link_id])
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        return self._row_to_ref(row, columns) if row else None

    def list_refs_by_section(self, section_id: str) -> list[ArticleSectionRef]:
        result = self.db.execute(
            "SELECT * FROM article_section_refs WHERE section_id = ? ORDER BY position", [section_id]
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_ref(row, columns) for row in result.fetchall()]

    def remove_ref(self, ref_link_id: str) -> bool:
        result = self.db.execute("DELETE FROM article_section_refs WHERE id = ? RETURNING id", [ref_link_id])
        return result.fetchone() is not None
