// BST Construction Visualizer
let currentArray = [];
let isSolving = false;
let isPaused = false;
let timerInterval = null;
let startTime = 0;
let currentScore = 0;
let steps = [];
let animationIndex = 0;
let animationTimeout = null;

const svg = document.getElementById('treeSvg');
const arrayContainer = document.getElementById('arrayContainer');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tabRandom').addEventListener('click', () => setInputMode('random'));
    document.getElementById('tabManual').addEventListener('click', () => setInputMode('manual'));
    document.getElementById('generateBtn').addEventListener('click', generateRandomArray);
    document.getElementById('generateManualBtn').addEventListener('click', loadManualArray);
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    document.getElementById('solveBtn').addEventListener('click', startBuildBST);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('prevBtn').addEventListener('click', stepBack);
    document.getElementById('nextBtn').addEventListener('click', stepForward);
    document.getElementById('closeResultBtn').addEventListener('click', () => document.getElementById('resultOverlay').style.display = 'none');

    setInputMode('random');
});

function setInputMode(mode) {
    document.getElementById('tabRandom').className = mode === 'random' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    document.getElementById('tabManual').className = mode === 'manual' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    document.getElementById('randomInputGroup').style.display = mode === 'random' ? 'block' : 'none';
    document.getElementById('manualInputGroup').style.display = mode === 'manual' ? 'block' : 'none';
}

function updateStatus(text) { document.getElementById('statusText').textContent = text; }

function resetAll() {
    clearAnimation();
    currentArray = []; steps = []; isSolving = false; isPaused = false;
    currentScore = 0; document.getElementById('currentScoreDisplay').textContent = "0";
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('timerDisplay').textContent = "00:00";
    svg.innerHTML = '';
    arrayContainer.innerHTML = '<span style="color: #64748b; font-style: italic;">Generate an array to begin</span>';
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'none';
    document.getElementById('stepControls').style.display = 'none';
    document.getElementById('resultOverlay').style.display = 'none';
    document.getElementById('insertionView').style.display = 'none';
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '||';
    updateStatus("Ready to build BST.");
}

async function generateRandomArray() {
    const count = document.getElementById('nodeCountInput').value;
    const res = await fetch(`/BST/GenerateRandom?count=${count}`);
    currentArray = await res.json();
    setupUIAfterLoad();
}

function loadManualArray() {
    const input = document.getElementById('manualArrayInput').value;
    currentArray = input.split(/[,\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (currentArray.length < 1) { updateStatus("Please enter some numbers."); return; }
    currentArray = [...new Set(currentArray)];
    if (currentArray.length > 15) { updateStatus("Max 15 elements for clear visualization."); return; }
    setupUIAfterLoad();
}

function setupUIAfterLoad() {
    renderArray();
    svg.innerHTML = '';
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'block';
    updateStatus("Array loaded. Click 'Build BST' to start.");
}

function renderTree(nodes = [], edges = [], options = {}) {
    svg.innerHTML = '';

    // Draw edges
    edges.forEach(edge => {
        const from = nodes.find(n => n.id === edge.from);
        const to = nodes.find(n => n.id === edge.to);
        if (from && to) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", from.x); line.setAttribute("y1", from.y);
            line.setAttribute("x2", to.x); line.setAttribute("y2", to.y);
            line.setAttribute("stroke", "#334155"); line.setAttribute("stroke-width", "2");
            line.classList.add("tree-edge");
            svg.appendChild(line);
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        const isComparing = options.compareValue === node.value;
        const isInserting = options.highlightValue === node.value && options.type === "Insert";

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.style.transformBox = "fill-box";
        g.style.transformOrigin = "center";

        if (isComparing) g.classList.add("node-compare");
        if (isInserting) g.classList.add("node-pulse");

        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", node.x); c.setAttribute("cy", node.y); c.setAttribute("r", "20");
        c.setAttribute("fill", isInserting ? "rgba(168, 85, 247, 0.4)" : (isComparing ? "rgba(249, 115, 22, 0.4)" : "#1e293b"));
        c.setAttribute("stroke", isInserting ? "#a855f7" : (isComparing ? "#f97316" : "#4ade80"));
        c.setAttribute("stroke-width", "3");
        c.classList.add("node-circle");

        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", node.x); t.setAttribute("y", node.y); t.setAttribute("dy", "0.35em"); t.setAttribute("text-anchor", "middle");
        t.setAttribute("fill", "white"); t.setAttribute("font-weight", "bold"); t.setAttribute("font-size", "0.9rem");
        t.textContent = node.value;

        g.appendChild(c); g.appendChild(t);
        svg.appendChild(g);
    });
}

function renderArray(highlightValue = null) {
    arrayContainer.innerHTML = currentArray.map(val => {
        let style = "border: 1px solid #334155; background: #1e293b; color: white;";
        if (val === highlightValue) style = "border: 2px solid #f97316; background: rgba(249, 115, 22, 0.4); color: white; font-weight: bold;";

        return `<div class="array-box" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 4px; ${style}">${val}</div>`;
    }).join('');
}

async function startBuildBST() {
    isSolving = true; isPaused = false;
    document.getElementById('solveBtn').disabled = true;
    document.getElementById('stepControls').style.display = 'flex';
    document.getElementById('insertionView').style.display = 'block';
    startTimer();

    const res = await fetch('/BST/Solve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ array: currentArray })
    });
    const data = await res.json();
    steps = data.steps; animationIndex = 0;
    animateStep();
}

function animateStep() {
    if (isPaused) return;
    if (animationIndex < steps.length) {
        renderStep(animationIndex);
        animationIndex++;
        const step = steps[animationIndex - 1];
        const delay = step.type === "Insert" ? 1500 : 800;
        animationTimeout = setTimeout(animateStep, delay);
    } else {
        finishSolve();
    }
}

function renderStep(index) {
    const step = steps[index];
    updateStatus(step.description);
    document.getElementById('insertingValue').textContent = step.highlightValue || "-";
    renderTree(step.nodes, step.edges, {
        highlightValue: step.highlightValue,
        compareValue: step.compareValue,
        type: step.type
    });
    renderArray(step.highlightValue);

    if (step.type === "Insert" && !isPaused) {
        currentScore += 10;
        document.getElementById('currentScoreDisplay').textContent = currentScore;
    }
}

function stepForward() {
    if (!isSolving || animationIndex >= steps.length) return;
    clearAnimation();
    if (!isPaused) togglePause();
    renderStep(animationIndex);
    animationIndex++;
}

function stepBack() {
    if (!isSolving || animationIndex <= 1) return;
    clearAnimation();
    if (!isPaused) togglePause();
    animationIndex -= 2;
    renderStep(animationIndex);
    animationIndex++;
}

function finishSolve() {
    stopTimer();
    document.getElementById('resultTime').textContent = getFormattedTime();
    document.getElementById('finalScore').textContent = currentScore;
    document.getElementById('resultOverlay').style.display = 'flex';
    isSolving = false;
    document.getElementById('solveBtn').disabled = false;
    updateStatus("BST construction complete. All nodes placed according to BST rules.");
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : '||';
    if (!isPaused) animateStep();
}

function clearAnimation() {
    if (animationTimeout) { clearTimeout(animationTimeout); animationTimeout = null; }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => document.getElementById('timerDisplay').textContent = getFormattedTime(), 100);
}
function stopTimer() { clearInterval(timerInterval); }
function getFormattedTime() {
    const d = Date.now() - startTime;
    const s = Math.floor(d / 1000);
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}
