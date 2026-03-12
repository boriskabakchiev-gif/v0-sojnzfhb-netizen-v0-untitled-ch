-- Add euro price columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS price1_eur DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price2_eur DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price3_eur DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price4_eur DECIMAL(10,2);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name LIKE '%eur%';
