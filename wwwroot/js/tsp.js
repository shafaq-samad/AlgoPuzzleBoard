// TSP Visualizer
let cities = [];
let route = []; // Current path (indices)
let finalTour = []; // Full solution (indices)
let isSolving = false;
let isPaused = false;
let score = 0;
let timerInterval;
let secondsElapsed = 0;
let hintsUsed = 0;
let manualMode = true;
let animationTimeout = null;

// Initialize SVG
const svg = document.getElementById('tspSvg');
const mapContainer = document.getElementById('mapContainer');

// Listen for clicks on map to add cities
mapContainer.addEventListener('click', (e) => {
    if (isSolving && !isPaused && route.length < finalTour.length) return; // Block only if auto-playing

    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked near existing city (to select it)
    const clickedCityIndex = cities.findIndex(c => Math.abs(c.x - x) < 15 && Math.abs(c.y - y) < 15);

    if (clickedCityIndex !== -1) {
        handleCityClick(clickedCityIndex);
    } else {
        addCity(x, y);
    }
});

function addCity(x, y) {
    if (route.length > 0 && manualMode && !isSolving) {
        resetRoute();
    }
    // If we were in solved state, adding a city resets everything
    if (finalTour.length > 0) {
        resetRoute();
        finalTour = [];
        document.getElementById('stepControls').style.display = 'none';
        document.getElementById('solveBtn').textContent = 'Calculate Route';
    }

    cities.push({ x, y, id: cities.length });
    renderMap();
    updateStats();
    updateExplanation("Added city. Click map to add more, or click a city to start manual path.");
}

function handleCityClick(index) {
    // If auto-solving/playing, ignore clicks unless finalized? 
    // Actually, let's allow manual override if paused? For now, simple block.
    if (isSolving && !isPaused && route.length < finalTour.length) return;

    if (route.length === 0) {
        // Start manual path
        startTimer();
        manualMode = true;
        route.push(index);
        updateExplanation(`Starting at City ${index + 1}. Choose next city.`);
    } else {
        // Add to path if valid
        const isStartNode = index === route[0];
        const canCloseLoop = isStartNode && route.length === cities.length;

        if (!route.includes(index) || canCloseLoop) {
            route.push(index);
            calculateScore();

            if (canCloseLoop) {
                stopTimer();
                updateExplanation("Tour complete! (Manual)");
            } else if (route.length === cities.length) {
                updateExplanation("All cities visited. Return to start (City " + (route[0] + 1) + ") to complete loop.");
            } else {
                updateExplanation(`Visited City ${index + 1}.`);
            }
        }
    }
    renderMap();
    updateStats();
}

function renderMap() {
    svg.innerHTML = '';

    // Draw Route
    if (route.length > 1) {
        for (let i = 0; i < route.length - 1; i++) {
            drawLine(cities[route[i]], cities[route[i + 1]]);
        }
    }

    // Draw Cities
    cities.forEach((city, i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', city.x);
        circle.setAttribute('cy', city.y);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', route.includes(i) ? '#10b981' : '#60a5fa');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '2');
        circle.classList.add('city-node');
        circle.dataset.id = i;

        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', city.x);
        text.setAttribute('y', city.y - 15);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-size', '12');
        text.textContent = i + 1;

        svg.appendChild(circle);
        svg.appendChild(text);
    });
}

function drawLine(c1, c2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', c1.x);
    line.setAttribute('y1', c1.y);
    line.setAttribute('x2', c2.x);
    line.setAttribute('y2', c2.y);
    line.setAttribute('stroke', '#fbbf24');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0.6');
    svg.appendChild(line);
}

function updateStats() {
    document.getElementById('cityCount').textContent = cities.length;

    // Calculate distance
    let dist = 0;
    if (route.length > 1) {
        for (let i = 0; i < route.length - 1; i++) {
            dist += getDist(cities[route[i]], cities[route[i + 1]]);
        }
    }
    document.getElementById('totalDistance').textContent = Math.round(dist) + ' px';

    const emptyMsg = document.getElementById('emptyMessage');
    if (cities.length > 0) emptyMsg.style.display = 'none';
    else emptyMsg.style.display = 'flex';
}

function getDist(c1, c2) {
    return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
}

// Hint Logic
async function getHint() {
    if (cities.length < 2) return;

    try {
        const response = await fetch('/TSP/GetNextMove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Cities: cities.map(c => ({ X: c.x, Y: c.y })), // Map to backend model
                CurrentPath: route
            })
        });

        if (!response.ok) {
            updateExplanation("No hint available.");
            return;
        }

        const move = await response.json();

        // Highlight city
        const circle = document.querySelector(`circle[data-id="${move.nextCityIndex}"]`);
        if (circle) {
            const OriginalR = circle.getAttribute('r');
            circle.setAttribute('r', '15');
            circle.setAttribute('fill', '#facc15');
            setTimeout(() => {
                circle.setAttribute('r', OriginalR);
                renderMap(); // Reset color
            }, 1000);
        }

        updateExplanation(`Hint: Next best city is ${move.nextCityIndex + 1}`);
        hintsUsed++;
        calculateScore();

    } catch (error) {
        console.error("Error getting hint:", error);
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
    let s = 2000 - (secondsElapsed * 2) - (hintsUsed * 50);
    if (s < 0) s = 0;
    score = s;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

// Solver & Controls
async function solveTSP() {
    if (isSolving || cities.length < 2) return;

    isSolving = true;
    manualMode = false;
    route = []; // Clear manual path
    startTimer();
    document.getElementById('solveBtn').textContent = 'Calculating...';
    document.getElementById('stepControls').style.display = 'flex';

    try {
        const response = await fetch('/TSP/SolveTSP', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cities.map(c => ({ X: c.x, Y: c.y })))
        });

        const result = await response.json();
        // Backend returns standard array of indices. 
        // Note: Backend usually returns closed loop? e.g. 0, 2, 1, 0
        // Or just 0, 2, 1?
        // Let's assume it returns standard path. If it doesn't close loop, we add start at end.

        let tour = result.tour;
        if (tour.length === cities.length && tour[0] !== tour[tour.length - 1]) {
            // Close loop locally for visualization if backend didn't
            tour.push(tour[0]);
        }

        finalTour = tour;
        // Start Auto Play
        isPaused = false;
        document.getElementById('pauseBtn').textContent = '||';
        playAnimation();

    } catch (error) {
        console.error("Error solving TSP:", error);
        isSolving = false;
        document.getElementById('solveBtn').textContent = 'Calculate Route';
    }
}

function playAnimation() {
    if (isPaused) return;

    // Recursive timeout for variable speed control if needed, using simple timeout for now
    clearTimeout(animationTimeout);
    animationTimeout = setTimeout(() => {
        if (isPaused) return;

        if (route.length < finalTour.length) {
            stepForward();
            playAnimation(); // Continue loop
        } else {
            // Done
            isSolving = false;
            stopTimer();
            document.getElementById('solveBtn').textContent = 'Calculate Route';
            updateExplanation("Tour Calculated.");
            showResultOverlay();
        }
    }, 200);
}

function stepForward() {
    if (route.length >= finalTour.length) return;

    const nextCityIndex = finalTour[route.length];
    route.push(nextCityIndex);

    renderMap();
    updateStats();
    updateExplanation(`Visiting City ${nextCityIndex + 1}`);
    calculateScore();
}

function stepBackward() {
    if (route.length <= 1) return; // Don't remove start node usually, or maybe yes? Let's keep at least 1 or 0? 
    // Usually keep 0.

    route.pop();
    renderMap();
    updateStats();
    updateExplanation("Stepped back.");
}

// Control Event Handlers
function onPrevStep() {
    isPaused = true;
    document.getElementById('pauseBtn').textContent = '▶';
    stepBackward();
}

function onNextStep() {
    isPaused = true;
    document.getElementById('pauseBtn').textContent = '▶';
    stepForward();
}

function onPauseToggle() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '▶' : '||';
    if (!isPaused) {
        playAnimation();
    }
}

function resetRoute() {
    route = [];
    finalTour = [];
    isSolving = false;
    isPaused = false;
    clearTimeout(animationTimeout);
    renderMap();
    updateStats();
}

function resetAll() {
    cities = [];
    resetRoute();
    stopTimer();
    secondsElapsed = 0;
    hintsUsed = 0;
    score = 0;
    document.getElementById('timerDisplay').textContent = "00:00";
    document.getElementById('scoreDisplay').textContent = "Score: 0";
    document.getElementById('stepControls').style.display = 'none';
    updateExplanation("Map cleared.");
}

function updateExplanation(text) {
    const el = document.getElementById('explanationText');
    if (el) el.textContent = text;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    document.getElementById('solveBtn').addEventListener('click', solveTSP);
    document.getElementById('hintBtn').addEventListener('click', getHint);

    document.getElementById('prevStepBtn').addEventListener('click', onPrevStep);
    document.getElementById('nextStepBtn').addEventListener('click', onNextStep);
    document.getElementById('pauseBtn').addEventListener('click', onPauseToggle);
    document.getElementById('closeResultBtn').addEventListener('click', closeResultOverlay);
});

function showResultOverlay() {
    const totalDist = document.getElementById('totalDistance').textContent;
    const finalScore = score;
    document.getElementById('resultDistanceValue').textContent = totalDist;
    document.getElementById('resultScoreValue').textContent = finalScore;
    document.getElementById('resultOverlay').style.display = 'flex';
}

function closeResultOverlay() {
    document.getElementById('resultOverlay').style.display = 'none';
}
