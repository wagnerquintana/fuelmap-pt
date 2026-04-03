-- Migração: Adicionar coluna locality à tabela fuel_stations
-- Executar no SQL Editor do Supabase Dashboard

ALTER TABLE fuel_stations ADD COLUMN IF NOT EXISTS locality TEXT;
CREATE INDEX IF NOT EXISTS idx_stations_locality ON fuel_stations(locality);
