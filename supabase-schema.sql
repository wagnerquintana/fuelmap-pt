-- FuelMap PT — Schema Supabase
-- Executar no SQL Editor do Supabase Dashboard

-- Tabela de postos de combustível (sincronizada da DGEG)
CREATE TABLE IF NOT EXISTS fuel_stations (
  id TEXT PRIMARY KEY,                    -- ID DGEG
  name TEXT NOT NULL,
  brand TEXT,
  address TEXT,
  locality TEXT,                          -- Localidade (ex: Mem Martins, Carcavelos)
  municipality TEXT,
  district TEXT,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  schedule TEXT,
  fuels JSONB DEFAULT '[]',              -- [{ type, price, updated_at }]
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stations_district ON fuel_stations(district);
CREATE INDEX IF NOT EXISTS idx_stations_municipality ON fuel_stations(municipality);
CREATE INDEX IF NOT EXISTS idx_stations_locality ON fuel_stations(locality);
CREATE INDEX IF NOT EXISTS idx_stations_location ON fuel_stations USING GIST (point(lng, lat));

-- Tabela de favoritos (ligada ao utilizador Supabase Auth)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id TEXT NOT NULL REFERENCES fuel_stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, station_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Row Level Security
ALTER TABLE fuel_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Postos: leitura pública
CREATE POLICY "Postos visíveis para todos"
  ON fuel_stations FOR SELECT
  USING (true);

-- Favoritos: só o próprio utilizador
CREATE POLICY "Favoritos só do próprio"
  ON favorites FOR ALL
  USING (auth.uid() = user_id);

-- Função para sync status
CREATE TABLE IF NOT EXISTS sync_log (
  id SERIAL PRIMARY KEY,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  stations_count INT,
  status TEXT
);
