// BFS Graph Traversal Visualizer
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
let currentManualQueue = [];
let manualTraversalOrder = [];

const svg = document.getElementById('algoSvg');
const width = 800; // viewBox units
const height = 600; // viewBox units

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tabRandom').addEventListener('click', () => setInputMode('random'));
    document.getElementById('tabManual').addEventListener('click', () => setInputMode('manual'));
    document.getElementById('generateBtn').addEventListener('click', generateGraph);
    document.getElementById('generateManualBtn').addEventListener('click', generateManualGraph);
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

function updateStatus(text) { document.getElementById('statusText').textContent = text; }

function clearAnimation() {
    if (animationTimeout) { clearTimeout(animationTimeout); animationTimeout = null; }
}

function resetAll() {
    clearAnimation();
    nodes = []; edges = []; steps = []; visitedNodes.clear(); manualTraversalOrder = []; currentManualQueue = [];
    isSolving = false; isManualMode = false; isPaused = false; currentScore = 0;
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
    document.getElementById('queueContainer').innerHTML = '<span style="color: #64748b; font-style: italic; font-size: 0.875rem;">Queue is empty</span>';
    updateStatus("Ready to generate graph.");
}

async function generateGraph() {
    const count = document.getElementById('nodeCountInput').value;
    updateStatus("Generating connected graph...");
    const res = await fetch(`/BFSGraph/GenerateRandom?count=${count}`);
    const data = await res.json();
    nodes = data.nodes;
    edges = data.edges;
    setupGraphUI();
}

function generateManualGraph() {
    const input = document.getElementById('manualEdgeInput').value.trim();
    if (!input) { updateStatus("Please enter edges (e.g., A-B, B-C)."); return; }

    // Parse edges like "A-B, B-C" or "A:B,C"
    const rawEdges = input.split(/[,;]+/).map(s => s.trim()).filter(s => s);
    const nodeSet = new Set();
    const parsedEdges = [];

    rawEdges.forEach(raw => {
        const parts = raw.split(/[-:>]+/).map(s => s.trim().toUpperCase());
        if (parts.length >= 2) {
            const u = parts[0];
            for (let i = 1; i < parts.length; i++) {
                const v = parts[i];
                if (u && v && u !== v) {
                    nodeSet.add(u);
                    nodeSet.add(v);
                    // Avoid duplicates
                    if (!parsedEdges.some(e => (e.source === u && e.target === v) || (e.source === v && e.target === u))) {
                        parsedEdges.push({ source: u, target: v });
                    }
                }
            }
        }
    });

    if (nodeSet.size === 0) { updateStatus("No valid edges found."); return; }
    if (nodeSet.size > 15) { updateStatus("Too many nodes (max 15)."); return; }

    // Create nodes with circular layout
    const nodeIds = Array.from(nodeSet).sort();
    const centerX = 400, centerY = 300, radius = 200;
    nodes = nodeIds.map((id, i) => {
        const angle = (i / nodeIds.length) * 2 * Math.PI - Math.PI / 2;
        return {
            id: id,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
    edges = parsedEdges;
    setupGraphUI();
}

function setupGraphUI() {
    renderGraph();
    const select = document.getElementById('startNodeSelect');
    select.innerHTML = '';
    nodes.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.textContent = n.id;
        select.appendChild(opt);
    });
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'block';
    document.getElementById('overlayMessage').style.display = 'none';
    updateStatus("Graph generated. Select start node and begin traversal.");
}

function renderGraph() {
    svg.innerHTML = '';
    edges.forEach(e => {
        const n1 = nodes.find(n => n.id === e.source);
        const n2 = nodes.find(n => n.id === e.target);
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", n1.x); l.setAttribute("y1", n1.y); l.setAttribute("x2", n2.x); l.setAttribute("y2", n2.y);
        l.setAttribute("stroke", "#334155"); l.setAttribute("stroke-width", "2");
        l.dataset.source = e.source; l.dataset.target = e.target;
        svg.appendChild(l);
    });
    nodes.forEach(n => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.style.cursor = isManualMode && isSolving ? "pointer" : "default";
        g.addEventListener('click', () => onNodeClick(n));

        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", n.x); c.setAttribute("cy", n.y); c.setAttribute("r", "20");
        c.setAttribute("fill", "#1e293b"); c.setAttribute("stroke", "#64748b"); c.setAttribute("stroke-width", "2");
        c.classList.add("node-circle"); c.dataset.id = n.id;
        g.appendChild(c);

        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", n.x); t.setAttribute("y", n.y); t.setAttribute("dy", "0.35em"); t.setAttribute("text-anchor", "middle");
        t.setAttribute("fill", "white"); t.setAttribute("font-weight", "bold"); t.textContent = n.id;
        g.appendChild(t);

        svg.appendChild(g);
    });
}

function updateQueueUI(queue) {
    const container = document.getElementById('queueContainer');
    if (!queue || queue.length === 0) {
        container.innerHTML = '<span style="color: #64748b; font-style: italic; font-size: 0.875rem;">Queue is empty</span>';
        return;
    }
    container.innerHTML = queue.map(id => `
        <div style="background: #1e293b; border: 1px solid #334155; width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; position: relative;">
            ${id}
            <div style="position: absolute; top: -10px; font-size: 0.6rem; color: #4ade80;">↑</div>
        </div>
    `).join('<div style="color: #334155;">→</div>');
}

async function startAutoSolve() {
    clearAnimation();
    renderGraph();
    isSolving = true; isPaused = false; currentScore = 0;
    document.getElementById('currentScoreDisplay').textContent = "0";
    document.getElementById('stepControls').style.display = 'flex';
    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;

    startTimer();
    const startNodeId = document.getElementById('startNodeSelect').value;

    try {
        const res = await fetch('/BFSGraph/Solve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes, edges, startNodeId })
        });
        const data = await res.json();
        steps = data.steps;
        animationIndex = 0;
        if (steps && steps.length > 0) animateStep();
    } catch (e) {
        updateStatus("Error: " + e.message);
        isSolving = false;
        document.getElementById('solveBtn').disabled = false;
    }
}

function animateStep() {
    if (isPaused) return;
    if (animationIndex < steps.length) {
        const step = steps[animationIndex];
        updateStatus(step.description);
        updateQueueUI(step.queue);

        if (step.type === "Enqueue") {
            const circle = document.querySelector(`.node-circle[data-id="${step.currentNodeId}"]`);
            if (circle) {
                circle.setAttribute("stroke", "#22d3ee");
                circle.setAttribute("stroke-width", "4");
            }
            // Highlight discovery edge
            const edge = document.querySelector(`line[data-source="${step.parentNodeId}"][data-target="${step.currentNodeId}"], line[data-source="${step.currentNodeId}"][data-target="${step.parentNodeId}"]`);
            if (edge) {
                edge.setAttribute("stroke", "#22d3ee");
                edge.setAttribute("stroke-width", "3");
            }
        } else if (step.type === "Visit") {
            // Pulse the node being dequeued
            const circle = document.querySelector(`.node-circle[data-id="${step.currentNodeId}"]`);
            if (circle) {
                circle.setAttribute("fill", "#164e63");
                circle.setAttribute("stroke", "#4ade80");
                circle.setAttribute("stroke-width", "5");
            }
            currentScore += 10;
            document.getElementById('currentScoreDisplay').textContent = currentScore;
        }

        animationIndex++;
        animationTimeout = setTimeout(animateStep, 1000);
    } else {
        const finalOrder = steps.filter(s => s.type === "Visit").map(s => s.currentNodeId).join(' → ');
        finishSolve(finalOrder);
    }
}

function startManualSolve() {
    isSolving = true; isManualMode = true; currentScore = 0;
    visitedNodes.clear(); manualTraversalOrder = [];
    const startNodeId = document.getElementById('startNodeSelect').value;
    currentManualQueue = [startNodeId];
    visitedNodes.add(startNodeId);

    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;

    startTimer();
    renderGraph();
    updateQueueUI(currentManualQueue);

    // Highlight start node as enqueued
    const c = document.querySelector(`.node-circle[data-id="${startNodeId}"]`);
    if (c) c.setAttribute("stroke", "#22d3ee");

    updateStatus(`Click the correct next node to visit (Head of Queue: ${startNodeId}).`);
}

function onNodeClick(node) {
    if (!isSolving || !isManualMode) return;
    if (currentManualQueue.length === 0) return;

    const expectedId = currentManualQueue[0];
    if (node.id === expectedId) {
        // Correct visit
        currentManualQueue.shift();
        manualTraversalOrder.push(node.id);

        const circle = document.querySelector(`.node-circle[data-id="${node.id}"]`);
        if (circle) {
            circle.setAttribute("fill", "#164e63");
            circle.setAttribute("stroke", "#4ade80");
        }

        // Find unvisited neighbors and enqueue them
        const neighbors = edges
            .filter(e => e.source === node.id || e.target === node.id)
            .map(e => e.source === node.id ? e.target : e.source)
            .sort();

        neighbors.forEach(nbr => {
            if (!visitedNodes.has(nbr)) {
                visitedNodes.add(nbr);
                currentManualQueue.push(nbr);
                const nbrCircle = document.querySelector(`.node-circle[data-id="${nbr}"]`);
                if (nbrCircle) nbrCircle.setAttribute("stroke", "#22d3ee");
            }
        });

        currentScore += 10;
        document.getElementById('currentScoreDisplay').textContent = currentScore;
        updateQueueUI(currentManualQueue);

        if (manualTraversalOrder.length === nodes.length) {
            finishSolve(manualTraversalOrder.join(' → '));
        } else {
            updateStatus(`Correct! Next visit should be the head of the queue: ${currentManualQueue[0]}.`);
        }
    } else {
        currentScore = Math.max(0, currentScore - 5);
        document.getElementById('currentScoreDisplay').textContent = currentScore;
        updateStatus(`Wrong! You must visit the nodes in FIFO order. Next is ${expectedId}.`);
    }
}

function finishSolve(order) {
    stopTimer();
    document.getElementById('resultTraversal').textContent = order;
    document.getElementById('resultTime').textContent = getFormattedTime();
    document.getElementById('finalScore').textContent = currentScore + (isManualMode ? "" : " (Auto)");
    document.getElementById('resultOverlay').style.display = 'flex';
    isSolving = false; isManualMode = false;
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
    updateStatus("Traversal complete.");
}

function togglePause() { isPaused = !isPaused; document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : '||'; if (!isPaused) animateStep(); }
function stepForward() { if (animationIndex < steps.length) { animationIndex++; /* apply logic manually if needed */ } }
function stepBack() { if (animationIndex > 0) { animationIndex--; } }
function startTimer() { startTime = Date.now(); timerInterval = setInterval(() => document.getElementById('timerDisplay').textContent = getFormattedTime(), 100); }
function stopTimer() { clearInterval(timerInterval); }
function getFormattedTime() { const d = Date.now() - startTime; const s = Math.floor(d / 1000); return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`; }
