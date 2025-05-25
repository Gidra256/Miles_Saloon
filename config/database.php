<?php
// Database configuration
$host = 'localhost';
$dbname = 'miles_salon';
$username = 'root';  // Change this to your MySQL username
$password = '';      // Change this to your MySQL password

try {
    // Try PDO first
    try {
        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        $conn = new PDO($dsn, $username, $password, $options);
        return $conn;
    } catch (PDOException $e) {
        // If PDO fails, try mysqli
        if (class_exists('mysqli')) {
            $conn = new mysqli($host, $username, $password, $dbname);
            if ($conn->connect_error) {
                throw new Exception("mysqli connection failed: " . $conn->connect_error);
            }
            $conn->set_charset("utf8mb4");
            return $conn;
        } else {
            throw new Exception("Neither PDO nor mysqli is available");
        }
    }
} catch (Exception $e) {
    die("Database connection failed: " . $e->getMessage() . 
        "<br>Please ensure MySQL is running and the database exists.");
}
?> 