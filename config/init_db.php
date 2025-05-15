<?php
echo "<h1>Database Initialization</h1>";

try {
    // Include database configuration
    require_once 'database.php';
    
    // Read the schema file
    $schema = file_get_contents('schema.sql');
    
    // Split into individual queries
    $queries = explode(';', $schema);
    
    // Execute each query
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            if ($conn->query($query)) {
                echo "Success: " . substr($query, 0, 50) . "...<br>";
            } else {
                echo "Error: " . $conn->error . "<br>";
                echo "Query: " . $query . "<br><br>";
            }
        }
    }
    
    echo "<h2>Adding Sample Data</h2>";
    
    // Add sample services
    $services = array(
        array('Haircut', 'Professional haircut and styling', 30.00, 45, 'haircuts'),
        array('Hair Coloring', 'Full hair coloring service', 80.00, 120, 'coloring'),
        array('Styling', 'Hair styling for special occasions', 50.00, 60, 'styling'),
        array('Makeup', 'Professional makeup application', 60.00, 60, 'makeup')
    );
    
    foreach ($services as $service) {
        $query = "INSERT INTO services (name, description, price, duration, category) 
                 VALUES ('$service[0]', '$service[1]', $service[2], $service[3], '$service[4]')";
        if ($conn->query($query)) {
            echo "Added service: $service[0]<br>";
        } else {
            echo "Error adding service $service[0]: " . $conn->error . "<br>";
        }
    }
    
    echo "<br>Database initialization completed!";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 