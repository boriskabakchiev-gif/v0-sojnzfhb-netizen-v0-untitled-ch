-- Clear all sample/mock data from the production system
-- Run this script to remove any existing sample data

-- Clear productions (sample production records)
DELETE FROM productions WHERE id IN (
    SELECT p.id FROM productions p
    JOIN employees e ON p.employee_id = e.id
    WHERE e.name IN ('Иван Петров', 'Мария Георгиева', 'Стоян Димитров', 'Елена Николова', 'Георги Стоянов')
);

-- Clear employee targets for sample employees
DELETE FROM employee_targets WHERE employee_id IN (
    SELECT id FROM employees 
    WHERE name IN ('Иван Петров', 'Мария Георгиева', 'Стоян Димитров', 'Елена Николова', 'Георги Стоянов')
);

-- Clear sample employees
DELETE FROM employees WHERE name IN (
    'Иван Петров', 'Мария Георгиева', 'Стоян Димитров', 'Елена Николова', 'Георги Стоянов'
);

-- Clear sample production lines
DELETE FROM production_lines WHERE name IN (
    'Линия 1', 'Линия 2', 'Линия 3', 'Линия 4'
);

-- Clear sample partners
DELETE FROM partners WHERE name IN (
    'Партньор А', 'Партньор Б', 'Партньор В', 'Партньор Г', 'Партньор Д'
);

-- All sample data cleared successfully
-- The system is now ready for real production data
