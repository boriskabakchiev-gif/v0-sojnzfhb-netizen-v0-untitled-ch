-- Add new column for partner employee ID
ALTER TABLE productions ADD COLUMN IF NOT EXISTS partner_employee_id INTEGER REFERENCES employees(id);

-- Migrate existing partner data if needed (optional - only if you want to preserve old data)
-- This assumes partner names match employee names
-- UPDATE productions p
-- SET partner_employee_id = (
--   SELECT e.id FROM employees e 
--   JOIN partners pt ON LOWER(TRIM(e.name)) = LOWER(TRIM(pt.name))
--   WHERE pt.id = p.partner_id
--   LIMIT 1
-- )
-- WHERE p.partner_id IS NOT NULL;

-- The partner_id column can remain for historical data, but new records will use partner_employee_id
