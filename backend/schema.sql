DROP TABLE IF EXISTS ratings, stores, users CASCADE;
DROP TYPE IF EXISTS user_role;

CREATE TYPE user_role AS ENUM ('admin', 'user', 'owner');

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL CHECK (char_length(name) BETWEEN 20 AND 60),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  address       VARCHAR(400) NOT NULL DEFAULT '',
  role          user_role    NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE stores (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL CHECK (char_length(name) BETWEEN 20 AND 60),
  email      VARCHAR(255) NOT NULL UNIQUE,
  address    VARCHAR(400) NOT NULL,
  owner_id   INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE ratings (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER  NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  store_id   INTEGER  NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, store_id)
);

CREATE INDEX idx_ratings_store ON ratings(store_id);
CREATE INDEX idx_users_role ON users(role);
