-- FuelMap PT — Tabela de alertas de preço
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  station_id TEXT NOT NULL REFERENCES fuel_stations(id) ON DELETE CASCADE,
  fuel_type TEXT NOT NULL,
  price_limit NUMERIC(6,3) NOT NULL,
  active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_email ON alerts(email);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active) WHERE active = true;

-- Tabela de leads capturados (pesquisas guardadas, exit-intent, calculadora)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL, -- 'save_search' | 'exit_intent' | 'calculator'
  district TEXT,
  fuel_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, source)
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Sem RLS (gestão interna apenas)
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
