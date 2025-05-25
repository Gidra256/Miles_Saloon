// Initialize flatpickr date picker
flatpickr(".datepicker", {
    minDate: "today",
    maxDate: new Date().fp_incr(30), // Allow booking up to 30 days in advance
    disable: [
        function(date) {
            // Disable Sundays
            return date.getDay() === 0;
        }
    ],
    locale: {
        firstDayOfWeek: 1 // Start week on Monday
    }
});

// Time slots
const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Form elements
const bookingForm = document.getElementById('booking-form');
const serviceSelect = document.getElementById('service');
const stylistSelect = document.getElementById('stylist');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const summaryDetails = document.getElementById('summary-details');

// Populate time slots
timeSlots.forEach(time => {
    const option = document.createElement('option');
    option.value = time;
    option.textContent = time;
    timeSelect.appendChild(option);
});

// Update booking summary
function updateSummary() {
    const service = serviceSelect.options[serviceSelect.selectedIndex]?.text || '';
    const stylist = stylistSelect.options[stylistSelect.selectedIndex]?.text || '';
    const date = dateInput.value;
    const time = timeSelect.value;

    if (service && stylist && date && time) {
        summaryDetails.innerHTML = `
            <div class="summary-item">
                <strong>Service:</strong> ${service}
            </div>
            <div class="summary-item">
                <strong>Stylist:</strong> ${stylist}
            </div>
            <div class="summary-item">
                <strong>Date:</strong> ${date}
            </div>
            <div class="summary-item">
                <strong>Time:</strong> ${time}
            </div>
        `;
    } else {
        summaryDetails.innerHTML = '<p>Please select your services and time</p>';
    }
}

// Add event listeners
[serviceSelect, stylistSelect, dateInput, timeSelect].forEach(element => {
    element.addEventListener('change', updateSummary);
});

// Booking form submission
document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service_id: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        stylist_id: document.getElementById('stylist').value
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Booking failed');
        }

        const data = await response.json();
        
        if (data.success) {
            alert('Booking successful! We will contact you shortly.');
            this.reset();
        } else {
            alert('Error: ' + (data.error || 'Unknown error occurred'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your booking: ' + error.message);
    }
});

// Load services from database
async function loadServices() {
    try {
        const response = await fetch('http://localhost:3000/api/services');
        const services = await response.json();
        
        const serviceSelect = document.getElementById('service');
        serviceSelect.innerHTML = '<option value="">Select a Service</option>';
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} - $${service.price}`;
            serviceSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load services when page loads
document.addEventListener('DOMContentLoaded', loadServices);

// Add animation to form elements
document.querySelectorAll('.form-group').forEach((group, index) => {
    group.style.opacity = '0';
    group.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        group.style.transition = 'all 0.3s ease';
        group.style.opacity = '1';
        group.style.transform = 'translateY(0)';
    }, index * 100);
}); 