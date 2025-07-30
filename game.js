// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const TOTAL_DOTS = 150;

// Game state
let score = 0;
let lives = 3;
let gameBoard = [];
let pacmanPosition = { x: 1, y: 1 };
let ghostPosition = { x: 18, y: 18 };
let gameInterval;
let dotsRemaining;
let isPaused = false;

// Initialize the game board
function initializeBoard() {
    const board = document.getElementById('game-board');
    board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`;
    
    // Create the maze layout
    for (let y = 0; y < GRID_SIZE; y++) {
        gameBoard[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.style.width = `${CELL_SIZE}px`;
            cell.style.height = `${CELL_SIZE}px`;
            
            // Create walls around the edges and some random internal walls
            if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1 ||
                (Math.random() < 0.2 && x !== 1 && y !== 1 && x !== 18 && y !== 18)) {
                cell.classList.add('wall');
                gameBoard[y][x] = 'wall';
            } else {
                cell.classList.add('path');
                if (x !== 1 || y !== 1) { // Don't place dot at Pacman's starting position
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    cell.appendChild(dot);
                    gameBoard[y][x] = 'dot';
                } else {
                    gameBoard[y][x] = 'empty';
                }
            }
            board.appendChild(cell);
        }
    }
    
    // Place Pacman and Ghost
    updatePacmanPosition(1, 1);
    updateGhostPosition(18, 18);
    
    // Count initial dots
    dotsRemaining = document.querySelectorAll('.dot').length;
}

// Update Pacman's position
function updatePacmanPosition(x, y) {
    const cells = document.getElementById('game-board').children;
    // Remove Pacman from previous position
    cells[pacmanPosition.y * GRID_SIZE + pacmanPosition.x].innerHTML = '';
    
    // Update position
    pacmanPosition.x = x;
    pacmanPosition.y = y;
    
    // Create new Pacman element
    const pacman = document.createElement('div');
    pacman.classList.add('pacman');
    cells[y * GRID_SIZE + x].appendChild(pacman);
    
    // Check if Pacman ate a dot
    if (gameBoard[y][x] === 'dot') {
        gameBoard[y][x] = 'empty';
        score += 10;
        dotsRemaining--;
        document.getElementById('score').textContent = score;
        
        // Check win condition
        if (dotsRemaining === 0) {
            endGame(true);
        }
    }
}

// Update Ghost's position
function updateGhostPosition(x, y) {
    const cells = document.getElementById('game-board').children;
    // Remove Ghost from previous position
    const previousCell = cells[ghostPosition.y * GRID_SIZE + ghostPosition.x];
    if (previousCell.querySelector('.ghost')) {
        previousCell.removeChild(previousCell.querySelector('.ghost'));
    }
    
    // Update position
    ghostPosition.x = x;
    ghostPosition.y = y;
    
    // Create new Ghost element
    const ghost = document.createElement('div');
    ghost.classList.add('ghost');
    cells[y * GRID_SIZE + x].appendChild(ghost);
    
    // Check collision with Pacman
    if (x === pacmanPosition.x && y === pacmanPosition.y) {
        handleCollision();
    }
}

// Move ghost towards Pacman
function moveGhost() {
    const possibleMoves = [
        { x: ghostPosition.x - 1, y: ghostPosition.y },
        { x: ghostPosition.x + 1, y: ghostPosition.y },
        { x: ghostPosition.x, y: ghostPosition.y - 1 },
        { x: ghostPosition.x, y: ghostPosition.y + 1 }
    ];
    
    // Filter out invalid moves (walls)
    const validMoves = possibleMoves.filter(move => 
        gameBoard[move.y][move.x] !== 'wall'
    );
    
    if (validMoves.length > 0) {
        // Choose the move that gets closest to Pacman
        const bestMove = validMoves.reduce((best, move) => {
            const currentDistance = Math.abs(move.x - pacmanPosition.x) + 
                                 Math.abs(move.y - pacmanPosition.y);
            const bestDistance = Math.abs(best.x - pacmanPosition.x) + 
                               Math.abs(best.y - pacmanPosition.y);
            return currentDistance < bestDistance ? move : best;
        });
        
        updateGhostPosition(bestMove.x, bestMove.y);
    }
}

// Handle collision between Pacman and Ghost
function handleCollision() {
    lives--;
    document.getElementById('lives').textContent = lives;
    
    if (lives <= 0) {
        endGame(false);
        return;
    }
    
    // Reset positions
    updatePacmanPosition(1, 1);
    updateGhostPosition(18, 18);
}

// Handle keyboard input
function handleKeyPress(event) {
    const key = event.key;
    
    // If game is paused, any key will unpause except Escape which toggles
    if (isPaused && key !== 'Escape') {
        togglePause();
        return;
    }
    
    if (key === 'Escape') {
        togglePause();
        return;
    }
    
    // Don't process movement when game is paused
    if (isPaused) return;
    
    let newX = pacmanPosition.x;
    let newY = pacmanPosition.y;
    
    switch (key) {
        case 'ArrowLeft':
            newX--;
            break;
        case 'ArrowRight':
            newX++;
            break;
        case 'ArrowUp':
            newY--;
            break;
        case 'ArrowDown':
            newY++;
            break;
        default:
            return;
    }
    
    // Check if the new position is valid (not a wall)
    if (gameBoard[newY][newX] !== 'wall') {
        updatePacmanPosition(newX, newY);
    }
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (isPaused) {
        clearInterval(gameInterval);
        gameInterval = null; // Clear the interval ID
    } else {
        if (!gameInterval) { // Only create new interval if one doesn't exist
            gameInterval = setInterval(() => moveGhost(), 500);
        }
    }
}

// End the game
function endGame(won) {
    clearInterval(gameInterval);
    document.removeEventListener('keydown', handleKeyPress);
    
    if (won) {
        document.getElementById('win-screen').classList.remove('hidden');
    } else {
        document.getElementById('game-over').classList.remove('hidden');
    }
}

// Restart the game
function restartGame() {
    // Reset game state
    score = 0;
    lives = 3;
    isPaused = false;
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('pause-btn').textContent = 'Pause';
    
    // Clear the game board
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    // Hide end game screens
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('win-screen').classList.add('hidden');
    
    // Initialize new game
    initializeBoard();
    startGame();
}

// Start the game
function startGame() {
    document.addEventListener('keydown', handleKeyPress);
    gameInterval = setInterval(() => moveGhost(), 500); // Ghost moves every 500ms
}

// Initialize the game when the page loads
window.onload = () => {
    initializeBoard();
    startGame();
};
