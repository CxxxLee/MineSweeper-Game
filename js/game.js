document.addEventListener('DOMContentLoaded', function() {
    // Start playing background music when page loads
    const gameMusic = document.getElementById('gameMusic');
    if (gameMusic && !isMuted) {
        gameMusic.volume = 1.0;
        const playPromise = gameMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Auto-play failed:", error);
                // Many browsers require user interaction before playing audio
                // The music will start when they click restart or interact with the game
            });
        }
    }
});

var board = [];
var rows = 5;
var cols = 5;
var mines = 3;
var numMines = 3;
var minesLocation = []; // Array to hold the locations of the mines
var tilesClicked = 0; // Counter for the number of tiles clicked
var flagEnabled = false; // Flag to enable flagging mode
var gameOver = false; // Flag to check if the game is over
var firstClick = true; // Flag to check if it's the first click
let restartButton;
let timerInterval = null;
let elapsedTime = 0;
let correctlyFlaggedMines = 0;
let isMuted = false;
const gameMusic = document.getElementById('gameMusic');

// Add difficulty configurations
const difficulties = {
    superEasy: { rows: 5, cols: 5, mines: 3, numMines: 3 },
    easy: { rows: 8, cols: 8, mines: 10, numMines: 10 },
    medium: { rows: 16, cols: 16, mines: 40, numMines: 40 },
    hard: { rows: 24, cols: 24, mines: 99, numMines: 99 }
};

let currentBoardStyle = 'fresnoState';
let currentColorTheme = 'fresnoState';

// Add this function at the top level of game.js
async function updateGameStats(result) {
    if (!document.cookie.includes('PHPSESSID')) {
        console.log('User not logged in, skipping stats update');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('result', result);
        formData.append('time', elapsedTime);
        const currentDifficulty = document.getElementById('difficulty').value;
        formData.append('difficulty', currentDifficulty);

        console.log('Sending game stats:', {
            result: result,
            time: elapsedTime,
            difficulty: currentDifficulty
        });

        const response = await fetch('php/update_stats.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (!data.success) {
            console.error('Failed to update stats:', data.message);
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

window.onload = function() {
    const difficultySelect = document.getElementById('difficulty');
    const boardStyleSelect = document.getElementById('boardStyle');
    const colorThemeSelect = document.getElementById('colorTheme');
    
    gameMusic.volume = 0.5; // Set volume to 50%
    gameMusic.play().catch(error => {
        console.log("Audio autoplay failed:", error);
        // Most browsers require user interaction before playing audio
    });
    
    difficultySelect.addEventListener('change', changeDifficulty);
    boardStyleSelect.addEventListener('change', function() {
        changeBoardStyle();
    });
    colorThemeSelect.addEventListener('change', function() {
        changeColorTheme();
    });
    
    startGame();
    
    // Set initial mute button state
    const muteButton = document.getElementById('mute-button');
    muteButton.textContent = '🔊';
}

function setMines(excludeRow, excludeCol) {
    // minesLocation.push("2-2"); // Example of adding a mine location
    // minesLocation.push("2-3"); // Example of adding a mine location
    // minesLocation.push("3-4"); // Example of adding a mine location
    // minesLocation.push("5-6"); // Example of adding a mine location\
    // minesLocation.push("1-1"); // Example of adding a mine location

    let minesLeft = mines; // Counter for mines left to place
    while(minesLeft > 0) {
        let r = Math.floor(Math.random() * rows); // Random row
        let c = Math.floor(Math.random() * cols); // Random column

        //ensure no mine is placed on first click
        if(r === excludeRow && c === excludeCol){
            continue;
        }

        let id = r.toString() + "-" + c.toString(); // Create ID for the tile
        if(!minesLocation.includes(id)) { // Check if mine is already placed
            minesLocation.push(id); // Add mine location
            minesLeft--; // Decrease mines left
        }
    }
}

function startGame() {
    // Initialize game music first thing
    if (!isMuted) {
        const gameMusic = document.getElementById('gameMusic');
        if (gameMusic) {
            gameMusic.currentTime = 0;
            // Force unmute and set volume
            gameMusic.muted = false;
            gameMusic.volume = 1.0;
            const playPromise = gameMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Auto-play failed:", error);
                });
            }
        }
    }
    
    // Initialize mute button state
    const muteButton = document.getElementById('mute-button');
    if (muteButton) {
        muteButton.textContent = isMuted ? '🔇' : '🔊';
    }
    
    // Rest of your existing startGame code...
    initializeUI();
    createBoard();
}

function initializeUI() {
    document.getElementById("mines").innerText = mines;
    const flagButton = document.getElementById("flag-button");
    flagButton.addEventListener("click", setFlag);
    
    restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", restartGame);
}

function createBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = '';
    board = [];
    
    // Add the current board style class
    boardElement.classList.add(`board-${currentBoardStyle}`);
    
    // Set grid columns based on difficulty
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    for(let r = 0; r < rows; r++) {
        let row = [];
        for(let c = 0; c < cols; c++) {
            const tile = document.createElement("div");
            tile.id = `${r}-${c}`;
            tile.classList.add('tile');
            tile.addEventListener("click", clickTile);
            boardElement.append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

function setFlag() {
    const flagButton = document.getElementById("flag-button");
    flagEnabled = !flagEnabled;
    flagButton.classList.toggle('active');

    console.log("Flagged tiles:", correctlyFlaggedMines, "Remaining mines:", mines);

}

function clickTile() {
    if(gameOver || this.classList.contains("tile-clicked" || this.innerText == "🐾")) {
        return; // Prevent action if game is over or tile has already been clicked
    }
    let tile = this; // Get the clicked tile

    if(firstClick) {
        startTimer();
        firstClick = false;
        let coords = tile.id.split("-"); // Get the coordinates
        let firstClickRow = parseInt(coords[0]); // Get row
        let firstClickCol = parseInt(coords[1]); // Get column

        //ensures first click is not a mine
        setMines(firstClickRow, firstClickCol);
    }
    if(flagEnabled){ 
        if(tile.innerText == "") {// If tile is empty, place flag
            tile.innerText = "🐾";
            document.getElementById("mines").innerText = --mines; // Decrease mines count
            if(minesLocation.includes(tile.id)){
                correctlyFlaggedMines++;
            }
        }
        else if(tile.innerText == "🐾") {  // If tile has a flag, remove it
            tile.innerText = ""; 
            document.getElementById("mines").innerText = ++mines; // Increase mines count
            if(minesLocation.includes(tile.id)){
                correctlyFlaggedMines--;
            }
        }
        return;
    }
    if(tile.innerText == "🐾") {
        return; // Prevent action if tile has a flag
    }

    if(minesLocation.includes(tile.id)) {
        revealMines();
        gameOver = true; // Set game over flag
        //alert("Game Over!"); // Alert the user
        return;
    }


    let coords = tile.id.split("-"); // Get the coordinates
    let r = parseInt(coords[0]); // Get row
    let c = parseInt(coords[1]); // Get column
    checkMine(r, c); // Check for adjacent mines
    console.log("Clicked Tile ID:", tile.id, "Tiles Clicked:", tilesClicked);

}

function revealMines() {
    // Stop background music first
    gameMusic.pause();
    gameMusic.currentTime = 0;
    
    // Play explosion sound
    const explosionSound = document.getElementById('explosionSound');
    if (explosionSound) {
        explosionSound.volume = 1.0; // Ensure full volume
        explosionSound.currentTime = 0; // Reset to start
        const playPromise = explosionSound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Error playing explosion sound:", error);
            });
        }
    }
    
    gameOver = true;
    stopTimer();
    updateGameStats('loss');

    // Show all mines
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = board[r][c];
            if(minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";
            }
            // Flag all incorrectly flagged tiles
            if(!minesLocation.includes(tile.id) && tile.innerText == "🐾") {
                tile.innerText = "❌";
                tile.style.backgroundColor = "blue";
            }
        }
    }    
    
    // Show the professor modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content game-over-modal';
    
    const gameOverText = document.createElement('h1');
    gameOverText.innerText = 'Game Over!';
    gameOverText.style.color = '#F8F9FA';
    gameOverText.style.marginBottom = '1rem';
    
    const img = document.createElement('img');
    img.src = 'assets/giphy.webp';
    img.alt = 'Game Over';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn';
    closeBtn.innerText = 'Close';
    closeBtn.onclick = () => modal.remove();
    
    modalContent.appendChild(gameOverText);
    modalContent.appendChild(img);
    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function checkMine(r,c){
    if(r < 0 || c < 0 || r >= rows || c >= cols){
        return; // Check bounds
    } 
    if(board[r][c].classList.contains("tile-clicked") || board[r][c].innerText == "🐾" ) {
        return; // Check if tile has already been clicked
    }

    board[r][c].classList.add("tile-clicked"); // Mark tile as clicked

    tilesClicked += 1;
    console.log("checkMine - Incremented tilesClicked:", tilesClicked);

    let minesFound = 0; // Counter for adjacent mines

    //top 3
    minesFound += checkTile(r-1, c-1); // Check top left
    minesFound += checkTile(r-1, c); // Check top
    minesFound += checkTile(r-1, c+1); // Check top right

    //left and right
    minesFound += checkTile(r, c-1); // Check left
    minesFound += checkTile(r, c+1); // Check right

    //bottom 3
    minesFound += checkTile(r+1, c-1); // Check bottom left
    minesFound += checkTile(r+1, c); // Check bottom
    minesFound += checkTile(r+1, c+1); // Check bottom right

    if(minesFound > 0){
        board[r][c].innerText = minesFound; // Display the number of adjacent mines
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else{
        //top 3
        checkMine(r-1, c-1); // Check top left
        checkMine(r-1, c); // Check top
        checkMine(r-1, c+1); // Check top right

        //left and right
        checkMine(r, c-1); // Check left
        checkMine(r, c+1); // Check right

        //bottom 3
        checkMine(r+1, c-1); // Check bottom left
        checkMine(r+1, c); // Check bottom
        checkMine(r+1, c+1); // Check bottom right
    }   
    // Adjusted win condition check
    if (tilesClicked == (rows * cols) - numMines) {
        // Stop background music
        gameMusic.pause();
        gameMusic.currentTime = 0;
        
        document.getElementById("mines").innerText = "Cleared";
        gameOver = true;
        stopTimer();
        updateGameStats('win');

        // Play winner sound with proper volume and ensure it plays
        const winnerSound = document.getElementById('winnerSound');
        if (winnerSound) {
            winnerSound.volume = 1.0; // Ensure full volume
            winnerSound.currentTime = 0; // Reset to start
            const playPromise = winnerSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Error playing winner sound:", error);
                });
            }
        }

        // win modal 
        const modal = document.createElement('div');
        modal.className = 'modal show';
    
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content game-over-modal';
    
        const gameOverText = document.createElement('h1');
        gameOverText.innerText = 'You Win!';
        gameOverText.style.color = '#F8F9FA';
        gameOverText.style.marginBottom = '1rem';
    
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn';
        closeBtn.innerText = 'Close';
        closeBtn.onclick = () => modal.remove();
    
        modalContent.appendChild(gameOverText);
        modalContent.appendChild(closeBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        confetti({
            particleCount: 300,
            spread: 100,
            origin: {x:1, y: 0.9 },
        });

        confetti({
            particleCount: 300,
            spread: 100,
            origin: {x:0, y: 0.9 },
        });

        // Log a message to ensure win condition is being triggered
        console.log(tilesClicked);

        // Flag all remaining unflagged mines
        minesLocation.forEach(id => {
            const [r, c] = id.split("-").map(Number);
            const tile = board[r][c];
    
            // Flag only if the tile isn't already flagged or clicked
            if (!tile.classList.contains("tile-clicked") && tile.innerText !== "🐾") {
                tile.innerText = "🐾"; // Set flag symbol
                tile.classList.add("flag"); // Optional styling
            }
        });
    }

}

function checkTile(r,c){
    if(r < 0 || c < 0 || r >= rows || c >= cols){
        return 0; // Check bounds
    } 
    if(minesLocation.includes(r.toString() + "-" + c.toString())){
        return 1; // Return 1 if mine is found
    }
    return 0;
}  // Add more game logic methods

function restartGame() {
    board = [];
    minesLocation = [];
    tilesClicked = 0;
    flagEnabled = false;
    gameOver = false;
    firstClick = true;
    correctlyFlaggedMines = 0;
    
    // Get current difficulty setting
    const difficulty = document.getElementById('difficulty').value;
    
    // Update game variables based on difficulty
    const config = difficulties[difficulty];
    rows = config.rows;
    cols = config.cols;
    mines = config.mines;
    numMines = config.numMines;

    document.getElementById("mines").innerText = mines;
    document.getElementById("flag-button").classList.remove("active");
    
    resetTimer();
    stopTimer();
    startGame();
    
    // Restart music if not muted
    if (!isMuted) {
        gameMusic.currentTime = 0;
        gameMusic.play().catch(error => {
            console.log("Audio autoplay failed:", error);
        });
    }
}

function showInstructions() {
    document.getElementById("instructionsModal").classList.add("show");
}

function closeInstructions() {
    document.getElementById("instructionsModal").classList.remove("show");
}

function changeDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    const config = difficulties[difficulty];
    
    // Update game variables
    rows = config.rows;
    cols = config.cols;
    mines = config.mines; // set mines based on difficulty
    numMines = config.numMines;
    
    // Restart game with new settings
    restartGame();
}

function changeBoardStyle() {
    const board = document.getElementById('board');
    const newStyle = document.getElementById('boardStyle').value;
    
    // Remove old style and shooting stars
    board.classList.remove(`board-${currentBoardStyle}`);
    const oldStars = board.querySelectorAll('.shooting-star');
    oldStars.forEach(star => star.remove());
    
    // Add new style
    board.classList.add(`board-${newStyle}`);
    
    // Add new shooting stars if cosmic theme
    if (newStyle === 'cosmic') {
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.classList.add('shooting-star');
            board.appendChild(star);
        }
    }
    
    currentBoardStyle = newStyle;
}

function changeColorTheme() {
    const body = document.body;
    const newTheme = document.getElementById('colorTheme').value;
    
    // Remove old theme
    body.classList.remove(`theme-${currentColorTheme}`);
    // Add new theme
    body.classList.add(`theme-${newTheme}`);
    
    currentColorTheme = newTheme;
}

function showThemes() {
    document.getElementById("themesModal").classList.add("show");
}

function closeThemes() {
    document.getElementById("themesModal").classList.remove("show");
}

function startTimer() {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Reset elapsed time
    elapsedTime = 0;
    updateTimerDisplay();
    
    // Start the timer
    timerInterval = setInterval(() => {
        elapsedTime++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById("timer").innerText = `Time: ${formattedTime}`;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    updateTimerDisplay();
}

function toggleMute() {
    isMuted = !isMuted;
    const muteButton = document.getElementById('mute-button');
    
    if (isMuted) {
        gameMusic.pause();
        muteButton.textContent = '🔇';
    } else {
        // Only play if game is not over
        if (!gameOver) {
            gameMusic.play();
        }
        muteButton.textContent = '🔊';
    }
}

