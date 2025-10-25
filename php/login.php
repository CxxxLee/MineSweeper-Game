<?php
session_start();
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->execute([$username]);
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch();
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                echo json_encode(["success" => true, "message" => "Login successful"]);
            } else {
                echo json_encode(["success" => false, "message" => "Invalid password"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "User not found"]);
        }
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}
?>
