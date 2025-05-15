<?php
session_start();
require_once 'includes/Database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$db = new Database();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Miles Unisex Salon</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <?php include 'includes/header.php'; ?>

    <section class="page-header">
        <h1>Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?>!</h1>
        <p>Manage your appointments and profile</p>
    </section>

    <section class="dashboard-section">
        <div class="dashboard-container">
            <div class="dashboard-grid">
                <!-- Upcoming Appointments -->
                <div class="dashboard-card">
                    <h2>Upcoming Appointments</h2>
                    <?php
                    $appointments = $db->getUserAppointments($_SESSION['user_id'], 'upcoming');
                    if ($appointments): ?>
                        <ul class="appointment-list">
                            <?php foreach ($appointments as $apt): ?>
                                <li>
                                    <div class="appointment-info">
                                        <strong><?php echo htmlspecialchars($apt['service_name']); ?></strong>
                                        <span><?php echo date('M d, Y', strtotime($apt['appointment_date'])); ?></span>
                                        <span><?php echo date('h:i A', strtotime($apt['appointment_time'])); ?></span>
                                    </div>
                                    <div class="appointment-actions">
                                        <a href="edit_appointment.php?id=<?php echo $apt['id']; ?>" class="btn-edit">Edit</a>
                                        <a href="cancel_appointment.php?id=<?php echo $apt['id']; ?>" class="btn-cancel">Cancel</a>
                                    </div>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php else: ?>
                        <p>No upcoming appointments</p>
                    <?php endif; ?>
                    <a href="booking.php" class="btn-book">Book New Appointment</a>
                </div>

                <!-- Recent Services -->
                <div class="dashboard-card">
                    <h2>Recent Services</h2>
                    <?php
                    $services = $db->getUserServices($_SESSION['user_id']);
                    if ($services): ?>
                        <ul class="service-list">
                            <?php foreach ($services as $service): ?>
                                <li>
                                    <strong><?php echo htmlspecialchars($service['name']); ?></strong>
                                    <span><?php echo date('M d, Y', strtotime($service['date'])); ?></span>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php else: ?>
                        <p>No recent services</p>
                    <?php endif; ?>
                </div>

                <!-- Quick Links -->
                <div class="dashboard-card">
                    <h2>Quick Links</h2>
                    <div class="quick-links">
                        <a href="profile.php" class="quick-link">
                            <i class="fas fa-user"></i>
                            <span>My Profile</span>
                        </a>
                        <a href="appointments.php" class="quick-link">
                            <i class="fas fa-calendar"></i>
                            <span>All Appointments</span>
                        </a>
                        <a href="reviews.php" class="quick-link">
                            <i class="fas fa-star"></i>
                            <span>My Reviews</span>
                        </a>
                        <a href="preferences.php" class="quick-link">
                            <i class="fas fa-cog"></i>
                            <span>Preferences</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <?php include 'includes/footer.php'; ?>
</body>
</html> 