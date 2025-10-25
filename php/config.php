<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "minesweeper_db";

try {
    // Create connection
    $conn = new PDO("mysql:host=$servername", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database if it doesn't exist
    $conn->exec("CREATE DATABASE IF NOT EXISTS $dbname");

    // Now select the database
    $conn->exec("USE $dbname");

} catch(PDOException $e) {
    // log the error
    error_log('DB connection error: ' . $e->getMessage());

    http_response_code(500);
    exit;
}
?>