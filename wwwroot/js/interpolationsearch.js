// Interpolation Search Visualizer JavaScript
let searchSteps = [];
let currentStepIndex = 0;
let isAnimating = false;
let isPaused = false;
let animationSpeed = 1000;
let timer = null;
let startTime = null;
let score = 0;

// DOM Elements
const arrayInput = document.getElementById('arrayInput');
const targetInput = document.getElementById('targetInput');
const arrayContainer = document.getElementById('arrayContainer');
const startBtn = document.getElementById('startBtn');
const autoSolveBtn = document.getElementById('autoSolveBtn');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stepControls = document.getElementById('stepControls');
const stepDescription = document.getElementById('stepDescription');
const inputError = document.getElementById('inputError');
const resultOverlay = document.getElementById('resultOverlay');
const closeResultBtn = document.getElementById('closeResultBtn');

// Stats elements
const arraySizeEl = document.getElementById('arraySize');
const comparisonsEl = document.getElementById('comparisons');
const currentProbeEl = document.getElementById('currentProbeVal');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');

// Event Listeners
startBtn.addEventListener('click', () => handleSearchInit(false));
autoSolveBtn.addEventListener('click', () => handleSearchInit(true));
generateBtn.addEventListener('click', generateUniformArray);
resetBtn.addEventListener('click', handleReset);
prevStepBtn.addEventListener('click', () => navigateStep(-1));
nextStepBtn.addEventListener('click', () => navigateStep(1));
pauseBtn.addEventListener('click', handlePause);
closeResultBtn.addEventListener('click', () => resultOverlay.style.display = 'none');

// Initialize
function init() {
    generateUniformArray();
}

// Generate uniform sorted array (best for interpolation search)
function generateUniformArray() {
    const size = Math.floor(Math.random() * 8) + 6; // 6-13 elements
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 10) + 5;

    let array = [];
    for (let i = 0; i < size; i++) {
        array.push(start + (i * step));
    }

    arrayInput.value = array.join(', ');

    // Pick a random target
    if (Math.random() > 0.2) {
        targetInput.value = array[Math.floor(Math.random() * array.length)];
    } else {
        targetInput.value = array[Math.floor(Math.random() * array.length)] + 2; // Close miss
    }

    inputError.style.display = 'none';
}

// Parse inputs
function parseInputs() {
    const input = arrayInput.value.trim();
    const targetStr = targetInput.value.trim();

    if (!input) {
        showError('Please enter array elements');
        return null;
    }

    if (!targetStr) {
        showError('Please enter a target value');
        return null;
    }

    const array = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const target = parseInt(targetStr);

    if (array.length == 0) {
        showError('Invalid array');
        return null;
    }

    if (array.length > 20) {
        showError('Array size cannot exceed 20 elements');
        return null;
    }

    inputError.style.display = 'none';
    return { array, target };
}

// Show error message
function showError(message) {
    inputError.textContent = message;
    inputError.style.display = 'block';
}

// Start search logic
async function handleSearchInit(autoPlay) {
    const inputs = parseInputs();
    if (!inputs) return;

    // Fetch search steps from backend
    try {
        const response = await fetch('/InterpolationSearch/GenerateSteps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                array: inputs.array,
                target: inputs.target
            })
        });

        if (!response.ok) {
            const error = await response.json();
            showError(error.error || 'Failed to generate search steps');
            return;
        }

        const result = await response.json();
        searchSteps = result.steps;
        currentStepIndex = 0;

        // Update stats
        arraySizeEl.textContent = inputs.array.length;
        comparisonsEl.textContent = '0';
        currentProbeEl.textContent = '-';

        // Start timer
        startTimer();

        // Show initial state
        renderStep(searchSteps[0]);
        stepControls.style.display = 'flex';

        startBtn.disabled = true;
        autoSolveBtn.disabled = true;

        updateStepDescription(searchSteps[0].description);

        if (autoPlay) {
            handleAutoPlay();
        } else {
            isPaused = true;
            pauseBtn.textContent = '▶ Resume';
        }

    } catch (error) {
        showError('Error connecting to server');
        console.error(error);
    }
}

// Auto play
function handleAutoPlay() {
    isAnimating = true;
    isPaused = false;
    pauseBtn.textContent = '|| Pause';
    animateSteps();
}

// Animate
async function animateSteps() {
    while (currentStepIndex < searchSteps.length && isAnimating && !isPaused) {
        renderStep(searchSteps[currentStepIndex]);
        updateStepDescription(searchSteps[currentStepIndex].description);
        currentStepIndex++;

        await sleep(animationSpeed);
    }

    if (currentStepIndex >= searchSteps.length) {
        handleSearchComplete();
    }

    isAnimating = false;
}

// Navigate
function navigateStep(direction) {
    const newIndex = currentStepIndex + direction;

    if (newIndex >= 0 && newIndex < searchSteps.length) {
        currentStepIndex = newIndex;
        renderStep(searchSteps[currentStepIndex]);
        updateStepDescription(searchSteps[currentStepIndex].description);

        if (isAnimating && !isPaused) {
            handlePause();
        }
    }

    if (currentStepIndex >= searchSteps.length - 1) {
        handleSearchComplete();
    }
}

// Pause/Resume
function handlePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Resume' : '|| Pause';

    if (!isPaused && !isAnimating) {
        isAnimating = true;
        animateSteps();
    }
}

// Render visual step
function renderStep(step) {
    arrayContainer.innerHTML = '';

    const arr = step.array;

    arr.forEach((value, index) => {
        const box = document.createElement('div');
        box.className = 'array-box';

        // Index label
        const indexLabel = document.createElement('div');
        indexLabel.className = 'index-label';
        box.appendChild(indexLabel);

        const valueText = document.createTextNode(value);
        box.appendChild(valueText);

        // Visual Logic
        // 1. Is it outside the active range?
        if (index < step.low || index > step.high) {
            box.classList.add('inactive');
        } else {
            box.classList.add('active-range');
        }

        // 2. Is it Probe?
        if (index === step.probe) {
            box.classList.add('probe');
            const probeMarker = document.createElement('div');
            probeMarker.className = 'index-marker marker-probe';
            probeMarker.textContent = 'PROBE';
            box.appendChild(probeMarker);

            currentProbeEl.textContent = value;
        }

        // 3. Is it found?
        if (step.isFound && index === step.probe) {
            box.classList.add('found');
            box.classList.remove('probe');
        }

        // 4. Low Marker
        if (index === step.low && step.low >= 0) {
            const lowMarker = document.createElement('div');
            lowMarker.className = 'index-marker marker-low';
            lowMarker.textContent = 'LOW';
            box.appendChild(lowMarker);
        }

        // 5. High Marker
        if (index === step.high && step.high >= 0) {
            const highMarker = document.createElement('div');
            highMarker.className = 'index-marker marker-high';
            highMarker.textContent = 'HIGH';
            box.appendChild(highMarker);
        }

        arrayContainer.appendChild(box);
    });

    let comps = 0;
    for (let i = 0; i < currentStepIndex && i < searchSteps.length; i++) {
        if (searchSteps[i].probe !== -1) comps++;
    }
    comparisonsEl.textContent = comps;
}

// Update description
function updateStepDescription(description) {
    stepDescription.innerHTML = `<p style="color: #cbd5e1; font-size: 0.875rem; margin: 0;">${description}</p>`;
}

// Complete
function handleSearchComplete() {
    stopTimer();

    const lastStep = searchSteps[searchSteps.length - 1];
    const isFound = lastStep.isFound;

    const resultTitleEl = document.getElementById('resultTitle');
    const resultMessageEl = document.getElementById('resultMessage');
    const resultComparisonsEl = document.getElementById('resultComparisons');
    const resultScoreEl = document.getElementById('resultScore');
    const resultTimeEl = document.getElementById('resultTime');

    if (isFound) {
        resultTitleEl.textContent = "Target Found! 🎉";
        resultTitleEl.style.color = "#10b981";
        resultMessageEl.textContent = `Found value ${lastStep.target} at index ${lastStep.probe}.`;

        const baseScore = 2000;
        const compPenalty = parseInt(comparisonsEl.textContent) * 50;
        score = Math.max(200, baseScore - compPenalty);
    } else {
        resultTitleEl.textContent = "Not Found 😔";
        resultTitleEl.style.color = "#ef4444";
        resultMessageEl.textContent = `Value ${lastStep.target} is not in the array.`;

        score = 500;
    }

    updateScore(score);

    resultComparisonsEl.textContent = comparisonsEl.textContent;
    resultTimeEl.textContent = timerDisplay.textContent;
    resultScoreEl.textContent = score;

    resultOverlay.style.display = 'flex';
}

// Reset
function handleReset() {
    searchSteps = [];
    currentStepIndex = 0;
    isAnimating = false;
    isPaused = false;

    stopTimer();
    updateScore(0);

    arrayContainer.innerHTML = '<p style="color: #94a3b8; text-align: center;">Enter array and target to begin.</p>';
    stepControls.style.display = 'none';
    stepDescription.innerHTML = '<p style="color: #cbd5e1; font-size: 0.875rem; margin: 0;">Ready to search.</p>';

    arraySizeEl.textContent = '0';
    comparisonsEl.textContent = '0';
    currentProbeEl.textContent = '-';

    startBtn.disabled = false;
    autoSolveBtn.disabled = false;
    pauseBtn.textContent = '|| Pause';
}

function startTimer() {
    startTime = Date.now();
    timer = setInterval(updateTimer, 100);
}

function stopTimer() {
    if (timer) clearInterval(timer);
}

function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateScore(newScore) {
    score = newScore;
    scoreDisplay.textContent = `Score: ${score}`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

init();
