-- Setup employee targets for existing employees
-- This script will add default daily targets for all active employees who don't have targets set

INSERT INTO employee_targets (employee_id, daily_target, created_at, updated_at)
SELECT 
    e.id,
    1000 as daily_target, -- Default target of 1000 units per day
    NOW(),
    NOW()
FROM employees e
WHERE e.active = true
  AND NOT EXISTS (
    SELECT 1 FROM employee_targets et WHERE et.employee_id = e.id
  );

-- Update the target for specific employees if needed
-- Uncomment and modify the lines below to set specific targets

-- UPDATE employee_targets 
-- SET daily_target = 1500, updated_at = NOW()
-- WHERE employee_id = (SELECT id FROM employees WHERE name = 'Georgi');

-- Check the results
SELECT 
    e.name,
    et.daily_target,
    et.created_at
FROM employees e
LEFT JOIN employee_targets et ON e.id = et.employee_id
WHERE e.active = true
ORDER BY e.name;
