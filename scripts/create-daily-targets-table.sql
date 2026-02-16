-- Create table for date-specific employee targets
CREATE TABLE IF NOT EXISTS daily_employee_targets (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  target_date DATE NOT NULL,
  daily_target INTEGER NOT NULL DEFAULT 3000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, target_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_targets_employee_date ON daily_employee_targets(employee_id, target_date);

-- Insert default targets for existing employees for the current week
INSERT INTO daily_employee_targets (employee_id, target_date, daily_target)
SELECT 
  e.id,
  generate_series(
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '6 days',
    interval '1 day'
  )::date as target_date,
  COALESCE(et.daily_target, 3000) as daily_target
FROM employees e
LEFT JOIN employee_targets et ON e.id = et.employee_id
WHERE e.active = true
ON CONFLICT (employee_id, target_date) DO NOTHING;
