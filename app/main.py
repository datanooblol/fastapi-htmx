from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.repositories.duckdb.connection import get_db, close_db
from app.repositories.duckdb.migrations import run_migrations
from app.routers import dashboard, sources, prompts


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = get_db()
    run_migrations(db)
    upload_dir = settings.BASE_DIR / settings.UPLOAD_DIR
    upload_dir.mkdir(parents=True, exist_ok=True)
    yield
    close_db()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.mount("/static", StaticFiles(directory=Path(__file__).parent.parent / "static"), name="static")

app.include_router(dashboard.router)
app.include_router(sources.router)
app.include_router(prompts.router)
