-- =========================================================
-- LifeLink Production Database Schema (PostgreSQL / MySQL Compatible)
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'donor', 'receiver', 'hospital')),
    phone VARCHAR(20),
    city VARCHAR(80),
    state VARCHAR(80),
    address TEXT,
    avatar_url TEXT,
    is_verified INT DEFAULT 1,
    is_suspended INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS Admins (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    role_level VARCHAR(50) DEFAULT 'SUPER_ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Donors Table
CREATE TABLE IF NOT EXISTS Donors (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    blood_group VARCHAR(10) NOT NULL,
    organs_registered TEXT,
    availability_status VARCHAR(20) DEFAULT 'AVAILABLE',
    total_donations INT DEFAULT 0,
    badges TEXT DEFAULT '[]',
    last_donated_at TIMESTAMP,
    emergency_contact VARCHAR(20),
    gender VARCHAR(10),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Receivers Table
CREATE TABLE IF NOT EXISTS Receivers (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    blood_group_needed VARCHAR(10),
    organ_needed VARCHAR(50),
    urgency_level VARCHAR(20) DEFAULT 'HIGH',
    city VARCHAR(80),
    distance_km NUMERIC(5,2) DEFAULT 5.0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    medical_doc_url TEXT,
    gender VARCHAR(10),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Hospitals Table
CREATE TABLE IF NOT EXISTS Hospitals (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    hospital_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_doc_url TEXT,
    city VARCHAR(80) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_approved INT DEFAULT 0,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Blood Inventory
CREATE TABLE IF NOT EXISTS BloodInventory (
    id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES Hospitals(id) ON DELETE CASCADE,
    blood_group VARCHAR(10) NOT NULL,
    units_available INT NOT NULL DEFAULT 0,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Organ Inventory
CREATE TABLE IF NOT EXISTS OrganInventory (
    id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES Hospitals(id) ON DELETE CASCADE,
    organ_type VARCHAR(50) NOT NULL,
    availability_status VARCHAR(20) DEFAULT 'AVAILABLE',
    waiting_list_count INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Requests Table
CREATE TABLE IF NOT EXISTS Requests (
    id SERIAL PRIMARY KEY,
    receiver_id INT NOT NULL REFERENCES Receivers(id) ON DELETE CASCADE,
    request_type VARCHAR(10) NOT NULL CHECK (request_type IN ('BLOOD', 'ORGAN')),
    item_requested VARCHAR(50) NOT NULL,
    units INT DEFAULT 1,
    hospital_id INT REFERENCES Hospitals(id) ON DELETE SET NULL,
    urgency VARCHAR(20) DEFAULT 'EMERGENCY',
    status VARCHAR(20) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Donations Table
CREATE TABLE IF NOT EXISTS Donations (
    id SERIAL PRIMARY KEY,
    donor_id INT NOT NULL REFERENCES Donors(id) ON DELETE CASCADE,
    request_id INT REFERENCES Requests(id) ON DELETE SET NULL,
    hospital_id INT NOT NULL REFERENCES Hospitals(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('BLOOD', 'ORGAN')),
    item_name VARCHAR(50) NOT NULL,
    units INT DEFAULT 1,
    donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Campaigns Table
CREATE TABLE IF NOT EXISTS Campaigns (
    id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES Hospitals(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_units INT DEFAULT 100,
    collected_units INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    banner_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'INFO',
    is_read INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Chats Table
CREATE TABLE IF NOT EXISTS Chats (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Medical Documents
CREATE TABLE IF NOT EXISTS MedicalDocuments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    doc_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'VERIFIED',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS AuditLogs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(80) NOT NULL,
    target VARCHAR(80) NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Speed & Scale
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_donors_bg ON Donors(blood_group);
CREATE INDEX idx_blood_hosp ON BloodInventory(hospital_id, blood_group);
CREATE INDEX idx_organ_hosp ON OrganInventory(hospital_id, organ_type);
CREATE INDEX idx_requests_status ON Requests(status, urgency);
