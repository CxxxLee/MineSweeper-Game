<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

require_once 'config.php';

// If there is any accidental whitespace/BOM before <?php in this file,
// or echoes from included files, it can mangle JSON. Ensure clean.

error_log("Update stats request received");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid method"]);
    exit;
}
if (!isset($_SESSION['user_id'])) {
    error_log("Invalid request or user not logged in");
    echo json_encode(["success" => false, "message" => "Invalid request or user not logged in"]);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$game_result = ($_POST['result'] === 'win') ? 'win' : 'loss';
$time_taken = isset($_POST['time']) ? (int)$_POST['time'] : 0;
$difficulty = isset($_POST['difficulty']) ? substr($_POST['difficulty'], 0, 32) : 'unknown';

error_log("Processing game result for user $user_id: $game_result, time: $time_taken, difficulty: $difficulty");

try {
    // Make sure PDO is in exception mode
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    $stmt = $conn->prepare("
        UPDATE users SET
          games_played = games_played + 1,
          games_won    = games_won + :won,
          games_lost   = games_lost + :lost
        WHERE id = :user_id
    ");
    $stmt->execute([
        ':won'     => ($game_result === 'win') ? 1 : 0,
        ':lost'    => ($game_result === 'loss') ? 1 : 0,
        ':user_id' => $user_id
    ]);

    $stmt = $conn->prepare("
        INSERT INTO scores (user_id, result, time_taken, difficulty)
        VALUES (:uid, :res, :time_taken, :difficulty)
    ");
    $stmt->execute([
        ':uid'        => $user_id,
        ':res'        => $game_result,
        ':time_taken' => $time_taken,
        ':difficulty' => $difficulty
    ]);

    $conn->commit();

    error_log("Game history recorded successfully");
    echo json_encode(["success" => true, "message" => "Stats updated"]);
    exit;
} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log("Error updating stats: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "DB Error"]);
    exit;
}
