// Knight's Tour Visualizer
let path = [];
let currentIndex = -1;
let isSolving = false;
let isPaused = false;
let currentPos = [0, 0];
let boardState = []; // Track visited status for manual/hints: 0=empty, >0=step number
let hintsUsed = 0;
let score = 0;
let timerInterval;
let secondsElapsed = 0;
let manualMode = true; // True if user is clicking or using hints manually

function initBoard() {
    const board = document.getElementById('knightBoard');
    board.innerHTML = '';

    // Initialize board state 8x8
    boardState = new Array(64).fill(-1);

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                cursor: pointer;
                background: ${(row + col) % 2 === 0 ? '#cbd5e1' : '#475569'};
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            cell.addEventListener('click', () => handleCellClick(row, col));
            board.appendChild(cell);
        }
    }

    updateBoard();
    updateExplanation("Click any cell to set starting position.");
}

function handleCellClick(row, col) {
    if (isSolving) return;

    // First move needs to set start
    if (currentIndex === -1) {
        startTimer();
        manualMode = true;
        currentPos = [row, col];
        path = [[row, col]];
        currentIndex = 0;
        boardState[row * 8 + col] = 0; // step 0
        updateBoard();
        updateStats();
        updateExplanation(`Starting at [${row}, ${col}]. Select next move.`);
        calculateScore();
        return;
    }

    // Subsequent manual moves checks validity
    if (isValidMove(row, col)) {
        currentPos = [row, col];
        path.push([row, col]);
        currentIndex++;
        boardState[row * 8 + col] = currentIndex;
        updateBoard();
        updateStats();
        updateExplanation(`Moved to [${row}, ${col}].`);
        calculateScore();
    } else {
        updateExplanation("Invalid move! Knight moves in L-shape.");
        // Visual feedback
        const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('unsafe');
            setTimeout(() => cell.classList.remove('unsafe'), 500);
        }
        score -= 5; // Penalty for invalid click
        calculateScore();
    }
}

function isValidMove(row, col) {
    const dx = Math.abs(row - currentPos[0]);
    const dy = Math.abs(col - currentPos[1]);
    // Standard knight move (2+1) and not visited
    if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;

    // Check if visited (in current path)
    return !path.some(p => p[0] === row && p[1] === col);
}

function updateBoard() {
    const cells = document.querySelectorAll('#knightBoard > div');

    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Remove hint highlight
        cell.classList.remove('hint-highlight', 'unsafe');

        // Check if in path
        const stepIndex = getStepIndex(row, col);
        const isVisited = stepIndex !== -1 && stepIndex <= currentIndex;
        const isCurrent = currentPos[0] === row && currentPos[1] === col;

        cell.innerHTML = '';
        cell.style.background = (row + col) % 2 === 0 ? '#cbd5e1' : '#475569';

        if (isCurrent) {
            cell.innerHTML = '<span style="font-size: 2.5rem; color: #34d399; filter: drop-shadow(0 0 10px #34d399);">♞</span>';
        } else if (isVisited) {
            cell.innerHTML = `<span style="font-size: 0.75rem; font-family: monospace; color: #6ee7b7;">${stepIndex + 1}</span>`;
            cell.style.background = 'rgba(16, 185, 129, 0.2)';
        }
    });

    drawPath();
}

function getStepIndex(row, col) {
    for (let i = 0; i < path.length; i++) {
        if (path[i][0] === row && path[i][1] === col) return i;
    }
    return -1;
}

function drawPath() {
    const svg = document.getElementById('pathSvg');
    svg.innerHTML = '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#34d399" /></marker></defs>';

    if (path.length <= 1) return;

    const multiplier = 12.5;
    const offset = 6.25;

    for (let i = 0; i < currentIndex && i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', `${p1[1] * multiplier + offset}%`);
        line.setAttribute('y1', `${p1[0] * multiplier + offset}%`);
        line.setAttribute('x2', `${p2[1] * multiplier + offset}%`);
        line.setAttribute('y2', `${p2[0] * multiplier + offset}%`);
        line.setAttribute('stroke', '#34d399');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrow)');
        line.setAttribute('opacity', '0.7');
        svg.appendChild(line);
    }
}

// Hint Logic
async function getHint() {
    if (isSolving || currentIndex === -1) {
        if (currentIndex === -1) updateExplanation("Set start position first.");
        return;
    }

    try {
        // Construct array for backend: -1 unvisited, else something else. 
        // Logic on backend uses board[x,y] == -1 check.
        const flatBoard = new Array(64).fill(-1);
        path.forEach(p => {
            flatBoard[p[0] * 8 + p[1]] = 1; // Mark as visited
        });

        const response = await fetch('/KnightsTour/GetNextMove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                board: flatBoard,
                currentRow: currentPos[0],
                currentCol: currentPos[1]
            })
        });

        if (!response.ok) {
            updateExplanation("No valid moves available (trapped!). Backtrack or Reset.");
            return;
        }

        const move = await response.json();

        // Highlight hint
        const cell = document.querySelector(`div[data-row="${move.row}"][data-col="${move.col}"]`);
        if (cell) {
            cell.classList.add('hint-highlight'); // Need CSS for this
            cell.style.border = '2px solid #facc15';
            setTimeout(() => {
                cell.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                cell.classList.remove('hint-highlight');
            }, 2000);
        }

        hintsUsed++;
        calculateScore();
        updateExplanation(`Hint: Move to [${move.row}, ${move.col}]`);

    } catch (error) {
        console.error('Error getting hint:', error);
    }
}

// Timer & Score
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

function calculateScore() {
    // Base 2000 (harder puzzle)
    // -2 per second
    // -50 per hint
    // +10 per visited square
    let visitedCount = path.length;
    let s = 2000 - (secondsElapsed * 2) - (hintsUsed * 50) + (visitedCount * 10);
    if (s < 0) s = 0;
    score = s;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

// Solver Logic
async function visualize() {
    if (isSolving) return;

    // Reset if we are just starting or finished previous run
    if (path.length <= 1) {
        // keep start pos if set
    }

    isSolving = true;
    manualMode = false;
    startTimer();
    document.getElementById('solveBtn').textContent = 'Solving...';
    document.getElementById('stepControls').style.display = 'flex';

    try {
        const response = await fetch('/KnightsTour/SolveTour', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startRow: currentPos[0], startCol: currentPos[1] })
        });

        const fullPath = await response.json();

        // Merge full path? No, replace path but keep start
        path = fullPath;
        // currentIndex starts at 0 (start pos)

        // Loop animation
        while (currentIndex < path.length - 1) {
            if (isPaused) {
                await sleep(100);
                continue;
            }
            if (!isSolving) break; // Exit if reset

            currentIndex++;
            currentPos = path[currentIndex];
            updateBoard();
            updateStats();
            updateExplanation(`Step ${currentIndex}: [${currentPos[0]}, ${currentPos[1]}]`);
            calculateScore();

            await sleep(document.getElementById('pauseBtn').textContent === '||' ? 100 : 50);
        }

    } catch (error) {
        console.error('Error:', error);
    }

    isSolving = false;
    stopTimer();
    document.getElementById('solveBtn').textContent = 'Start Tour';
    updateExplanation("Tour Completed!");
    showResultOverlay();
}

function updateStats() {
    const visited = currentIndex + 1;
    document.getElementById('visited').textContent = `${visited} / 64`;
    document.getElementById('progressFill').style.width = `${(visited / 64) * 100}%`;
}

function updateExplanation(text) {
    const el = document.getElementById('explanationText');
    if (el) el.textContent = text;
}

function reset() {
    isSolving = false;
    isPaused = false;
    stopTimer();
    path = [];
    currentIndex = -1;
    currentPos = [0, 0];
    secondsElapsed = 0;
    hintsUsed = 0;
    score = 0;
    document.getElementById('timerDisplay').textContent = '00:00';
    document.getElementById('scoreDisplay').textContent = 'Score: 0';

    updateBoard();
    document.getElementById('visited').textContent = '0 / 64';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('solveBtn').textContent = 'Start Tour';
    document.getElementById('stepControls').style.display = 'none';
    updateExplanation("Click any cell to set starting position.");
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '▶' : '||';
}

function nextStep() {
    isPaused = true;
    document.getElementById('pauseBtn').textContent = '▶';
    if (currentIndex < path.length - 1) {
        currentIndex++;
        currentPos = path[currentIndex];
        updateBoard();
        updateStats();
        updateExplanation(`Step ${currentIndex}`);
    }
}

function prevStep() {
    isPaused = true;
    document.getElementById('pauseBtn').textContent = '▶';
    if (currentIndex > 0) {
        currentIndex--;
        currentPos = path[currentIndex];
        updateBoard();
        updateStats();
        updateExplanation(`Step ${currentIndex}`);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', () => {
    initBoard();
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('solveBtn').addEventListener('click', visualize);
    document.getElementById('hintBtn').addEventListener('click', getHint);

    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('nextStepBtn').addEventListener('click', nextStep);
    document.getElementById('prevStepBtn').addEventListener('click', prevStep);
    document.getElementById('closeResultBtn').addEventListener('click', closeResultOverlay);
});

function showResultOverlay() {
    const moves = currentIndex + 1; // Visited count
    const finalScore = score;
    document.getElementById('resultMovesValue').textContent = moves;
    document.getElementById('resultScoreValue').textContent = finalScore;
    document.getElementById('resultOverlay').style.display = 'flex';
}

function closeResultOverlay() {
    document.getElementById('resultOverlay').style.display = 'none';
}
