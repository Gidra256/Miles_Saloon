const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const database = require('./utils/database');
const logger = require('./utils/logger');

const app = express();

// Debug middleware for static files
app.use((req, res, next) => {
    logger.info(`Request URL: ${req.url}`);
    next();
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "http:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/admin/login.html');
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin routes
app.get('/admin', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/admin/index.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/admin/bookings', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/admin/services', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/admin/staff', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/admin/gallery', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple check for admin credentials
    if (username === 'admin' && password === 'admin123') {
        req.session.isAuthenticated = true;
        res.redirect('/admin/index.html');
    } else {
        res.redirect('/admin/login.html?error=1');
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login.html');
});

// API Routes
app.get('/api/services', async (req, res) => {
    try {
        const services = await database.query('SELECT * FROM services');
        res.json(services);
    } catch (error) {
        logger.error('Error fetching services:', error);
        res.status(500).json({ error: 'Error fetching services' });
    }
});

app.post('/api/bookings', async (req, res) => {
    const { name, email, phone, service_id, stylist_id, date, time, notes } = req.body;
    
    console.log('Booking request received:', req.body); // Debug log
    
    if (!name || !email || !service_id || !stylist_id || !date || !time) {
        return res.status(400).json({ 
            success: false,
            error: 'Missing required fields',
            received: req.body 
        });
    }

    try {
        const result = await database.query(
            'INSERT INTO bookings (name, email, phone, service_id, stylist_id, booking_date, booking_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone || null, service_id, stylist_id, date, time, notes || null]
        );

        res.json({ 
            success: true, 
            booking_id: result.insertId 
        });
    } catch (error) {
        console.error('Booking error:', error); // Debug log
        res.status(500).json({ 
            success: false, 
            error: 'Error creating booking',
            details: error.message 
        });
    }
});

// Admin API Routes
app.get('/api/admin/bookings', requireAuth, async (req, res) => {
    try {
        const bookings = await database.query(`
            SELECT b.*, s.name as service_name 
            FROM bookings b 
            LEFT JOIN services s ON b.service_id = s.id 
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `);
        res.json(bookings);
    } catch (error) {
        logger.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});

// Delete booking endpoint
app.delete('/api/admin/bookings/:id', requireAuth, async (req, res) => {
    try {
        const bookingId = req.params.id;
        await database.query('DELETE FROM bookings WHERE id = ?', [bookingId]);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Error deleting booking' });
    }
});

// Admin authentication check endpoint
app.get('/api/admin/check-auth', requireAuth, (req, res) => {
    res.json({ authenticated: true });
});

// Debug endpoint to check session
app.get('/api/debug/session', (req, res) => {
    res.json({
        session: req.session,
        isAuthenticated: req.session.isAuthenticated || false
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = config.server.port;
app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
}); 