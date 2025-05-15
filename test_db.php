<?php
echo "<h1>Database Connection Test</h1>";

try {
    // Test 1: Basic Connection
    echo "<h3>Test 1: Basic Connection</h3>";
    require_once 'config/database.php';
    echo "Database connection successful!<br>";
    
    // Test 2: Database Selection
    echo "<h3>Test 2: Database Selection</h3>";
    if ($conn->select_db('miles_salon')) {
        echo "Database 'miles_salon' selected successfully!<br>";
    } else {
        echo "Could not select database<br>";
    }

    // Test 3: Tables Check
    echo "<h3>Test 3: Tables Check</h3>";
    $tables = array('users', 'services', 'appointments', 'gallery', 'staff', 'reviews');
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "Table '$table' exists<br>";
        } else {
            echo "Table '$table' is missing<br>";
        }
    }

    // Configuration Details
    echo "<h3>Configuration Details:</h3>";
    echo "PHP Version: " . phpversion() . "<br>";
    echo "Host: " . DB_HOST . "<br>";
    echo "Database: " . DB_NAME . "<br>";
    echo "User: " . DB_USER . "<br>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 