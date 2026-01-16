// BFS BST Traversal Visualizer
let nodes = [];
let edges = [];
let isSolving = false;
let isManualMode = false;
let isPaused = false;
let timerInterval = null;
let startTime = 0;
let currentScore = 0;

let steps = [];
let animationIndex = 0;
let animationTimeout = null;

let visitedNodes = new Set();
let manualTraversalOrder = [];

const svg = document.getElementById('algoSvg');
const width = document.getElementById('mapContainer').clientWidth;
const height = document.getElementById('mapContainer').clientHeight;

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tabRandom').addEventListener('click', () => setInputMode('random'));
    document.getElementById('tabManual').addEventListener('click', () => setInputMode('manual'));

    document.getElementById('generateRandomBtn').addEventListener('click', generateRandomTree);
    document.getElementById('generateManualBtn').addEventListener('click', generateManualTree);
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    document.getElementById('solveBtn').addEventListener('click', startAutoSolve);
    document.getElementById('manualSolveBtn').addEventListener('click', startManualSolve);
    document.getElementById('closeResultBtn').addEventListener('click', () => document.getElementById('resultOverlay').style.display = 'none');

    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('prevBtn').addEventListener('click', stepBack);
    document.getElementById('nextBtn').addEventListener('click', stepForward);
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
    visitedNodes.clear();
    manualTraversalOrder = [];
    isSolving = false;
    isManualMode = false;
    isPaused = false;
    currentScore = 0;
    if (animationTimeout) clearTimeout(animationTimeout);
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('timerDisplay').textContent = "00:00";
    document.getElementById('currentScoreDisplay').textContent = "0";

    svg.innerHTML = '';
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'none';
    document.getElementById('overlayMessage').style.display = 'flex';
    document.getElementById('stepControls').style.display = 'none';
    document.getElementById('resultOverlay').style.display = 'none';
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '||';
    updateStatus("Ready to generate BST.");
}

function generateRandomTree() {
    const count = document.getElementById('nodeCountInput').value;
    updateStatus("Generating BST...");

    fetch(`/BFS/GenerateRandom?count=${count}`)
        .then(r => r.json())
        .then(data => {
            nodes = data.nodes.map(n => ({ id: n.id, value: n.value, x: n.x, y: n.y }));
            edges = data.edges.map(e => ({ source: e.source, target: e.target }));
            setupTree();
        })
        .catch(e => updateStatus("Error generating BST."));
}

function generateManualTree() {
    const input = document.getElementById('manualValueInput').value.trim();
    if (!input) {
        updateStatus("Please enter some values.");
        return;
    }

    const values = input.split(/[,\s]+/).map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length === 0) {
        updateStatus("No valid numbers found.");
        return;
    }

    if (values.length > 15) {
        updateStatus("Maximum 15 nodes allowed.");
        return;
    }

    nodes = [];
    edges = [];
    const nodeMap = {};

    for (let i = 0; i < values.length; i++) {
        const id = String.fromCharCode(65 + i); // A, B, C...
        const node = { id: id, value: values[i], x: 0, y: 0 };
        nodes.push(node);
        nodeMap[id] = node;

        if (i > 0) {
            // Insert into BST
            let currentId = nodes[0].id;
            while (true) {
                const currentNode = nodeMap[currentId];
                if (values[i] < currentNode.value) {
                    // Left
                    const leftEdge = edges.find(e => e.source === currentId && nodeMap[e.target].value < currentNode.value);
                    if (!leftEdge) {
                        edges.push({ source: currentId, target: id });
                        break;
                    } else {
                        currentId = leftEdge.target;
                    }
                } else {
                    // Right
                    const rightEdge = edges.find(e => e.source === currentId && nodeMap[e.target].value >= currentNode.value);
                    if (!rightEdge) {
                        edges.push({ source: currentId, target: id });
                        break;
                    } else {
                        currentId = rightEdge.target;
                    }
                }
            }
        }
    }

    setupTree();
}

function setupTree() {
    calculateBSTLayout();
    renderTree();

    // Populate Start Node Dropdown
    const select = document.getElementById('startNodeSelect');
    select.innerHTML = '<option value="" disabled selected>-- Select Start Node --</option>';
    nodes.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.textContent = `${n.id} (${n.value})`;
        select.appendChild(opt);
    });

    if (nodes.length > 0) {
        select.value = nodes[0].id; // Default to root
    }

    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'block';
    document.getElementById('overlayMessage').style.display = 'none';
    document.getElementById('stepControls').style.display = 'none';
    document.getElementById('nodeCountDisplay').textContent = nodes.length;
    document.getElementById('edgeCountDisplay').textContent = edges.length;
    updateStatus("BST generated. Select mode and start.");
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '||';
}

function calculateBSTLayout() {
    if (nodes.length === 0) return;

    // Build adjacency for tree structure
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
        adj[e.source].push(e.target);
    });

    // Assign levels using BFS
    const root = nodes[0].id;
    const levels = {};
    const queue = [{ id: root, level: 0 }];
    levels[root] = 0;
    let maxLevel = 0;

    while (queue.length > 0) {
        const { id, level } = queue.shift();
        maxLevel = Math.max(maxLevel, level);

        adj[id].forEach(child => {
            levels[child] = level + 1;
            queue.push({ id: child, level: level + 1 });
        });
    }

    // Count nodes per level
    const nodesPerLevel = {};
    Object.keys(levels).forEach(nodeId => {
        const lvl = levels[nodeId];
        if (!nodesPerLevel[lvl]) nodesPerLevel[lvl] = [];
        nodesPerLevel[lvl].push(nodeId);
    });

    // Sort nodes per level by value to ensure BST order (left to right)
    Object.keys(nodesPerLevel).forEach(lvl => {
        nodesPerLevel[lvl].sort((a, b) => {
            const valA = nodes.find(n => n.id === a).value;
            const valB = nodes.find(n => n.id === b).value;
            return valA - valB;
        });
    });

    // Position nodes
    const levelHeight = height / (maxLevel + 2);

    nodes.forEach(n => {
        const level = levels[n.id];
        const levelNodes = nodesPerLevel[level];
        const index = levelNodes.indexOf(n.id);
        const levelWidth = width / (levelNodes.length + 1);

        n.x = levelWidth * (index + 1);
        n.y = levelHeight * (level + 1);
    });
}

function renderTree() {
    svg.innerHTML = '';

    // Draw Edges
    edges.forEach(e => {
        const n1 = nodes.find(n => n.id === e.source);
        const n2 = nodes.find(n => n.id === e.target);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", n1.x);
        line.setAttribute("y1", n1.y);
        line.setAttribute("x2", n2.x);
        line.setAttribute("y2", n2.y);
        line.setAttribute("stroke", "#334155");
        line.setAttribute("stroke-width", "2");
        line.classList.add("edge-line");
        line.dataset.id = `${e.source}-${e.target}`;
        svg.appendChild(line);
    });

    // Draw Nodes
    nodes.forEach(n => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.style.cursor = isManualMode && isSolving ? "pointer" : "default";
        group.addEventListener('click', () => onNodeClick(n));

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", n.x);
        circle.setAttribute("cy", n.y);
        circle.setAttribute("r", "30");
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
        text.setAttribute("font-size", "16px");
        text.textContent = n.value;
        group.appendChild(text);

        svg.appendChild(group);
    });
}

function highlightNode(id, color) {
    const selector = `.node-circle[data-id="${id}"]`;
    const circle = document.querySelector(selector);
    if (circle) {
        circle.setAttribute("stroke", color);
        circle.setAttribute("stroke-width", "4");
        circle.setAttribute("fill", color === '#10b981' ? '#065f46' : '#1e293b');
    }
}

// --- Manual Solve ---
function startManualSolve() {
    const startSelect = document.getElementById('startNodeSelect');
    if (!startSelect.value) {
        updateStatus("Please select a Start Node.");
        return;
    }

    isSolving = true;
    isManualMode = true;
    isPaused = false;
    currentScore = 0;
    visitedNodes.clear();
    manualTraversalOrder = [];
    document.getElementById('currentScoreDisplay').textContent = "0";
    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;
    updateStatus("Click nodes in BFS order (level by level, left to right).");
    startTimer();
    renderTree();
}

function onNodeClick(node) {
    if (!isSolving || !isManualMode) return;

    if (visitedNodes.has(node.id)) {
        updateStatus("Node already visited!");
        return;
    }

    // Check if it's the correct next node in BFS order
    const correctOrder = getCorrectBFSOrder();
    const nextCorrectNode = correctOrder[visitedNodes.size];

    if (node.id === nextCorrectNode) {
        visitedNodes.add(node.id);
        manualTraversalOrder.push(node.value);
        highlightNode(node.id, '#10b981');
        currentScore += 10;
        document.getElementById('currentScoreDisplay').textContent = currentScore;
        updateStatus(`Correct! Visited: ${manualTraversalOrder.join(' → ')}`);

        if (visitedNodes.size === nodes.length) {
            finishManual();
        }
    } else {
        currentScore = Math.max(0, currentScore - 5);
        document.getElementById('currentScoreDisplay').textContent = currentScore;
        updateStatus("Wrong node! Try again.");
    }
}

function getCorrectBFSOrder() {
    const startSelect = document.getElementById('startNodeSelect');
    const startId = startSelect.value;

    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
        adj[e.source].push(e.target);
    });

    const order = [];
    const queue = [startId];
    const visited = new Set([startId]);

    while (queue.length > 0) {
        const current = queue.shift();
        order.push(current);

        adj[current].sort().forEach(child => {
            if (!visited.has(child)) {
                visited.add(child);
                queue.push(child);
            }
        });
    }

    return order;
}

function finishManual() {
    const timeStr = getFormattedTime();
    stopTimer();
    updateStatus("BFS Complete!");

    document.getElementById('resultTraversal').textContent = manualTraversalOrder.join(' → ');
    document.getElementById('resultTime').textContent = timeStr;
    document.getElementById('finalScore').textContent = currentScore;
    document.getElementById('resultOverlay').style.display = 'flex';

    isSolving = false;
    isManualMode = false;
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
}

// --- Auto Solve ---
async function startAutoSolve() {
    const startSelect = document.getElementById('startNodeSelect');
    if (!startSelect.value) {
        updateStatus("Please select a Start Node.");
        return;
    }

    isSolving = true;
    isPaused = false;
    currentScore = 0;
    document.getElementById('currentScoreDisplay').textContent = "0";
    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;
    document.getElementById('stepControls').style.display = 'flex';
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '||';
    updateStatus("Running BFS...");
    startTimer();

    try {
        const backendNodes = nodes.map(n => ({ Id: n.id, Value: n.value, X: Math.round(n.x), Y: Math.round(n.y) }));
        const backendEdges = edges.map(e => ({ Source: e.source, Target: e.target }));
        const startId = startSelect.value;

        const response = await fetch('/BFS/Solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Nodes: backendNodes, Edges: backendEdges, StartNodeId: startId })
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const result = await response.json();
        steps = result.steps;

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

        let delay = 800;
        animationTimeout = setTimeout(animateStep, delay);
    } else {
        // Final state
        const timeStr = getFormattedTime();
        stopTimer();
        updateStatus("BFS Traversal Complete!");

        // Get traversal order from steps
        const traversalValues = steps
            .filter(s => s.type === "Visit")
            .map(s => nodes.find(n => n.id === s.currentNodeId).value);

        // Calculate max score
        currentScore = nodes.length * 10;

        document.getElementById('resultTraversal').textContent = traversalValues.join(' → ');
        document.getElementById('resultTime').textContent = timeStr;
        document.getElementById('finalScore').textContent = currentScore + " (Auto)";
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

    updateStatus(step.description || "Processing...");

    if (step.type === "Visit") {
        highlightNode(step.currentNodeId, '#10b981');
        currentScore += 10;
        document.getElementById('currentScoreDisplay').textContent = currentScore;
    }
}

// --- Step Controls ---
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
        applyVisualsAt(animationIndex);
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
