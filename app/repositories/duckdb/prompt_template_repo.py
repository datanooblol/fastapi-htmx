from uuid import uuid4

import duckdb

from app.models.prompt_template import PromptTemplate, PromptTemplateCreate


class DuckDBPromptTemplateRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def _row_to_template(self, row: tuple, columns: list[str]) -> PromptTemplate:
        return PromptTemplate(**dict(zip(columns, row)))

    def create(self, user_id: str, template: PromptTemplateCreate) -> PromptTemplate:
        template_id = uuid4().hex
        self.db.execute(
            """INSERT INTO prompt_templates (id, user_id, name, prompt_text, is_default)
               VALUES (?, ?, ?, ?, ?)""",
            [template_id, user_id, template.name, template.prompt_text, template.is_default],
        )
        return self.get_by_id(template_id)

    def list_all(self, user_id: str) -> list[PromptTemplate]:
        result = self.db.execute(
            "SELECT * FROM prompt_templates WHERE user_id = ? OR user_id = 'default' ORDER BY is_default DESC, name",
            [user_id],
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_template(row, columns) for row in result.fetchall()]

    def get_by_id(self, template_id: str) -> PromptTemplate | None:
        result = self.db.execute(
            "SELECT * FROM prompt_templates WHERE id = ?", [template_id]
        )
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        if row is None:
            return None
        return self._row_to_template(row, columns)

    def delete(self, template_id: str) -> bool:
        result = self.db.execute(
            "DELETE FROM prompt_templates WHERE id = ? AND is_default = FALSE RETURNING id",
            [template_id],
        )
        return result.fetchone() is not None
