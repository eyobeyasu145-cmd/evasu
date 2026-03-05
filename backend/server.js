const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Verify Database Connection
db.query('SELECT NOW()')
    .then(res => console.log('✅ Connected to Database at:', res.rows[0].now))
    .catch(err => console.error('❌ Database Connection Error:', err.message));

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
        res.status(500).json({ error: 'Failed to register. Please ensure all fields are correct.' });
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
      ORDER BY m.registered_date DESC;
    `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch Members Error:', error);
        res.status(500).json({ error: 'Failed to fetch members data.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
