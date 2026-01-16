// Linear Search Visualizer JavaScript
let searchSteps = [];
let currentStepIndex = 0;
let isAnimating = false;
let isPaused = false;
let animationSpeed = 600;
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
const searchStatusEl = document.getElementById('searchStatus');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');

// Event Listeners
startBtn.addEventListener('click', () => handleSearchInit(false)); // Manual start
autoSolveBtn.addEventListener('click', () => handleSearchInit(true)); // Auto start
generateBtn.addEventListener('click', generateRandomArray);
resetBtn.addEventListener('click', handleReset);
prevStepBtn.addEventListener('click', () => navigateStep(-1));
nextStepBtn.addEventListener('click', () => navigateStep(1));
pauseBtn.addEventListener('click', handlePause);
closeResultBtn.addEventListener('click', () => resultOverlay.style.display = 'none');

// Initialize
function init() {
    arrayInput.value = '10, 50, 30, 70, 80, 20';
    targetInput.value = '30';
    updateScore(0);
}

// Generate random array
function generateRandomArray() {
    const size = Math.floor(Math.random() * 8) + 5; // 5-12 elements
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 99) + 1);
    }
    arrayInput.value = array.join(', ');

    // Pick a random target from array 70% of time, or random number 30% of time
    if (Math.random() > 0.3) {
        targetInput.value = array[Math.floor(Math.random() * array.length)];
    } else {
        targetInput.value = Math.floor(Math.random() * 99) + 1;
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

// Start search initialization
async function handleSearchInit(autoPlay) {
    const inputs = parseInputs();
    if (!inputs) return;

    // Fetch search steps from backend
    try {
        const response = await fetch('/LinearSearch/GenerateSteps', {
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
        searchStatusEl.textContent = 'Searching...';
        searchStatusEl.style.color = '#facc15';

        // Start timer
        startTimer();

        // Show initial state
        renderStep(searchSteps[0]);
        stepControls.style.display = 'flex';

        // Disable both start buttons
        startBtn.disabled = true;
        autoSolveBtn.disabled = true;

        updateStepDescription(searchSteps[0].description);

        // Auto play if requested
        if (autoPlay) {
            handleAutoPlay();
        } else {
            // Ensure paused state for manual mode
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

// Animate through steps
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

// Navigate steps manually
function navigateStep(direction) {
    const newIndex = currentStepIndex + direction;

    if (newIndex >= 0 && newIndex < searchSteps.length) {
        currentStepIndex = newIndex;
        renderStep(searchSteps[currentStepIndex]);
        updateStepDescription(searchSteps[currentStepIndex].description);

        // If we are playing, pause on manual interaction
        if (isAnimating && !isPaused) {
            handlePause();
        }
    }

    if (currentStepIndex >= searchSteps.length - 1) {
        handleSearchComplete();
    }
}

// Pause/Resume animation
function handlePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Resume' : '|| Pause';

    if (!isPaused) {
        // If we are resuming, ensure animation loop is running
        if (!isAnimating) {
            isAnimating = true;
            animateSteps();
        }
    }
}

// Render current step
function renderStep(step) {
    arrayContainer.innerHTML = '';

    step.array.forEach((value, index) => {
        const box = document.createElement('div');
        box.className = 'array-box';

        // Index label
        const indexLabel = document.createElement('div');
        indexLabel.className = 'index-label';
        indexLabel.textContent = index;
        box.appendChild(indexLabel);

        // Apply state classes
        if (step.isFound && index === step.currentIndex) {
            box.classList.add('found');
        } else if (index === step.currentIndex) {
            box.classList.add('checking');
        } else if (step.currentIndex > -1 && index < step.currentIndex) {
            box.classList.add('visited');
        }

        const valueText = document.createTextNode(value);
        box.appendChild(valueText);
        arrayContainer.appendChild(box);
    });

    // Calculate comparisons so far
    if (step.currentIndex > -1) {
        comparisonsEl.textContent = step.currentIndex + 1;
    } else {
        comparisonsEl.textContent = 0;
    }
}

// Update step description
function updateStepDescription(description) {
    stepDescription.innerHTML = `<p style="color: #cbd5e1; font-size: 0.875rem; margin: 0;">${description}</p>`;
}

// Handle search complete
function handleSearchComplete() {
    stopTimer();

    const lastStep = searchSteps[searchSteps.length - 1];
    const isFound = lastStep.isFound;

    // Calculate result
    const resultTitleEl = document.getElementById('resultTitle');
    const resultMessageEl = document.getElementById('resultMessage');
    const resultComparisonsEl = document.getElementById('resultComparisons');
    const resultScoreEl = document.getElementById('resultScore');
    const resultTimeEl = document.getElementById('resultTime');

    if (isFound) {
        resultTitleEl.textContent = "Target Found! 🎉";
        resultTitleEl.style.color = "#10b981";
        resultMessageEl.textContent = `Found value ${lastStep.target} at index ${lastStep.currentIndex}.`;
        searchStatusEl.textContent = "Found";
        searchStatusEl.style.color = "#10b981";

        // Score: faster find = better score (arbitrary)
        const baseScore = 1000;
        // penalized by comparisons (fewer comparisons = better)
        const compPenalty = (lastStep.currentIndex + 1) * 20;
        score = Math.max(100, baseScore - compPenalty);
    } else {
        resultTitleEl.textContent = "Not Found 😔";
        resultTitleEl.style.color = "#ef4444";
        resultMessageEl.textContent = `Value ${lastStep.target} is not in the array.`;
        searchStatusEl.textContent = "Not Found";
        searchStatusEl.style.color = "#ef4444";

        score = 500; // Constolation points
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

    arrayContainer.innerHTML = '<p style="color: #94a3b8; text-align: center;">Enter array and target value to begin</p>';
    stepControls.style.display = 'none';
    stepDescription.innerHTML = '<p style="color: #cbd5e1; font-size: 0.875rem; margin: 0;">Ready to search.</p>';

    arraySizeEl.textContent = '0';
    comparisonsEl.textContent = '0';
    searchStatusEl.textContent = 'Idle';
    searchStatusEl.style.color = '#94a3b8';

    startBtn.disabled = false;
    autoSolveBtn.disabled = false;
    pauseBtn.textContent = '|| Pause';
}

// Timer functions
function startTimer() {
    startTime = Date.now();
    timer = setInterval(updateTimer, 100);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function updateTimer() {
    if (!startTime) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Update score
function updateScore(newScore) {
    score = newScore;
    scoreDisplay.textContent = `Score: ${score}`;
}

// Utility sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on page load
init();
