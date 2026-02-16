-- Drop the old unique constraint that doesn't include production_line_id
ALTER TABLE daily_employee_targets 
DROP CONSTRAINT IF EXISTS daily_employee_targets_employee_product_date_unique;

-- Create a new unique constraint that includes production_line_id
-- This allows multiple products per day, but each product-line combination must be unique
ALTER TABLE daily_employee_targets 
ADD CONSTRAINT daily_employee_targets_employee_product_line_date_unique 
UNIQUE (employee_id, product_id, production_line_id, target_date);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_targets_employee_date 
ON daily_employee_targets(employee_id, target_date);
