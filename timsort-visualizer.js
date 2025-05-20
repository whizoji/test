// Timsort Visualizer in JavaScript

console.log('Script loaded');
const arrayContainer = document.getElementById('array');
console.log('arrayContainer:', arrayContainer);
const randomizeBtn = document.getElementById('randomize');
console.log('randomizeBtn:', randomizeBtn);
const sortBtn = document.getElementById('sort');
console.log('sortBtn:', sortBtn);
const sizeSlider = document.getElementById('size');
console.log('sizeSlider:', sizeSlider);
const shuffleBtn = document.getElementById('shuffle');
const speedSlider = document.getElementById('speed');

let arr = [];
let delay = 8;

function randomArray(size) {
    arr = Array.from({length: size}, () => Math.floor(Math.random() * 320) + 30);
    renderArray();
}

function shuffleArray() {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    renderArray();
}

function renderArray(activeIndices = [], sortedIndices = []) {
    arrayContainer.innerHTML = '';
    arr.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = val + 'px';
        // Smoother animation: longer transition for height, shorter for color
        bar.style.transition = `height 0.35s cubic-bezier(0.4,0,0.2,1), background 0.15s`;
        if (activeIndices.includes(idx)) bar.classList.add('active');
        if (sortedIndices.includes(idx)) bar.classList.add('sorted');
        arrayContainer.appendChild(bar);
    });
}

randomizeBtn.onclick = () => randomArray(Number(sizeSlider.value));
shuffleBtn.onclick = () => shuffleArray();
speedSlider.oninput = () => {
    delay = 100 - Number(speedSlider.value);
    if (delay < 2) delay = 2;
};
sizeSlider.oninput = () => randomArray(Number(sizeSlider.value));

// --- Timsort Implementation for Visualization ---
const MIN_MERGE = 32;

function minRunLength(n) {
    let r = 0;
    while (n >= MIN_MERGE) {
        r |= n & 1;
        n >>= 1;
    }
    return n + r;
}

async function insertionSort(left, right) {
    for (let i = left + 1; i <= right; i++) {
        let temp = arr[i];
        let j = i - 1;
        while (j >= left && arr[j] > temp) {
            arr[j + 1] = arr[j];
            renderArray([j, j+1]);
            await sleep(delay);
            j--;
        }
        arr[j + 1] = temp;
        renderArray([j+1]);
        await sleep(delay);
    }
}

async function merge(l, m, r) {
    let len1 = m - l + 1, len2 = r - m;
    let left = [], right = [];
    for (let i = 0; i < len1; i++) left[i] = arr[l + i];
    for (let i = 0; i < len2; i++) right[i] = arr[m + 1 + i];
    let i = 0, j = 0, k = l;
    while (i < len1 && j < len2) {
        if (left[i] <= right[j]) {
            arr[k] = left[i++];
        } else {
            arr[k] = right[j++];
        }
        renderArray([k]);
        await sleep(delay);
        k++;
    }
    while (i < len1) {
        arr[k] = left[i++];
        renderArray([k]);
        await sleep(delay);
        k++;
    }
    while (j < len2) {
        arr[k] = right[j++];
        renderArray([k]);
        await sleep(delay);
        k++;
    }
}

async function timSort() {
    let n = arr.length;
    let minRun = minRunLength(MIN_MERGE);
    // Visualize sorting of runs of size 1 to 32
    for (let i = 0; i < n; i += minRun) {
        await insertionSort(i, Math.min(i + minRun - 1, n - 1));
        // Highlight the sorted run after each insertion sort
        let sortedIndices = [];
        for (let k = i; k <= Math.min(i + minRun - 1, n - 1); k++) sortedIndices.push(k);
        renderArray([], sortedIndices);
        await sleep(delay * 2);
    }
    for (let size = minRun; size < n; size = 2 * size) {
        for (let left = 0; left < n; left += 2 * size) {
            let mid = left + size - 1;
            let right = Math.min((left + 2 * size - 1), (n - 1));
            if (mid < right) {
                await merge(left, mid, right);
            }
        }
    }
    renderArray([], Array.from({length: n}, (_, i) => i));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

sortBtn.onclick = async () => {
    sortBtn.disabled = true;
    randomizeBtn.disabled = true;
    sizeSlider.disabled = true;
    await timSort();
    sortBtn.disabled = false;
    randomizeBtn.disabled = false;
    sizeSlider.disabled = false;
};

// Initialize after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    randomArray(Number(sizeSlider.value));
});
