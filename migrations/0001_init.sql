CREATE TABLE problems (
  id TEXT PRIMARY KEY,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tag TEXT NOT NULL,
  channel TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  incoming TEXT NOT NULL,
  reply TEXT NOT NULL,
  reading TEXT NOT NULL
);

CREATE TABLE plays (
  id TEXT PRIMARY KEY,
  anon_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  salary INTEGER NOT NULL,
  completed_count INTEGER NOT NULL,
  kpm REAL,
  accuracy REAL,
  miss_count INTEGER NOT NULL,
  max_combo INTEGER NOT NULL,
  key_stats TEXT NOT NULL,
  finger_stats TEXT NOT NULL,
  bigram_stats TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_plays_anon ON plays (anon_id, created_at);
CREATE INDEX idx_problems_difficulty ON problems (difficulty);
