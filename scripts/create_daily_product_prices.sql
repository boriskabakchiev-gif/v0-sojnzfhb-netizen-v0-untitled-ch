-- Create table for daily product prices
CREATE TABLE IF NOT EXISTS daily_product_prices (
  id SERIAL PRIMARY KEY,
  production_product_id INTEGER NOT NULL REFERENCES production_products(id) ON DELETE CASCADE,
  production_line_id INTEGER NOT NULL REFERENCES production_lines(id) ON DELETE CASCADE,
  price_date DATE NOT NULL,
  price_per_piece DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(production_product_id, production_line_id, price_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_product_prices_date 
ON daily_product_prices(price_date);

CREATE INDEX IF NOT EXISTS idx_daily_product_prices_product 
ON daily_product_prices(production_product_id, production_line_id);
