<?php
session_start();

$response = [
    'loggedIn' => isset($_SESSION['user_id']),
    'username' => $_SESSION['username'] ?? null
];

echo json_encode($response);
?> 