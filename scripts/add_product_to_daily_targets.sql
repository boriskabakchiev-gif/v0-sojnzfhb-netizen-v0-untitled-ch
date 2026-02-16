-- Add product_id column to daily_employee_targets table to make targets product-specific
ALTER TABLE daily_employee_targets 
ADD COLUMN product_id character varying;

-- Add foreign key constraint to link to new_products table
-- Note: We use character varying to match new_products.objectid
ALTER TABLE daily_employee_targets 
ADD CONSTRAINT fk_daily_targets_product 
FOREIGN KEY (product_id) REFERENCES new_products(objectid);

-- Create index for better performance on product_id queries
CREATE INDEX idx_daily_employee_targets_product_id ON daily_employee_targets(product_id);

-- Create composite index for efficient queries by employee, date, and product
CREATE INDEX idx_daily_employee_targets_composite ON daily_employee_targets(employee_id, target_date, product_id);
