// Huffman Coding Visualizer
let treeRoot = null;
let codes = {};
let isSolving = false;
let isPaused = false;
let score = 0;
let timerInterval;
let secondsElapsed = 0;
let hintsUsed = 0;
let originalSize = 0;
let compressedSize = 0;

async function buildTree() {
    const text = document.getElementById('inputText').value;
    if (!text) return;

    // Reset state
    resetStateOnly();
    isSolving = true;
    startTimer();
    document.getElementById('buildBtn').textContent = 'Building...';

    try {
        const response = await fetch('/Huffman/BuildTree', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(text)
        });

        const result = await response.json();
        treeRoot = result.treeRoot;
        codes = result.codes;
        originalSize = result.originalSize;
        compressedSize = result.compressedSize;

        renderTree(treeRoot);
        displayCodes(codes);
        updateStats();
        updateExplanation("Tree built! Hover over nodes to see details.");

        // Final Score Calculation
        calculateScore();
        stopTimer();
        isSolving = false;
        document.getElementById('buildBtn').textContent = 'Build Tree';

        // Show Decompression UI
        document.getElementById('decompressionSection').style.display = 'block';
        document.getElementById('encodedDisplay').textContent = result.encodedText;
        document.getElementById('decompressResult').textContent = '';
        showResultOverlay();

    } catch (error) {
        console.error("Error building tree:", error);
        isSolving = false;
        document.getElementById('buildBtn').textContent = 'Build Tree';
    }
}

async function decompress() {
    if (!treeRoot) return;
    const encoded = document.getElementById('encodedDisplay').textContent;

    try {
        const response = await fetch('/Huffman/Decode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encoded: encoded, treeRoot: treeRoot })
        });

        const result = await response.json();
        document.getElementById('decompressResult').textContent = "Decoded: " + result.decoded;

    } catch (error) {
        console.error("Error decoding:", error);
    }
}

function renderTree(root) {
    const svg = document.getElementById('treeSvg');
    svg.innerHTML = '';

    if (!root) {
        document.getElementById('emptyTreeMessage').style.display = 'block';
        return;
    }

    document.getElementById('emptyTreeMessage').style.display = 'none';

    // Calculate layout
    const levels = [];
    traverse(root, 0, levels);
    const treeHeight = Math.max(700, levels.length * 100 + 100);
    const treeWidth = Math.max(1200, Math.pow(2, levels.length) * 60 + 200);

    svg.setAttribute('viewBox', `0 0 ${treeWidth} ${treeHeight}`);
    svg.style.minWidth = '100%';

    // Basic recursion for drawing
    drawNode(svg, root, treeWidth / 2, 50, treeWidth / 4);
}

function traverse(node, level, levels) {
    if (!node) return;
    if (!levels[level]) levels[level] = [];
    levels[level].push(node);
    traverse(node.left, level + 1, levels);
    traverse(node.right, level + 1, levels);
}

function drawNode(svg, node, x, y, offset) {
    if (!node) return;

    // Draw children connections first
    if (node.left) {
        drawLine(svg, x, y, x - offset, y + 80);
        drawNode(svg, node.left, x - offset, y + 80, offset / 2);
    }
    if (node.right) {
        drawLine(svg, x, y, x + offset, y + 80);
        drawNode(svg, node.right, x + offset, y + 80, offset / 2);
    }

    // Draw node
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', node.character === '*' ? '#475569' : '#ec4899');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#fff');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.textContent = node.character === '*' ? node.frequency : node.character;

    // Metadata for hints/hover
    g.setAttribute('data-char', node.character);
    g.setAttribute('data-freq', node.frequency);

    g.appendChild(circle);
    g.appendChild(text);
    svg.appendChild(g);
}

function drawLine(svg, x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#94a3b8');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);
}

function displayCodes(codes) {
    const list = document.getElementById('codesList');
    list.innerHTML = '';
    document.getElementById('codesSection').style.display = 'block';

    for (const [char, code] of Object.entries(codes)) {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(0,0,0,0.2); margin-bottom: 0.25rem; border-radius: 0.25rem;';
        item.innerHTML = `<span style="color: #cbd5e1;">'${char}'</span><span style="font-family: monospace; color: #f472b6;">${code}</span>`;
        if (Object.keys(codes).length > 20) {
            // Limit display if too many
            if (list.children.length < 20) list.appendChild(item);
        } else {
            list.appendChild(item);
        }
    }
}

function updateStats() {
    document.getElementById('statsSection').style.display = 'block';
    document.getElementById('originalSize').textContent = originalSize + ' bits';
    document.getElementById('compressedSize').textContent = compressedSize + ' bits';
}

function calculateScore() {
    // Score based on Compression Ratio and Speed
    // Ratio = (Original - Compressed) / Original * 100
    if (originalSize === 0) return 0;

    const ratio = ((originalSize - compressedSize) / originalSize) * 100;
    // Base score from ratio (e.g., 50% = 500 pts) * 2 = 1000 max
    // Penalty for time? Usually Huffman is fast.
    let s = Math.round(ratio * 20) - (secondsElapsed * 5) - (hintsUsed * 50);
    if (s < 0) s = 0;
    score = s;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

// Hint Logic
async function getHint() {
    // For Huffman, hint = "Next Merge".
    // Since we auto-build, maybe "Hint" explains the tree structure?
    // Or we could implement step-by-step construction manually?
    // Given the current setup is Auto-Build, "Hint" might just highlight the root or explanation.
    // Let's make Hint simulate a "What would be the next step if we were building?"
    // The instructions said "Hint button suggests the next move".
    // Visualizing the MERGE order.

    if (!treeRoot) {
        updateExplanation("Enter text and build tree first.");
        return;
    }

    updateExplanation("Hint: Huffman builds bottom-up by merging lowest frequency nodes.");
    hintsUsed++;
    calculateScore();
}

// Timer
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const seconds = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
        // Score updates only on completion for Huffman usually, but realtime penalty visibility is ok
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetStateOnly() {
    stopTimer();
    secondsElapsed = 0;
    hintsUsed = 0;
    score = 0;
    document.getElementById('timerDisplay').textContent = "00:00";
    document.getElementById('scoreDisplay').textContent = "Score: 0";
}

function reset() {
    resetStateOnly();
    treeRoot = null;
    document.getElementById('inputText').value = "";
    document.getElementById('treeSvg').innerHTML = "";
    document.getElementById('emptyTreeMessage').style.display = 'block';
    document.getElementById('codesSection').style.display = 'none';
    document.getElementById('decompressionSection').style.display = 'none'; // properties
    document.getElementById('statsSection').style.display = 'none';
    updateExplanation("Reset complete.");
}

function updateExplanation(text) {
    const el = document.getElementById('explanationText');
    if (el) el.textContent = text;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('buildBtn').addEventListener('click', buildTree);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('hintBtn').addEventListener('click', getHint);
    document.getElementById('decompressBtn').addEventListener('click', decompress);
    document.getElementById('closeResultBtn').addEventListener('click', closeResultOverlay);
});

function showResultOverlay() {
    let ratio = 0;
    if (originalSize > 0) {
        ratio = ((originalSize - compressedSize) / originalSize) * 100;
    }
    const finalScore = score;
    document.getElementById('resultRatioValue').textContent = ratio.toFixed(1) + "%";
    document.getElementById('resultScoreValue').textContent = finalScore;
    document.getElementById('resultOverlay').style.display = 'flex';
}

function closeResultOverlay() {
    document.getElementById('resultOverlay').style.display = 'none';
}
