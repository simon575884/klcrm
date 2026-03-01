-- ============================================
-- K&L AUTO REPAIR CRM - SUPABASE DATABASE SETUP
-- ============================================
-- Run this SQL file in Supabase SQL Editor
-- This will create all tables, indexes, and default data
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'worker', 'receptionist')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    car_model VARCHAR(255) NOT NULL,
    number_plate VARCHAR(100) NOT NULL UNIQUE,
    manufacturing_year INTEGER NOT NULL,
    color VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. REPAIR JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS repairs (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    problem_description TEXT NOT NULL,
    repair_details TEXT,
    repair_cost DECIMAL(10, 2) NOT NULL,
    repair_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (repair_status IN ('Pending', 'In Progress', 'Completed')),
    payment_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Card', 'Online', '')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid', 'Unpaid')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    vehicle_number VARCHAR(100),
    service_type VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    problem_description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. STAFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    position VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2),
    hire_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(50) NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Leave', 'Half Day')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, date)
);

-- ============================================
-- 9. NOTIFICATIONS TABLE (Future Ready)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('SMS', 'WhatsApp', 'Email')),
    recipient VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(number_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_customer ON repairs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_vehicle ON repairs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(repair_status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_attendance_staff ON attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- ============================================
-- INSERT DEFAULT USERS (Passwords are hashed with bcrypt)
-- ============================================
-- OWNER: username=owner, password=admin123
INSERT INTO users (username, password, role) VALUES ('owner', '$2a$10$.lNB3OghaccWYBj7GZyWeeWUs5N0JaXUJ6cQWEC6pKMPAJ6LtJCV.', 'owner') ON CONFLICT (username) DO NOTHING;

-- WORKER: username=worker, password=worker123
INSERT INTO users (username, password, role) VALUES ('worker', '$2a$10$Zyl1aa/5KEED1iM3MvzaqONyFkyDyhzJsIr1nT21fJOea.Pjggmd.', 'worker') ON CONFLICT (username) DO NOTHING;

-- RECEPTIONIST: username=receptionist, password=reception123
INSERT INTO users (username, password, role) VALUES ('receptionist', '$2a$10$yKzm6WMxtY0OJ4GAs20YQuoKhIYsYIQwxwRI9R5B6hpAzNTp6I99a', 'receptionist') ON CONFLICT (username) DO NOTHING;

-- ============================================
-- INSERT SAMPLE DATA (Optional - Remove if not needed)
-- ============================================

-- Sample Customers
INSERT INTO customers (name, phone, email, address) VALUES 
('John Smith', '803-555-0101', 'john.smith@email.com', '123 Main St, Columbia, SC'),
('Sarah Johnson', '803-555-0102', 'sarah.j@email.com', '456 Oak Ave, Columbia, SC'),
('Michael Brown', '803-555-0103', 'mbrown@email.com', '789 Pine Rd, Columbia, SC')
ON CONFLICT DO NOTHING;

-- Sample Vehicles
INSERT INTO vehicles (customer_id, car_model, number_plate, manufacturing_year, color) VALUES 
(1, 'Toyota Camry', 'ABC-1234', 2020, 'Silver'),
(1, 'Honda Civic', 'XYZ-5678', 2019, 'Blue'),
(2, 'Ford F-150', 'DEF-9012', 2021, 'Black'),
(3, 'Chevrolet Malibu', 'GHI-3456', 2018, 'White')
ON CONFLICT (number_plate) DO NOTHING;

-- Sample Staff
INSERT INTO staff (name, phone, email, position, salary, hire_date, status) VALUES 
('Carlos Martinez', '803-555-0201', 'carlos@klmobile.com', 'Senior Mechanic', 4500.00, '2023-01-15', 'Active'),
('David Wilson', '803-555-0202', 'david@klmobile.com', 'Mechanic', 3500.00, '2023-03-20', 'Active'),
('Emily Davis', '803-555-0203', 'emily@klmobile.com', 'Tire Specialist', 3200.00, '2023-06-10', 'Active'),
('James Anderson', '803-555-0204', 'james@klmobile.com', 'Assistant Mechanic', 2800.00, '2023-09-05', 'Active')
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE FUNCTION TO AUTO-UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- CREATE TRIGGER FOR REPAIRS TABLE
-- ============================================
DROP TRIGGER IF EXISTS update_repairs_updated_at ON repairs;
CREATE TRIGGER update_repairs_updated_at
    BEFORE UPDATE ON repairs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CREATE VIEW FOR REPAIR JOBS WITH DETAILS
-- ============================================
CREATE OR REPLACE VIEW repair_jobs_view AS
SELECT 
    r.id,
    r.customer_id,
    r.vehicle_id,
    c.name as customer_name,
    c.phone as customer_phone,
    c.email as customer_email,
    c.address as customer_address,
    v.car_model,
    v.number_plate,
    v.manufacturing_year,
    v.color,
    r.problem_description,
    r.repair_details,
    r.repair_cost,
    r.repair_status,
    r.payment_amount,
    r.payment_method,
    r.payment_status,
    r.created_at,
    r.updated_at
FROM repairs r
JOIN customers c ON r.customer_id = c.id
JOIN vehicles v ON r.vehicle_id = v.id;

-- ============================================
-- CREATE VIEW FOR VEHICLES WITH CUSTOMER INFO
-- ============================================
CREATE OR REPLACE VIEW vehicles_view AS
SELECT 
    v.id,
    v.customer_id,
    v.car_model,
    v.number_plate,
    v.manufacturing_year,
    v.color,
    c.name as customer_name,
    c.phone as customer_phone,
    v.created_at
FROM vehicles v
JOIN customers c ON v.customer_id = c.id;

-- ============================================
-- ENABLE ROW LEVEL SECURITY (Optional)
-- ============================================
-- Uncomment if you want to enable RLS
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ============================================
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next Steps:
-- 1. Update user passwords with proper bcrypt hashes
-- 2. Configure your backend to use Supabase connection
-- 3. Test the connection
-- ============================================

SELECT 'Database setup completed successfully!' as status;
