<?php
$servername = "localhost";
$username   = "root";
$password   = "";

try {
    $conn = new PDO("mysql:host=$servername;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // DB
    $dbName = 'minesweeper_db';
    $conn->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
    $conn->exec("USE `$dbName`");

    // USERS
    $conn->exec("
        CREATE TABLE IF NOT EXISTS `users` (
            `id` INT PRIMARY KEY AUTO_INCREMENT,
            `username` VARCHAR(50) NOT NULL UNIQUE,
            `email` VARCHAR(255) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `games_played` INT NOT NULL DEFAULT 0,
            `games_won` INT NOT NULL DEFAULT 0,
            `games_lost` INT NOT NULL DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // SCORES
    $conn->exec("
        CREATE TABLE IF NOT EXISTS `scores` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `result` ENUM('win','loss') NOT NULL,
        `time_taken` INT NOT NULL,              -- seconds
        `difficulty` VARCHAR(32) NOT NULL,      -- e.g., 'superEasy','easy','medium','hard'
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT `fk_scores_user` FOREIGN KEY (`user_id`)
            REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // (no echo — keep this file silent if you call it from the app)
} catch (PDOException $e) {
    error_log("INIT_DB error: " . $e->getMessage());
    http_response_code(500);
    exit;
}
