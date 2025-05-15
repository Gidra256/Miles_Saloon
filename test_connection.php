<?php
echo "Starting database connection test...\n\n";

try {
    // Test 1: Basic Connection
    echo "Test 1: Testing basic database connection... ";
    require_once 'config/database.php';
    echo "SUCCESS!\n";
    
    // Test 2: Database Selection
    echo "Test 2: Testing database selection... ";
    if ($conn->select_db('miles_salon')) {
        echo "SUCCESS!\n";
    } else {
        throw new Exception("Could not select database");
    }

    // Test 3: Check Tables
    echo "Test 3: Checking if tables exist...\n";
    $tables = ['users', 'services', 'appointments', 'gallery', 'staff', 'reviews'];
    
    foreach ($tables as $table) {
        echo "  Checking table '$table'... ";
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "EXISTS!\n";
        } else {
            echo "MISSING!\n";
        }
    }

    // Test 4: Test Insert Operation
    echo "\nTest 4: Testing insert operation... ";
    $test_query = "INSERT INTO services (name, description, price, duration, category) 
                   VALUES ('Test Service', 'Test Description', 10.00, 30, 'test')";
    if ($conn->query($test_query)) {
        echo "SUCCESS!\n";
        // Clean up test data
        $conn->query("DELETE FROM services WHERE name = 'Test Service'");
    } else {
        throw new Exception("Could not insert test data");
    }

    // Test 5: Database Class
    echo "Test 5: Testing Database class... ";
    require_once 'includes/Database.php';
    $db = new Database();
    $services = $db->getServices();
    if (is_array($services)) {
        echo "SUCCESS!\n";
    } else {
        throw new Exception("Database class test failed");
    }

    echo "\nAll tests completed successfully! Your database connection is working properly.\n";
    echo "Configuration Details:\n";
    echo "Host: " . DB_HOST . "\n";
    echo "Database: " . DB_NAME . "\n";
    echo "User: " . DB_USER . "\n";

} catch (Exception $e) {
    echo "FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
}
?> 