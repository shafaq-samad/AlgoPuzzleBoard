// Dijkstra Visualizer
let nodes = [];
let edges = [];
let startNodeId = null;
let targetNodeId = null;
let manualPath = [];
let isSolving = false;
let isPaused = false;
let autoPath = []; // For auto-solve animation
let visitedOrder = []; // For auto-solve animation
let score = 0;
let animationTimeout = null;
let timerInterval = null;
let secondsElapsed = 0;
let hintsUsed = 0;

const svg = document.getElementById('dijkstraSvg');
const width = document.getElementById('mapContainer').clientWidth;
const height = document.getElementById('mapContainer').clientHeight;

// --- Initialization & Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // Mode Tabs
    document.getElementById('tabRandom').addEventListener('click', () => setInputMode('random'));
    document.getElementById('tabManual').addEventListener('click', () => setInputMode('manual'));

    // Generators
    document.getElementById('generateRandomBtn').addEventListener('click', generateRandomGraph);
    document.getElementById('generateManualBtn').addEventListener('click', generateManualGraph);

    // Actions
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    document.getElementById('autoSolveBtn').addEventListener('click', startAutoSolve);
    document.getElementById('manualSolveBtn').addEventListener('click', startManualMode);
    document.getElementById('hintBtn').addEventListener('click', getHint);
    document.getElementById('closeResultBtn').addEventListener('click', closeResult);

    // Controls
    document.getElementById('prevStepBtn').addEventListener('click', prevStep);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('nextStepBtn').addEventListener('click', nextStep);

    setInputMode('random'); // Default
});

function closeResult() {
    document.getElementById('resultOverlay').style.display = 'none';
}

function setInputMode(mode) {
    document.getElementById('tabRandom').className = mode === 'random' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    document.getElementById('tabManual').className = mode === 'manual' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';

    document.getElementById('randomInputGroup').style.display = mode === 'random' ? 'block' : 'none';
    document.getElementById('manualInputGroup').style.display = mode === 'manual' ? 'block' : 'none';
}

function updateStatus(text) {
    document.getElementById('statusText').textContent = text;
}

function togglePause() {
    // If no path, ignore
    if (autoPath.length === 0) return;

    // If finished, restart
    if (animationIndex >= autoPath.length) {
        animationIndex = 0;
        isSolving = true;
        document.getElementById('resultOverlay').style.display = 'none';
        renderGraph();
        clearHighlights();
        // Set to paused so the toggle below flips it to playing
        isPaused = true;
    }

    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '▶' : '||';
    if (!isPaused) { // If playing
        animateStep();
    }
}

function nextStep() {
    if (autoPath.length === 0 || animationIndex >= autoPath.length) return;

    // Allow step if paused OR if we are not solving (e.g. manually set state or finished)
    // But mostly we only step if paused. If running, ignore.
    if (!isPaused && isSolving) return;

    animateStep(true); // Single step force
}

function prevStep() {
    if (autoPath.length === 0 || animationIndex <= 0) return;

    // Allow step if paused OR if finished (!isSolving)
    if (!isPaused && isSolving) return;

    // If we were finished, re-enter solving mode state (paused)
    if (!isSolving) {
        isSolving = true;
        isPaused = true; // Ensure we are in paused state
        document.getElementById('pauseBtn').textContent = '▶';
        document.getElementById('resultOverlay').style.display = 'none';
        document.getElementById('autoSolveBtn').disabled = true;
    }

    animationIndex--;
    updateStatus(`Stepped back to ${animationIndex}`);

    // Re-render to clear partial highlights
    renderGraph();
    clearHighlights();

    // Restore highlights up to current index
    for (let i = 0; i < animationIndex; i++) {
        const nId = autoPath[i];
        highlightNode(nId, '#fbbf24', true);
        if (i > 0) highlightEdge(autoPath[i - 1], nId, '#fbbf24');
    }
}

// --- Graph Generation ---

async function generateRandomGraph() {
    const count = document.getElementById('nodeCountInput').value;
    updateStatus("Generating random graph...");

    try {
        const response = await fetch(`/Dijkstra/GenerateRandom?count=${count}`);
        if (!response.ok) throw new Error("Failed to generate");

        const graph = await response.json();
        nodes = graph.nodes;
        edges = graph.edges;

        setupGraph();
    } catch (e) {
        console.error(e);
        updateStatus("Error generating graph.");
    }
}

function generateManualGraph() {
    const input = document.getElementById('manualEdgeInput').value.trim();
    if (!input) return;

    // Parse input: A-B-5
    nodes = [];
    edges = [];
    const createdNodes = new Set();
    const lines = input.split('\n');

    try {
        lines.forEach(line => {
            const parts = line.split('-').map(s => s.trim());
            if (parts.length < 2) return;

            const src = parts[0];
            const tgt = parts[1];
            const weight = parts.length > 2 ? parseInt(parts[2]) : 1;

            if (!createdNodes.has(src)) {
                nodes.push({ id: src, x: 0, y: 0 }); // Placeholder pos
                createdNodes.add(src);
            }
            if (!createdNodes.has(tgt)) {
                nodes.push({ id: tgt, x: 0, y: 0 }); // Placeholder pos
                createdNodes.add(tgt);
            }

            edges.push({ source: src, target: tgt, weight: weight });
        });

        // Simple Circle Layout
        const cx = 400, cy = 250, r = 200;
        nodes.forEach((n, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            n.x = cx + r * Math.cos(angle);
            n.y = cy + r * Math.sin(angle);
        });

        setupGraph();

    } catch (e) {
        console.error(e);
        updateStatus("Error parsing manual input.");
    }
}

function setupGraph() {
    resetState();
    renderGraph();

    // Populate Dropdowns
    const startSel = document.getElementById('startNodeSelect');
    const targetSel = document.getElementById('targetNodeSelect');
    startSel.innerHTML = '';
    targetSel.innerHTML = '';

    nodes.forEach(n => {
        const op1 = document.createElement('option');
        op1.value = n.id;
        op1.text = n.id;
        startSel.add(op1);

        const op2 = document.createElement('option');
        op2.value = n.id;
        op2.text = n.id;
        targetSel.add(op2);
    });

    // Default selection different
    if (nodes.length > 1) targetSel.selectedIndex = 1;

    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'flex';
    document.getElementById('overlayMessage').style.display = 'none';
    updateStatus("Graph generated. Select Start and Target.");

    document.getElementById('nodeCountDisplay').textContent = nodes.length;
    document.getElementById('edgeCountDisplay').textContent = edges.length;
}

function resetState() {
    manualPath = [];
    autoPath = [];
    visitedOrder = [];
    isSolving = false;
    isPaused = false;
    startNodeId = null;
    targetNodeId = null;
    if (animationTimeout) clearTimeout(animationTimeout);
    stopTimer();
    secondsElapsed = 0;
    hintsUsed = 0;
    updateScore();
    document.getElementById('timerDisplay').textContent = "00:00";
    document.getElementById('resultOverlay').style.display = 'none';
}

function startTimer() {
    stopTimer();
    secondsElapsed = 0;
    document.getElementById('timerDisplay').textContent = "00:00";
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const seconds = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
        updateScore();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateScore() {
    // Base 1000, -2 per second, -50 per hint
    let s = 1000 - (secondsElapsed * 2) - (hintsUsed * 50);
    if (s < 0) s = 0;
    score = s;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

function resetAll() {
    nodes = [];
    edges = [];
    resetState();
    svg.innerHTML = '';
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'none';
    document.getElementById('overlayMessage').style.display = 'flex';
    updateStatus("Ready.");
}

// --- Visualization ---

function renderGraph() {
    svg.innerHTML = '';

    // Draw Edges
    edges.forEach(e => {
        const n1 = nodes.find(n => n.id === e.source);
        const n2 = nodes.find(n => n.id === e.target);
        if (!n1 || !n2) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', n1.x);
        line.setAttribute('y1', n1.y);
        line.setAttribute('x2', n2.x);
        line.setAttribute('y2', n2.y);
        line.setAttribute('stroke', '#475569');
        line.setAttribute('stroke-width', '2');
        line.classList.add('edge-line');
        line.dataset.source = e.source;
        line.dataset.target = e.target;
        svg.appendChild(line);

        // Weight Label (Midpoint)
        const mx = (n1.x + n2.x) / 2;
        const my = (n1.y + n2.y) / 2;

        // Background for text
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', mx - 10);
        rect.setAttribute('y', my - 10);
        rect.setAttribute('width', '20');
        rect.setAttribute('height', '20');
        rect.setAttribute('fill', '#0f172a');
        rect.setAttribute('rx', '4');
        svg.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', mx);
        text.setAttribute('y', my + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '12');
        text.textContent = e.weight;
        svg.appendChild(text);
    });

    // Draw Nodes
    nodes.forEach(n => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-group');
        g.dataset.id = n.id;
        g.style.cursor = 'pointer';
        g.addEventListener('click', () => onNodeClick(n.id));

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', n.x);
        circle.setAttribute('cy', n.y);
        circle.setAttribute('r', '20');
        circle.setAttribute('fill', '#1e293b');
        circle.setAttribute('stroke', '#cbd5e1');
        circle.setAttribute('stroke-width', '2');
        circle.classList.add('node-circle');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', n.x);
        text.setAttribute('y', n.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-weight', 'bold');
        text.textContent = n.id;

        g.appendChild(circle);
        g.appendChild(text);
        svg.appendChild(g);
    });
}

function highlightNode(id, color, scale = false) {
    const el = document.querySelector(`.node-group[data-id="${id}"] circle`);
    if (el) {
        el.setAttribute('fill', color);
        if (scale) {
            el.setAttribute('transform-origin', `${el.getAttribute('cx')} ${el.getAttribute('cy')}`);
            el.setAttribute('transform', 'scale(1.2)');
        }
    }
}

function highlightEdge(id1, id2, color) {
    const lines = document.querySelectorAll('.edge-line');
    lines.forEach(l => {
        if ((l.dataset.source === id1 && l.dataset.target === id2) ||
            (l.dataset.source === id2 && l.dataset.target === id1)) {
            l.setAttribute('stroke', color);
            l.setAttribute('stroke-width', '4');
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.node-circle').forEach(c => {
        c.setAttribute('fill', '#1e293b');
        c.removeAttribute('transform');
    });
    document.querySelectorAll('.edge-line').forEach(l => {
        l.setAttribute('stroke', '#475569');
        l.setAttribute('stroke-width', '2');
    });

    // Re-apply Start/Target if set
    if (startNodeId) highlightNode(startNodeId, '#10b981'); // Green
    if (targetNodeId) highlightNode(targetNodeId, '#ef4444'); // Red
}

// --- Logic (Manual & Auto) ---

function updateStartTarget() {
    startNodeId = document.getElementById('startNodeSelect').value;
    targetNodeId = document.getElementById('targetNodeSelect').value;
    clearHighlights();
}

function startManualMode() {
    updateStartTarget();
    if (startNodeId === targetNodeId) {
        updateStatus("Start and Target cannot be the same.");
        return;
    }

    resetState();
    // Re-set start/target after reset cleared them? No, resetState clears selection vars but dropdowns persist.
    // actually resetState clears startNodeId vars. We need to re-read.
    updateStartTarget();

    manualPath = [startNodeId];
    isSolving = true;
    startTimer();
    updateStatus(`Manual Mode: Click neighbor of ${startNodeId} to move.`);
    clearHighlights();
    highlightNode(startNodeId, '#10b981'); // Start is Green
}

async function startAutoSolve() {
    updateStartTarget();

    // Auto solve doesn't use score/timer in the same way, but let's reset to be clean
    resetState();
    updateStartTarget(); // Re-read start/target from dropdowns

    updateStatus("Solving...");
    isSolving = true;
    document.getElementById('stepControls').style.display = 'flex';
    document.getElementById('autoSolveBtn').disabled = true;

    try {
        // Map to PascalCase for C#
        const backendNodes = nodes.map(n => ({ Id: n.id, X: n.x, Y: n.y }));
        const backendEdges = edges.map(e => ({ Source: e.source, Target: e.target, Weight: e.weight }));

        const response = await fetch('/Dijkstra/Solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Nodes: backendNodes,
                Edges: backendEdges,
                StartNodeId: startNodeId,
                TargetNodeId: targetNodeId
            })
        });

        if (!response.ok) {
            updateStatus("Error: " + response.statusText);
            isSolving = false;
            document.getElementById('autoSolveBtn').disabled = false;
            return;
        }

        const result = await response.json();
        if (!result.success) {
            updateStatus("No path found!");
            isSolving = false;
            document.getElementById('autoSolveBtn').disabled = false;
            return;
        }

        autoPath = result.path;
        // Store total distance for display
        document.getElementById('resultDistance').textContent = result.totalDistance;
        visitedOrder = result.visitedOrder;

        animationIndex = 0;
        animateStep();

    } catch (e) {
        console.error(e);
        updateStatus("Error contacting server.");
        isSolving = false;
        document.getElementById('autoSolveBtn').disabled = false;
    }
}

let animationIndex = 0;
function animateStep(singleStep = false) {
    if (isPaused && !singleStep) return;

    if (animationIndex < autoPath.length) {
        const nodeId = autoPath[animationIndex];
        highlightNode(nodeId, '#fbbf24', true); // Yellow
        if (animationIndex > 0) {
            highlightEdge(autoPath[animationIndex - 1], nodeId, '#fbbf24');
        }
        updateStatus(`Visiting: ${nodeId}`);
        animationIndex++;

        if (!singleStep) {
            animationTimeout = setTimeout(animateStep, 800);
        }
    } else {
        updateStatus("Reached Target!");
        isSolving = false;
        document.getElementById('autoSolveBtn').disabled = false;
        document.getElementById('resultOverlay').style.display = 'flex';
    }
}

async function onNodeClick(id) {
    if (!isSolving || autoPath.length > 0) return; // Only manual mode

    const current = manualPath[manualPath.length - 1];

    // Check if neighbor
    const isNeighbor = edges.some(e =>
        (e.source === current && e.target === id) ||
        (e.source === id && e.target === current)
    );

    if (isNeighbor) {
        // Validate with backend if this move is "optimal" or just allow any valid move?
        // Requirement said "user will solve manually". Let's allow valid moves, but verify optimality at end?
        // Or "Hint score auto solve options". 
        // Let's just track the path.

        manualPath.push(id);
        highlightEdge(current, id, '#10b981');
        highlightNode(id, '#10b981');

        if (id === targetNodeId) {
            updateStatus("Target Reached!");
            stopTimer(); // Stop timer on completion
            checkOptimality();
            isSolving = false;
        } else {
            updateStatus(`Moved to ${id}. Choose next.`);
        }
    } else {
        updateStatus("Invalid move. Must be a neighbor.");
    }
}

async function checkOptimality() {
    // Call backend to get actual distance
    // Map to PascalCase
    const backendNodes = nodes.map(n => ({ Id: n.id, X: n.x, Y: n.y }));
    const backendEdges = edges.map(e => ({ Source: e.source, Target: e.target, Weight: e.weight }));

    const response = await fetch('/Dijkstra/Solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nodes: backendNodes, Edges: backendEdges, StartNodeId: startNodeId, TargetNodeId: targetNodeId })
    });
    const result = await response.json();

    if (result.success) {
        // Show result overlay
        document.getElementById('resultDistance').textContent = result.totalDistance + " (Score: " + score + ")";
        document.getElementById('resultOverlay').style.display = 'flex';
    }
}

async function getHint() {
    if (!isSolving) {
        updateStatus("Start a mode first.");
        return;
    }

    const current = manualPath.length > 0 ? manualPath[manualPath.length - 1] : startNodeId;
    if (!current) return;

    updateStatus("Getting hint...");
    try {
        // Map to PascalCase
        const backendNodes = nodes.map(n => ({ Id: n.id, X: n.x, Y: n.y }));
        const backendEdges = edges.map(e => ({ Source: e.source, Target: e.target, Weight: e.weight }));

        const response = await fetch('/Dijkstra/GetHint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Nodes: backendNodes,
                Edges: backendEdges,
                StartNodeId: current,
                TargetNodeId: targetNodeId
            })
        });

        if (response.ok) {
            const move = await response.json();
            const nextId = move.nextNodeId;

            highlightNode(nextId, '#facc15', true); // Flash Yellow
            updateStatus(`Hint: Go to ${nextId}`);
            hintsUsed++; // Penalty
            updateScore();
            setTimeout(() => {
                // Return to normal color if not visited
                if (!manualPath.includes(nextId)) {
                    // highlightNode(nextId, '#1e293b'); // This might clear wrong things
                    // Ideally we have a better state redraw
                }
            }, 1000);
        } else {
            updateStatus("No hint available.");
        }
    } catch (e) {
        console.error(e);
    }
}
