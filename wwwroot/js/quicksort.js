// Quick Sort Visualizer JavaScript
let sortingSteps = [];
let currentStepIndex = 0;
let isAnimating = false;
let isPaused = false;
let animationSpeed = 500;
let timer = null;
let startTime = null;
let score = 0;
let hintsUsed = 0;

// DOM Elements
const arrayInput = document.getElementById('arrayInput');
const arrayContainer = document.getElementById('arrayContainer');
const startBtn = document.getElementById('startBtn');
const generateBtn = document.getElementById('generateBtn');
const autoSolveBtn = document.getElementById('autoSolveBtn');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
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
const swapsEl = document.getElementById('swaps');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');

// Event Listeners
startBtn.addEventListener('click', handleStartSorting);
generateBtn.addEventListener('click', generateRandomArray);
autoSolveBtn.addEventListener('click', handleAutoSolve);
resetBtn.addEventListener('click', handleReset);
hintBtn.addEventListener('click', handleHint);
prevStepBtn.addEventListener('click', () => navigateStep(-1));
nextStepBtn.addEventListener('click', () => navigateStep(1));
pauseBtn.addEventListener('click', handlePause);
closeResultBtn.addEventListener('click', () => resultOverlay.style.display = 'none');

// Initialize
function init() {
    arrayInput.value = '64, 34, 25, 12, 22, 11, 90';
    updateScore(0);
}

// Generate random array
function generateRandomArray() {
    const size = Math.floor(Math.random() * 8) + 5; // 5-12 elements
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 100) + 1);
    }
    arrayInput.value = array.join(', ');
    inputError.style.display = 'none';
}

// Parse input array
function parseInputArray() {
    const input = arrayInput.value.trim();
    if (!input) {
        showError('Please enter array elements');
        return null;
    }

    const array = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

    if (array.length < 2) {
        showError('Array must have at least 2 elements');
        return null;
    }

    if (array.length > 20) {
        showError('Array size cannot exceed 20 elements');
        return null;
    }

    inputError.style.display = 'none';
    return array;
}

// Show error message
function showError(message) {
    inputError.textContent = message;
    inputError.style.display = 'block';
}

// Start sorting
async function handleStartSorting() {
    const array = parseInputArray();
    if (!array) return;

    // Get selected sort order
    const isAscending = document.querySelector('input[name="sortOrder"]:checked').value === 'ascending';

    // Fetch sorting steps from backend
    try {
        const response = await fetch('/QuickSort/GenerateSteps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                array: array,
                isAscending: isAscending
            })
        });

        if (!response.ok) {
            const error = await response.json();
            showError(error.error || 'Failed to generate sorting steps');
            return;
        }

        const result = await response.json();
        sortingSteps = result.steps;
        currentStepIndex = 0;

        // Update stats
        arraySizeEl.textContent = array.length;
        comparisonsEl.textContent = '0';
        swapsEl.textContent = '0';

        // Start timer
        startTimer();

        // Show initial state
        renderStep(sortingSteps[0]);
        stepControls.style.display = 'flex';

        updateStepDescription(sortingSteps[0].description);

    } catch (error) {
        showError('Error connecting to server');
        console.error(error);
    }
}

// Auto solve
async function handleAutoSolve() {
    if (sortingSteps.length === 0) {
        await handleStartSorting();
        if (sortingSteps.length === 0) return;
    }

    isAnimating = true;
    isPaused = false;
    pauseBtn.textContent = '|| Pause';
    autoSolveBtn.disabled = true;

    animateSteps();
}

// Animate through steps
async function animateSteps() {
    while (currentStepIndex < sortingSteps.length && isAnimating && !isPaused) {
        renderStep(sortingSteps[currentStepIndex]);
        updateStepDescription(sortingSteps[currentStepIndex].description);
        currentStepIndex++;

        await sleep(animationSpeed);
    }

    if (currentStepIndex >= sortingSteps.length) {
        handleSortingComplete();
    }

    isAnimating = false;
    autoSolveBtn.disabled = false;
}

// Navigate steps manually
function navigateStep(direction) {
    const newIndex = currentStepIndex + direction;

    if (newIndex >= 0 && newIndex < sortingSteps.length) {
        currentStepIndex = newIndex;
        renderStep(sortingSteps[currentStepIndex]);
        updateStepDescription(sortingSteps[currentStepIndex].description);
    }

    if (currentStepIndex >= sortingSteps.length - 1) {
        handleSortingComplete();
    }
}

// Pause/Resume animation
function handlePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Resume' : '|| Pause';

    if (!isPaused && isAnimating) {
        animateSteps();
    }
}

// Render current step
function renderStep(step) {
    arrayContainer.innerHTML = '';

    const maxValue = Math.max(...step.array);
    const minHeight = 50;
    const maxHeight = 250;

    step.array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'array-bar';

        // Calculate height
        const height = minHeight + (value / maxValue) * (maxHeight - minHeight);
        bar.style.height = `${height}px`;

        // Apply state classes
        if (step.sortedIndices.includes(index) || step.isSorted) {
            bar.classList.add('sorted');
        }
        // Pivot visualization
        if (index === step.pivotIndex) {
            bar.classList.add('pivot');

            // Add explicit "Pivot" label
            const pivotLabel = document.createElement('div');
            pivotLabel.className = 'pivot-label';
            pivotLabel.textContent = 'Pivot';
            bar.appendChild(pivotLabel);
        }

        // Comparison/Swap visualization
        if (index === step.compareIndex1 || index === step.compareIndex2) {
            if (step.swapped) {
                bar.classList.add('swapping');
            } else {
                bar.classList.add('comparing');
            }
        }

        // Range visualization (optional visual cue)
        if (index >= step.leftIndex && index <= step.rightIndex && step.leftIndex !== -1) {
            bar.classList.add('partition-range');
        }

        // Add value label
        const valueLabel = document.createElement('span');
        valueLabel.className = 'array-bar-value';
        valueLabel.textContent = value;
        bar.appendChild(valueLabel);

        arrayContainer.appendChild(bar);
    });

    // Stats update
    let totalComparisons = 0;
    let totalSwaps = 0;
    for (let i = 0; i <= currentStepIndex; i++) {
        if (sortingSteps[i].compareIndex1 >= 0 && sortingSteps[i].compareIndex2 >= 0) {
            if (sortingSteps[i].swapped) totalSwaps++;
            else totalComparisons++;
        }
    }
    comparisonsEl.textContent = totalComparisons;
    swapsEl.textContent = totalSwaps;
}

// Update step description
function updateStepDescription(description) {
    stepDescription.innerHTML = `<p style="color: #cbd5e1; font-size: 0.875rem; margin: 0;">${description}</p>`;
}

// Handle sorting complete
function handleSortingComplete() {
    stopTimer();

    const totalComparisons = parseInt(comparisonsEl.textContent);
    const totalSwaps = parseInt(swapsEl.textContent);

    // Calculate score (higher is better, penalize for hints)
    const baseScore = 1500; // Slightly higher base for QuickSort as it's faster usually
    const timeBonus = Math.max(0, 500 - (Date.now() - startTime) / 1000);
    const hintPenalty = hintsUsed * 50;
    score = Math.floor(baseScore + timeBonus - hintPenalty);

    updateScore(score);

    // Show result overlay
    document.getElementById('resultComparisons').textContent = totalComparisons;
    document.getElementById('resultSwaps').textContent = totalSwaps;
    document.getElementById('resultTime').textContent = timerDisplay.textContent;
    document.getElementById('resultScore').textContent = score;
    resultOverlay.style.display = 'flex';
}

// Reset
function handleReset() {
    sortingSteps = [];
    currentStepIndex = 0;
    isAnimating = false;
    isPaused = false;
    hintsUsed = 0;

    stopTimer();
    updateScore(0);

    arrayContainer.innerHTML = '<p style="color: #94a3b8; text-align: center;">Enter an array to begin visualization</p>';
    stepControls.style.display = 'none';
    stepDescription.innerHTML = '<p style="color: #cbd5e1; font-size: 0.875rem; margin: 0;">Enter your array elements and click "Start Sorting" to begin visualization.</p>';

    arraySizeEl.textContent = '0';
    comparisonsEl.textContent = '0';
    swapsEl.textContent = '0';

    autoSolveBtn.disabled = false;
    pauseBtn.textContent = '|| Pause';
}

// Handle hint
function handleHint() {
    if (sortingSteps.length === 0) {
        alert('Please start sorting first!');
        return;
    }

    hintsUsed++;
    updateScore(Math.max(0, score - 50));

    const hints = [
        'Quick Sort is a divide-and-conquer algorithm like Merge Sort.',
        'It works by selecting a "pivot" element from the array.',
        'Elements smaller than the pivot move to its left, larger ones to its right.',
        'Look for the purple bar - that represents the current pivot.',
        'The process partitions the array into two sub-arrays around the pivot.',
        'These sub-arrays are then sorted recursively.',
        'Yellow bars indicate elements being compared to the pivot.',
        'Red bars are swapped to place them on the correct side of the pivot.'
    ];

    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    alert(`💡 Hint: ${randomHint}\n\n(Hints used: ${hintsUsed}, -50 points each)`);
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
