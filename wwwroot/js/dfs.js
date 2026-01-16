// DFS BST Traversal Visualizer
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

function updateStatus(text) { document.getElementById('statusText').textContent = text; }

function clearAnimation() {
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
}

function resetAll() {
    clearAnimation();
    nodes = []; edges = []; steps = []; visitedNodes.clear(); manualTraversalOrder = [];
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
    updateStatus("Ready to generate BST.");
}

function generateRandomTree() {
    const count = document.getElementById('nodeCountInput').value;
    updateStatus("Generating BST...");
    fetch(`/DFS/GenerateRandom?count=${count}`).then(r => r.json()).then(data => {
        nodes = data.nodes; edges = data.edges; setupTree();
    }).catch(e => updateStatus("Error generating tree."));
}

function generateManualTree() {
    const input = document.getElementById('manualValueInput').value.trim();
    if (!input) return;
    const values = input.split(/[,\s]+/).map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    nodes = []; edges = []; const nodeMap = {};
    for (let i = 0; i < values.length; i++) {
        const id = String.fromCharCode(65 + i);
        const node = { id: id, value: values[i], x: 0, y: 0 };
        nodes.push(node); nodeMap[id] = node;
        if (i > 0) {
            let currId = nodes[0].id;
            while (true) {
                const currNode = nodeMap[currId];
                if (values[i] < currNode.value) {
                    const left = edges.find(e => e.source === currId && nodeMap[e.target].value < currNode.value);
                    if (!left) { edges.push({ source: currId, target: id }); break; } else currId = left.target;
                } else {
                    const right = edges.find(e => e.source === currId && nodeMap[e.target].value >= currNode.value);
                    if (!right) { edges.push({ source: currId, target: id }); break; } else currId = right.target;
                }
            }
        }
    }
    setupTree();
}

function setupTree() {
    calculateBSTLayout(); renderTree();
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'block';
    document.getElementById('overlayMessage').style.display = 'none';
    document.getElementById('stepControls').style.display = 'none';
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '||';
    updateStatus("BST generated. Select traversal and start.");
}

function calculateBSTLayout() {
    if (nodes.length === 0) return;
    const adj = {}; nodes.forEach(n => adj[n.id] = []); edges.forEach(e => adj[e.source].push(e.target));
    const levels = {}; const queue = [{ id: nodes[0].id, level: 0 }];
    levels[nodes[0].id] = 0; let maxLevel = 0;
    while (queue.length > 0) {
        const { id, level } = queue.shift();
        maxLevel = Math.max(maxLevel, level);
        adj[id].forEach(child => { levels[child] = level + 1; queue.push({ id: child, level: level + 1 }); });
    }
    const nodesPerLevel = {}; Object.keys(levels).forEach(id => {
        const lvl = levels[id]; if (!nodesPerLevel[lvl]) nodesPerLevel[lvl] = []; nodesPerLevel[lvl].push(id);
    });
    Object.keys(nodesPerLevel).forEach(lvl => nodesPerLevel[lvl].sort((a, b) => nodes.find(n => n.id === a).value - nodes.find(n => n.id === b).value));
    const lH = height / (maxLevel + 2);
    nodes.forEach(n => {
        const lvl = levels[n.id]; const lNodes = nodesPerLevel[lvl]; const idx = lNodes.indexOf(n.id); const lW = width / (lNodes.length + 1);
        n.x = lW * (idx + 1); n.y = lH * (lvl + 1);
    });
}

function renderTree() {
    svg.innerHTML = '';
    edges.forEach(e => {
        const n1 = nodes.find(n => n.id === e.source); const n2 = nodes.find(n => n.id === e.target);
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", n1.x); l.setAttribute("y1", n1.y); l.setAttribute("x2", n2.x); l.setAttribute("y2", n2.y);
        l.setAttribute("stroke", "#334155"); l.setAttribute("stroke-width", "2"); svg.appendChild(l);
    });
    nodes.forEach(n => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.style.cursor = isManualMode && isSolving ? "pointer" : "default";
        g.addEventListener('click', () => onNodeClick(n));
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", n.x); c.setAttribute("cy", n.y); c.setAttribute("r", "25");
        c.setAttribute("fill", "#1e293b"); c.setAttribute("stroke", "#64748b"); c.setAttribute("stroke-width", "2");
        c.classList.add("node-circle"); c.dataset.id = n.id; g.appendChild(c);
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", n.x); t.setAttribute("y", n.y); t.setAttribute("dy", "0.35em"); t.setAttribute("text-anchor", "middle");
        t.setAttribute("fill", "white"); t.setAttribute("font-weight", "bold"); t.textContent = n.value; g.appendChild(t);
        svg.appendChild(g);
    });
}

function highlightNode(id, color) {
    const c = document.querySelector(`.node-circle[data-id="${id}"]`);
    if (c) { c.setAttribute("stroke", color); c.setAttribute("stroke-width", "4"); c.setAttribute("fill", color === '#10b981' ? '#065f46' : '#1e293b'); }
}

async function startAutoSolve() {
    clearAnimation();
    renderTree(); // Clear previous highlights
    isSolving = true; isPaused = false; currentScore = 0;
    document.getElementById('currentScoreDisplay').textContent = "0";
    document.getElementById('stepControls').style.display = 'flex';
    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;

    startTimer();
    const type = document.getElementById('traversalTypeSelect').value;
    updateStatus(`Running ${type} Traversal...`);

    try {
        const res = await fetch('/DFS/Solve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nodes: nodes.map(n => ({ id: n.id, value: n.value, x: n.x, y: n.y })),
                edges: edges.map(e => ({ source: e.source, target: e.target })),
                startNodeId: nodes[0].id,
                traversalType: type
            })
        });

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();
        steps = data.steps;
        animationIndex = 0;

        if (steps && steps.length > 0) {
            animateStep();
        } else {
            updateStatus("No steps found for this traversal.");
            isSolving = false;
            document.getElementById('solveBtn').disabled = false;
            document.getElementById('manualSolveBtn').disabled = false;
        }
    } catch (e) {
        console.error(e);
        updateStatus("Error: " + e.message);
        isSolving = false;
        document.getElementById('solveBtn').disabled = false;
        document.getElementById('manualSolveBtn').disabled = false;
    }
}

function startManualSolve() {
    isSolving = true; isManualMode = true; currentScore = 0; visitedNodes.clear(); manualTraversalOrder = [];
    document.getElementById('solveBtn').disabled = true; document.getElementById('manualSolveBtn').disabled = true;
    updateStatus(`Click nodes in ${document.getElementById('traversalTypeSelect').value} order.`);
    startTimer(); renderTree();
}

function onNodeClick(node) {
    if (!isSolving || !isManualMode || visitedNodes.has(node.id)) return;
    const type = document.getElementById('traversalTypeSelect').value;
    const correctOrder = getCorrectDFSOrder(type);
    if (node.id === correctOrder[visitedNodes.size].id) {
        visitedNodes.add(node.id); manualTraversalOrder.push(node.value); highlightNode(node.id, '#10b981');
        currentScore += 10; document.getElementById('currentScoreDisplay').textContent = currentScore;
        if (visitedNodes.size === nodes.length) finishSolve(manualTraversalOrder.join(' → '));
    } else {
        currentScore = Math.max(0, currentScore - 5); document.getElementById('currentScoreDisplay').textContent = currentScore;
        updateStatus("Wrong node! Try again.");
    }
}

function getCorrectDFSOrder(type) {
    const adj = {}; nodes.forEach(n => adj[n.id] = { id: n.id, value: n.value, L: null, R: null });
    edges.forEach(e => {
        const p = adj[e.source]; const c = adj[e.target]; if (c.value < p.value) p.L = c; else p.R = c;
    });
    const order = [];
    const traverse = (n) => {
        if (!n) return;
        if (type === "PreOrder") order.push(n);
        traverse(n.L);
        if (type === "InOrder") order.push(n);
        traverse(n.R);
        if (type === "PostOrder") order.push(n);
    };
    traverse(adj[nodes[0].id]); return order;
}

function animateStep() {
    if (isPaused) return;
    if (animationIndex < steps.length) {
        const step = steps[animationIndex]; updateStatus(step.description); highlightNode(step.currentNodeId, '#10b981');
        currentScore += 10; document.getElementById('currentScoreDisplay').textContent = currentScore;
        animationIndex++; animationTimeout = setTimeout(animateStep, 800);
    } else finishSolve(steps.map(s => nodes.find(n => n.id === s.currentNodeId).value).join(' → '));
}

function finishSolve(order) {
    stopTimer(); document.getElementById('resultTraversal').textContent = order;
    document.getElementById('resultTime').textContent = getFormattedTime();
    document.getElementById('finalScore').textContent = currentScore + (isManualMode ? "" : " (Auto)");
    document.getElementById('resultOverlay').style.display = 'flex';
    isSolving = false; isManualMode = false;
    document.getElementById('solveBtn').disabled = false; document.getElementById('manualSolveBtn').disabled = false;
}

function togglePause() { isPaused = !isPaused; document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : '||'; if (!isPaused) animateStep(); }
function stepForward() { if (animationIndex < steps.length) { const step = steps[animationIndex]; highlightNode(step.currentNodeId, '#10b981'); animationIndex++; } }
function stepBack() { if (animationIndex > 0) { animationIndex--; const step = steps[animationIndex]; highlightNode(step.currentNodeId, '#1e293b'); } }
function startTimer() { startTime = Date.now(); timerInterval = setInterval(() => document.getElementById('timerDisplay').textContent = getFormattedTime(), 100); }
function stopTimer() { clearInterval(timerInterval); }
function getFormattedTime() { const d = Date.now() - startTime; const s = Math.floor(d / 1000); return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`; }
