// Optional loading of .env
try {
    require('dotenv').config();
} catch (err) {
    console.log('No .env file found, using default configuration');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const multer = require('multer');
const fs = require('fs');
// const stripe = process.env.STRIPE_SECRET_KEY 
//     ? require('stripe')(process.env.STRIPE_SECRET_KEY)
//     : null;
const Payment = require('./models/Payment');

// Import models
const Service = require('./models/Service');
const Staff = require('./models/Staff');
const Booking = require('./models/Booking');
const Gallery = require('./models/Gallery');

const app = express();
const port = process.env.PORT || 3000;

// In-memory data storage
const dataStore = {
    services: [
        { id: 1, name: 'Haircut', price: 30, description: 'Professional haircut service' },
        { id: 2, name: 'Hair Coloring', price: 60, description: 'Full hair coloring service' },
        { id: 3, name: 'Styling', price: 40, description: 'Hair styling for any occasion' },
        { id: 4, name: 'Manicure', price: 25, description: 'Professional nail care' },
        { id: 5, name: 'Pedicure', price: 35, description: 'Luxury foot care service' }
    ],
    staff: [
        { id: 1, name: 'John Doe', specialization: 'Hair Stylist', experience: '5 years', available: true },
        { id: 2, name: 'Jane Smith', specialization: 'Color Specialist', experience: '7 years', available: true },
        { id: 3, name: 'Mike Johnson', specialization: 'Nail Artist', experience: '3 years', available: true },
        { id: 4, name: 'Sarah Wilson', specialization: 'Senior Stylist', experience: '8 years', available: true }
    ],
    bookings: [],
    nextBookingId: 1
};

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
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            scriptSrcAttr: ["'unsafe-inline'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Middleware
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'miles-salon-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/gallery')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'public/uploads/gallery');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/miles-salon', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// API Routes

// Services
app.get('/api/services', async (req, res) => {
  try {
    console.log('GET /api/services - Fetching all services');
    const services = await Service.find();
    console.log('Found services:', services);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    console.log('Received service data:', req.body);
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const service = new Service({
      name: req.body.name,
      price: Number(req.body.price),
      description: req.body.description || ''
    });
    const newService = await service.save();
    console.log('Service saved successfully:', newService);
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error saving service:', error);
    res.status(400).json({ message: error.message });
  }
});

// Staff
app.get('/api/staff', async (req, res) => {
  try {
    console.log('GET /api/staff - Fetching all staff');
    const staff = await Staff.find();
    console.log('Found staff:', staff);
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    console.log('Received staff data:', req.body);
    if (!req.body.name || !req.body.specialization) {
      return res.status(400).json({ message: 'Name and specialization are required' });
    }
    const staff = new Staff({
      name: req.body.name,
      specialization: req.body.specialization,
      experience: req.body.experience || ''
    });
    const newStaff = await staff.save();
    console.log('Staff member saved successfully:', newStaff);
    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Error saving staff:', error);
    res.status(400).json({ message: error.message });
  }
});

// Bookings
app.post('/api/bookings', async (req, res) => {
  try {
    console.log('Received booking data:', req.body);
    if (!req.body.name || !req.body.email || !req.body.phone || !req.body.service || !req.body.stylist || !req.body.date || !req.body.time) {
      return res.status(400).json({ message: 'All fields are required except notes' });
    }
    const booking = new Booking({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      service: req.body.service,
      stylist: req.body.stylist,
      date: req.body.date,
      time: req.body.time,
      notes: req.body.notes || ''
    });
    const newBooking = await booking.save();
    console.log('Booking saved successfully:', newBooking);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('service')
      .populate('stylist');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete booking
app.delete('/api/admin/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete service
app.delete('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete staff member
app.delete('/api/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update service
app.put('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        price: Number(req.body.price),
        description: req.body.description
      },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update staff member
app.put('/api/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        specialization: req.body.specialization,
        experience: req.body.experience
      },
      { new: true }
    );
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking
app.put('/api/admin/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        service: req.body.service,
        stylist: req.body.stylist,
        date: req.body.date,
        time: req.body.time,
        notes: req.body.notes
      },
      { new: true }
    ).populate('service').populate('stylist');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Gallery routes
app.get('/api/gallery', async (req, res) => {
  try {
    const images = await Gallery.find().sort('-createdAt');
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/gallery', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    
    const gallery = new Gallery({
      title: req.body.title,
      description: req.body.description,
      imageUrl: imageUrl,
      category: req.body.category
    });
    
    const newImage = await gallery.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Payments
app.post('/api/payments', async (req, res) => {
    try {
        const { bookingId, serviceId, amount, method, phoneNumber } = req.body;

        // Create a new payment record
        const payment = new Payment({
            booking: bookingId,
            service: serviceId,
            amount,
            method,
            phoneNumber,
            status: method === 'cash' ? 'pending' : 'processing',
            currency: 'UGX'
        });

        await payment.save();

        // If it's a mobile money payment, simulate sending a payment request
        if (method === 'mtn' || method === 'airtel') {
            // In a real implementation, you would integrate with MTN/Airtel APIs here
            // For now, we'll simulate the process
            setTimeout(async () => {
                payment.status = 'completed';
                payment.transactionId = 'MM' + Date.now();
                await payment.save();
            }, 5000);

            res.json({
                success: true,
                message: `${method.toUpperCase()} Mobile Money payment initiated. Please check your phone for the payment prompt.`,
                paymentId: payment._id
            });
        } else {
            // For cash payments
            res.json({
                success: true,
                message: 'Cash payment recorded. Please pay at the salon.',
                paymentId: payment._id
            });
        }
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed',
            error: error.message
        });
    }
});

// Get payment status
app.get('/api/payments/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment status',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 