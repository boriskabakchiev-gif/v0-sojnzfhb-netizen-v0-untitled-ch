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

-- Insert sample employees
INSERT INTO employees (name) VALUES 
('Иван Петров'),
('Мария Георгиева'),
('Стоян Димитров'),
('Елена Николова'),
('Георги Стоянов')
ON CONFLICT DO NOTHING;

-- Insert sample production lines
INSERT INTO production_lines (name, description) VALUES 
('Линия 1', 'Основна производствена линия'),
('Линия 2', 'Втора производствена линия'),
('Линия 3', 'Трета производствена линия'),
('Линия 4', 'Четвърта производствена линия')
ON CONFLICT DO NOTHING;

-- Insert sample partners
INSERT INTO partners (name) VALUES 
('Партньор А'),
('Партньор Б'),
('Партньор В'),
('Партньор Г'),
('Партньор Д')
ON CONFLICT DO NOTHING;

-- Insert sample production data
INSERT INTO productions (employee_id, production_line_id, product_name, partner_id, quantity, production_date, notes) VALUES 
(1, 1, 'Захранка Карп Микс', 1, 150.50, CURRENT_DATE - INTERVAL '1 day', 'Ванилия аромат'),
(2, 2, 'Захранка Фидер Микс', 2, 200.00, CURRENT_DATE - INTERVAL '2 days', 'Червен цвят'),
(3, 1, 'Захранка Метод Микс', 1, 175.25, CURRENT_DATE, 'Шоколад аромат'),
(1, 3, 'Захранка Река Микс', 3, 120.75, CURRENT_DATE - INTERVAL '3 days', 'Зелен цвят')
ON CONFLICT DO NOTHING;
