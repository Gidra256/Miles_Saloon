// Data Service for handling JSON storage
const dataService = {
    // Load data from localStorage or initialize from db.json
    async initialize() {
        if (!localStorage.getItem('salonData')) {
            try {
                const response = await fetch('/data/db.json');
                const data = await response.json();
                localStorage.setItem('salonData', JSON.stringify(data));
            } catch (error) {
                console.error('Error initializing data:', error);
                return false;
            }
        }
        return true;
    },

    // Get all services
    getServices() {
        const data = JSON.parse(localStorage.getItem('salonData'));
        return data.services || [];
    },

    // Get all staff
    getStaff() {
        const data = JSON.parse(localStorage.getItem('salonData'));
        return data.staff || { barbers: [], ladies: [], nails: [] };
    },

    // Get all staff as a flat array
    getAllStaffArray() {
        const staff = this.getStaff();
        return [
            ...staff.barbers,
            ...staff.ladies,
            ...staff.nails
        ];
    },

    // Get all bookings
    getBookings() {
        const data = JSON.parse(localStorage.getItem('salonData'));
        return data.bookings || [];
    },

    // Add a new booking
    addBooking(booking) {
        const data = JSON.parse(localStorage.getItem('salonData'));
        booking.id = Date.now(); // Use timestamp as ID
        data.bookings.push(booking);
        localStorage.setItem('salonData', JSON.stringify(data));
        return booking;
    },

    // Update a booking
    updateBooking(bookingId, updates) {
        const data = JSON.parse(localStorage.getItem('salonData'));
        const index = data.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            data.bookings[index] = { ...data.bookings[index], ...updates };
            localStorage.setItem('salonData', JSON.stringify(data));
            return data.bookings[index];
        }
        return null;
    },

    // Get a service by ID
    getServiceById(serviceId) {
        const services = this.getServices();
        return services.find(s => s.id === serviceId);
    },

    // Get a staff member by ID
    getStaffById(staffId) {
        const allStaff = this.getAllStaffArray();
        return allStaff.find(s => s.id === staffId);
    }
}; 