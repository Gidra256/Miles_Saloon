<?php
$host = 'localhost';
$username = 'root';
$password = ''; // Default WAMP password is blank
$database = 'milessalon';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

return $conn;
?> 