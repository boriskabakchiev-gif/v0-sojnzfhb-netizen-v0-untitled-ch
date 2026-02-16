-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Create production_lines table
CREATE TABLE IF NOT EXISTS production_lines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Create productions table
CREATE TABLE IF NOT EXISTS productions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    production_line_id INTEGER REFERENCES production_lines(id),
    product_name VARCHAR(255) NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    quantity DECIMAL(10,2) NOT NULL,
    production_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables created successfully - no sample data inserted
-- Add your real employees, production lines, and partners through the application interface
