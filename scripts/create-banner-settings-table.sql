-- Create banner_settings table for managing holiday banners
CREATE TABLE IF NOT EXISTS banner_settings (
  id SERIAL PRIMARY KEY,
  start_date VARCHAR(20) NOT NULL DEFAULT '23.12.2025',
  end_date VARCHAR(20) NOT NULL DEFAULT '04.01.2026',
  message TEXT NOT NULL DEFAULT 'От {start_date} до {end_date} няма да приемаме заявки!',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default banner settings
INSERT INTO banner_settings (start_date, end_date, message, is_visible)
VALUES ('23.12.2025', '04.01.2026', 'От {start_date} до {end_date} няма да приемаме заявки!', true)
ON CONFLICT DO NOTHING;
