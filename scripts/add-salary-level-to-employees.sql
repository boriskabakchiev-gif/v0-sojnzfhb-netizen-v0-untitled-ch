-- Add salary_level_id column to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS salary_level_id INTEGER REFERENCES salary_levels(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_salary_level_id ON employees(salary_level_id);
