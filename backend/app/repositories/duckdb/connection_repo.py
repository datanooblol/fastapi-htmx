from uuid import uuid4

import duckdb

from app.models.connection import Connection


class DuckDBConnectionRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def _row_to_connection(self, row: tuple, columns: list[str]) -> Connection:
        return Connection(**dict(zip(columns, row)))

    def create(self, user_id: str, data: dict) -> Connection:
        conn_id = uuid4().hex
        self.db.execute(
            """INSERT INTO connections (id, user_id, node_a_id, node_a_type, node_b_id, node_b_type,
               relationship_type, strength, status, ai_reason)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            [conn_id, user_id, data["node_a_id"], data["node_a_type"],
             data["node_b_id"], data["node_b_type"],
             data.get("relationship_type"), data.get("strength", "moderate"),
             data.get("status", "confirmed"), data.get("ai_reason")],
        )
        return self.get_by_id(conn_id)

    def get_by_id(self, conn_id: str) -> Connection | None:
        result = self.db.execute("SELECT * FROM connections WHERE id = ?", [conn_id])
        columns = [desc[0] for desc in result.description]
        row = result.fetchone()
        if row is None:
            return None
        return self._row_to_connection(row, columns)

    def exists(self, node_a_id: str, node_b_id: str) -> bool:
        result = self.db.execute(
            """SELECT COUNT(*) FROM connections
               WHERE ((node_a_id = ? AND node_b_id = ?) OR (node_a_id = ? AND node_b_id = ?))
               AND status != 'rejected'""",
            [node_a_id, node_b_id, node_b_id, node_a_id],
        )
        return result.fetchone()[0] > 0

    def list_all(self, user_id: str, status: str | None = None) -> list[Connection]:
        if status:
            result = self.db.execute(
                "SELECT * FROM connections WHERE user_id = ? AND status = ? ORDER BY created_at DESC",
                [user_id, status],
            )
        else:
            result = self.db.execute(
                "SELECT * FROM connections WHERE user_id = ? ORDER BY created_at DESC",
                [user_id],
            )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_connection(row, columns) for row in result.fetchall()]

    def update_status(self, conn_id: str, status: str) -> Connection | None:
        self.db.execute(
            "UPDATE connections SET status = ?, updated_at = now() WHERE id = ?",
            [status, conn_id],
        )
        return self.get_by_id(conn_id)

    def delete(self, conn_id: str) -> bool:
        result = self.db.execute("DELETE FROM connections WHERE id = ? RETURNING id", [conn_id])
        return result.fetchone() is not None

    def count(self, user_id: str) -> int:
        return self.db.execute(
            "SELECT COUNT(*) FROM connections WHERE user_id = ? AND status = 'confirmed'",
            [user_id],
        ).fetchone()[0]

    def list_for_node(self, node_id: str, node_type: str) -> list[Connection]:
        result = self.db.execute(
            """SELECT * FROM connections
               WHERE (node_a_id = ? AND node_a_type = ?) OR (node_b_id = ? AND node_b_type = ?)
               ORDER BY created_at DESC""",
            [node_id, node_type, node_id, node_type],
        )
        columns = [desc[0] for desc in result.description]
        return [self._row_to_connection(row, columns) for row in result.fetchall()]
