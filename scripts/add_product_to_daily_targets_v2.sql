-- Add unique constraint to new_products.objectid if it doesn't exist
DO $$ 
BEGIN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'new_products_objectid_unique'
    ) THEN
        -- Add unique constraint to objectid column
        ALTER TABLE new_products ADD CONSTRAINT new_products_objectid_unique UNIQUE (objectid);
    END IF;
END $$;

-- Add product_id column to daily_employee_targets if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_employee_targets' 
        AND column_name = 'product_id'
    ) THEN
        ALTER TABLE daily_employee_targets ADD COLUMN product_id character varying;
    END IF;
END $$;

-- Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'daily_employee_targets_product_id_fkey'
    ) THEN
        ALTER TABLE daily_employee_targets 
        ADD CONSTRAINT daily_employee_targets_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES new_products(objectid);
    END IF;
END $$;

-- Create index for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_daily_employee_targets_product_id'
    ) THEN
        CREATE INDEX idx_daily_employee_targets_product_id ON daily_employee_targets(product_id);
    END IF;
END $$;

-- Update the unique constraint to include product_id
DO $$ 
BEGIN
    -- Drop existing unique constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'daily_employee_targets_employee_id_target_date_key'
    ) THEN
        ALTER TABLE daily_employee_targets DROP CONSTRAINT daily_employee_targets_employee_id_target_date_key;
    END IF;
    
    -- Add new composite unique constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'daily_employee_targets_employee_product_date_unique'
    ) THEN
        ALTER TABLE daily_employee_targets 
        ADD CONSTRAINT daily_employee_targets_employee_product_date_unique 
        UNIQUE (employee_id, product_id, target_date);
    END IF;
END $$;
