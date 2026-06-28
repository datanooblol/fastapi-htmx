from uuid import uuid4

import duckdb


class DuckDBEngagementRepository:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def record(self, article_id: str, engagement_type: str, format: str | None = None, platform: str | None = None) -> None:
        self.db.execute(
            "INSERT INTO engagements (id, article_id, engagement_type, format, platform) VALUES (?, ?, ?, ?, ?)",
            [uuid4().hex, article_id, engagement_type, format, platform],
        )

    def get_stats_for_article(self, article_id: str) -> dict[str, int]:
        result = self.db.execute(
            "SELECT engagement_type, COUNT(*) FROM engagements WHERE article_id = ? GROUP BY engagement_type",
            [article_id],
        )
        return dict(result.fetchall())

    def get_aggregate_stats(self, user_id: str, days: int | None = None) -> dict[str, int]:
        if days:
            result = self.db.execute(
                """SELECT e.engagement_type, COUNT(*)
                   FROM engagements e JOIN articles a ON e.article_id = a.id
                   WHERE a.user_id = ? AND e.created_at >= now() - INTERVAL ? DAY
                   GROUP BY e.engagement_type""",
                [user_id, days],
            )
        else:
            result = self.db.execute(
                """SELECT e.engagement_type, COUNT(*)
                   FROM engagements e JOIN articles a ON e.article_id = a.id
                   WHERE a.user_id = ?
                   GROUP BY e.engagement_type""",
                [user_id],
            )
        return dict(result.fetchall())

    def get_recent_activity(self, user_id: str, limit: int = 10) -> list[dict]:
        result = self.db.execute(
            """SELECT e.engagement_type, e.format, e.platform, e.created_at, a.title
               FROM engagements e JOIN articles a ON e.article_id = a.id
               WHERE a.user_id = ?
               ORDER BY e.created_at DESC LIMIT ?""",
            [user_id, limit],
        )
        columns = [desc[0] for desc in result.description]
        return [dict(zip(columns, row)) for row in result.fetchall()]
