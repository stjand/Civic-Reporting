-- File: backend/migrations/001_initial_schema.sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'citizen' CHECK (role IN ('citizen', 'ward_officer', 'admin', 'contractor')),
  is_verified BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  contact_phone VARCHAR(15),
  contact_email VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table with PostGIS geometry
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  department_id INTEGER REFERENCES departments(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('pothole', 'garbage', 'streetlight', 'water_leak', 'other')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'in_progress', 'resolved', 'rejected')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  location GEOMETRY(Point, 4326) NOT NULL,
  address TEXT,
  image_urls TEXT[], -- Array of S3 URLs
  assigned_to INTEGER REFERENCES users(id),
  resolution_comment TEXT,
  estimated_resolution_date DATE,
  actual_resolution_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Report status history
CREATE TABLE report_status_history (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  comment TEXT,
  changed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  report_id INTEGER REFERENCES reports(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  fcm_token VARCHAR(255),
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics/hotspots table
CREATE TABLE analytics_hotspots (
  id SERIAL PRIMARY KEY,
  grid_cell GEOMETRY(Polygon, 4326),
  report_count INTEGER DEFAULT 0,
  dominant_category VARCHAR(50),
  avg_resolution_hours FLOAT,
  date_calculated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial indexes for performance
CREATE INDEX idx_reports_location ON reports USING GIST (location);
CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_category ON reports (category);
CREATE INDEX idx_reports_created_at ON reports (created_at);
CREATE INDEX idx_reports_user_id ON reports (user_id);
CREATE INDEX idx_analytics_hotspots_grid ON analytics_hotspots USING GIST (grid_cell);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
