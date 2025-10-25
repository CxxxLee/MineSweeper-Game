<?php
require_once 'config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($username === '' || $email === '' || $password === '') {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $conn->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already exists']);
        exit;
    }

    $stmt = $conn->prepare('INSERT INTO users (username, email, password, games_played, games_won, games_lost) VALUES (?, ?, ?, 0, 0, 0)');
    $stmt->execute([$username, $email, $hash]);

    echo json_encode(['success' => true, 'message' => 'Signup successful']);
} catch (PDOException $e) {
    error_log('Signup error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
