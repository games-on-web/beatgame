const state = {
  images: [],
  imageIndex: -1,
  bpm: 60,
  stage: 0,
  isEdge: false,
  config: {
    censored: false,
    pixel: 10,
    speed: 5000,
    difficulty: "medium"
  },
  audio: {
    bg: new Audio("bg.mp3"),
    click: document.getElementById("click-sound")
  },
  timers: {
    beat: null,
    ramp: null,
    image: null
  }
};

const diffLevels = {
  easy: { start: 50, inc: 1 },
  medium: { start: 70, inc: 2 },
  hard: { start: 100, inc: 4 },
  extreme: { start: 140, inc: 7 }
};

const $ = (id) => document.getElementById(id);
const viewer = $("viewer");
const image = $("main-image");

function showSettings() {
  $("landing-page").classList.add("is-hidden");
  $("settings-page").classList.remove("is-hidden");
}

function showLanding() {
  $("settings-page").classList.add("is-hidden");
  $("landing-page").classList.remove("is-hidden");
}

function applyImageFilter() {
  if (state.config.censored) {
    image.style.filter = `blur(${state.config.pixel}px)`;
  } else {
    image.style.filter = "none";
  }
}

async function fetchContent() {
  try {
    const response = await fetch("./images.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    state.images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];

    if (!state.images.length) {
      throw new Error("images.json contains no images");
    }
  } catch (error) {
    console.error("Could not load images.json:", error);
    image.alt = "No images found. Add image paths to images.json.";
  }
}

function cycleImage() {
  if (!state.images.length) return;

  let next = Math.floor(Math.random() * state.images.length);

  if (state.images.length > 1 && next === state.imageIndex) {
    next = (next + 1) % state.images.length;
  }

  state.imageIndex = next;

  image.classList.add("is-changing");
  image.src = state.images[next];

  requestAnimationFrame(() => {
    image.classList.remove("is-changing");
  });

  resetProgress();
}

function resetProgress() {
  const progress = $("session-progress");
  progress.style.transition = "none";
  progress.style.transform = "scaleX(0)";

  requestAnimationFrame(() => {
    progress.style.transition = `transform ${state.config.speed}ms linear`;
    progress.style.transform = "scaleX(1)";
  });
}

function runBeat() {
  if (!state.isEdge && $("metro-toggle").checked) {
    const click = state.audio.click;

    if (click) {
      click.currentTime = 0;
      click.volume = 0.25;
      click.play().catch(() => {});
    }

    $("beat-flash").style.opacity = "0.09";
    image.style.transform = "scale(1.012)";

    setTimeout(() => {
      $("beat-flash").style.opacity = "0";
      image.style.transform = "scale(1)";
    }, 65);
  }

  $("bpm-display").textContent = String(Math.floor(state.bpm)).padStart(3, "0");

  clearTimeout(state.timers.beat);
  state.timers.beat = setTimeout(runBeat, 60000 / Math.max(state.bpm, 1));
}

function startSession() {
  state.config.censored = $("censor-check").checked;
  state.config.pixel = Number($("pixel-slider").value);
  state.config.speed = Number($("speed-input").value);
  state.config.difficulty = $("difficulty-select").value;

  const diff = diffLevels[state.config.difficulty];
  state.bpm = diff.start;
  state.stage = 0;

  applyImageFilter();

  $("settings-page").classList.add("is-hidden");
  $("landing-page").classList.add("is-hidden");
  $("session").classList.remove("is-hidden");

  if ($("bg-toggle").checked) {
    state.audio.bg.loop = true;
    state.audio.bg.volume = 0.28;
    state.audio.bg.play().catch(() => {});
  }

  clearInterval(state.timers.image);
  clearInterval(state.timers.ramp);
  clearTimeout(state.timers.beat);

  fetchContent().then(() => {
    cycleImage();
    state.timers.image = setInterval(cycleImage, state.config.speed);
  });

  runBeat();

  state.timers.ramp = setInterval(() => {
    if (!state.isEdge) {
      state.bpm += diff.inc;
      state.stage = Math.floor((state.bpm - diff.start) / 15);
      $("stage-display").textContent = String(state.stage);
    }
  }, 10000);

  // Keep the interface visually quiet.
  viewer.classList.add("clean");
}

function toggleMusic() {
  const enabled = $("bg-toggle").checked;
  $("bg-toggle").checked = !enabled;

  if (!enabled) {
    state.audio.bg.loop = true;
    state.audio.bg.volume = 0.28;
    state.audio.bg.play().catch(() => {});
  } else {
    state.audio.bg.pause();
  }

  $("music-btn").classList.toggle("is-active", !enabled);
}

function toggleMetronome() {
  $("metro-toggle").checked = !$("metro-toggle").checked;
  $("metro-btn").classList.toggle("is-active", $("metro-toggle").checked);
}

function toggleFocus() {
  state.isEdge = !state.isEdge;
  $("edge-btn").classList.toggle("is-active", state.isEdge);

  if (state.isEdge) {
    image.style.filter = "grayscale(1) brightness(.62) blur(1px)";
  } else {
    applyImageFilter();
  }
}

function endSession() {
  clearInterval(state.timers.image);
  clearInterval(state.timers.ramp);
  clearTimeout(state.timers.beat);

  state.audio.bg.pause();
  state.audio.bg.currentTime = 0;

  state.isEdge = false;
  state.imageIndex = -1;

  $("session").classList.add("is-hidden");
  $("settings-page").classList.add("is-hidden");
  $("landing-page").classList.remove("is-hidden");
  $("stage-display").textContent = "0";
  $("bpm-display").textContent = "000";
  $("edge-btn").classList.remove("is-active");
}

$("start-session-btn").addEventListener("click", startSession);
$("settings-btn").addEventListener("click", showSettings);
$("music-btn").addEventListener("click", toggleMusic);
$("metro-btn").addEventListener("click", toggleMetronome);
$("edge-btn").addEventListener("click", toggleFocus);
$("end-btn").addEventListener("click", endSession);

$("pixel-slider").addEventListener("input", (event) => {
  $("pixel-value").textContent = event.target.value;
  state.config.pixel = Number(event.target.value);
  applyImageFilter();
});

$("censor-check").addEventListener("change", applyImageFilter);

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !$("session").classList.contains("is-hidden")) {
    event.preventDefault();
    cycleImage();
  }

  if (event.key.toLowerCase() === "f" && !$("session").classList.contains("is-hidden")) {
    toggleFocus();
  }

  if (event.key === "Escape" && !$("settings-page").classList.contains("is-hidden")) {
    showLanding();
  }
});
