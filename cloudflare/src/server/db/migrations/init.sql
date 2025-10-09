-- Delete this after having real migrations, this is just to make the local SQLite file show up in .wrangler/
-- when running wrangler d1 migrations apply DB --local AKA cf:migrate

-- Migration placeholder
CREATE TABLE IF NOT EXISTS _placeholder (id INTEGER PRIMARY KEY);