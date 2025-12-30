-- CamperPack Database Schema
-- Initial migration

-- Items: Master inventory of all items
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  storage_location TEXT,
  is_permanent INTEGER DEFAULT 0,
  is_critical INTEGER DEFAULT 0,
  purchase_timing TEXT,
  icon TEXT,
  photo_url TEXT,
  notes TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  synced_at TEXT
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(storage_location);
CREATE INDEX IF NOT EXISTS idx_items_critical ON items(is_critical);

-- Trip Templates: Predefined trip configurations
CREATE TABLE IF NOT EXISTS trip_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration_days INTEGER,
  trip_type TEXT,
  default_items TEXT, -- JSON array of item IDs
  clothing_multiplier REAL DEFAULT 1.0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Trips: Individual trips
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT,
  start_date TEXT,
  end_date TEXT,
  destination TEXT,
  status TEXT DEFAULT 'planning',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (template_id) REFERENCES trip_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- Trip Items: Packing list for each trip
CREATE TABLE IF NOT EXISTS trip_items (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  packed INTEGER DEFAULT 0,
  packed_at TEXT,
  notes TEXT,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE INDEX IF NOT EXISTS idx_trip_items_trip ON trip_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_items_packed ON trip_items(packed);

-- Storage Locations: Customizable storage locations
CREATE TABLE IF NOT EXISTS storage_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL, -- 'trailer', 'truck', 'house'
  sort_order INTEGER DEFAULT 0
);

-- Sync Log: Track changes for offline sync
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  data TEXT, -- JSON of the record
  created_at TEXT DEFAULT (datetime('now')),
  synced INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sync_log_synced ON sync_log(synced);

-- Insert default trip templates
INSERT OR IGNORE INTO trip_templates (id, name, duration_days, trip_type, clothing_multiplier, notes) VALUES
  ('weekend', 'Weekend Trip', 3, 'weekend', 1.0, 'Short 2-3 day trip'),
  ('week', 'Week Trip', 7, 'week', 0.8, '5-7 day trip with laundry option'),
  ('extended', 'Extended Stay', 14, 'extended', 0.5, '2+ weeks with laundry facilities'),
  ('day', 'Day Trip', 1, 'day', 0.0, 'No overnight stay'),
  ('special', 'Special Event', 4, 'special', 1.0, 'Festival, gathering, or special occasion');

-- Insert default storage locations
INSERT OR IGNORE INTO storage_locations (id, name, area, sort_order) VALUES
  -- Trailer locations
  ('pass_thru_main', 'Pass-thru main', 'trailer', 1),
  ('pass_thru_small', 'Pass-thru small', 'trailer', 2),
  ('pantry', 'Pantry', 'trailer', 3),
  ('kitchen_overhead', 'Kitchen overhead', 'trailer', 4),
  ('tv_cabinet', 'TV cabinet', 'trailer', 5),
  ('under_table', 'Under table', 'trailer', 6),
  ('kitchen_drawer_1', 'Kitchen drawer 1', 'trailer', 7),
  ('kitchen_drawer_2', 'Kitchen drawer 2', 'trailer', 8),
  ('kitchen_drawer_3', 'Kitchen drawer 3', 'trailer', 9),
  ('kitchen_drawer_4', 'Kitchen drawer 4', 'trailer', 10),
  ('under_sink', 'Under sink', 'trailer', 11),
  ('kitchen_counter', 'Kitchen counter', 'trailer', 12),
  ('in_sink', 'In sink', 'trailer', 13),
  ('fridge', 'Fridge', 'trailer', 14),
  ('key_hooks', 'Key hooks', 'trailer', 15),
  ('wall_hooks', 'Wall hooks', 'trailer', 16),
  ('bathroom_cabinet', 'Bathroom cabinet', 'trailer', 17),
  ('medicine_cabinet', 'Medicine cabinet', 'trailer', 18),
  ('shower', 'Shower', 'trailer', 19),
  ('left_bedside', 'Left bedside', 'trailer', 20),
  ('right_bedside', 'Right bedside', 'trailer', 21),
  ('under_bed', 'Under bed', 'trailer', 22),
  -- Truck locations
  ('console', 'Console', 'truck', 30),
  ('glove_compartment', 'Glove compartment', 'truck', 31),
  ('front_cab', 'Front cab', 'truck', 32),
  ('rear_pockets', 'Rear pockets', 'truck', 33),
  ('rear_under_seat', 'Rear under seat', 'truck', 34),
  ('rear_seat', 'Rear seat', 'truck', 35),
  ('truck_bed', 'Truck bed', 'truck', 36),
  ('bed_trunk', 'Bed trunk', 'truck', 37),
  -- House (items to pack)
  ('house', 'House (pack before trip)', 'house', 50);
