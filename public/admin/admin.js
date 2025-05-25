// DOM Elements
const dashboardPage = document.getElementById('dashboardPage');
const bookingsPage = document.getElementById('bookingsPage');
const servicesPage = document.getElementById('servicesPage');
const staffPage = document.getElementById('staffPage');
const galleryPage = document.getElementById('galleryPage');
const paymentsPage = document.getElementById('paymentsPage');

// Stats Elements
const todayBookingsEl = document.getElementById('todayBookings');
const totalServicesEl = document.getElementById('totalServices');
const totalStaffEl = document.getElementById('totalStaff');
const totalRevenueEl = document.getElementById('totalRevenue');

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        if (this.getAttribute('href')) return; // Skip if it's a real link (like logout)
        
        // Remove active class from all links and pages
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Show corresponding page
        const pageName = this.getAttribute('data-page');
        document.getElementById(`${pageName}Page`).classList.add('active');
        
        // Load data for the page
        loadPageData(pageName);
    });
});

// Load data based on page
async function loadPageData(page) {
    switch(page) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'bookings':
            await loadBookings();
            break;
        case 'services':
            await loadServices();
            break;
        case 'staff':
            await loadStaff();
            break;
        case 'gallery':
            await loadGallery();
            break;
        case 'payments':
            await loadPayments();
            break;
    }
}

// Dashboard Data
async function loadDashboardData() {
    try {
        // Load all data in parallel
        const [bookings, services, staff] = await Promise.all([
            fetch('http://localhost:3000/api/admin/bookings').then(res => res.json()),
            fetch('http://localhost:3000/api/services').then(res => res.json()),
            fetch('http://localhost:3000/api/staff').then(res => res.json())
        ]);

        // Calculate today's bookings
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(booking => booking.date === today).length;

        // Update stats
        todayBookingsEl.textContent = todayBookings;
        totalServicesEl.textContent = services.length;
        totalStaffEl.textContent = staff.length;

        // Calculate total revenue (from today's bookings)
        const revenue = bookings
            .filter(booking => booking.date === today)
            .reduce((total, booking) => total + (booking.service?.price || 0), 0);
        totalRevenueEl.textContent = `$${revenue}`;

        // Update recent bookings table
        const recentBookingsTable = document.getElementById('recentBookings');
        recentBookingsTable.innerHTML = bookings
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(booking => `
                <tr>
                    <td>${booking._id}</td>
                    <td>${booking.name}</td>
                    <td>${booking.service?.name || 'N/A'}</td>
                    <td>${booking.date}</td>
                    <td>${booking.time}</td>
                    <td><span class="badge bg-success">Confirmed</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewBooking('${booking._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBooking('${booking._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading dashboard data. Please try again.');
    }
}

// Bookings Page
async function loadBookings() {
    try {
        const bookings = await fetch('http://localhost:3000/api/admin/bookings').then(res => res.json());
        
        bookingsPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Bookings</h2>
                <button class="btn btn-primary" onclick="showNewBookingModal()">
                    <i class="fas fa-plus me-2"></i>New Booking
                </button>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Stylist</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bookings.map(booking => `
                                    <tr>
                                        <td>${booking._id}</td>
                                        <td>${booking.name}</td>
                                        <td>${booking.service?.name || 'N/A'}</td>
                                        <td>${booking.stylist?.name || 'N/A'}</td>
                                        <td>${booking.date}</td>
                                        <td>${booking.time}</td>
                                        <td><span class="badge bg-success">Confirmed</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="viewBooking('${booking._id}')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteBooking('${booking._id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsPage.innerHTML = '<div class="alert alert-danger">Error loading bookings. Please try again.</div>';
    }
}

// Services Page
async function loadServices() {
    try {
        const services = await fetch('http://localhost:3000/api/services').then(res => res.json());
        
        servicesPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Services</h2>
                <button class="btn btn-primary" onclick="showNewServiceModal()">
                    <i class="fas fa-plus me-2"></i>New Service
                </button>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${services.map(service => `
                                    <tr>
                                        <td>${service.name}</td>
                                        <td>$${service.price}</td>
                                        <td>${service.description || 'N/A'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="editService('${service._id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteService('${service._id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading services:', error);
        servicesPage.innerHTML = '<div class="alert alert-danger">Error loading services. Please try again.</div>';
    }
}

// Staff Page
async function loadStaff() {
    try {
        const staff = await fetch('http://localhost:3000/api/staff').then(res => res.json());
        
        staffPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Staff</h2>
                <button class="btn btn-primary" onclick="showNewStaffModal()">
                    <i class="fas fa-plus me-2"></i>New Staff Member
                </button>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Specialization</th>
                                    <th>Experience</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${staff.map(person => `
                                    <tr>
                                        <td>${person.name}</td>
                                        <td>${person.specialization}</td>
                                        <td>${person.experience || 'N/A'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="editStaff('${person._id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteStaff('${person._id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading staff:', error);
        staffPage.innerHTML = '<div class="alert alert-danger">Error loading staff. Please try again.</div>';
    }
}

// Gallery Page
async function loadGallery() {
    try {
        galleryPage.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
        
        const images = await fetch('http://localhost:3000/api/gallery').then(res => res.json());
        
        if (images.length === 0) {
            galleryPage.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Manage Gallery</h2>
                    <button class="btn btn-primary" onclick="showNewImageModal()">
                        <i class="fas fa-plus me-2"></i>Add New Image
                    </button>
                </div>
                <div class="alert alert-info">No images in the gallery. Add some images to get started!</div>
            `;
            return;
        }
        
        galleryPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Gallery</h2>
                <button class="btn btn-primary" onclick="showNewImageModal()">
                    <i class="fas fa-plus me-2"></i>Add New Image
                </button>
            </div>
            <div class="row" id="galleryGrid">
                ${images.map(image => `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <img src="${image.imageUrl}" class="card-img-top" alt="${image.title}" 
                                style="height: 200px; object-fit: cover;"
                                onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Found'">
                            <div class="card-body">
                                <h5 class="card-title">${image.title}</h5>
                                <p class="card-text">${image.description || ''}</p>
                                <span class="badge bg-primary mb-2">${image.category}</span>
                                <div class="mt-2">
                                    <button class="btn btn-sm btn-danger" onclick="deleteImage('${image._id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading gallery:', error);
        galleryPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Gallery</h2>
                <button class="btn btn-primary" onclick="showNewImageModal()">
                    <i class="fas fa-plus me-2"></i>Add New Image
                </button>
            </div>
            <div class="alert alert-danger">
                Error loading gallery: ${error.message}
                <button class="btn btn-link" onclick="loadGallery()">Try again</button>
            </div>
        `;
    }
}

async function showNewImageModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Image</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="newImageForm">
                        <div class="mb-3">
                            <label class="form-label">Title</label>
                            <input type="text" class="form-control" name="title" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea class="form-control" name="description" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Image</label>
                            <input type="file" class="form-control" name="image" accept="image/*" required>
                            <div class="mt-2" id="imagePreview"></div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Category</label>
                            <select class="form-control" name="category">
                                <option value="haircuts">Haircuts</option>
                                <option value="coloring">Coloring</option>
                                <option value="styling">Styling</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="addNewImage()">Add Image</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Add image preview functionality
    const imageInput = modal.querySelector('input[type="file"]');
    const previewDiv = modal.querySelector('#imagePreview');
    
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewDiv.innerHTML = `
                    <img src="${e.target.result}" class="img-fluid" style="max-height: 200px;">
                `;
            }
            reader.readAsDataURL(file);
        }
    });
    
    // Clean up after hiding
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

async function addNewImage() {
    const form = document.getElementById('newImageForm');
    const formData = new FormData(form);
    
    try {
        const response = await fetch('http://localhost:3000/api/gallery', {
            method: 'POST',
            body: formData // FormData will automatically set the correct Content-Type
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add image');
        }
        
        const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
        modal.hide();
        
        alert('Image added successfully');
        loadGallery();
    } catch (error) {
        console.error('Error adding image:', error);
        alert('Error adding image: ' + error.message);
    }
}

async function deleteImage(id) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/gallery/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete image');
        
        alert('Image deleted successfully');
        loadGallery();
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error deleting image: ' + error.message);
    }
}

// Delete functions
async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/admin/bookings/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete booking');
        
        alert('Booking deleted successfully');
        loadPageData(document.querySelector('.nav-link.active').getAttribute('data-page'));
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking: ' + error.message);
    }
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/services/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete service');
        
        alert('Service deleted successfully');
        loadPageData('services');
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error deleting service: ' + error.message);
    }
}

async function deleteStaff(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/staff/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete staff member');
        
        alert('Staff member deleted successfully');
        loadPageData('staff');
    } catch (error) {
        console.error('Error deleting staff member:', error);
        alert('Error deleting staff member: ' + error.message);
    }
}

// Edit functions
async function editService(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/services/${id}`);
        const service = await response.json();
        
        const newName = prompt('Enter new service name:', service.name);
        if (!newName) return;
        
        const newPrice = prompt('Enter new price:', service.price);
        if (!newPrice) return;
        
        const newDescription = prompt('Enter new description:', service.description);
        
        const updatedService = {
            name: newName,
            price: Number(newPrice),
            description: newDescription || ''
        };
        
        const updateResponse = await fetch(`http://localhost:3000/api/services/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedService)
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update service');
        
        alert('Service updated successfully');
        loadPageData('services');
    } catch (error) {
        console.error('Error updating service:', error);
        alert('Error updating service: ' + error.message);
    }
}

async function editStaff(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/staff/${id}`);
        const staff = await response.json();
        
        const newName = prompt('Enter new staff name:', staff.name);
        if (!newName) return;
        
        const newSpecialization = prompt('Enter new specialization:', staff.specialization);
        if (!newSpecialization) return;
        
        const newExperience = prompt('Enter new experience:', staff.experience);
        
        const updatedStaff = {
            name: newName,
            specialization: newSpecialization,
            experience: newExperience || ''
        };
        
        const updateResponse = await fetch(`http://localhost:3000/api/staff/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedStaff)
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update staff member');
        
        alert('Staff member updated successfully');
        loadPageData('staff');
    } catch (error) {
        console.error('Error updating staff member:', error);
        alert('Error updating staff member: ' + error.message);
    }
}

async function viewBooking(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/bookings/${id}`);
        const booking = await response.json();
        
        alert(`
            Booking Details:
            Name: ${booking.name}
            Email: ${booking.email}
            Phone: ${booking.phone}
            Service: ${booking.service?.name || 'N/A'}
            Stylist: ${booking.stylist?.name || 'N/A'}
            Date: ${booking.date}
            Time: ${booking.time}
            Notes: ${booking.notes || 'No notes'}
        `);
    } catch (error) {
        console.error('Error viewing booking:', error);
        alert('Error viewing booking: ' + error.message);
    }
}

// Payments Page
async function loadPayments() {
    try {
        const response = await fetch('http://localhost:3000/api/payments');
        const payments = await response.json();
        
        const tableBody = document.getElementById('paymentsTableBody');
        tableBody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.booking?._id || 'N/A'}</td>
                <td>${payment.booking?.name || 'N/A'}</td>
                <td>$${(payment.amount / 100).toFixed(2)}</td>
                <td>
                    <span class="badge bg-${getStatusColor(payment.status)}">
                        ${payment.status}
                    </span>
                </td>
                <td>${payment.paymentMethod}</td>
                <td>${new Date(payment.createdAt).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewPaymentDetails('${payment._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${payment.status === 'completed' ? `
                        <button class="btn btn-sm btn-warning" onclick="initiateRefund('${payment._id}')">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading payments:', error);
        paymentsPage.innerHTML = '<div class="alert alert-danger">Error loading payments. Please try again.</div>';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'completed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'failed':
            return 'danger';
        default:
            return 'secondary';
    }
}

async function viewPaymentDetails(paymentId) {
    try {
        const response = await fetch(`http://localhost:3000/api/payments/${paymentId}`);
        const payment = await response.json();
        
        alert(`
            Payment Details:
            Booking ID: ${payment.booking?._id || 'N/A'}
            Customer: ${payment.booking?.name || 'N/A'}
            Amount: $${(payment.amount / 100).toFixed(2)}
            Status: ${payment.status}
            Payment Method: ${payment.paymentMethod}
            Date: ${new Date(payment.createdAt).toLocaleString()}
            Stripe Payment ID: ${payment.stripePaymentId}
        `);
    } catch (error) {
        console.error('Error viewing payment:', error);
        alert('Error viewing payment details: ' + error.message);
    }
}

async function initiateRefund(paymentId) {
    if (!confirm('Are you sure you want to initiate a refund for this payment?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/payments/${paymentId}/refund`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Failed to initiate refund');
        
        alert('Refund initiated successfully');
        loadPayments();
    } catch (error) {
        console.error('Error initiating refund:', error);
        alert('Error initiating refund: ' + error.message);
    }
}

// Show/hide mobile money fields based on payment method
document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
    input.addEventListener('change', function() {
        const mobileMoneySection = document.getElementById('mobile-money-section');
        mobileMoneySection.style.display = 
            ['mtn_money', 'airtel_money'].includes(this.value) ? 'block' : 'none';
    });
});

async function submitBookingWithPayment() {
    try {
        const form = document.getElementById('newBookingForm');
        const formData = new FormData(form);
        const bookingData = Object.fromEntries(formData.entries());
        
        // Create booking first
        const bookingResponse = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!bookingResponse.ok) {
            throw new Error('Failed to create booking');
        }
        
        const booking = await bookingResponse.json();
        
        if (['mtn_money', 'airtel_money'].includes(bookingData.paymentMethod)) {
            // Initiate mobile money payment
            const paymentResponse = await fetch('/api/initiate-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookingId: booking._id,
                    paymentMethod: bookingData.paymentMethod,
                    phoneNumber: bookingData.phoneNumber
                })
            });
            
            if (!paymentResponse.ok) {
                throw new Error('Failed to initiate payment');
            }
            
            const paymentData = await paymentResponse.json();
            
            // Show payment instructions modal
            showPaymentInstructions(paymentData);
        } else {
            // Handle cash payment
            await fetch('/api/confirm-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookingId: booking._id,
                    transactionId: 'CASH-' + Date.now(),
                    amount: booking.service.price,
                    paymentMethod: 'cash'
                })
            });
            
            // Show success message
            showPaymentSuccess('Cash payment recorded successfully');
        }
        
        // Close booking modal and refresh data
        const bookingModal = bootstrap.Modal.getInstance(document.getElementById('newBookingModal'));
        bookingModal.hide();
        
        // Refresh data
        loadPageData(document.querySelector('.nav-link.active').getAttribute('data-page'));
    } catch (error) {
        console.error('Error processing booking:', error);
        alert('Error: ' + error.message);
    }
}

function showPaymentInstructions(paymentData) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Payment Instructions</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <i class="fas fa-mobile-alt" style="font-size: 48px;"></i>
                    </div>
                    <p>${paymentData.instructions}</p>
                    <div class="alert alert-info">
                        <strong>Amount:</strong> ${paymentData.amount} ${paymentData.currency}<br>
                        <strong>Provider:</strong> ${paymentData.provider}<br>
                        <strong>Transaction ID:</strong> ${paymentData.transactionId}
                    </div>
                    <p class="text-muted">Please keep this transaction ID for your reference.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="checkPaymentStatus('${paymentData.transactionId}')">
                        Check Payment Status
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

async function checkPaymentStatus(transactionId) {
    try {
        const response = await fetch(`/api/payment-status/${transactionId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
            showPaymentSuccess('Payment completed successfully!');
        } else {
            alert('Payment is still pending. Please try again later.');
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        alert('Error checking payment status: ' + error.message);
    }
}

function showPaymentSuccess(message) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Payment Successful</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <i class="fas fa-check-circle text-success" style="font-size: 48px;"></i>
                        <h4 class="mt-3">Success!</h4>
                        <p>${message}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// Initialize dashboard when the page loads
window.onload = () => {
    loadDashboardData();
}; 