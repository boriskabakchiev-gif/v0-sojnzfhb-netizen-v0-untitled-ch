-- Creating employee targets table for coefficient calculations
CREATE TABLE IF NOT EXISTS employee_targets (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    daily_target INTEGER NOT NULL DEFAULT 3000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id)
);

-- Insert default targets for existing employees
INSERT INTO employee_targets (employee_id, daily_target)
SELECT id, 3000 FROM employees
ON CONFLICT (employee_id) DO NOTHING;
