-- Digital Wallet schema (PostgreSQL)
-- Matches Sequelize models in this project (UUID PKs, BIGINT cents, SERIALIZABLE transfers).

-- UUID helpers
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Transaction type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_transaction_type') THEN
    CREATE TYPE wallet_transaction_type AS ENUM ('CREDIT', 'DEBIT', 'TRANSFER');
  END IF;
END $$;

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(320) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  name varchar(100),
  daily_transfer_limit_cents bigint NOT NULL DEFAULT 100000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance_cents bigint NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER wallets_set_updated_at
BEFORE UPDATE ON wallets
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type wallet_transaction_type NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),

  sender_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  receiver_user_id uuid REFERENCES users(id) ON DELETE SET NULL,

  meta jsonb NULL,
  category varchar(50) NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Consistency: enforce sender/receiver shape by transaction type
  CONSTRAINT wallet_transactions_sender_receiver_shape CHECK (
    (type = 'CREDIT' AND sender_user_id IS NULL AND receiver_user_id IS NOT NULL)
    OR
    (type = 'DEBIT' AND sender_user_id IS NOT NULL AND receiver_user_id IS NULL)
    OR
    (type = 'TRANSFER' AND sender_user_id IS NOT NULL AND receiver_user_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS wallet_transactions_sender_idx ON wallet_transactions(sender_user_id);
CREATE INDEX IF NOT EXISTS wallet_transactions_receiver_idx ON wallet_transactions(receiver_user_id);
CREATE INDEX IF NOT EXISTS wallet_transactions_created_at_idx ON wallet_transactions(created_at);

CREATE TRIGGER wallet_transactions_set_updated_at
BEFORE UPDATE ON wallet_transactions
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

