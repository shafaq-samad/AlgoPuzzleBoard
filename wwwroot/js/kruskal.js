// Kruskal Visualizer
let nodes = [];
let edges = [];
let sortedEdges = []; // For Manual Mode logic
let isSolving = false;
let isPaused = false;
let isManualMode = false;
let manualCurrentIndex = 0; // Index in sortedEdges we are looking for
let manualUserMSTWeight = 0;
let currentScore = 0;
let timerInterval = null;
let startTime = 0;
let parent = {}; // For Client-side Union-Find (Manual Mode)

let steps = [];
let animationIndex = 0;
let animationTimeout = null;
let acceptedEdgesStr = new Set(); // store "src-tgt"
let rejectedEdgesStr = new Set(); // store "src-tgt"

const svg = document.getElementById('algoSvg');
const width = document.getElementById('mapContainer').clientWidth;
const height = document.getElementById('mapContainer').clientHeight;

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tabRandom').addEventListener('click', () => setInputMode('random'));
    document.getElementById('tabManual').addEventListener('click', () => setInputMode('manual'));

    document.getElementById('generateRandomBtn').addEventListener('click', generateRandomGraph);
    document.getElementById('generateManualBtn').addEventListener('click', generateManualGraph);

    document.getElementById('resetBtn').addEventListener('click', resetAll);
    document.getElementById('solveBtn').addEventListener('click', startAutoSolve);
    document.getElementById('manualSolveBtn').addEventListener('click', startManualSolve);

    document.getElementById('closeResultBtn').addEventListener('click', () => document.getElementById('resultOverlay').style.display = 'none');

    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('prevBtn').addEventListener('click', stepBack);
    document.getElementById('nextBtn').addEventListener('click', stepForward);

    setInputMode('random');
});

function setInputMode(mode) {
    document.getElementById('tabRandom').className = mode === 'random' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    document.getElementById('tabManual').className = mode === 'manual' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    document.getElementById('randomInputGroup').style.display = mode === 'random' ? 'block' : 'none';
    document.getElementById('manualInputGroup').style.display = mode === 'manual' ? 'block' : 'none';
}

function updateStatus(text) {
    document.getElementById('statusText').textContent = text;
}

function resetAll() {
    nodes = [];
    edges = [];
    sortedEdges = [];
    steps = [];
    acceptedEdgesStr.clear();
    rejectedEdgesStr.clear();
    isSolving = false;
    isPaused = false;
    isManualMode = false;
    if (animationTimeout) clearTimeout(animationTimeout);
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('timerDisplay').textContent = "00:00";
    currentScore = 0;
    document.getElementById('currentScoreDisplay').textContent = "0";

    svg.innerHTML = '';
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'none';
    document.getElementById('overlayMessage').style.display = 'flex';
    document.getElementById('resultOverlay').style.display = 'none';
    updateStatus("Ready.");
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
}

function togglePause() {
    if (!isSolving || isManualMode) return;
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '▶' : '||';
    if (!isPaused) animateStep();
}

function stepBack() {
    if (steps.length === 0 || isManualMode || animationIndex <= 0) return;
    // Pause if running
    if (!isPaused && isSolving) togglePause();

    animationIndex--;
    applyVisualsAt(animationIndex);
}

function stepForward() {
    if (steps.length === 0 || isManualMode || animationIndex >= steps.length) return;
    // Pause if running
    if (!isPaused && isSolving) togglePause();

    // Apply current index visuals then move forward
    applyVisualsAt(animationIndex);
    animationIndex++;
}

// --- Graph Generation ---
async function generateRandomGraph() {
    const count = document.getElementById('nodeCountInput').value;
    updateStatus("Generating...");
    try {
        const response = await fetch(`/Kruskal/GenerateRandom?count=${count}`);
        if (!response.ok) throw new Error("Failed");
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
    if (!input) {
        updateStatus("Input is empty.");
        return;
    }

    nodes = [];
    edges = [];
    const createdNodes = new Set();
    const lines = input.split('\n');

    try {
        lines.forEach(line => {
            if (!line.trim()) return;
            const parts = line.split('-').map(s => s.trim());
            if (parts.length < 2) return;

            const src = parts[0];
            const tgt = parts[1];
            if (!src || !tgt) return;

            let weight = 1;
            if (parts.length > 2) {
                const w = parseInt(parts[2]);
                if (!isNaN(w)) weight = w;
            }

            if (!createdNodes.has(src)) {
                nodes.push({ id: src, x: 0, y: 0 });
                createdNodes.add(src);
            }
            if (!createdNodes.has(tgt)) {
                nodes.push({ id: tgt, x: 0, y: 0 });
                createdNodes.add(tgt);
            }
            edges.push({ source: src, target: tgt, weight: weight });
        });

        if (nodes.length === 0) {
            updateStatus("No valid nodes found.");
            return;
        }

        const cx = 400, cy = 250, r = 200;
        nodes.forEach((n, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            n.x = cx + r * Math.cos(angle);
            n.y = cy + r * Math.sin(angle);
        });

        setupGraph();
    } catch (e) {
        console.error(e);
        updateStatus("Error parsing input.");
    }
}

function setupGraph() {
    acceptedEdgesStr.clear();
    rejectedEdgesStr.clear();
    renderGraph();
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'flex';
    document.getElementById('overlayMessage').style.display = 'none';
    document.getElementById('nodeCountDisplay').textContent = nodes.length;
    document.getElementById('edgeCountDisplay').textContent = edges.length;
    updateStatus("Graph generated. Ready to solve.");
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
}

// --- Visualization ---
function renderGraph() {
    svg.innerHTML = '';

    // Draw Edges
    edges.forEach(e => {
        const n1 = nodes.find(n => n.id === e.source);
        const n2 = nodes.find(n => n.id === e.target);
        if (!n1 || !n2) return;

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.style.cursor = 'pointer';
        group.setAttribute('pointer-events', 'all'); // Force events

        // Bind click explicit
        group.onclick = function () { onEdgeClick(e); };

        const hitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hitLine.setAttribute('x1', n1.x);
        hitLine.setAttribute('y1', n1.y);
        hitLine.setAttribute('x2', n2.x);
        hitLine.setAttribute('y2', n2.y);
        hitLine.setAttribute('stroke', 'rgba(255,255,255,0.01)'); // Almost transparent but distinct
        hitLine.setAttribute('stroke-width', '20'); // Wider hit area
        group.appendChild(hitLine);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', n1.x);
        line.setAttribute('y1', n1.y);
        line.setAttribute('x2', n2.x);
        line.setAttribute('y2', n2.y);
        line.setAttribute('stroke', '#475569');
        line.setAttribute('stroke-width', '2');
        line.classList.add('edge-line');
        line.dataset.id = `${e.source}-${e.target}`;
        line.dataset.revId = `${e.target}-${e.source}`;

        let color = '#475569';
        let widthVal = '2';

        if (acceptedEdgesStr.has(line.dataset.id) || acceptedEdgesStr.has(line.dataset.revId)) {
            color = '#10b981';
            widthVal = '4';
        } else if (rejectedEdgesStr.has(line.dataset.id) || rejectedEdgesStr.has(line.dataset.revId)) {
            color = '#991b1b';
            widthVal = '1';
            // Fade rejected
            line.setAttribute('opacity', '0.5');
        }

        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', widthVal);
        group.appendChild(line);

        const mx = (n1.x + n2.x) / 2;
        const my = (n1.y + n2.y) / 2;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', mx - 12);
        rect.setAttribute('y', my - 12);
        rect.setAttribute('width', '24');
        rect.setAttribute('height', '24');
        rect.setAttribute('fill', '#0f172a');
        rect.setAttribute('rx', '4');
        group.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', mx);
        text.setAttribute('y', my + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '12');
        text.textContent = e.weight;
        // Also allow clicking text
        text.style.pointerEvents = 'none'; // Let it pass to group
        group.appendChild(text);

        svg.appendChild(group);
    });

    nodes.forEach(n => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', n.x);
        circle.setAttribute('cy', n.y);
        circle.setAttribute('r', '20');
        circle.setAttribute('fill', '#1e293b');
        circle.setAttribute('stroke', '#cbd5e1');
        circle.setAttribute('stroke-width', '2');
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

function highlightEdge(src, tgt, color, widthVal = '4') {
    const selector = `.edge-line[data-id="${src}-${tgt}"], .edge-line[data-id="${tgt}-${src}"]`;
    const line = document.querySelector(selector);
    if (line) {
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', widthVal);
    }
}

// --- Manual Solve ---
function startManualSolve() {
    if (edges.length === 0) {
        updateStatus("Please generate a graph first!");
        return;
    }

    if (animationTimeout) clearTimeout(animationTimeout);
    isSolving = true;
    isPaused = false;
    isManualMode = true;
    steps = []; // Clear auto steps
    animationIndex = 0;

    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;
    document.getElementById('stepControls').style.display = 'none';
    document.getElementById('resultOverlay').style.display = 'none';

    sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    manualUserMSTWeight = 0;
    currentScore = 0; // Global score tracker
    document.getElementById('currentScoreDisplay').textContent = currentScore;
    acceptedEdgesStr.clear();
    rejectedEdgesStr.clear();
    parent = {};
    nodes.forEach(n => parent[n.id] = n.id);
    renderGraph();

    if (sortedEdges.length > 0) {
        updateStatus(`Manual Mode: Click the edge with weight ${sortedEdges[0].weight} (smallest).`);
        startTimer();
    }
}

function findSet(i) {
    if (parent[i] == i) return i;
    return findSet(parent[i]);
}

function unionSets(i, j) {
    const rootI = findSet(i);
    const rootJ = findSet(j);
    if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
    }
    return false;
}

function onEdgeClick(clickedEdge) {
    if (!isSolving || !isManualMode) {
        // If clicked when not solving, just say it.
        updateStatus(`Clicked edge ${clickedEdge.source}-${clickedEdge.target} (Mode: ${isManualMode ? 'Manual' : 'View'}, Solving: ${isSolving})`);
        return;
    }

    // DEBUG: Confirm click received in solving mode
    // updateStatus(`DEBUG: Processing click on ${clickedEdge.source}-${clickedEdge.target}...`);

    const unprocessed = sortedEdges.filter(e =>
        !acceptedEdgesStr.has(`${e.source}-${e.target}`) &&
        !acceptedEdgesStr.has(`${e.target}-${e.source}`) &&
        !rejectedEdgesStr.has(`${e.source}-${e.target}`) &&
        !rejectedEdgesStr.has(`${e.target}-${e.source}`)
    );

    if (unprocessed.length === 0) {
        finishManual();
        return;
    }

    // Kruskal's Rule: Must pick edge with minimum weight among unprocessed
    const minW = unprocessed[0].weight;
    if (clickedEdge.weight > minW) {
        updateStatus(`Kruskal's Rule: Order matters! Check edge with weight ${minW} first. (-5 Pts)`);
        currentScore = Math.max(0, currentScore - 5);
        document.getElementById('currentScoreDisplay').textContent = currentScore;
        return;
    }

    const src = clickedEdge.source;
    const tgt = clickedEdge.target;

    // Check if already processed (just in case filter missed something or race condition)
    if (acceptedEdgesStr.has(`${src}-${tgt}`) || acceptedEdgesStr.has(`${tgt}-${src}`) ||
        rejectedEdgesStr.has(`${src}-${tgt}`) || rejectedEdgesStr.has(`${tgt}-${src}`)) return;

    // Check Cycle
    const root1 = findSet(src);
    const root2 = findSet(tgt);

    // Valid Move reward
    currentScore += 10;
    document.getElementById('currentScoreDisplay').textContent = currentScore;

    if (root1 !== root2) {
        // No Cycle -> Accept
        updateStatus(`Accepted edge ${src}-${tgt} (Weight: ${clickedEdge.weight}).`);
        unionSets(src, tgt);
        acceptedEdgesStr.add(`${src}-${tgt}`);
        manualUserMSTWeight += clickedEdge.weight;
        highlightEdge(src, tgt, '#10b981'); // Green
    } else {
        // Cycle -> Reject
        updateStatus(`Cycle detected! Edge ${src}-${tgt} Rejected.`);
        rejectedEdgesStr.add(`${src}-${tgt}`);
        highlightEdge(src, tgt, '#ef4444'); // Red
    }

    // Check if that was the last one
    if (unprocessed.length === 1) { // We just processed the last one
        finishManual();
    }
}

function finishManual() {
    const timeStr = getFormattedTime();
    stopTimer();
    updateStatus("MST Complete!");
    document.getElementById('resultWeight').textContent = manualUserMSTWeight;
    document.getElementById('finalScore').textContent = currentScore;
    document.getElementById('resultTime').textContent = timeStr;
    document.getElementById('resultOverlay').style.display = 'flex';
    isSolving = false;
    isManualMode = false;
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
}

// --- Auto Solver ---
async function startAutoSolve() {
    isSolving = true;
    isPaused = false;
    // Auto mode doesn't track score
    document.getElementById('currentScoreDisplay').textContent = "N/A";

    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;
    document.getElementById('stepControls').style.display = 'flex';
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '||';
    updateStatus("Finding MST...");
    startTimer();

    acceptedEdgesStr.clear();
    rejectedEdgesStr.clear();

    try {
        const backendNodes = nodes.map(n => ({ Id: n.id, X: Math.round(n.x), Y: Math.round(n.y) }));
        const backendEdges = edges.map(e => ({ Source: e.source, Target: e.target, Weight: parseInt(e.weight) }));

        const response = await fetch('/Kruskal/Solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Nodes: backendNodes, Edges: backendEdges })
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const result = await response.json();
        steps = result.steps;
        document.getElementById('resultWeight').textContent = result.totalWeight;

        animationIndex = 0;
        animateStep();

    } catch (e) {
        console.error(e);
        updateStatus("Error: " + e.message);
        isSolving = false;
        document.getElementById('solveBtn').disabled = false;
        document.getElementById('manualSolveBtn').disabled = false;
    }
}

// Helper to draw specific state frame
function applyVisualsAt(index) {
    if (index < 0 || index >= steps.length) return;

    acceptedEdgesStr.clear();
    rejectedEdgesStr.clear();

    // Process history up to index (exclusive of current step action for rendering "past", but we want to show current step)
    // Actually, let's process 0 to index-1 for permanent state, and index for active highlight.

    for (let i = 0; i < index; i++) {
        const s = steps[i];
        if (s.status === "Accepted") acceptedEdgesStr.add(`${s.edge.source}-${s.edge.target}`);
        else if (s.status === "Rejected") rejectedEdgesStr.add(`${s.edge.source}-${s.edge.target}`);
    }

    renderGraph(); // Draws base + permanent accepted/rejected

    // Now highlight the current step action
    const currentStep = steps[index];
    const e = currentStep.edge;
    const status = currentStep.status;

    if (status === "Checking") {
        updateStatus(`Checking edge ${e.source}-${e.target} (Weight: ${e.weight})`);
        highlightEdge(e.source, e.target, '#fbbf24'); // Yellow
    }
    else if (status === "Accepted") {
        updateStatus(`Accepted edge ${e.source}-${e.target}! No cycle.`);
        highlightEdge(e.source, e.target, '#10b981'); // Green active
        acceptedEdgesStr.add(`${e.source}-${e.target}`); // Add for next frame
    }
    else if (status === "Rejected") {
        updateStatus(`Rejected edge ${e.source}-${e.target}. Cycle detected!`);
        highlightEdge(e.source, e.target, '#ef4444'); // Red active
        rejectedEdgesStr.add(`${e.source}-${e.target}`); // Add for next frame
    }
}

function animateStep() {
    if (isPaused) return;

    if (animationIndex < steps.length) {
        applyVisualsAt(animationIndex);
        animationIndex++;

        let delay = 1000;
        if (steps[animationIndex - 1].status === "Checking") delay = 600;

        animationTimeout = setTimeout(animateStep, delay);
    } else {
        // Final state
        applyVisualsAt(steps.length - 1); // Ensure last frame persists
        const timeStr = getFormattedTime();
        stopTimer();
        updateStatus("MST Complete! Review steps with controls.");
        document.getElementById('finalScore').textContent = "N/A";
        document.getElementById('resultTime').textContent = timeStr;
        document.getElementById('resultOverlay').style.display = 'flex';
        isSolving = false;
        document.getElementById('solveBtn').disabled = false;
        document.getElementById('manualSolveBtn').disabled = false;
        // Keep controls visible for review
        document.getElementById('pauseBtn').disabled = true;
    }
}

// --- Timer ---
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    document.getElementById('timerDisplay').textContent = getFormattedTime();
}

function getFormattedTime() {
    const delta = Date.now() - startTime;
    const seconds = Math.floor(delta / 1000);
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
}
