-- Create salary_levels table
CREATE TABLE IF NOT EXISTS salary_levels (
  id SERIAL PRIMARY KEY,
  level_name VARCHAR(255) NOT NULL,
  salary_per_day NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT true
);

-- Create index on level_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_salary_levels_level_name ON salary_levels(level_name);

-- Create index on active status
CREATE INDEX IF NOT EXISTS idx_salary_levels_active ON salary_levels(active);
