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


/* =========================================================
   DIFFICULTY
   ========================================================= */

const diffLevels = {
  easy: {
    start: 50,
    inc: 1
  },

  medium: {
    start: 70,
    inc: 2
  },

  hard: {
    start: 100,
    inc: 4
  },

  extreme: {
    start: 140,
    inc: 7
  }
};


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const viewer = $("viewer");
const image = $("main-image");


/* =========================================================
   WELCOME
   ========================================================= */

async function loadWelcomeImages() {
  try {
    const response = await fetch("./images.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const images = Array.isArray(data.images)
      ? data.images.filter(Boolean)
      : [];

    state.images = images;

    $("welcome-image-count").textContent =
      String(images.length).padStart(2, "0");

    createFloatingImages(images);

  } catch (error) {

    console.error(
      "Could not load welcome images:",
      error
    );

    $("welcome-image-count").textContent = "—";
  }
}


/* =========================================================
   FLOATING IMAGE BACKGROUND
   ========================================================= */

function createFloatingImages(images) {

  const container = $("floating-images");

  if (!container) return;

  container.innerHTML = "";

  if (!images.length) return;

  /*
    Pick up to 9 images.

    We shuffle the array first so the background isn't
    always showing the same first images.
  */

  const shuffled = [...images]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(9, images.length));


  shuffled.forEach((src, index) => {

    const img = document.createElement("img");

    img.className = "floating-image";

    img.src = src;

    img.alt = "";

    img.setAttribute(
      "aria-hidden",
      "true"
    );

    /*
      Random-ish positions.

      The CSS animation handles the actual movement.
    */

    const positions = [
      [4, 12, -8],
      [22, 68, 6],
      [42, 8, 4],
      [65, 20, -5],
      [82, 65, 7],
      [8, 78, 5],
      [35, 80, -7],
      [58, 65, 4],
      [88, 12, -6]
    ];

    const position =
      positions[index % positions.length];

    img.style.left = `${position[0]}%`;
    img.style.top = `${position[1]}%`;
    img.style.transform =
      `rotate(${position[2]}deg)`;

    /*
      Different animation timing makes them feel
      independent rather than synchronized.
    */

    img.style.animationDuration =
      `${16 + (index * 1.8)}s`;

    img.style.animationDelay =
      `${-(index * 2.1)}s`;

    container.appendChild(img);
  });
}


/* =========================================================
   CHANGELOG
   ========================================================= */

function toggleChangelog() {

  const panel = $("changelog-panel");

  if (!panel) return;

  panel.classList.toggle("is-open");
}


function closeChangelog() {

  const panel = $("changelog-panel");

  if (!panel) return;

  panel.classList.remove("is-open");
}


$("changelog-btn").addEventListener(
  "click",
  toggleChangelog
);

$("changelog-close").addEventListener(
  "click",
  closeChangelog
);


/* =========================================================
   NAVIGATION
   ========================================================= */

function showSettings() {

  closeChangelog();

  $("landing-page")
    .classList
    .add("is-hidden");

  $("settings-page")
    .classList
    .remove("is-hidden");
}


function showLanding() {

  $("settings-page")
    .classList
    .add("is-hidden");

  $("landing-page")
    .classList
    .remove("is-hidden");

  createFloatingImages(state.images);
}


/* =========================================================
   IMAGE FILTER
   ========================================================= */

function applyImageFilter() {

  if (state.isEdge) {

    image.style.filter =
      "grayscale(1) brightness(.62) blur(1px)";

    return;
  }

  if (state.config.censored) {

    image.style.filter =
      `blur(${state.config.pixel}px)`;

  } else {

    image.style.filter = "none";
  }
}


/* =========================================================
   FETCH CONTENT
   ========================================================= */

async function fetchContent() {

  try {

    const response = await fetch(
      "./images.json",
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data = await response.json();

    state.images =
      Array.isArray(data.images)
        ? data.images.filter(Boolean)
        : [];

    if (!state.images.length) {
      throw new Error(
        "images.json contains no images"
      );
    }

  } catch (error) {

    console.error(
      "Could not load images.json:",
      error
    );

    image.alt =
      "No images found. Add image paths to images.json.";
  }
}


/* =========================================================
   CYCLE IMAGE
   ========================================================= */

function cycleImage() {

  if (!state.images.length) {
    return;
  }

  let next =
    Math.floor(
      Math.random() *
      state.images.length
    );

  if (
    state.images.length > 1 &&
    next === state.imageIndex
  ) {

    next =
      (next + 1) %
      state.images.length;
  }

  state.imageIndex = next;


  /*
    Fade the image slightly during change.
  */

  image.style.opacity = "0";


  setTimeout(() => {

    image.src =
      state.images[next];

    /*
      Wait for image dimensions to be available.

      This makes the browser calculate the correct
      natural aspect ratio before displaying it.
    */

    if (image.complete) {

      image.style.opacity = "1";

    } else {

      image.onload = () => {
        image.style.opacity = "1";
      };
    }

  }, 100);


  resetProgress();
}


/* =========================================================
   PROGRESS
   ========================================================= */

function resetProgress() {

  const progress =
    $("session-progress");

  progress.style.transition =
    "none";

  progress.style.transform =
    "scaleX(0)";


  requestAnimationFrame(() => {

    progress.style.transition =
      `transform ${state.config.speed}ms linear`;

    progress.style.transform =
      "scaleX(1)";
  });
}


/* =========================================================
   BEAT
   ========================================================= */

function runBeat() {

  if (
    !state.isEdge &&
    $("metro-toggle").checked
  ) {

    const click =
      state.audio.click;

    if (click) {

      click.currentTime = 0;

      click.volume = .25;

      click.play().catch(() => {});
    }


    $("beat-flash").style.opacity =
      ".09";


    /*
      IMPORTANT FIX:

      The old code used transform:scale()
      on the actual image.

      That could make the image visually exceed
      the containment area.

      Instead, we use a tiny filter brightness pulse.
    */

    image.style.filter =
      getBeatFilter();


    setTimeout(() => {

      $("beat-flash").style.opacity =
        "0";

      applyImageFilter();

    }, 65);
  }


  $("bpm-display").textContent =
    String(
      Math.floor(state.bpm)
    ).padStart(3, "0");


  clearTimeout(
    state.timers.beat
  );


  state.timers.beat =
    setTimeout(
      runBeat,
      60000 /
      Math.max(state.bpm, 1)
    );
}


/* =========================================================
   BEAT FILTER
   ========================================================= */

function getBeatFilter() {

  if (state.isEdge) {

    return (
      "grayscale(1) " +
      "brightness(.68) " +
      "blur(1px)"
    );
  }

  if (state.config.censored) {

    return (
      `blur(${state.config.pixel}px) ` +
      "brightness(1.08)"
    );
  }

  return "brightness(1.08)";
}


/* =========================================================
   START SESSION
   ========================================================= */

function startSession() {

  state.config.censored =
    $("censor-check").checked;

  state.config.pixel =
    Number(
      $("pixel-slider").value
    );

  state.config.speed =
    Number(
      $("speed-input").value
    );

  state.config.difficulty =
    $("difficulty-select").value;


  const diff =
    diffLevels[
      state.config.difficulty
    ];


  state.bpm =
    diff.start;

  state.stage = 0;

  state.isEdge = false;


  applyImageFilter();


  $("settings-page")
    .classList
    .add("is-hidden");

  $("landing-page")
    .classList
    .add("is-hidden");

  $("session")
    .classList
    .remove("is-hidden");


  /*
    Music
  */

  if ($("bg-toggle").checked) {

    state.audio.bg.loop = true;

    state.audio.bg.volume = .28;

    state.audio.bg
      .play()
      .catch(() => {});
  }


  /*
    Clear previous timers.
  */

  clearInterval(
    state.timers.image
  );

  clearInterval(
    state.timers.ramp
  );

  clearTimeout(
    state.timers.beat
  );


  /*
    Load images then start.
  */

  fetchContent().then(() => {

    cycleImage();

    state.timers.image =
      setInterval(
        cycleImage,
        state.config.speed
      );

  });


  /*
    Beat
  */

  runBeat();


  /*
    Difficulty ramp
  */

  state.timers.ramp =
    setInterval(() => {

      if (!state.isEdge) {

        state.bpm += diff.inc;

        state.stage =
          Math.floor(
            (state.bpm - diff.start) /
            15
          );

        $("stage-display")
          .textContent =
          String(state.stage);
      }

    }, 10000);


  viewer.classList.add("clean");
}


/* =========================================================
   MUSIC
   ========================================================= */

function toggleMusic() {

  const enabled =
    $("bg-toggle").checked;

  $("bg-toggle").checked =
    !enabled;


  if (!enabled) {

    state.audio.bg.loop = true;

    state.audio.bg.volume = .28;

    state.audio.bg
      .play()
      .catch(() => {});

  } else {

    state.audio.bg.pause();
  }


  $("music-btn")
    .classList
    .toggle(
      "is-active",
      !enabled
    );
}


/* =========================================================
   METRONOME
   ========================================================= */

function toggleMetronome() {

  $("metro-toggle").checked =
    !$("metro-toggle").checked;


  $("metro-btn")
    .classList
    .toggle(
      "is-active",
      $("metro-toggle").checked
    );
}


/* =========================================================
   FOCUS
   ========================================================= */

function toggleFocus() {

  state.isEdge =
    !state.isEdge;


  $("edge-btn")
    .classList
    .toggle(
      "is-active",
      state.isEdge
    );


  applyImageFilter();
}


/* =========================================================
   END SESSION
   ========================================================= */

function endSession() {

  clearInterval(
    state.timers.image
  );

  clearInterval(
    state.timers.ramp
  );

  clearTimeout(
    state.timers.beat
  );


  state.audio.bg.pause();

  state.audio.bg.currentTime = 0;


  state.isEdge = false;

  state.imageIndex = -1;


  image.style.filter = "none";

  image.style.opacity = "1";


  $("session")
    .classList
    .add("is-hidden");


  $("settings-page")
    .classList
    .add("is-hidden");


  $("landing-page")
    .classList
    .remove("is-hidden");


  $("stage-display")
    .textContent = "0";


  $("bpm-display")
    .textContent = "000";


  $("edge-btn")
    .classList
    .remove("is-active");


  createFloatingImages(
    state.images
  );
}


/* =========================================================
   SETTINGS EVENTS
   ========================================================= */

$("start-session-btn")
  .addEventListener(
    "click",
    startSession
  );


$("settings-btn")
  .addEventListener(
    "click",
    showSettings
  );


$("music-btn")
  .addEventListener(
    "click",
    toggleMusic
  );


$("metro-btn")
  .addEventListener(
    "click",
    toggleMetronome
  );


$("edge-btn")
  .addEventListener(
    "click",
    toggleFocus
  );


$("end-btn")
  .addEventListener(
    "click",
    endSession
  );


/* =========================================================
   BLUR SLIDER
   ========================================================= */

$("pixel-slider")
  .addEventListener(
    "input",
    (event) => {

      $("pixel-value")
        .textContent =
        event.target.value;

      state.config.pixel =
        Number(
          event.target.value
        );

      applyImageFilter();
    }
  );


$("censor-check")
  .addEventListener(
    "change",
    applyImageFilter
  );


/* =========================================================
   KEYBOARD
   ========================================================= */

window.addEventListener(
  "keydown",
  (event) => {

    if (
      event.code === "Space" &&
      !$("session")
        .classList
        .contains("is-hidden")
    ) {

      event.preventDefault();

      cycleImage();
    }


    if (
      event.key.toLowerCase() === "f" &&
      !$("session")
        .classList
        .contains("is-hidden")
    ) {

      toggleFocus();
    }


    if (
      event.key === "Escape" &&
      !$("settings-page")
        .classList
        .contains("is-hidden")
    ) {

      showLanding();
    }

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

loadWelcomeImages();
