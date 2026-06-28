import duckdb
from app.config import settings


_connection: duckdb.DuckDBPyConnection | None = None


def get_db() -> duckdb.DuckDBPyConnection:
    global _connection
    if _connection is None:
        db_path = settings.BASE_DIR / settings.DATABASE_PATH
        db_path.parent.mkdir(parents=True, exist_ok=True)
        _connection = duckdb.connect(str(db_path))
    return _connection


def close_db() -> None:
    global _connection
    if _connection is not None:
        _connection.close()
        _connection = None
