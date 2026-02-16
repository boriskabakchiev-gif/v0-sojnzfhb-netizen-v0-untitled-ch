-- Add production_line_id column to daily_employee_targets table
ALTER TABLE daily_employee_targets 
ADD COLUMN IF NOT EXISTS production_line_id integer;

-- Add foreign key constraint to production_lines table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_employee_targets_production_line_id_fkey'
  ) THEN
    ALTER TABLE daily_employee_targets
    ADD CONSTRAINT daily_employee_targets_production_line_id_fkey 
    FOREIGN KEY (production_line_id) 
    REFERENCES production_lines(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Update the unique constraint to include production_line_id
DO $$ 
BEGIN
  -- Drop old constraint if exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_employee_targets_employee_date_product_key'
  ) THEN
    ALTER TABLE daily_employee_targets
    DROP CONSTRAINT daily_employee_targets_employee_date_product_key;
  END IF;
  
  -- Add new constraint with production_line_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_employee_targets_employee_date_product_line_key'
  ) THEN
    ALTER TABLE daily_employee_targets
    ADD CONSTRAINT daily_employee_targets_employee_date_product_line_key 
    UNIQUE (employee_id, target_date, product_id, production_line_id);
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_targets_production_line 
ON daily_employee_targets(production_line_id);
