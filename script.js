const state = {
    images: [],
    bpm: 60,
    stage: 0,
    isEdge: false,
    config: { censored: false, pixel: 10, speed: 5000, difficulty: 'medium' },
    audio: {
        bg: new Audio("bg.mp3"),
        click: document.getElementById('click-sound')
    },
    timers: { beat: null, ramp: null, image: null }
};

const diffLevels = {
    easy: { start: 50, inc: 1 },
    medium: { start: 70, inc: 2 },
    hard: { start: 100, inc: 4 },
    extreme: { start: 140, inc: 7 }
};

function showSettings() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('settings-page').style.display = 'flex';
}

async function fetchContent() {
    try {
        const r = await fetch("./images.json");
        const d = await r.json();
        state.images = d.images;
    } catch (e) { console.error("Could not find images.json"); }
}

function runBeat() {
    if (!state.isEdge) {
        // Sound
        if (document.getElementById('metro-toggle').checked) {
            state.audio.click.currentTime = 0;
            state.audio.click.volume = 0.3;
            state.audio.click.play().catch(()=>{});
        }

        // Animation
        const flash = document.getElementById('beat-flash');
        const img = document.getElementById('main-image');
        flash.style.opacity = "0.25";
        img.style.transform = "scale(1.06)";
        
        setTimeout(() => {
            flash.style.opacity = "0";
            img.style.transform = "scale(1)";
        }, 60);
    }

    document.getElementById('bpm-display').innerText = Math.floor(state.bpm).toString().padStart(3, '0');
    
    // Dynamic scheduling for perfect timing
    clearTimeout(state.timers.beat);
    state.timers.beat = setTimeout(runBeat, 60000 / state.bpm);
}

function startSession() {
    // 1. Map Settings
    state.config.censored = document.getElementById('censor-check').checked;
    state.config.pixel = document.getElementById('pixel-slider').value;
    state.config.speed = parseInt(document.getElementById('speed-input').value);
    state.config.difficulty = document.getElementById('difficulty-select').value;

    const diff = diffLevels[state.config.difficulty];
    state.bpm = diff.start;

    // 2. Apply Visual Filters
    if (state.config.censored) {
        document.getElementById('main-image').style.filter = `blur(${state.config.pixel}px) contrast(1.1)`;
    }

    // 3. UI Swap
    document.getElementById('settings-page').style.display = 'none';

    // 4. Audio Init
    if (document.getElementById('bg-toggle').checked) {
        state.audio.bg.loop = true;
        state.audio.bg.volume = 0.5;
        state.audio.bg.play().catch(()=>{});
    }

    // 5. Start Game Loops
    fetchContent().then(() => {
        cycleImage();
        state.timers.image = setInterval(cycleImage, state.config.speed);
    });

    runBeat();

    state.timers.ramp = setInterval(() => {
        if (!state.isEdge) {
            state.bpm += diff.inc;
            state.stage = Math.floor((state.bpm - diff.start) / 15);
            document.getElementById('stage-display').innerText = state.stage;
        }
    }, 10000);
}

function cycleImage() {
    if (state.images.length > 0) {
        const img = document.getElementById('main-image');
        img.src = state.images[Math.floor(Math.random() * state.images.length)];
    }
}

// Global Controls
document.getElementById('start-session-btn').onclick = startSession;

document.getElementById('edge-btn').onclick = () => {
    state.isEdge = true;
    const img = document.getElementById('main-image');
    const prevFilter = img.style.filter;
    img.style.filter = "grayscale(1) brightness(0.3) blur(2px)";
    
    setTimeout(() => {
        state.isEdge = false;
        img.style.filter = prevFilter;
    }, 12000);
};
