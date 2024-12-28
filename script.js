const imageElement = document.getElementById("image");
const bpmElement = document.getElementById("bpm");
const clickSound = document.getElementById("click-sound");

let images = [];
let currentBPM = 200;

// Fetch the image list from images.json
async function fetchImageList() {
  const response = await fetch('./images.json');
  const data = await response.json();
  images = data.images; // Use the image URLs from the JSON file
}

// Change the displayed image
function changeImage() {
  if (images.length > 0) {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    imageElement.src = randomImage;
  }
}

// Play metronome sound
function playMetronome() {
  clickSound.currentTime = 0;
  clickSound.play();
  const interval = 60000 / currentBPM;
  setTimeout(playMetronome, interval);
}

// Change BPM randomly every 15 seconds
function changeBPM() {
  currentBPM = Math.floor(Math.random() * (300 - 100 + 1)) + 100; // Random BPM between 100-300
  bpmElement.textContent = `BPM: ${currentBPM}`;
  setTimeout(changeBPM, 15000);
}

// Initialize everything
async function init() {
  await fetchImageList();
  changeImage();
  setInterval(changeImage, 6000); // Change image every 6 seconds
  changeBPM();
  playMetronome();
}

init();
