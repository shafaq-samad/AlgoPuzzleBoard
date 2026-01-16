// Min Heap Construction Visualizer
let currentArray = [];
let isSolving = false;
let isManualMode = false;
let isPaused = false;
let timerInterval = null;
let startTime = 0;
let currentScore = 0;
let steps = [];
let animationIndex = 0;
let animationTimeout = null;

// Manual Mode State
let manualParentIdx = -1;

const svg = document.getElementById('heapSvg');
const arrayContainer = document.getElementById('arrayContainer');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tabRandom').addEventListener('click', () => setInputMode('random'));
    document.getElementById('tabManual').addEventListener('click', () => setInputMode('manual'));
    document.getElementById('generateBtn').addEventListener('click', generateRandomArray);
    document.getElementById('generateManualBtn').addEventListener('click', loadManualArray);
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    document.getElementById('solveBtn').addEventListener('click', startBuildHeap);
    document.getElementById('manualSolveBtn').addEventListener('click', startManualSolve);
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
    currentArray = []; steps = []; isSolving = false; isManualMode = false; isPaused = false;
    currentScore = 0; document.getElementById('currentScoreDisplay').textContent = "0";
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('timerDisplay').textContent = "00:00";
    svg.innerHTML = '';
    arrayContainer.innerHTML = '<span style="color: #64748b; font-style: italic;">Generate an array to begin</span>';
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'none';
    document.getElementById('stepControls').style.display = 'none';
    document.getElementById('resultOverlay').style.display = 'none';
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '||';
    manualParentIdx = -1;
    updateStatus("Ready to build Min Heap.");
}

async function generateRandomArray() {
    const count = document.getElementById('nodeCountInput').value;
    const res = await fetch(`/MinHeap/GenerateRandom?count=${count}`);
    currentArray = await res.json();
    setupUIAfterLoad();
}

function loadManualArray() {
    const input = document.getElementById('manualArrayInput').value;
    currentArray = input.split(/[,\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (currentArray.length < 2) { updateStatus("Please enter at least 2 numbers."); return; }
    if (currentArray.length > 15) { updateStatus("Max 15 elements for clear visualization."); return; }
    setupUIAfterLoad();
}

function setupUIAfterLoad() {
    renderHeap();
    renderArray();
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'block';
    updateStatus("Array loaded. Choose Auto or Manual Mode to build the Min Heap.");
}

function renderHeap(highlights = [], swaps = []) {
    svg.innerHTML = '';
    const n = currentArray.length;
    const levelHeight = 80;

    const getCoords = (index) => {
        const level = Math.floor(Math.log2(index + 1));
        const numInLevel = Math.pow(2, level);
        const positionInLevel = index - (numInLevel - 1);
        const sectionWidth = 800 / numInLevel;
        const x = sectionWidth * positionInLevel + sectionWidth / 2;
        const y = 50 + level * levelHeight;
        return { x, y };
    };

    for (let i = 0; i < n; i++) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        const parent = getCoords(i);
        if (left < n) { const child = getCoords(left); drawLine(parent.x, parent.y, child.x, child.y); }
        if (right < n) { const child = getCoords(right); drawLine(parent.x, parent.y, child.x, child.y); }
    }

    for (let i = 0; i < n; i++) {
        const coords = getCoords(i);
        let color = "#1e293b";
        let stroke = "#334155";
        let textColor = "white";

        const isHighlighted = highlights.includes(i) || (isManualMode && i === manualParentIdx);
        const isSwapping = swaps.includes(i);

        if (isHighlighted) { stroke = "#22d3ee"; color = "rgba(34, 211, 238, 0.4)"; }
        if (isSwapping) { stroke = "#4ade80"; color = "rgba(74, 222, 128, 0.4)"; }

        drawNode(coords.x, coords.y, currentArray[i], color, stroke, textColor, i, isHighlighted, isSwapping);
    }
}

function drawLine(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1); line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#334155"); line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
}

function drawNode(x, y, value, color, stroke, textColor, index, isHighlighted, isSwapping) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    if (isSolving) g.style.cursor = "pointer";
    g.style.transformBox = "fill-box";
    g.style.transformOrigin = "center";
    if (isHighlighted) g.classList.add("node-pulse");
    if (isSwapping) g.classList.add("node-swap");
    g.addEventListener('click', (e) => { e.stopPropagation(); onNodeClick(index); });

    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", "22");
    c.setAttribute("fill", color); c.setAttribute("stroke", stroke); c.setAttribute("stroke-width", "3");
    c.classList.add("heap-node-circle");

    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x); t.setAttribute("y", y); t.setAttribute("dy", "0.35em"); t.setAttribute("text-anchor", "middle");
    t.setAttribute("fill", textColor); t.setAttribute("font-weight", "bold"); t.textContent = value;
    t.style.pointerEvents = "none";

    const idxText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    idxText.setAttribute("x", x); idxText.setAttribute("y", y + 35); idxText.setAttribute("text-anchor", "middle");
    idxText.setAttribute("fill", "#64748b"); idxText.setAttribute("font-size", "0.7rem"); idxText.textContent = `[${index}]`;
    idxText.style.pointerEvents = "none";

    g.appendChild(c); g.appendChild(t); g.appendChild(idxText);
    svg.appendChild(g);
}

function renderArray(highlights = [], swaps = []) {
    arrayContainer.innerHTML = currentArray.map((val, i) => {
        let style = "border: 1px solid #334155; background: #1e293b; color: white;";
        let extraClass = "";
        if (swaps.includes(i)) { style = "border: 2px solid #4ade80; background: rgba(74, 222, 128, 0.4); color: #4ade80; font-weight: bold;"; extraClass = "array-swap"; }
        else if (highlights.includes(i) || (isManualMode && i === manualParentIdx)) { style = "border: 2px solid #22d3ee; background: rgba(34, 211, 238, 0.4); color: #22d3ee; font-weight: bold;"; }
        return `<div class="array-box ${extraClass}" style="width: 40px; height: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                    <div style="${style} width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 4px;">${val}</div>
                    <span style="font-size: 0.6rem; color: #64748b; position: absolute; bottom: -18px;">${i}</span>
                </div>`;
    }).join('');
}

async function startBuildHeap() {
    isSolving = true; isPaused = false; isManualMode = false;
    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;
    document.getElementById('stepControls').style.display = 'flex';
    startTimer();
    const res = await fetch('/MinHeap/Solve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ array: currentArray }) });
    const data = await res.json();
    steps = data.steps; animationIndex = 0;
    animateStep();
}

function startManualSolve() {
    isSolving = true; isManualMode = true; currentScore = 0;
    document.getElementById('currentScoreDisplay').textContent = "0";
    document.getElementById('solveBtn').disabled = true;
    document.getElementById('manualSolveBtn').disabled = true;
    manualParentIdx = Math.floor(currentArray.length / 2) - 1;
    startTimer();
    renderHeap(); renderArray();
    updateStatus(`Manual Mode: Start from node ${manualParentIdx}. Click a SMALLER child to swap, or node itself if it's smaller than both children.`);
}

function onNodeClick(index) {
    if (!isSolving || !isManualMode) return;

    const n = currentArray.length;
    const l = 2 * manualParentIdx + 1;
    const r = 2 * manualParentIdx + 2;
    let smallest = manualParentIdx;
    if (l < n && currentArray[l] < currentArray[smallest]) smallest = l;
    if (r < n && currentArray[r] < currentArray[smallest]) smallest = r;

    if (index === manualParentIdx) {
        if (smallest === manualParentIdx) {
            currentScore += 10;
            document.getElementById('currentScoreDisplay').textContent = currentScore;
            moveToNextParent();
        } else {
            currentScore = Math.max(0, currentScore - 5);
            document.getElementById('currentScoreDisplay').textContent = currentScore;
            updateStatus(`Wrong! Node ${manualParentIdx} (${currentArray[manualParentIdx]}) is LARGER than child ${smallest} (${currentArray[smallest]}). Click the child to swap.`);
        }
    } else if (index === l || index === r) {
        if (index === smallest) {
            const temp = currentArray[manualParentIdx];
            currentArray[manualParentIdx] = currentArray[smallest];
            currentArray[smallest] = temp;
            currentScore += 10;
            document.getElementById('currentScoreDisplay').textContent = currentScore;

            const oldParent = manualParentIdx;
            manualParentIdx = smallest;

            renderHeap([], [oldParent, manualParentIdx]);
            renderArray([], [oldParent, manualParentIdx]);

            const nextL = 2 * manualParentIdx + 1;
            const nextR = 2 * manualParentIdx + 2;
            if (nextL >= n) {
                updateStatus(`Node moved to leaf. Subtree fixed!`);
                setTimeout(moveToNextParent, 800);
            } else {
                updateStatus(`Correct swap! Continue Min-Heapifying down from index ${manualParentIdx}.`);
            }
        } else {
            currentScore = Math.max(0, currentScore - 5);
            document.getElementById('currentScoreDisplay').textContent = currentScore;
            updateStatus(`Incorrect swap! Child ${index} is not the absolute smallest.`);
        }
    } else {
        updateStatus(`Focus on node ${manualParentIdx} and its children.`);
    }
}

function moveToNextParent() {
    for (let i = Math.floor(currentArray.length / 2) - 1; i >= 0; i--) {
        const n = currentArray.length;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let smallest = i;
        if (l < n && currentArray[l] < currentArray[smallest]) smallest = l;
        if (r < n && currentArray[r] < currentArray[smallest]) smallest = r;

        if (smallest !== i) {
            manualParentIdx = i;
            renderHeap(); renderArray();
            updateStatus(`Moving to node ${manualParentIdx}. Fix the violation.`);
            return;
        }
    }
    finishSolve();
}

function animateStep() {
    if (isPaused) return;
    if (animationIndex < steps.length) {
        renderStep(animationIndex);
        animationIndex++;
        const delay = steps[animationIndex - 1].type === "Swap" ? 1500 : 1000;
        animationTimeout = setTimeout(animateStep, delay);
    } else { finishSolve(); }
}

function renderStep(index) {
    if (index < 0 || index >= steps.length) return;
    const step = steps[index];
    currentArray = step.array;
    updateStatus(step.description);
    renderHeap(step.highlightIndices || [], step.swapIndices || []);
    renderArray(step.highlightIndices || [], step.swapIndices || []);
    if (step.type === "Swap" && !isPaused) {
        currentScore += 10;
        document.getElementById('currentScoreDisplay').textContent = currentScore;
    }
}

function stepForward() {
    if (!isSolving || isManualMode || animationIndex >= steps.length) return;
    clearAnimation();
    if (!isPaused) togglePause();
    renderStep(animationIndex);
    animationIndex++;
}

function stepBack() {
    if (!isSolving || isManualMode || animationIndex <= 1) return;
    clearAnimation();
    if (!isPaused) togglePause();
    animationIndex -= 2;
    renderStep(animationIndex);
    animationIndex++;
}

function finishSolve() {
    stopTimer();
    manualParentIdx = -1;
    document.getElementById('resultTime').textContent = getFormattedTime();
    document.getElementById('finalScore').textContent = currentScore;
    document.getElementById('resultOverlay').style.display = 'flex';
    isSolving = false; isPaused = false; isManualMode = false;
    document.getElementById('solveBtn').disabled = false;
    document.getElementById('manualSolveBtn').disabled = false;
    document.getElementById('stepControls').style.display = 'none';
    renderHeap(); renderArray();
    updateStatus("Success! Min Heap built.");
}

function togglePause() { isPaused = !isPaused; document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : '||'; if (!isPaused) animateStep(); }
function clearAnimation() { if (animationTimeout) { clearTimeout(animationTimeout); animationTimeout = null; } }
function startTimer() { startTime = Date.now(); timerInterval = setInterval(() => document.getElementById('timerDisplay').textContent = getFormattedTime(), 100); }
function stopTimer() { clearInterval(timerInterval); }
function getFormattedTime() { const d = Date.now() - startTime; const s = Math.floor(d / 1000); return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`; }
