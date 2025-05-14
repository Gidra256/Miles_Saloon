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

// Form submission
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(bookingForm);
    const bookingData = Object.fromEntries(formData.entries());

    // Validate phone number
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(bookingData.phone)) {
        alert('Please enter a valid phone number');
        return;
    }

    // Show confirmation
    const confirmed = confirm(`
        Please confirm your booking:
        Service: ${serviceSelect.options[serviceSelect.selectedIndex].text}
        Stylist: ${stylistSelect.options[stylistSelect.selectedIndex].text}
        Date: ${bookingData.date}
        Time: ${bookingData.time}
    `);

    if (confirmed) {
        // Here you would typically send the data to a server
        // For now, we'll just show a success message
        alert('Booking confirmed! We will send you a confirmation email shortly.');
        bookingForm.reset();
        updateSummary();
    }
});

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