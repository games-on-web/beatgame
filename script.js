const imageElement = document.getElementById("image");
const bpmElement = document.getElementById("bpm");
const clickSound = document.getElementById("click-sound");

let images = [];
let currentBPM = 200;

// Function to fetch all images in the "images" folder
async function fetchImages() {
  const response = await fetch('./images/');
  const text = await response.text();
  const parser = new DOMParser();
  const html = parser.parseFromString(text, 'text/html');
  const anchors = html.querySelectorAll('a');

  images = Array.from(anchors)
    .map(a => a.href)
    .filter(href => href.match(/\.(jpg|jpeg|png|gif|webp)$/i)); // Include WebP images
}

// Function to change the displayed image
function changeImage() {
  if (images.length > 0) {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    imageElement.src = randomImage;
  }
}

// Function to play the click sound at the current BPM
function playMetronome() {
  clickSound.currentTime = 0;
  clickSound.play();

  const interval = 60000 / currentBPM; // Calculate interval in ms
  setTimeout(playMetronome, interval);
}

// Function to change BPM randomly every 15 seconds
function changeBPM() {
  currentBPM = Math.floor(Math.random() * (300 - 100 + 1)) + 100; // Random BPM between 100-300
  bpmElement.textContent = `BPM: ${currentBPM}`;
  setTimeout(changeBPM, 15000);
}

// Initialize everything
async function init() {
  await fetchImages();
  changeImage();
  setInterval(changeImage, 6000); // Change image every 6 seconds
  changeBPM();
  playMetronome();
}

init();
