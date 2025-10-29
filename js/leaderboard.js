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

  const selectedDiff = document.getElementById('sortBy').value; // superEasy | easy | medium | hard

  // 1) Filter to the selected difficulty
  const filtered = leaderboardData.filter(item => item.difficulty === selectedDiff);

  // 2) For each player, keep only their best time at this difficulty
  const bestByUser = new Map(); // username -> { username, best_time }
  filtered.forEach(({ username, best_time }) => {
    if (best_time == null) return; // skip missing times
    const current = bestByUser.get(username);
    if (!current || best_time < current.best_time) {
      bestByUser.set(username, { username, best_time });
    }
  });

  // Convert to array
  const rows = Array.from(bestByUser.values());

  if (rows.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="3">No ${formatDifficulty(selectedDiff)} games yet</td>`;
    tbody.appendChild(row);
    return;
  }

  // 3) Sort by best time (lower is better)
  rows.sort((a, b) => a.best_time - b.best_time);

  // Render
  rows.forEach(({ username, best_time }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${username}</td>
      <td>${formatDifficulty(selectedDiff)}</td>
      <td>${formatTime(best_time)}</td>
    `;
    tbody.appendChild(tr);
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
