import db from './database.js';
import bcrypt from 'bcryptjs';

console.log('🔧 Initializing K&L Auto Repair CRM Database...');

(async () => {
  try {
    // Users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('owner', 'worker', 'receptionist')),
        full_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vehicles table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        car_model TEXT NOT NULL,
        number_plate TEXT UNIQUE NOT NULL,
        manufacturing_year INTEGER,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // Repair jobs table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS repair_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        problem_description TEXT NOT NULL,
        repair_details TEXT,
        repair_cost REAL NOT NULL,
        repair_status TEXT NOT NULL CHECK(repair_status IN ('Pending', 'In Progress', 'Completed')),
        payment_amount REAL DEFAULT 0,
        payment_method TEXT CHECK(payment_method IN ('Cash', 'Card', 'Online', NULL)),
        payment_status TEXT NOT NULL CHECK(payment_status IN ('Paid', 'Unpaid')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      )
    `);

    // Invoices table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        repair_job_id INTEGER NOT NULL,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repair_job_id) REFERENCES repair_jobs(id)
      )
    `);

    // Appointments table (NEW)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        vehicle_number TEXT,
        service_type TEXT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        problem_description TEXT,
        status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Staff table (NEW)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        position TEXT NOT NULL,
        joining_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Attendance table (NEW)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id INTEGER NOT NULL,
        date DATE NOT NULL,
        check_in_time TIME,
        check_out_time TIME,
        status TEXT NOT NULL CHECK(status IN ('Present', 'Leave', 'Absent')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff(id)
      )
    `);

    // Notifications table (NEW - for future SMS/WhatsApp)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('appointment', 'repair_completed', 'payment_reminder')),
        recipient_phone TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Sent', 'Failed')),
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default owner account
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    await db.prepare(`
      INSERT OR IGNORE INTO users (username, password, role, full_name) 
      VALUES (?, ?, ?, ?)
    `).run('owner', hashedPassword, 'owner', 'Luis Griffin');
    
    await db.prepare(`
      INSERT OR IGNORE INTO users (username, password, role, full_name) 
      VALUES (?, ?, ?, ?)
    `).run('worker', bcrypt.hashSync('worker123', 10), 'worker', 'Worker Account');
    
    await db.prepare(`
      INSERT OR IGNORE INTO users (username, password, role, full_name) 
      VALUES (?, ?, ?, ?)
    `).run('receptionist', bcrypt.hashSync('reception123', 10), 'receptionist', 'Receptionist Account');

    console.log('✅ Database initialized successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Owner: username=owner, password=admin123');
    console.log('Worker: username=worker, password=worker123');
    console.log('Receptionist: username=receptionist, password=reception123');
    console.log('\n🆕 New Features Added:');
    console.log('✅ Appointment Booking System');
    console.log('✅ Staff Management System');
    console.log('✅ Attendance Tracking System');
    console.log('✅ Notification Architecture (Future Ready)');

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
})();
