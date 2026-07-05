-- Phase 0 — multi-tenant schema (Postgres).
-- Content tables (topics, questions, eval_skills) are a PROJECTION of the config
-- files in topics/ and are populated by the importer — never hand-edited.
-- Per-user tables carry user_id and are strictly owner-scoped.

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- content projection (derived from topics/, content-hash keyed) ----------

CREATE TABLE topics (
    id             TEXT PRIMARY KEY,          -- topic.yaml id
    title          TEXT NOT NULL,
    description    TEXT NOT NULL DEFAULT '',
    pass_threshold REAL NOT NULL DEFAULT 0.7,
    tag_weights    JSONB NOT NULL DEFAULT '{}',
    content_hash   TEXT NOT NULL,
    imported_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE questions (
    id           TEXT PRIMARY KEY,            -- question id (unique per import set)
    topic_id     TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK (type IN ('multiple_choice','text_input','essay','code')),
    tags         JSONB NOT NULL DEFAULT '[]',
    difficulty   SMALLINT,
    spec         JSONB NOT NULL,              -- full validated question config
    content_hash TEXT NOT NULL
);
CREATE INDEX questions_topic_idx ON questions(topic_id);

CREATE TABLE eval_skills (
    id             TEXT PRIMARY KEY,
    topic_id       TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    applies_to     TEXT NOT NULL,
    output_schema  TEXT NOT NULL,
    body           TEXT NOT NULL,
    -- latest meta-eval gate result; a skill below threshold may not grade real users.
    meta_eval_score REAL,
    meta_eval_status TEXT NOT NULL DEFAULT 'unmeasured'
        CHECK (meta_eval_status IN ('unmeasured','passing','needs-work')),
    content_hash   TEXT NOT NULL
);

-- ---------------------------- per-user session state ----------------------------

CREATE TABLE sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode        TEXT NOT NULL DEFAULT 'practice' CHECK (mode IN ('practice','mock')),
    seed        BIGINT NOT NULL,               -- reproducible randomization
    config      JSONB NOT NULL DEFAULT '{}',   -- topics/tags/count/time limit
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX sessions_user_idx ON sessions(user_id);

CREATE TABLE attempts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id  TEXT NOT NULL,
    answer       JSONB,                        -- submitted answer
    eval_output  JSONB,                        -- evaluator result (checks, feedback)
    score        REAL,
    verdict      TEXT CHECK (verdict IN ('pass','borderline','fail')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX attempts_session_idx ON attempts(session_id);
CREATE INDEX attempts_user_idx ON attempts(user_id);

-- ------------------------------- async grading -------------------------------

CREATE TABLE grading_jobs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id   UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued','running','done','flagged','failed')),
    escalation   JSONB NOT NULL DEFAULT '[]',  -- best-of-3 / bigger-model trail
    worker       TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX grading_jobs_status_idx ON grading_jobs(status);

-- Cases the engine could not grade with confidence — an admin works this queue.
CREATE TABLE review_queue (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id  UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    reason      TEXT NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- ---------------------- adaptive practice + spaced repetition ----------------------

CREATE TABLE mastery (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    tag         TEXT,                          -- nullable: per-question or per-tag rollup
    attempts    INTEGER NOT NULL DEFAULT 0,
    correct     INTEGER NOT NULL DEFAULT 0,
    strength    REAL NOT NULL DEFAULT 0,       -- 0..1 mastery estimate
    PRIMARY KEY (user_id, question_id)
);

CREATE TABLE review_schedule (
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id  TEXT NOT NULL,
    ease         REAL NOT NULL DEFAULT 2.5,    -- SM-2 ease factor
    interval_days INTEGER NOT NULL DEFAULT 0,
    due_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, question_id)
);
CREATE INDEX review_schedule_due_idx ON review_schedule(user_id, due_at);
