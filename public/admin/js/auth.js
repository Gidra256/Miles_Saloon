// Authentication Utility

function checkAuth() {
    // Check if user is authenticated
    if (!sessionStorage.getItem('adminAuthenticated')) {
        window.location.href = 'login.html';
        return;
    }
}

function logout() {
    // Clear authentication data
    sessionStorage.removeItem('adminAuthenticated');
    // Redirect to login page
    window.location.href = 'login.html';
}

// Initialize authentication check when included
document.addEventListener('DOMContentLoaded', checkAuth); 