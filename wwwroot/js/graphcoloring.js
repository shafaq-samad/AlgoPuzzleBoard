// Graph Coloring Visualizer
let graph = { nodes: [], edges: [] };
const colors = ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#eab308'];
let isSolving = false;
let isPaused = false;
let selectedColorIndex = -1;
let score = 0;
let timerInterval;
let secondsElapsed = 0;
let hintsUsed = 0;
let conflictsCount = 0;

async function generateGraph() {
    try {
        const response = await fetch('/GraphColoring/GenerateGraph', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(0)
        });
        graph = await response.json();

        // Reset state
        resetStateOnly();
        renderGraph();
        updateStats();
        updateExplanation("Graph generated. Select a color from palette and click a node.");
    } catch (error) {
        console.error("Error generating graph:", error);
    }
}

function renderGraph() {
    const svg = document.getElementById('graphSvg');
    svg.innerHTML = '';

    // Draw edges first
    // Draw edges first
    graph.edges.forEach(edge => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        // Use percentages for positioning
        const x1 = graph.nodes[edge.source].x + '%';
        const y1 = graph.nodes[edge.source].y + '%';
        const x2 = graph.nodes[edge.target].x + '%';
        const y2 = graph.nodes[edge.target].y + '%';

        // Check conflict for styling
        const n1 = graph.nodes[edge.source];
        const n2 = graph.nodes[edge.target];
        let isConflict = false;
        if (n1.colorIndex !== -1 && n1.colorIndex === n2.colorIndex) {
            isConflict = true;
        }

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', isConflict ? '#f87171' : '#475569');
        line.setAttribute('stroke-width', isConflict ? '3' : '2');
        if (isConflict) line.classList.add('animate-pulse');
        svg.appendChild(line);
    });

    // Draw nodes
    graph.nodes.forEach((node, i) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const x = node.x + '%';
        const y = node.y + '%';

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '25');
        circle.setAttribute('fill', node.colorIndex === -1 ? '#334155' : colors[node.colorIndex] || '#64748b');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('data-id', i);
        circle.style.cursor = 'pointer';
        circle.onclick = () => handleNodeClick(i);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('dy', '5'); // Use dy for offset instead of y calculation
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.textContent = i + 1;
        text.style.pointerEvents = 'none';

        g.appendChild(circle);
        g.appendChild(text);
        svg.appendChild(g);
    });
}

function handleNodeClick(index) {
    if (isSolving) return;

    // Start timer on first interact
    if (secondsElapsed === 0 && !timerInterval) startTimer();

    if (selectedColorIndex === -1) {
        // cycle if no palette selected
        graph.nodes[index].colorIndex = (graph.nodes[index].colorIndex + 1) % colors.length;
    } else {
        graph.nodes[index].colorIndex = selectedColorIndex;
    }

    renderGraph();
    updateStats();
    calculateScore();
}

// Stats & Score
function updateStats() {
    const coloredNodes = graph.nodes.filter(n => n.colorIndex !== -1).length;
    const maxColor = Math.max(...graph.nodes.map(n => n.colorIndex), -1);
    document.getElementById('chromaticNumber').textContent = maxColor + 1;

    // Check conflicts
    let conflicts = 0;
    graph.edges.forEach(edge => {
        if (graph.nodes[edge.source].colorIndex !== -1 &&
            graph.nodes[edge.source].colorIndex === graph.nodes[edge.target].colorIndex) {
            conflicts++;
        }
    });
    document.getElementById('conflicts').textContent = conflicts;
    conflictsCount = conflicts;

    // Check completion
    if (coloredNodes === graph.nodes.length && conflicts === 0) {
        stopTimer();
        updateExplanation("Graph successfully colored!");
        showResultOverlay();
    }
}

function calculateScore() {
    // Base 1000
    // Penalties: Time, Conflicts * 100, Hints * 50
    // Bonus for low chromatic number? Maybe just efficiency.
    let s = 1000 - (secondsElapsed * 2) - (conflictsCount * 50) - (hintsUsed * 50);
    if (s < 0) s = 0;
    score = s;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

// Timer
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

// Palette Selection
function initPalette() {
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            swatches.forEach(s => s.style.transform = 'scale(1)');
            swatch.style.transform = 'scale(1.2)';
            selectedColorIndex = parseInt(swatch.dataset.color);
        });
    });
}

// Hint Logic
async function getHint() {
    if (isSolving) return;

    try {
        const response = await fetch('/GraphColoring/GetNextMove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graph)
        });

        if (!response.ok) {
            updateExplanation("No hint available.");
            return;
        }

        const move = await response.json();
        const node = graph.nodes.find(n => n.id === move.nodeId);

        // Highlight node
        const circle = document.querySelector(`circle[data-id="${move.nodeId}"]`);
        if (circle) {
            circle.setAttribute('stroke', '#facc15');
            circle.setAttribute('stroke-width', '5');
            setTimeout(() => renderGraph(), 2000);
        }

        updateExplanation(`Hint: Color Node ${move.nodeId + 1} with Color ${move.colorIndex + 1} (${colors[move.colorIndex]})`);
        hintsUsed++;
        calculateScore();

    } catch (error) {
        console.error("Error getting hint:", error);
    }
}

// Auto Solve
async function solveColoring() {
    if (isSolving) return;

    isSolving = true;
    startTimer();
    document.getElementById('solveBtn').textContent = 'Solving...';

    try {
        const response = await fetch('/GraphColoring/SolveColoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graph)
        });
        const solvedGraph = await response.json();

        // Instead of instant snap, let's try to animate applying colors row by row?
        // Or just show result for now as simple greedy is instant.
        // Let's iterate through nodes to "animate"

        const finalNodes = solvedGraph.nodes;

        for (let i = 0; i < finalNodes.length; i++) {
            graph.nodes[i].colorIndex = finalNodes[i].colorIndex;
            renderGraph();
            updateStats();
            calculateScore();
            await sleep(300);
        }

    } catch (error) {
        console.error("Error solving:", error);
    }

    isSolving = false;
    stopTimer();
    document.getElementById('solveBtn').textContent = 'Auto Color';
    updateExplanation("Auto Coloring Complete.");
    showResultOverlay();
}

function resetStateOnly() {
    stopTimer();
    secondsElapsed = 0;
    hintsUsed = 0;
    score = 0;
    isSolving = false;
    isPaused = false;
    document.getElementById('timerDisplay').textContent = "00:00";
    document.getElementById('scoreDisplay').textContent = "Score: 0";
}

function reset() {
    graph.nodes.forEach(n => n.colorIndex = -1);
    resetStateOnly();
    renderGraph();
    updateStats();
    updateExplanation("Graph reset.");
}

function updateExplanation(text) {
    const el = document.getElementById('explanationText');
    if (el) el.textContent = text;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', () => {
    initPalette();
    generateGraph();
    document.getElementById('newGraphBtn').addEventListener('click', generateGraph);
    document.getElementById('solveBtn').addEventListener('click', solveColoring);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('hintBtn').addEventListener('click', getHint);
    document.getElementById('closeResultBtn').addEventListener('click', closeResultOverlay);
});

function showResultOverlay() {
    const chromatic = document.getElementById('chromaticNumber').textContent;
    const finalScore = score;
    document.getElementById('resultChromaticValue').textContent = chromatic;
    document.getElementById('resultScoreValue').textContent = finalScore;
    document.getElementById('resultOverlay').style.display = 'flex';
}

function closeResultOverlay() {
    document.getElementById('resultOverlay').style.display = 'none';
}
