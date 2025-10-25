<?php
session_start();
require_once 'config.php';

error_log("Update stats request received");

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    $game_result = $_POST['result'];
    $time_taken = $_POST['time'];
    $difficulty = $_POST['difficulty'];

    error_log("Processing game result for user $user_id: $game_result, time: $time_taken, difficulty: $difficulty");

    try {
        // Start transaction
        $conn->beginTransaction();

        // Update user stats for specific difficulty
        $stmt = $conn->prepare("UPDATE users SET 
            games_played = games_played + 1,
            games_won = games_won + :won,
            games_lost = games_lost + :lost
            WHERE id = :user_id");
            
        $stmt->execute([
            'won' => $game_result === 'win' ? 1 : 0,
            'lost' => $game_result === 'loss' ? 1 : 0,
            'user_id' => $user_id
        ]);

        // Record game history with difficulty
        $stmt = $conn->prepare("INSERT INTO scores (user_id, result, time_taken, difficulty) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $game_result, $time_taken, $difficulty]);

        // Commit transaction
        $conn->commit();

        error_log("Game history recorded successfully");
        echo json_encode(["success" => true, "message" => "Stats updated"]);
    } catch(PDOException $e) {
        // Rollback transaction on error
        $conn->rollBack();
        error_log("Error updating stats: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
} else {
    error_log("Invalid request or user not logged in");
    echo json_encode(["success" => false, "message" => "Invalid request or user not logged in"]);
}
?> 