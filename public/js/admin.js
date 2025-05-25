// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('/api/admin/check-auth');
        if (!response.ok) {
            window.location.href = '/admin/login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/admin/login.html';
        return false;
    }
}

// Navigation
document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = e.target.dataset.page;
        showPage(pageId);
    });
});

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    // Show selected page
    document.getElementById(pageId + 'Page').classList.add('active');
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

// Load Dashboard Data
async function loadDashboard() {
    if (!(await checkAuth())) return;

    try {
        const [todayRes, pendingRes, servicesRes] = await Promise.all([
            fetch('/api/admin/bookings/today'),
            fetch('/api/admin/bookings/pending'),
            fetch('/api/services')
        ]);

        const [today, pending, services] = await Promise.all([
            todayRes.json(),
            pendingRes.json(),
            servicesRes.json()
        ]);

        document.getElementById('todayBookings').textContent = today.count;
        document.getElementById('pendingBookings').textContent = pending.count;
        document.getElementById('totalServices').textContent = services.length;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard data. Please try refreshing the page.');
    }
}

// Load Bookings
async function loadBookings() {
    if (!(await checkAuth())) return;

    try {
        const response = await fetch('/api/admin/bookings');
        if (!response.ok) throw new Error('Failed to fetch bookings');
        
        const bookings = await response.json();
        const tbody = document.getElementById('bookingsTable');
        tbody.innerHTML = '';
        
        bookings.forEach(booking => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.name}<br><small>${booking.email}</small></td>
                <td>${booking.service_name}</td>
                <td>${new Date(booking.booking_date).toLocaleDateString()}</td>
                <td>${booking.booking_time}</td>
                <td>
                    <select class="form-select form-select-sm status-select" data-id="${booking.id}">
                        <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteBooking(${booking.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to status selects
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                updateBookingStatus(e.target.dataset.id, e.target.value);
            });
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        alert('Error loading bookings. Please try refreshing the page.');
    }
}

// Load Services
function loadServices() {
    fetch('/api/services')
        .then(response => response.json())
        .then(services => {
            const tbody = document.getElementById('servicesTable');
            tbody.innerHTML = '';
            
            services.forEach(service => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${service.name}</td>
                    <td>${service.description}</td>
                    <td>$${service.price}</td>
                    <td>${service.duration} mins</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2" onclick="editService(${service.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

// Service Modal
const serviceModal = new bootstrap.Modal(document.getElementById('serviceModal'));
let currentServiceId = null;

document.getElementById('addServiceBtn').addEventListener('click', () => {
    currentServiceId = null;
    document.getElementById('serviceForm').reset();
    serviceModal.show();
});

document.getElementById('saveServiceBtn').addEventListener('click', () => {
    const serviceData = {
        name: document.getElementById('serviceName').value,
        description: document.getElementById('serviceDescription').value,
        price: parseFloat(document.getElementById('servicePrice').value),
        duration: parseInt(document.getElementById('serviceDuration').value)
    };

    const url = currentServiceId ? 
        `/api/services/${currentServiceId}` : 
        '/api/services';

    fetch(url, {
        method: currentServiceId ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
    })
    .then(response => response.json())
    .then(() => {
        serviceModal.hide();
        loadServices();
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    fetch('/api/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '/admin/login.html';
        });
});

// Update booking status
async function updateBookingStatus(bookingId, status) {
    if (!(await checkAuth())) return;

    try {
        const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('Failed to update status');
        
        const data = await response.json();
        if (data.success) {
            alert('Booking status updated successfully');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Error updating booking status. Please try again.');
    }
}

// Delete booking
async function deleteBooking(bookingId) {
    if (!(await checkAuth())) return;

    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
        const response = await fetch(`/api/admin/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete booking');
        
        const data = await response.json();
        if (data.success) {
            alert('Booking deleted successfully');
            loadBookings();
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Please try again.');
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    if (await checkAuth()) {
        loadDashboard();
        loadBookings();
    }
}); 