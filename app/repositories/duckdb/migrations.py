import duckdb


TABLES = [
    """
    CREATE TABLE IF NOT EXISTS sources (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        title           VARCHAR NOT NULL,
        source_type     VARCHAR NOT NULL,
        raw_content     TEXT,
        file_path       VARCHAR,
        file_name       VARCHAR,
        file_size_bytes INTEGER,
        source_url      VARCHAR,
        word_count      INTEGER DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS notes (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        source_id       VARCHAR REFERENCES sources(id),
        title           VARCHAR NOT NULL,
        content         TEXT NOT NULL,
        word_count      INTEGER DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS prompt_templates (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        name            VARCHAR NOT NULL,
        prompt_text     TEXT NOT NULL,
        is_default      BOOLEAN DEFAULT FALSE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS summaries (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        source_id       VARCHAR NOT NULL REFERENCES sources(id),
        prompt_template_id VARCHAR REFERENCES prompt_templates(id),
        prompt_text_used TEXT,
        content         TEXT NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS concepts (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        name            VARCHAR NOT NULL,
        description     TEXT,
        synthesized_content TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS connections (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        node_a_id       VARCHAR NOT NULL,
        node_a_type     VARCHAR NOT NULL,
        node_b_id       VARCHAR NOT NULL,
        node_b_type     VARCHAR NOT NULL,
        relationship_type VARCHAR,
        strength        VARCHAR DEFAULT 'moderate',
        status          VARCHAR DEFAULT 'confirmed',
        ai_reason       TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS articles (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        title           VARCHAR NOT NULL,
        subtitle        VARCHAR,
        slug            VARCHAR,
        status          VARCHAR DEFAULT 'outline',
        visibility      VARCHAR DEFAULT 'public',
        excerpt         TEXT,
        cover_image_path VARCHAR,
        published_at    TIMESTAMPTZ,
        word_count      INTEGER DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS article_sections (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        article_id      VARCHAR NOT NULL REFERENCES articles(id),
        position        INTEGER NOT NULL,
        title           VARCHAR NOT NULL,
        brief           TEXT,
        content         TEXT,
        status          VARCHAR DEFAULT 'outline',
        word_count      INTEGER DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS article_section_refs (
        id              VARCHAR PRIMARY KEY,
        section_id      VARCHAR NOT NULL REFERENCES article_sections(id),
        ref_id          VARCHAR NOT NULL,
        ref_type        VARCHAR NOT NULL,
        position        INTEGER DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS tags (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        name            VARCHAR NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, name)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS item_tags (
        id              VARCHAR PRIMARY KEY,
        tag_id          VARCHAR NOT NULL REFERENCES tags(id),
        item_id         VARCHAR NOT NULL,
        item_type       VARCHAR NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS engagements (
        id              VARCHAR PRIMARY KEY,
        article_id      VARCHAR NOT NULL REFERENCES articles(id),
        engagement_type VARCHAR NOT NULL,
        format          VARCHAR,
        platform        VARCHAR,
        ip_hash         VARCHAR,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS ai_conversations (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        article_id      VARCHAR NOT NULL REFERENCES articles(id),
        section_id      VARCHAR,
        role            VARCHAR NOT NULL,
        content         TEXT NOT NULL,
        ai_action       VARCHAR,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS knowledge_log (
        id              VARCHAR PRIMARY KEY,
        user_id         VARCHAR NOT NULL DEFAULT 'default',
        action          VARCHAR NOT NULL,
        entity_type     VARCHAR NOT NULL,
        entity_id       VARCHAR NOT NULL,
        details         TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
]

DEFAULT_PROMPTS = [
    (
        "Default Summary",
        "Summarize the following document. Extract the key ideas, main arguments, and any actionable insights.\n\nFormat your response as:\n1. A brief overview paragraph (2-3 sentences)\n2. Key points as bullet points\n3. Any questions or areas worth exploring further\n\nSource text:\n{source_text}",
        True,
    ),
    (
        "Key Concepts Extraction",
        "Extract the key concepts from the following text. For each concept:\n- Name the concept\n- Define it in one sentence\n- Note how it relates to other concepts in the text\n\nSource text:\n{source_text}",
        False,
    ),
    (
        "Cornell Notes Format",
        "Convert the following text into Cornell Notes format:\n\n- LEFT COLUMN (Cues): Key questions and terms\n- RIGHT COLUMN (Notes): Detailed notes and explanations\n- BOTTOM (Summary): 3-5 sentence summary\n\nSource text:\n{source_text}",
        False,
    ),
]


def run_migrations(db: duckdb.DuckDBPyConnection) -> None:
    for ddl in TABLES:
        db.execute(ddl)

    existing = db.execute("SELECT COUNT(*) FROM prompt_templates").fetchone()[0]
    if existing == 0:
        from uuid import uuid4

        for name, text, is_default in DEFAULT_PROMPTS:
            db.execute(
                "INSERT INTO prompt_templates (id, name, prompt_text, is_default) VALUES (?, ?, ?, ?)",
                [uuid4().hex, name, text, is_default],
            )
