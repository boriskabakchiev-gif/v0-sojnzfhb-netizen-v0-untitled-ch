-- Снабдяване (Supply) feature schema
-- 1) materials: inventory of packaging/label/box materials
-- 2) material_movements: ledger of every stock change (for reliable edit/delete corrections)
-- 3) recipe columns on production_products: how much of each material a single unit consumes

CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  stock NUMERIC(14, 2) NOT NULL DEFAULT 0,
  min_quantity NUMERIC(14, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(active);

-- Ledger of stock changes. change < 0 = consumption, change > 0 = delivery/restock/reversal.
CREATE TABLE IF NOT EXISTS material_movements (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  production_id INTEGER, -- links a consumption batch to a production record (nullable; not a hard FK so deletes never block)
  change NUMERIC(14, 2) NOT NULL,
  reason VARCHAR(50) NOT NULL, -- 'production' | 'production_reverse' | 'delivery' | 'manual'
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_material_movements_material ON material_movements(material_id);
CREATE INDEX IF NOT EXISTS idx_material_movements_production ON material_movements(production_id);

-- Recipe: 5 fixed slots on each production product.
-- Each slot = which material + how much of it is consumed per ONE produced unit.
ALTER TABLE production_products
  ADD COLUMN IF NOT EXISTS label1_material_id INTEGER REFERENCES materials(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS label1_qty NUMERIC(14, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS label2_material_id INTEGER REFERENCES materials(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS label2_qty NUMERIC(14, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sticker_material_id INTEGER REFERENCES materials(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sticker_qty NUMERIC(14, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packaging_material_id INTEGER REFERENCES materials(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS packaging_qty NUMERIC(14, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS box_material_id INTEGER REFERENCES materials(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS box_qty NUMERIC(14, 4) NOT NULL DEFAULT 0;
