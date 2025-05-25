const mongoose = require('mongoose');
const Service = require('../models/Service');
const Staff = require('../models/Staff');

// Initial data
const services = [
    {
        name: 'Haircut',
        price: 30,
        description: 'Professional haircut service'
    },
    {
        name: 'Hair Coloring',
        price: 60,
        description: 'Full hair coloring service'
    },
    {
        name: 'Styling',
        price: 40,
        description: 'Hair styling for any occasion'
    },
    {
        name: 'Manicure',
        price: 25,
        description: 'Professional nail care'
    },
    {
        name: 'Pedicure',
        price: 35,
        description: 'Luxury foot care service'
    }
];

const staff = [
    {
        name: 'John Doe',
        specialization: 'Hair Stylist',
        experience: '5 years'
    },
    {
        name: 'Jane Smith',
        specialization: 'Color Specialist',
        experience: '7 years'
    },
    {
        name: 'Mike Johnson',
        specialization: 'Nail Artist',
        experience: '3 years'
    },
    {
        name: 'Sarah Wilson',
        specialization: 'Senior Stylist',
        experience: '8 years'
    }
];

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/miles-salon', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB');

    try {
        // Clear existing data
        await Service.deleteMany({});
        await Staff.deleteMany({});
        console.log('Cleared existing data');

        // Insert new data
        const createdServices = await Service.insertMany(services);
        const createdStaff = await Staff.insertMany(staff);
        
        console.log('Inserted services:', createdServices);
        console.log('Inserted staff:', createdStaff);
        
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
}); 