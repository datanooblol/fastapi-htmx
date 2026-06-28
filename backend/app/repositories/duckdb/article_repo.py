from uuid import uuid4

import duckdb

from app.models.article import Article, ArticleCreate, ArticleUpdate


class DuckDBArticleRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def _row_to_article(self, row: tuple, columns: list[str]) -> Article:
        return Article(**dict(zip(columns, row)))

    def create(self, user_id: str, data: ArticleCreate) -> Article:
        article_id = uuid4().hex
        self.db.execute(
            "INSERT INTO articles (id, user_id, title, subtitle) VALUES (?, ?, ?, ?)",
            [article_id, user_id, data.title, data.subtitle],
        )
        return self.get_by_id(article_id)

    def get_by_id(self, article_id: str) -> Article | None:
        result = self.db.execute("SELECT * FROM articles WHERE id = ?", [article_id])
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        return self._row_to_article(row, columns) if row else None

    def list_all(self, user_id: str, status: str | None = None) -> list[Article]:
        if status:
            result = self.db.execute(
                "SELECT * FROM articles WHERE user_id = ? AND status = ? ORDER BY updated_at DESC",
                [user_id, status],
            )
        else:
            result = self.db.execute(
                "SELECT * FROM articles WHERE user_id = ? ORDER BY updated_at DESC",
                [user_id],
            )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_article(row, columns) for row in result.fetchall()]

    def update(self, article_id: str, data: ArticleUpdate) -> Article | None:
        updates = data.model_dump(exclude_none=True)
        if not updates:
            return self.get_by_id(article_id)
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [article_id]
        self.db.execute(f"UPDATE articles SET {set_clause}, updated_at = now() WHERE id = ?", values)
        return self.get_by_id(article_id)

    def delete(self, article_id: str) -> bool:
        self.db.execute("DELETE FROM article_section_refs WHERE section_id IN (SELECT id FROM article_sections WHERE article_id = ?)", [article_id])
        self.db.execute("DELETE FROM article_sections WHERE article_id = ?", [article_id])
        self.db.execute("DELETE FROM ai_conversations WHERE article_id = ?", [article_id])
        result = self.db.execute("DELETE FROM articles WHERE id = ? RETURNING id", [article_id])
        return result.fetchone() is not None

    def count(self, user_id: str) -> int:
        return self.db.execute("SELECT COUNT(*) FROM articles WHERE user_id = ?", [user_id]).fetchone()[0]

    def count_by_status(self, user_id: str) -> dict[str, int]:
        result = self.db.execute(
            "SELECT status, COUNT(*) FROM articles WHERE user_id = ? GROUP BY status", [user_id]
        )
        return dict(result.fetchall())
