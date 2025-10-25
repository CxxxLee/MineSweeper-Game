document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    
    // Add event listener for sort selection
    document.getElementById('sortBy').addEventListener('change', loadLeaderboard);
});

async function loadLeaderboard() {
    try {
        const response = await fetch('php/get_leaderboard.php');
        const data = await response.json();
        
        console.log('Leaderboard response:', data);
        
        if (data.success) {
            displayLeaderboard(data.data);
        } else {
            console.error('Error loading leaderboard:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayLeaderboard(leaderboardData) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    if (leaderboardData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4">No games played yet</td>';
        tbody.appendChild(row);
        return;
    }

    // Sort data based on selected criteria
    const sortBy = document.getElementById('sortBy').value;
    leaderboardData.sort((a, b) => {
        switch (sortBy) {
            case 'difficulty':
                // Order: superEasy, easy, medium, hard
                const difficultyOrder = {
                    'superEasy': 1,
                    'easy': 2,
                    'medium': 3,
                    'hard': 4
                };
                return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            case 'games_won':
                return b.games_won - a.games_won;
            case 'time_taken':
                // Handle null/undefined best times
                if (!a.best_time) return 1;
                if (!b.best_time) return -1;
                return a.best_time - b.best_time;
            default:
                return 0;
        }
    });

    leaderboardData.forEach((player) => {
        const row = document.createElement('tr');
        // Format difficulty display
        const formattedDifficulty = formatDifficulty(player.difficulty);
        row.innerHTML = `
            <td>${player.username}</td>
            <td>${formattedDifficulty}</td>
            <td>${player.games_won}/${player.games_played}</td>
            <td>${formatTime(player.best_time)}</td>
        `;
        tbody.appendChild(row);
    });
}

function formatTime(seconds) {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Add this new function to format difficulty display
function formatDifficulty(difficulty) {
    const difficultyMap = {
        'superEasy': 'Super Easy',
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard'
    };
    return difficultyMap[difficulty] || difficulty;
}
