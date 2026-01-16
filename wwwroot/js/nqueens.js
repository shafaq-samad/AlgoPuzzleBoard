// N-Queens Visualizer JavaScript
const N = 8;
let board = new Array(N).fill(-1); // board[row] = col, -1 if empty
let isSolving = false;
let isPaused = false;
let currentStepIndex = 0;
let solutionSteps = [];
let timerInterval;
let secondsElapsed = 0;
let hintsUsed = 0;
let score = 0;

// Initialize the board
function initBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';

    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            const square = document.createElement('div');
            square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', () => toggleQueen(row, col));
            chessboard.appendChild(square);
        }
    }

    updateBoard();
    updateExplanation("Click a square to place a queen or use Auto Solve.");
}

// Toggle queen placement (manual mode)
function toggleQueen(row, col) {
    if (isSolving) return;

    // Start timer on first move if not running
    if (secondsElapsed === 0 && !timerInterval) {
        startTimer();
    }

    if (board[row] === col) {
        board[row] = -1;
        updateExplanation(`Removed queen at [${row}, ${col}]`);
    } else {
        board[row] = col;
        updateExplanation(`Placed queen at [${row}, ${col}]`);
    }

    updateBoard();
    updateStats();
    calculateScore();
}

// Update the visual board
function updateBoard() {
    const squares = document.querySelectorAll('.chess-square');

    squares.forEach(square => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        square.innerHTML = '';
        square.classList.remove('unsafe', 'hint-highlight');

        // Check if queen is placed here
        if (board[row] === col) {
            const queen = document.createElement('span');
            queen.textContent = '♛';
            queen.className = 'animate-bounce-in';
            queen.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';
            square.appendChild(queen);

            // Check if this position is safe
            if (!isSafe(row, col)) {
                square.classList.add('unsafe');
            }
        }
    });
}

// Check if a position is safe
function isSafe(row, col) {
    for (let r = 0; r < N; r++) {
        if (r === row) continue;
        if (board[r] === -1) continue;

        const c = board[r];
        if (c === col || Math.abs(c - col) === Math.abs(r - row)) {
            return false;
        }
    }
    return true;
}

// Update stats display
function updateStats() {
    const queensCount = board.filter(c => c !== -1).length;
    document.getElementById('queensPlaced').textContent = `${queensCount} / ${N}`;

    const progress = Math.round((queensCount / N) * 100);
    document.getElementById('progressPercent').textContent = `${progress}%`;

    // Check if solved (manual mode)
    if (queensCount === N && board.every((c, r) => isSafe(r, c))) {
        stopTimer();
        updateExplanation("Congratulations! You solved the N-Queens puzzle!");
        showResultOverlay();
    }
}

// Timer Logic
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const seconds = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
        calculateScore();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    secondsElapsed = 0;
    hintsUsed = 0;
    score = 0;
    document.getElementById('timerDisplay').textContent = "00:00";
    document.getElementById('scoreDisplay').textContent = "Score: 0";
}

// Score Logic
function calculateScore() {
    // Base score 1000
    // Penalties: Time * 1, Hints * 50
    const backtracks = parseInt(document.getElementById('backtracks').textContent) || 0;
    let currentScore = 1000 - (secondsElapsed * 2) - (hintsUsed * 50) - (backtracks * 5);
    if (currentScore < 0) currentScore = 0;
    score = currentScore;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

// Hint Functionality
async function getHint() {
    if (isSolving) return;

    try {
        const response = await fetch('/NQueens/GetNextMove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(board)
        });

        if (!response.ok) {
            updateExplanation("No valid hint available. You might need to backtrack.");
            return;
        }

        const move = await response.json();
        hintsUsed++;
        calculateScore();

        // Highlight the hint square
        const squares = document.querySelectorAll('.chess-square');
        const targetSquare = Array.from(squares).find(s =>
            parseInt(s.dataset.row) === move.row && parseInt(s.dataset.col) === move.col
        );

        if (targetSquare) {
            targetSquare.classList.add('hint-highlight'); // Add yellow border/glow
            targetSquare.style.background = 'rgba(250, 204, 21, 0.4)';
            updateExplanation(`Hint: Place queen at Row ${move.row + 1}, Col ${move.col + 1}`);

            // Auto remove highlight after 2 seconds
            setTimeout(() => {
                targetSquare.style.background = '';
                updateBoard();
            }, 2000);
        }

    } catch (error) {
        console.error('Error getting hint:', error);
    }
}

// Update Explanation Text
function updateExplanation(text) {
    const el = document.getElementById('explanationText');
    if (el) el.textContent = text;
}

// Reset board
function resetBoard() {
    board = new Array(N).fill(-1);
    isSolving = false;
    isPaused = false;
    currentStepIndex = 0;
    solutionSteps = [];
    resetTimer();
    updateBoard();
    updateStats();
    document.getElementById('backtracks').textContent = '0';
    document.getElementById('solveBtn').textContent = 'Auto Solve';
    document.getElementById('stepControls').style.display = 'none';
    updateExplanation("Board reset. Start placing queens or use Auto Solve.");
}

// Solve using backtracking
async function startSolver() {
    if (isSolving) return;

    resetBoard();
    isSolving = true;
    startTimer();
    document.getElementById('solveBtn').textContent = 'Solving...';
    document.getElementById('stepControls').style.display = 'flex';

    try {
        const response = await fetch('/NQueens/Solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(N)
        });

        solutionSteps = await response.json();

        // Start animation loop
        animateLoop();

    } catch (error) {
        console.error('Error solving N-Queens:', error);
        isSolving = false;
        document.getElementById('solveBtn').textContent = 'Auto Solve';
    }
}

// Animation Loop for Step-by-Step
async function animateLoop() {
    if (!isSolving) return;

    while (currentStepIndex < solutionSteps.length) {
        if (isPaused) {
            await sleep(100);
            continue;
        }

        await showStep(currentStepIndex);
        currentStepIndex++;

        // Dynamic speed based on backtracks (optional, but keeping simple for now)
        await sleep(document.getElementById('pauseBtn').textContent === '||' ? 200 : 50); // Slower if normal play
    }

    isSolving = false;
    stopTimer();
    document.getElementById('solveBtn').textContent = 'Solved';
    updateExplanation("Solution Complete!");
    showResultOverlay();
}

async function showStep(index) {
    if (index < 0 || index >= solutionSteps.length) return;

    const step = solutionSteps[index];
    board = [...step.board];

    // Update explanation based on board state change
    const queensCount = board.filter(c => c !== -1).length;
    let statusMsg = step.isSolution ? "Solution Found!" : `Step ${index + 1}: Checking placement...`;

    if (step.backtracks > parseInt(document.getElementById('backtracks').textContent)) {
        statusMsg = "Backtracking due to conflict...";
    }

    updateExplanation(statusMsg);
    updateBoard();
    document.getElementById('backtracks').textContent = step.backtracks;
    updateStats();
    calculateScore();
}

// Step Controls
function pauseSolver() {
    isPaused = !isPaused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = isPaused ? '▶' : '||';
}

function nextStep() {
    if (!isSolving && currentStepIndex === 0 && solutionSteps.length > 0) {
        // Manual step through after solve
        isSolving = true; // tricky logic, might need adjustment
    }
    isPaused = true;
    document.getElementById('pauseBtn').textContent = '▶';

    if (currentStepIndex < solutionSteps.length - 1) {
        currentStepIndex++;
        showStep(currentStepIndex);
    }
}

function prevStep() {
    isPaused = true;
    document.getElementById('pauseBtn').textContent = '▶';

    if (currentStepIndex > 0) {
        currentStepIndex--;
        showStep(currentStepIndex);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initBoard();

    document.getElementById('resetBtn').addEventListener('click', resetBoard);
    document.getElementById('solveBtn').addEventListener('click', startSolver);
    document.getElementById('hintBtn').addEventListener('click', getHint);

    document.getElementById('pauseBtn').addEventListener('click', pauseSolver);
    document.getElementById('nextStepBtn').addEventListener('click', nextStep);
    document.getElementById('prevStepBtn').addEventListener('click', prevStep);
    document.getElementById('closeResultBtn').addEventListener('click', closeResultOverlay);
});

function showResultOverlay() {
    const queensCount = String(board.filter(c => c !== -1).length);
    const finalScore = score;
    document.getElementById('resultQueensValue').textContent = queensCount;
    document.getElementById('resultScoreValue').textContent = finalScore;
    document.getElementById('resultOverlay').style.display = 'flex';
}

function closeResultOverlay() {
    document.getElementById('resultOverlay').style.display = 'none';
}
