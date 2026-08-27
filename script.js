"use strict";


/* =========================================================
   STATE
========================================================= */

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
  },

  libraryLoaded: false

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
   DOM HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);


const landing = $("landing-page");
const settings = $("settings-page");
const session = $("session");

const viewer = $("viewer");
const image = $("main-image");

const enterButton = $("enter-session-btn");

const landingCount = $("landing-image-count");
const landingStatus = $("landing-image-status");

const sessionImageCount = $("image-count-display");


/* =========================================================
   LANDING / SETTINGS
========================================================= */

function showSettings() {

  landing.classList.add("is-hidden");

  settings.classList.remove("is-hidden");

}


function showLanding() {

  settings.classList.add("is-hidden");

  if (session.classList.contains("is-hidden")) {
    landing.classList.remove("is-hidden");
  }

}


/* =========================================================
   IMAGE COUNT
========================================================= */

function updateImageCount() {

  const count = state.images.length;

  landingCount.textContent =
    `${count} ${count === 1 ? "image" : "images"}`;

  sessionImageCount.textContent =
    String(count);

}


/* =========================================================
   LOAD IMAGE
========================================================= */

function preloadImage(src) {

  return new Promise((resolve) => {

    const img = new Image();

    img.onload = () => {
      resolve({
        src,
        ok: true
      });
    };

    img.onerror = () => {
      resolve({
        src,
        ok: false
      });
    };

    img.src = src;

  });

}


/* =========================================================
   LOAD IMAGE LIBRARY
========================================================= */

async function fetchContent() {

  landingStatus.textContent =
    "Loading image library…";

  landingCount.textContent =
    "Loading…";

  enterButton.disabled = true;

  try {

    /*
      IMPORTANT:

      images.json must be next to index.html.

      Example:

      /
      ├── index.html
      ├── style.css
      ├── script.js
      ├── images.json
      ├── click.mp3
      ├── bg.mp3
      └── images/
    */

    const response = await fetch(
      "./images.json",
      {
        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        `Could not load images.json (${response.status})`
      );

    }


    const data =
      await response.json();


    if (!data || !Array.isArray(data.images)) {

      throw new Error(
        "images.json must contain an 'images' array."
      );

    }


    /*
      Clean the list.
    */

    const paths = data.images
      .map((src) => String(src).trim())
      .filter(Boolean);


    if (!paths.length) {

      throw new Error(
        "images.json contains zero images."
      );

    }


    /*
      Remove duplicate paths.
    */

    const uniquePaths =
      [...new Set(paths)];


    /*
      Preload everything.

      Broken files are removed instead of making
      the session randomly show broken images.
    */

    const results =
      await Promise.all(
        uniquePaths.map(preloadImage)
      );


    state.images =
      results
        .filter(result => result.ok)
        .map(result => result.src);


    if (!state.images.length) {

      throw new Error(
        "No valid images could be loaded."
      );

    }


    state.libraryLoaded = true;


    updateImageCount();

    buildPreviewRails();


    landingStatus.textContent =
      "Image library ready";

    enterButton.disabled = false;

    enterButton.innerHTML = `
      <span>Enter session</span>
      <span class="btn-arrow">→</span>
    `;


    console.log(
      `Loaded ${state.images.length} images.`
    );


  } catch (error) {

    console.error(
      "IMAGE LIBRARY ERROR:",
      error
    );


    state.images = [];

    state.libraryLoaded = false;


    landingCount.textContent =
      "0 images";


    landingStatus.textContent =
      "Could not load image library";


    enterButton.disabled = true;

    enterButton.innerHTML = `
      <span>Image library unavailable</span>
    `;

  }

}


/* =========================================================
   PREVIEW RAILS
========================================================= */

function createPreviewImage(src) {

  const img =
    document.createElement("img");


  img.className =
    "preview-image";


  img.src =
    src;


  img.alt =
    "";


  img.loading =
    "eager";


  img.draggable =
    false;


  /*
    If a preview image somehow fails after loading,
    remove it rather than leaving a broken image icon.
  */

  img.addEventListener(
    "error",
    () => {
      img.remove();
    },
    {
      once: true
    }
  );


  return img;

}


function buildPreviewRails() {

  const left =
    $("preview-left-track");

  const right =
    $("preview-right-track");


  left.innerHTML = "";

  right.innerHTML = "";


  if (!state.images.length) {
    return;
  }


  /*
    We need enough images to create a seamless
    scrolling wall.

    Repeat the library several times.
  */

  const repeated = [];


  const repeatCount =
    Math.max(
      4,
      Math.ceil(
        20 / state.images.length
      )
    );


  for (
    let r = 0;
    r < repeatCount;
    r++
  ) {

    for (
      let i = 0;
      i < state.images.length;
      i++
    ) {

      repeated.push(
        state.images[i]
      );

    }

  }


  /*
    Left side
  */

  repeated.forEach((src) => {

    left.appendChild(
      createPreviewImage(src)
    );

  });


  /*
    Right side uses reversed images
    so the two sides don't look identical.
  */

  [...repeated]
    .reverse()
    .forEach((src) => {

      right.appendChild(
        createPreviewImage(src)
      );

    });


  /*
    Duplicate the entire set once.

    This makes the CSS animation loop smoothly.
  */

  const leftClone =
    left.innerHTML;

  const rightClone =
    right.innerHTML;


  left.insertAdjacentHTML(
    "beforeend",
    leftClone
  );


  right.insertAdjacentHTML(
    "beforeend",
    rightClone
  );

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

    image.style.filter =
      "none";

  }

}


/* =========================================================
   CHANGE MAIN IMAGE
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


  /*
    Don't immediately show the same image.
  */

  if (
    state.images.length > 1 &&
    next === state.imageIndex
  ) {

    next =
      (next + 1) %
      state.images.length;

  }


  state.imageIndex =
    next;


  const nextSrc =
    state.images[next];


  /*
    Fade while image changes.
  */

  image.classList.add(
    "image-loading"
  );


  /*
    Create a new Image first.

    This prevents the visible image from
    suddenly changing size while loading.
  */

  const loader =
    new Image();


  loader.onload = () => {

    image.src =
      nextSrc;

    image.classList.remove(
      "image-loading"
    );

    image.classList.remove(
      "image-error"
    );

  };


  loader.onerror = () => {

    console.warn(
      "Failed to display image:",
      nextSrc
    );

    image.classList.remove(
      "image-loading"
    );

    image.classList.add(
      "image-error"
    );

  };


  loader.src =
    nextSrc;


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

  const metro =
    $("metro-toggle");


  if (
    !state.isEdge &&
    metro.checked
  ) {

    const click =
      state.audio.click;


    if (click) {

      click.currentTime = 0;

      click.volume = .25;

      click
        .play()
        .catch(() => {});

    }


    $("beat-flash").style.opacity =
      ".09";


    /*
      IMPORTANT:

      We DO NOT scale the image anymore.

      Scaling the image was causing the image
      to exceed the safe viewport.

      Instead we briefly brighten it.
    */

    image.style.filter =
      state.isEdge
        ? "grayscale(1) brightness(.62) blur(1px)"
        : state.config.censored
          ? `blur(${state.config.pixel}px) brightness(1.06)`
          : "brightness(1.06)";


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
      Math.max(
        state.bpm,
        1
      )
    );

}


/* =========================================================
   START SESSION
========================================================= */

function startSession() {

  if (
    !state.libraryLoaded ||
    !state.images.length
  ) {

    console.warn(
      "Cannot start session: image library is unavailable."
    );

    return;

  }


  /*
    Save settings.
  */

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


  state.stage =
    0;


  state.isEdge =
    false;


  state.imageIndex =
    -1;


  $("stage-display").textContent =
    "0";


  applyImageFilter();


  /*
    Switch screens.
  */

  settings.classList.add(
    "is-hidden"
  );

  landing.classList.add(
    "is-hidden"
  );

  session.classList.remove(
    "is-hidden"
  );


  /*
    Music.
  */

  if (
    $("bg-toggle").checked
  ) {

    state.audio.bg.loop =
      true;

    state.audio.bg.volume =
      .28;

    state.audio.bg
      .play()
      .catch(() => {});

  }


  /*
    Clear old timers.
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
    Start first image.
  */

  cycleImage();


  /*
    Automatically cycle images.
  */

  state.timers.image =
    setInterval(
      cycleImage,
      state.config.speed
    );


  /*
    Start metronome.
  */

  runBeat();


  /*
    Ramp difficulty.
  */

  state.timers.ramp =
    setInterval(() => {

      if (!state.isEdge) {

        state.bpm +=
          diff.inc;


        state.stage =
          Math.floor(
            (
              state.bpm -
              diff.start
            ) / 15
          );


        $("stage-display").textContent =
          String(state.stage);

      }

    }, 10000);


  viewer.classList.add(
    "clean"
  );

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

    state.audio.bg.loop =
      true;

    state.audio.bg.volume =
      .28;

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


  state.timers.image =
    null;

  state.timers.ramp =
    null;

  state.timers.beat =
    null;


  state.audio.bg.pause();

  state.audio.bg.currentTime =
    0;


  state.isEdge =
    false;


  state.imageIndex =
    -1;


  session.classList.add(
    "is-hidden"
  );


  settings.classList.add(
    "is-hidden"
  );


  landing.classList.remove(
    "is-hidden"
  );


  $("stage-display").textContent =
    "0";


  $("bpm-display").textContent =
    "000";


  $("edge-btn")
    .classList
    .remove("is-active");


  applyImageFilter();

}


/* =========================================================
   EVENTS
========================================================= */

$("enter-session-btn")
  .addEventListener(
    "click",
    showSettings
  );


$("close-settings-btn")
  .addEventListener(
    "click",
    showLanding
  );


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


$("pixel-slider")
  .addEventListener(
    "input",
    (event) => {

      $("pixel-value").textContent =
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
      !session.classList.contains(
        "is-hidden"
      )
    ) {

      event.preventDefault();

      cycleImage();

    }


    if (
      event.key.toLowerCase() === "f" &&
      !session.classList.contains(
        "is-hidden"
      )
    ) {

      toggleFocus();

    }


    if (
      event.key === "Escape" &&
      !settings.classList.contains(
        "is-hidden"
      )
    ) {

      showLanding();

    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    fetchContent();

  }
);
