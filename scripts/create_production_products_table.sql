-- Create production_products table for production-specific products
-- These are separate from the online store products
CREATE TABLE IF NOT EXISTS production_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  production_line_id INTEGER REFERENCES production_lines(id) ON DELETE SET NULL,
  daily_target INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_production_products_active ON production_products(active);
CREATE INDEX IF NOT EXISTS idx_production_products_line ON production_products(production_line_id);
