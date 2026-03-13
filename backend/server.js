const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Verify Database Connection
db.query('SELECT NOW()')
    .then(res => console.log('✅ Connected to Database at:', res.rows[0].now))
    .catch(err => console.error('❌ Database Connection Error:', err));

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Public Route: Register Member
app.post('/api/members/register', async (req, res) => {
    try {
        const {
            full_name, university_id, dorm, block, stream, section_id,
            region, sub_city, sex, education_year, phone_number
        } = req.body;

        const query = `
      INSERT INTO members (
        full_name, university_id, dorm, block, stream, section_id,
        region, sub_city, sex, education_year, phone_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
        const values = [
            full_name, university_id, dorm, block, stream, section_id,
            region, sub_city, sex, education_year, phone_number
        ];

        const result = await db.query(query, values);
        res.status(201).json({ message: 'Registration successful!', member: result.rows[0] });
    } catch (error) {
        console.error('Registration Error:', error);

        // Handle Duplicate Violations (Postgres code 23505)
        if (error.code === '23505') {
            const detail = error.detail || '';
            if (detail.includes('university_id')) {
                return res.status(400).json({ error: 'This University ID is already registered.' });
            }
            if (detail.includes('phone_number')) {
                return res.status(400).json({ error: 'This Phone Number is already registered.' });
            }

            // Fallback: Manually check if the above didn't catch it
            try {
                const checkUniv = await db.query('SELECT 1 FROM members WHERE university_id = $1', [req.body.university_id]);
                if (checkUniv.rows.length > 0) return res.status(400).json({ error: 'This University ID already exists.' });

                const checkPhone = await db.query('SELECT 1 FROM members WHERE phone_number = $1', [req.body.phone_number]);
                if (checkPhone.rows.length > 0) return res.status(400).json({ error: 'This Phone Number already exists.' });
            } catch (e) { /* ignore secondary check errors */ }

            return res.status(400).json({ error: 'A member with this ID or Phone already exists.' });
        }

        // Handle other specific errors
        if (error.code === '23502') { // Not null violation
            return res.status(400).json({ error: `Missing required field: ${error.column}` });
        }

        res.status(500).json({ error: 'Registration failed: ' + (error.message || 'Unknown database error') });
    }
});

// Secured Route: Leader Login
// Note: We use a hardcoded admin credential here for simplicity, 
// but in production it should query the leaders table with hashed passwords
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    // Let's assume the default leader is admin@evasu.org / Unit12phy
    if (email === 'admin@evasu.org' && password === process.env.DB_PASSWORD) {
        const token = jwt.sign({ role: 'leader' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ message: 'Login successful', token });
    }

    // Alternatively, try to find a leader by email and use DB_PASSWORD as universal password for now
    try {
        const leaderResult = await db.query('SELECT * FROM leaders WHERE email = $1', [email]);
        if (leaderResult.rows.length > 0 && password === process.env.DB_PASSWORD) {
            const leader = leaderResult.rows[0];
            const token = jwt.sign({ id: leader.leader_id, role: 'leader' }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.json({ message: 'Login successful', token, leader });
        }
    } catch (e) {
        console.error(e);
    }

    return res.status(401).json({ error: 'Invalid email or password' });
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Secured Route: Get all members for Leader Dashboard
app.get('/api/members', authenticateToken, async (req, res) => {
    try {
        const query = `
      SELECT 
          m.member_id,
          m.full_name,
          m.university_id,
          m.stream,
          m.education_year,
          m.phone_number,
          m.family_id,
          f.family_name,
          m.service_id,
          s.service_name,
          m.leader_id,
          l.full_name AS leader_name,
          m.region,
          m.sub_city,
          m.registered_date
      FROM members m
      LEFT JOIN family f ON m.family_id = f.id
      LEFT JOIN services s ON m.service_id = s.id
      LEFT JOIN leaders l ON m.leader_id = l.leader_id
      ORDER BY m.registered_date DESC;
    `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch Members Error:', error);
        res.status(500).json({ error: 'Failed to fetch members data.' });
    }
});

// Secured Route: Update a member's assignments
app.put('/api/members/:id/assign', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { family_id, service_id, leader_id } = req.body;
        const query = `
            UPDATE members 
            SET family_id = $1, service_id = $2, leader_id = $3
            WHERE member_id = $4 RETURNING *;
        `;
        const result = await db.query(query, [family_id, service_id, leader_id, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Assign Member Error:', error);
        res.status(500).json({ error: 'Failed to update member assignments.' });
    }
});

// Secured Route: Get all families
app.get('/api/families', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM family ORDER BY family_name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch families.' });
    }
});

// Secured Route: Get all services
app.get('/api/services', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM services ORDER BY service_name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services.' });
    }
});

// Secured Route: Get all leaders
app.get('/api/leaders', authenticateToken, async (req, res) => {
    try {
        const query = `
      SELECT 
          l.leader_id,
          l.full_name,
          l.phone_number,
          l.email,
          l.is_active,
          l.joined_date,
          r.role_name
      FROM leaders l
      LEFT JOIN leadership_roles r ON l.role_id = r.role_id
      ORDER BY l.joined_date DESC;
    `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch Leaders Error:', error);
        res.status(500).json({ error: 'Failed to fetch leaders data.' });
    }
});

// Secured Route: Get all leadership roles
app.get('/api/roles', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leadership_roles ORDER BY role_id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles.' });
    }
});

// Secured Route: Add a new leader
app.post('/api/leaders', authenticateToken, async (req, res) => {
    try {
        const { full_name, phone_number, email, role_id } = req.body;
        const query = `
            INSERT INTO leaders (full_name, phone_number, email, role_id)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const result = await db.query(query, [full_name, phone_number, email, role_id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add Leader Error:', error);
        res.status(500).json({ error: 'Failed to add leader. Email or Phone might already exist.' });
    }
});

// Secured Route: Update a leader
app.put('/api/leaders/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone_number, email, role_id, is_active } = req.body;
        const query = `
            UPDATE leaders 
            SET full_name = $1, phone_number = $2, email = $3, role_id = $4, is_active = $5
            WHERE leader_id = $6 RETURNING *;
        `;
        const result = await db.query(query, [full_name, phone_number, email, role_id, is_active, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Leader not found.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update Leader Error:', error);
        res.status(500).json({ error: 'Failed to update leader.' });
    }
});

// Secured Route: Delete a leader
app.delete('/api/leaders/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM leaders WHERE leader_id = $1 RETURNING *;', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Leader not found.' });
        res.json({ message: 'Leader deleted safely.' });
    } catch (error) {
        console.error('Delete Leader Error:', error);
        res.status(500).json({ error: 'Failed to delete leader. Usually due to constraint checks.' });
    }
});

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('/*splat', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Trigger restart
// Backend update - Redeploy check
