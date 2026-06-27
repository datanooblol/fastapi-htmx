from uuid import uuid4

import duckdb

from app.models.summary import Summary, SummaryCreate


class DuckDBSummaryRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def _row_to_summary(self, row: tuple, columns: list[str]) -> Summary:
        return Summary(**dict(zip(columns, row)))

    def create(self, user_id: str, summary: SummaryCreate) -> Summary:
        summary_id = uuid4().hex
        self.db.execute(
            """INSERT INTO summaries (id, user_id, source_id, prompt_template_id, prompt_text_used, content)
               VALUES (?, ?, ?, ?, ?, ?)""",
            [summary_id, user_id, summary.source_id, summary.prompt_template_id,
             summary.prompt_text_used, summary.content],
        )
        return self.get_by_id(summary_id)

    def list_by_source(self, source_id: str) -> list[Summary]:
        result = self.db.execute(
            """SELECT s.*, pt.name as prompt_name
               FROM summaries s
               LEFT JOIN prompt_templates pt ON s.prompt_template_id = pt.id
               WHERE s.source_id = ? ORDER BY s.created_at DESC""",
            [source_id],
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_summary(row, columns) for row in result.fetchall()]

    def get_by_id(self, summary_id: str) -> Summary | None:
        result = self.db.execute(
            """SELECT s.*, pt.name as prompt_name
               FROM summaries s
               LEFT JOIN prompt_templates pt ON s.prompt_template_id = pt.id
               WHERE s.id = ?""",
            [summary_id],
        )
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        if row is None:
            return None
        return self._row_to_summary(row, columns)

    def delete(self, summary_id: str) -> bool:
        result = self.db.execute(
            "DELETE FROM summaries WHERE id = ? RETURNING id", [summary_id]
        )
        return result.fetchone() is not None
