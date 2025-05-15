<?php
class Database {
    private $conn;

    public function __construct() {
        $this->conn = require_once __DIR__ . '/../config/database.php';
    }

    // Get all services
    public function getServices() {
        $result = $this->conn->query("SELECT * FROM services ORDER BY name");
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // Get service by ID
    public function getService($id) {
        $stmt = $this->conn->prepare("SELECT * FROM services WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Create new appointment
    public function createAppointment($userId, $serviceId, $date, $time, $notes) {
        $stmt = $this->conn->prepare("INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iisss", $userId, $serviceId, $date, $time, $notes);
        return $stmt->execute();
    }

    // Get user's appointments
    public function getUserAppointments($userId, $type = 'all') {
        $query = "SELECT a.*, s.name as service_name 
                 FROM appointments a 
                 JOIN services s ON a.service_id = s.id 
                 WHERE a.user_id = ?";
        
        if ($type == 'upcoming') {
            $query .= " AND a.appointment_date >= CURDATE() 
                       AND a.status != 'cancelled' 
                       ORDER BY a.appointment_date, a.appointment_time";
        } else {
            $query .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Get user's recent services
    public function getUserServices($userId) {
        $query = "SELECT s.name, a.appointment_date as date 
                 FROM appointments a 
                 JOIN services s ON a.service_id = s.id 
                 WHERE a.user_id = ? 
                 AND a.status = 'completed' 
                 ORDER BY a.appointment_date DESC 
                 LIMIT 5";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Get gallery items
    public function getGalleryItems($category = null) {
        if ($category && $category !== 'all') {
            $stmt = $this->conn->prepare("SELECT * FROM gallery WHERE category = ? ORDER BY created_at DESC");
            $stmt->bind_param("s", $category);
            $stmt->execute();
            return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        } else {
            $result = $this->conn->query("SELECT * FROM gallery ORDER BY created_at DESC");
            return $result->fetch_all(MYSQLI_ASSOC);
        }
    }

    // Create new user
    public function createUser($firstName, $lastName, $email, $phone, $password) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->conn->prepare("INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $firstName, $lastName, $email, $phone, $hashedPassword);
        return $stmt->execute();
    }

    // Get user by email
    public function getUserByEmail($email) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Update user profile
    public function updateUser($userId, $firstName, $lastName, $phone) {
        $stmt = $this->conn->prepare("UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?");
        $stmt->bind_param("sssi", $firstName, $lastName, $phone, $userId);
        return $stmt->execute();
    }

    // Change user password
    public function updatePassword($userId, $newPassword) {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->bind_param("si", $hashedPassword, $userId);
        return $stmt->execute();
    }

    // Add review
    public function addReview($userId, $serviceId, $rating, $comment) {
        $stmt = $this->conn->prepare("INSERT INTO reviews (user_id, service_id, rating, comment) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiis", $userId, $serviceId, $rating, $comment);
        return $stmt->execute();
    }

    // Get reviews for a service
    public function getServiceReviews($serviceId) {
        $stmt = $this->conn->prepare("
            SELECT r.*, u.first_name, u.last_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.service_id = ? 
            ORDER BY r.created_at DESC
        ");
        $stmt->bind_param("i", $serviceId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Get user's reviews
    public function getUserReviews($userId) {
        $stmt = $this->conn->prepare("
            SELECT r.*, s.name as service_name 
            FROM reviews r 
            JOIN services s ON r.service_id = s.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Cancel appointment
    public function cancelAppointment($appointmentId, $userId) {
        $stmt = $this->conn->prepare("
            UPDATE appointments 
            SET status = 'cancelled' 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->bind_param("ii", $appointmentId, $userId);
        return $stmt->execute();
    }

    // Close connection
    public function __destruct() {
        $this->conn->close();
    }
} 