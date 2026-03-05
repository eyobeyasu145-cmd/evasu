# 🌟 EVASU Member Management System

## 🎯 Project Overview
A secure, full-stack web application designed to manage church members, families, services, and leadership roles. Built with modern web technologies, it ensures secure, role-based access for different users.

### 🛠️ Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Hosting/Deployment:** Render

---

## 🔐 Role-Based Access Control & Views

The application features a secure, multi-tiered architecture tailored for deployment to the public:

### 1️⃣ Public Registration Page (Public Access)
A publicly deployed web page allowing new members to safely register themselves. It collects the following necessary student information:
- `full_name`
- `university_id`
- `dorm`
- `block`
- `stream`
- `section_id`
- `region`
- `sub_city`
- `sex`
- `education_year`
- `phone_number`

### 2️⃣ Secure Leader Portal (Restricted Access)
A protected dashboard for leaders and structured roles:
- View all registered members securely.
- Only visible to authenticated users with **Leader** permissions or specific organizational roles.
- Full dashboard to manage members, families, services, and other administrative tasks.

---

## ⚙️ Database Configuration

<details>
<summary><b>Click to View Environment Variables</b></summary>

```env
#DB_HOST=localhost
DB_NAME=evasu
DB_USER=postges
DB_PASSWORD=Unit12phy
DB_PORT=5432
```

</details>

<details>
<summary><b>Click to View Raw SQL Setup Scripts</b></summary>

```sql
-- Create sequence for member IDs starting from 19000
CREATE SEQUENCE mem START 19000;

-- 1. FAMILY table (for member grouping)
CREATE TABLE family (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO family (family_name, description) VALUES
('Tumim', 'A family known for strong faith and service'),
('Yohana', 'A family that focuses on leadership and guidance'),
('Zablon', 'A family committed to unity and cooperation'),
('Mikael', 'A family that encourages spiritual growth'),
('Samuel', 'A family dedicated to prayer and teaching'),
('Daniel', 'A family known for wisdom and discipline'),
('Eliyas', 'A family focused on charity and helping others');

-- 2. SERVICES table (available church services)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO services (service_name, description) VALUES
('Prayer', 'Leads prayer sessions'),
('LAD', 'Literature, Art and Drama ministry'),
('Choir', 'Member of song and worship team'),
('Facility', 'Helps seating and guiding members'),
('Bible Study', 'Teaches Bible classes'),
('Evangelism', 'Spreads the Gospel'),
('Charity', 'Act of giving help, money, or time'),
('Consultation', 'Provides spiritual advice and guidance');

-- 3. LEADERS table
CREATE TABLE leadership_roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO leadership_roles (role_name, description) VALUES
('General Leader', 'Manages and oversees all activities'),
('Time Manager', 'Responsible for scheduling and managing time'),
('Finance Manager', 'Handles money and financial records'),
('Prayer Coordinator', 'Organizes and leads prayer sessions'),
('Worship Leader', 'Leads worship and music ministry'),
('Bible Study Coordinator', 'Organizes and supervises Bible study'),
('Evangelism Leader', 'Coordinates outreach and evangelism activities'),
('Charity Coordinator', 'Manages charity and support programs'),
('Facility Manager', 'Responsible for hall arrangement and seating');

CREATE TABLE leaders (
    leader_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    role_id INT,
    is_active BOOLEAN DEFAULT true,
    joined_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (role_id) REFERENCES leadership_roles(role_id)
);

INSERT INTO leaders (full_name, role_id) VALUES
('Samuel facilty', 1),
('Kenenisa', 2),
('Fiqrear', 3),
('samuel choir', 4),
('Leader Five', 5),
('Leader Six', 6),
('Leader Seven', 7),
('Leader Eight', 8),
('Leader Nine', 9);

-- 4. MEMBERS table
CREATE TABLE members (
    member_id VARCHAR(15) PRIMARY KEY DEFAULT 'evasu' || nextval('mem')::text,
    full_name VARCHAR(150) NOT NULL,
    university_id VARCHAR(150) NOT NULL,
    dorm VARCHAR(50) NOT NULL,
    block VARCHAR(50) NOT NULL,
    stream VARCHAR(50) NOT NULL,
    section_id INT,
    region VARCHAR(100),
    sub_city VARCHAR(100),
    sex VARCHAR(10) CHECK (sex IN ('Male', 'Female')),
    education_year VARCHAR(20) CHECK (education_year IN ('Remedial', 'Freshman', '2nd', '3rd', '4th', '5th', 'GC')),
    phone_number VARCHAR(20),
    family_id INT REFERENCES family(id) ON DELETE SET NULL,
    service_id INT REFERENCES services(id) ON DELETE SET NULL,
    leader_id INT REFERENCES leaders(leader_id) ON DELETE SET NULL,
    registered_by INT,
    registered_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO members (
    full_name, university_id, dorm, block, stream, section_id, region, sub_city, sex, education_year, phone_number, family_id, service_id, leader_id, registered_by
) VALUES
('Eyob Eyasu', 'DU12345', 'Dorm A', 'Block 3', 'Computer Science', 1, 'Oromia', 'Dire Dawa', 'Male', '3rd', '0912345678', 1, 3, 1, 1),
('Samuel Bekele', 'DU12346', 'Dorm B', 'Block 2', 'Information Technology', 2, 'Amhara', 'Bahir Dar', 'Male', '2nd', '0923456789', 2, 1, 2, 1),
('Sara Tesfaye', 'DU12347', 'Dorm C', 'Block 1', 'Software Engineering', 1, 'Addis Ababa', 'Bole', 'Female', 'Freshman', '0934567890', 3, 5, 3, 1),
('Daniel Mekonnen', 'DU12348', 'Dorm A', 'Block 4', 'Electrical Engineering', 3, 'Tigray', 'Mekelle', 'Male', '4th', '0945678901', 4, 6, 4, 2),
('Hana Yohannes', 'DU12349', 'Dorm D', 'Block 5', 'Management', 2, 'SNNPR', 'Hawassa', 'Female', '2nd', '0956789012', 5, 2, 5, 2),
('Abel Girma', 'DU12350', 'Dorm B', 'Block 3', 'Civil Engineering', 1, 'Oromia', 'Adama', 'Male', '3rd', '0967890123', 6, 7, 6, 3),
('Bethel Kassa', 'DU12351', 'Dorm C', 'Block 2', 'Accounting', 2, 'Amhara', 'Gondar', 'Female', 'Freshman', '0978901234', 7, 4, 7, 3);

-- Verification Query
SELECT 
    m.member_id,
    m.full_name,
    m.university_id,
    m.stream,
    m.education_year,
    m.phone_number,
    f.family_name,
    s.service_name,
    l.full_name AS leader_name,
    m.region,
    m.sub_city,
    m.registered_date
FROM members m
LEFT JOIN family f ON m.family_id = f.id
LEFT JOIN services s ON m.service_id = s.id
LEFT JOIN leaders l ON m.leader_id = l.leader_id
ORDER BY m.full_name;
```

</details>
