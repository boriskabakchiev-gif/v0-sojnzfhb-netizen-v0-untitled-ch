-- Creating employee targets table for coefficient calculations
CREATE TABLE IF NOT EXISTS employee_targets (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    daily_target INTEGER NOT NULL DEFAULT 3000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id)
);

-- Table created successfully - no default targets inserted
-- Set targets for employees through the application interface after adding real employees
