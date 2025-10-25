<?php
require_once 'config.php';

try {
    error_log("Fetching leaderboard data");
    
    $stmt = $conn->prepare("
        SELECT 
            u.username,
            gh.difficulty,
            COUNT(*) as games_played,
            SUM(CASE WHEN gh.result = 'win' THEN 1 ELSE 0 END) as games_won,
            MIN(CASE WHEN gh.result = 'win' THEN gh.time_taken ELSE NULL END) as best_time
        FROM users u
        JOIN scores gh ON u.id = gh.user_id
        GROUP BY u.id, gh.difficulty
        ORDER BY games_won DESC, best_time ASC
        LIMIT 10
    ");
    
    $stmt->execute();
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("Leaderboard data: " . print_r($leaderboard, true));
    
    echo json_encode(["success" => true, "data" => $leaderboard]);
} catch(PDOException $e) {
    error_log("Error fetching leaderboard: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?> 