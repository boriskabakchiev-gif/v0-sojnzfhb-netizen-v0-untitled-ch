-- Add sales_value column to production_products table
ALTER TABLE production_products
ADD COLUMN IF NOT EXISTS sales_value NUMERIC(10, 2) DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN production_products.sales_value IS 'Sales value of the product for profitability tracking';
