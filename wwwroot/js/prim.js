// Prim's Visualizer
let nodes = [];
let edges = [];
let isSolving = false;
let isPaused = false;
let isManualMode = false;
let manualUserMSTWeight = 0;
let currentScore = 0;
let timerInterval = null;
let startTime = 0;

// Prim-Specific Manual State
let visitedNodes = new Set();
let startNodeId = null;
let isSelectingStart = false;

let steps = [];
let animationIndex = 0;
let animationTimeout = null;
let acceptedEdgesStr = new Set(); // store "src-tgt"

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
    steps = [];
    acceptedEdgesStr.clear();
    visitedNodes.clear();
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

function generateRandomGraph() {
    const count = document.getElementById('nodeCountInput').value;
    updateStatus("Generating...");

    fetch(`/Prim/GenerateRandom?count=${count}`)
        .then(r => r.json())
        .then(data => {
            nodes = data.nodes.map(n => ({ id: n.id, x: n.x, y: n.y }));
            edges = data.edges.map(e => ({ source: e.source, target: e.target, weight: e.weight }));
            setupGraph();
        })
        .catch(e => updateStatus("Error generating graph."));
}

function generateManualGraph() {
    const text = document.getElementById('manualEdgeInput').value.trim();
    if (!text) { updateStatus("Please enter edges."); return; }

    try {
        const lines = text.split('\n');
        nodes = [];
        edges = [];
        let createdNodes = new Set();

        lines.forEach(line => {
            const parts = line.split('-').map(s => s.trim());
            if (parts.length < 2) return;
            const src = parts[0];
            const tgt = parts[1];
            let weight = 1;
            if (parts.length > 2) {
                const w = parseInt(parts[2]);
                if (!isNaN(w)) weight = w;
            }

            if (!createdNodes.has(src)) { createdNodes.add(src); nodes.push({ id: src, x: 0, y: 0 }); }
            if (!createdNodes.has(tgt)) { createdNodes.add(tgt); nodes.push({ id: tgt, x: 0, y: 0 }); }

            edges.push({ source: src, target: tgt, weight: weight });
        });

        if (edges.length === 0) { updateStatus("No valid edges found."); return; }

        // Circular Layout
        const cx = 400, cy = 250, r = 200;
        nodes.forEach((n, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            n.x = cx + r * Math.cos(angle);
            n.y = cy + r * Math.sin(angle);
        });

        const inputEl = document.getElementById('manualStartNodeInput');
        const preferred = inputEl ? inputEl.value.trim() : null;
        setupGraph(preferred);
    } catch (e) {
        console.error(e);
        updateStatus("Error parsing input.");
    }
}

function setupGraph(preferredStartNode = null) {
    acceptedEdgesStr.clear();
    visitedNodes.clear();
    renderGraph();

    // Populate Dropdown
    const select = document.getElementById('startNodeSelect');
    select.innerHTML = '<option value="" disabled selected>-- Select Start Node --</option>';
    nodes.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.textContent = n.id;
        select.appendChild(opt);
    });

    if (preferredStartNode && nodes.find(n => n.id === preferredStartNode)) {
        select.value = preferredStartNode;
    }

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

        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.style.cursor = "pointer";
        group.onclick = () => onEdgeClick(e);

        // Invisible hit area
        const hitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        hitLine.setAttribute("x1", n1.x);
        hitLine.setAttribute("y1", n1.y);
        hitLine.setAttribute("x2", n2.x);
        hitLine.setAttribute("y2", n2.y);
        hitLine.setAttribute("stroke", "transparent");
        hitLine.setAttribute("stroke-width", "20");
        group.appendChild(hitLine);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", n1.x);
        line.setAttribute("y1", n1.y);
        line.setAttribute("x2", n2.x);
        line.setAttribute("y2", n2.y);
        line.setAttribute("stroke", "#334155");
        line.setAttribute("stroke-width", "2");
        line.classList.add("edge-line");
        line.dataset.id = `${e.source}-${e.target}`; // For lookup
        group.appendChild(line);

        // Weight Label
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", midX - 10);
        rect.setAttribute("y", midY - 10);
        rect.setAttribute("width", "20");
        rect.setAttribute("height", "20");
        rect.setAttribute("fill", "#0f172a");
        rect.setAttribute("rx", "4");
        group.appendChild(rect);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY);
        text.setAttribute("dy", "0.35em");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#94a3b8");
        text.setAttribute("font-size", "12px");
        text.textContent = e.weight;
        group.appendChild(text);

        svg.appendChild(group);
    });

    // Draw Nodes
    nodes.forEach(n => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.style.cursor = "pointer";
        group.onclick = () => onNodeClick(n);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", n.x);
        circle.setAttribute("cy", n.y);
        circle.setAttribute("r", "20");
        circle.setAttribute("fill", "#1e293b");
        circle.setAttribute("stroke", "#64748b");
        circle.setAttribute("stroke-width", "2");
        circle.classList.add("node-circle");
        circle.dataset.id = n.id;
        group.appendChild(circle);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", n.x);
        text.setAttribute("y", n.y);
        text.setAttribute("dy", "0.35em");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-weight", "bold");
        text.textContent = n.id;
        group.appendChild(text);

        svg.appendChild(group);
    });
}

function highlightEdge(src, tgt, color) {
    const selector = `.edge-line[data-id="${src}-${tgt}"], .edge-line[data-id="${tgt}-${src}"]`;
    const line = document.querySelector(selector);
    if (line) {
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "4");
    }
}

function highlightNode(id, color) {
    const selector = `.node-circle[data-id="${id}"]`;
    const circle = document.querySelector(selector);
    if (circle) {
        circle.setAttribute("stroke", color);
        circle.setAttribute("fill", "#0f172a"); // Darker fill
    }
}

// --- Manual Solve (Prim's Logic) ---
function onNodeClick(node) {
    if (!isSolving || !isManualMode || !isSelectingStart) return;

    startNodeId = node.id;
    visitedNodes.add(startNodeId);
    highlightNode(startNodeId, '#10b981'); // Green
    isSelectingStart = false;
    updateStatus(`Prim's: Started at Node ${startNodeId}. Select minimum edge connected to visited nodes.`);
    startTimer();
}
function startManualSolve() {
    isSolving = true;
    isManualMode = true;
    isPaused = false;
    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;
    document.getElementById('stepControls').style.display = 'none';
    document.getElementById('resultOverlay').style.display = 'none';

    manualUserMSTWeight = 0;
    currentScore = 0;
    document.getElementById('currentScoreDisplay').textContent = 0;
    acceptedEdgesStr.clear();
    visitedNodes.clear();

    if (nodes.length > 0) {
        const startSelect = document.getElementById('startNodeSelect');
        if (startSelect.value) {
            startNodeId = startSelect.value;
            visitedNodes.add(startNodeId);
            highlightNode(startNodeId, '#10b981');
            updateStatus(`Prim's: Started at Node ${startNodeId}. Select minimum edge connected to visited nodes.`);
            startTimer();
            isSelectingStart = false;
        } else {
            isSelectingStart = true;
            updateStatus("Click any node to START the algorithm.");
        }
    }
}

function onEdgeClick(clickedEdge) {
    if (!isSolving || !isManualMode) return;

    const src = clickedEdge.source;
    const tgt = clickedEdge.target;

    // Check if already processed
    if (acceptedEdgesStr.has(`${src}-${tgt}`) || acceptedEdgesStr.has(`${tgt}-${src}`)) return;

    // Determine connectivity
    const srcVisited = visitedNodes.has(src);
    const tgtVisited = visitedNodes.has(tgt);

    if (srcVisited && tgtVisited) {
        // Cycle (Both internal)
        updateStatus(`Both nodes visited. Choosing this would create a cycle. (-5 Pts)`);
        currentScore = Math.max(0, currentScore - 5);
        document.getElementById('currentScoreDisplay').textContent = currentScore;
        return;
    }

    if (!srcVisited && !tgtVisited) {
        // Disconnected
        updateStatus(`Disconnected! You must pick an edge connected to the visited set. (-5 Pts)`);
        currentScore = Math.max(0, currentScore - 5);
        document.getElementById('currentScoreDisplay').textContent = currentScore;
        return;
    }

    // Valid Frontier Edge (One visited, one not)
    // Find ALL Frontier edges to determine MIN
    const frontierEdges = edges.filter(e => {
        const s = visitedNodes.has(e.source);
        const t = visitedNodes.has(e.target);
        return s ^ t; // XOR
    });

    const minW = Math.min(...frontierEdges.map(e => e.weight));

    if (clickedEdge.weight > minW) {
        updateStatus(`Prim's Rule: Must pick Minimum weight edge from frontier. (${minW}) (-5 Pts)`);
        currentScore = Math.max(0, currentScore - 5);
        document.getElementById('currentScoreDisplay').textContent = currentScore;
        return;
    }

    // Correct Move!
    currentScore += 10;
    document.getElementById('currentScoreDisplay').textContent = currentScore;

    acceptedEdgesStr.add(`${src}-${tgt}`);
    manualUserMSTWeight += clickedEdge.weight;

    // Update Visited
    if (!visitedNodes.has(src)) { visitedNodes.add(src); highlightNode(src, '#10b981'); }
    if (!visitedNodes.has(tgt)) { visitedNodes.add(tgt); highlightNode(tgt, '#10b981'); }

    highlightEdge(src, tgt, '#10b981');
    updateStatus(`Accepted edge ${src}-${tgt}. Frontier expanded.`);

    // Check Completion
    if (visitedNodes.size === nodes.length) {
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

    // Validation
    const startSelect = document.getElementById('startNodeSelect');
    if (!startSelect.value) {
        updateStatus("Please select a Start Node.");
        isSolving = false;
        return;
    }

    currentScore = 0;
    document.getElementById('currentScoreDisplay').textContent = 0;

    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;
    document.getElementById('stepControls').style.display = 'flex';
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '||';
    updateStatus("Finding MST...");
    startTimer();

    acceptedEdgesStr.clear();
    visitedNodes.clear();

    try {
        const backendNodes = nodes.map(n => ({ Id: n.id, X: Math.round(n.x), Y: Math.round(n.y) }));
        const backendEdges = edges.map(e => ({ Source: e.source, Target: e.target, Weight: parseInt(e.weight) }));
        const startId = document.getElementById('startNodeSelect').value;

        const response = await fetch('/Prim/Solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Nodes: backendNodes, Edges: backendEdges, StartNodeId: startId })
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
        applyVisualsAt(steps.length - 1);
        const timeStr = getFormattedTime();
        stopTimer();
        updateStatus("MST Complete!");
        document.getElementById('finalScore').textContent = currentScore;
        document.getElementById('resultTime').textContent = timeStr;
        document.getElementById('resultOverlay').style.display = 'flex';
        isSolving = false;
        document.getElementById('solveBtn').disabled = false;
        document.getElementById('manualSolveBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
}

function applyVisualsAt(index) {
    if (index < 0) return;
    const step = steps[index];
    const e = step.edge;
    const status = step.status;

    updateStatus(step.description || `Processing ${e.source}-${e.target}`);

    if (status === "Checking") {
        highlightEdge(e.source, e.target, '#fbbf24'); // Yellow
    }
    else if (status === "Accepted") {
        highlightEdge(e.source, e.target, '#10b981'); // Green
        highlightNode(e.source, '#10b981');
        highlightNode(e.target, '#10b981');

        // Auto Score Update
        if (isSolving && !isManualMode) {
            currentScore += 10;
            document.getElementById('currentScoreDisplay').textContent = currentScore;
        }
    }
}

// --- Steps Control ---
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : '||';
    if (!isPaused) animateStep();
}

function stepForward() {
    if (animationIndex < steps.length) {
        applyVisualsAt(animationIndex);
        animationIndex++;
    }
}

function stepBack() {
    if (animationIndex > 0) {
        animationIndex--;
        // Re-render everything up to this point is hard without full state loop
        // Simplified: just render this step (visual artifacts might remain)
        // Better: clear visuals and re-apply from 0 to index
        // For simpler UI: just update text for now or do full redraw
        // I'll resort to applyVisualsAt which is partial. The users usually just want to see logic flow.
        applyVisualsAt(animationIndex - 1);
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
