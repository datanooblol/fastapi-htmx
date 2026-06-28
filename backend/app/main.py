from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.repositories.duckdb.connection import get_db, close_db
from app.repositories.duckdb.migrations import run_migrations
from app.routers import dashboard, sources, prompts, notes, synapse, articles, muse, graph, publish, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = get_db()
    run_migrations(db)
    upload_dir = settings.BASE_DIR / settings.UPLOAD_DIR
    upload_dir.mkdir(parents=True, exist_ok=True)
    yield
    close_db()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=Path(__file__).parent.parent / "static"), name="static")

app.include_router(dashboard.router, prefix="/api")
app.include_router(sources.router, prefix="/api")
app.include_router(prompts.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(synapse.router, prefix="/api")
app.include_router(articles.router, prefix="/api")
app.include_router(muse.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(publish.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
