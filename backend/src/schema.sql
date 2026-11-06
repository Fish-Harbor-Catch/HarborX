CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK (role IN ('seller','buyer','admin')), phone TEXT NOT NULL DEFAULT '',
 boat_name TEXT NOT NULL DEFAULT '', verified BOOLEAN NOT NULL DEFAULT FALSE, active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS lots (
 id UUID PRIMARY KEY, code TEXT NOT NULL UNIQUE, seller_id UUID NOT NULL REFERENCES users(id),
 species TEXT NOT NULL, grade TEXT NOT NULL, weight NUMERIC(12,2) NOT NULL CHECK(weight>0),
 actual_weight NUMERIC(12,2) CHECK(actual_weight>0), base_price NUMERIC(12,2) NOT NULL CHECK(base_price>0),
 min_increment NUMERIC(12,2) NOT NULL DEFAULT 50 CHECK(min_increment>0), harbor TEXT NOT NULL,
 boat_name TEXT NOT NULL DEFAULT '', arrival_at TIMESTAMPTZ NOT NULL, notes TEXT NOT NULL DEFAULT '',
 image_key TEXT NOT NULL DEFAULT 'tuna', status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','scheduled','live','closed','cancelled','unsold')),
 round INTEGER NOT NULL DEFAULT 0 CHECK(round BETWEEN 0 AND 3), round_ends_at TIMESTAMPTZ,
 arrived BOOLEAN NOT NULL DEFAULT FALSE, highest_bid NUMERIC(12,2), highest_buyer_id UUID REFERENCES users(id),
 winner_id UUID REFERENCES users(id), final_price NUMERIC(14,2), commission NUMERIC(14,2),
 commission_rate NUMERIC(5,2), payment_due_at TIMESTAMPTZ, cancel_reason TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), closed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS bids (
 id UUID PRIMARY KEY, lot_id UUID NOT NULL REFERENCES lots(id), buyer_id UUID NOT NULL REFERENCES users(id),
 amount NUMERIC(12,2) NOT NULL CHECK(amount>0), round INTEGER NOT NULL,
 request_key UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(buyer_id,request_key)
);
CREATE INDEX IF NOT EXISTS bids_lot_idx ON bids(lot_id,created_at);
CREATE TABLE IF NOT EXISTS payments (
 id UUID PRIMARY KEY, lot_id UUID NOT NULL REFERENCES lots(id), amount NUMERIC(14,2) NOT NULL CHECK(amount>0),
 reference TEXT NOT NULL, recorded_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_events (
 id UUID PRIMARY KEY, lot_id UUID REFERENCES lots(id), actor_id UUID REFERENCES users(id),
 action TEXT NOT NULL, detail TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS lots_seller_idx ON lots(seller_id);
CREATE INDEX IF NOT EXISTS payments_lot_idx ON payments(lot_id);
