const imageElement = document.getElementById("image");
const bpmElement = document.getElementById("bpm");
const clickSound = document.getElementById("click-sound");

let images = [];
let currentBPM = 60; // Starting BPM
let stage = 0; // Track metronome stage
let metronomeTimeout; // Variable to store the metronome timeout

// Background music file
const bgAudio = new Audio("bg.mp3"); // Use a single background music file

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

// Flash the BPM text on every beat
function flashText() {
    bpmElement.style.color = "red"; // Flash the text color
    setTimeout(() => {
        bpmElement.style.color = "white"; // Revert back to white after 100ms
    }, 100);
}

// Play metronome sound
function playMetronome() {
    clickSound.currentTime = 0;
    clickSound.play();
    const interval = 60000 / currentBPM;
    
    // Stop the previous timeout before starting a new one
    clearTimeout(metronomeTimeout);
    
    // Set the next timeout for the metronome
    metronomeTimeout = setTimeout(playMetronome, interval);
}

// Function to increase BPM and make the metronome more challenging
function increaseBPM() {
    if (stage === 0) {
        currentBPM = 60 + Math.floor(Math.random() * 40); // Random BPM between 60-100
    } else if (stage === 1) {
        currentBPM = 100 + Math.floor(Math.random() * 50); // Random BPM between 100-150
    } else if (stage === 2) {
        currentBPM = 150 + Math.floor(Math.random() * 100); // Random BPM between 150-250
    } else {
        currentBPM = 200 + Math.floor(Math.random() * 100); // Random BPM between 200-300
    }
    bpmElement.textContent = `BPM: ${currentBPM}`;

    stage++;
    if (stage > 3) {
        stage = 3; // Keep it at the hardest stage
    }

    setTimeout(increaseBPM, 15000); // Increase BPM every 15 seconds
}

// Initialize background music and loop it at 100% volume
function initBgMusic() {
    bgAudio.volume = 1.0; // Set volume to 100% (full volume)
    bgAudio.loop = true; // Loop the music indefinitely
    bgAudio.play();
}

// Pause the metronome for 10 seconds every 30 seconds
function pauseMetronome() {
    // Stop the metronome for 10 seconds
    clearTimeout(metronomeTimeout);
    
    // After 10 seconds, resume the metronome
    setTimeout(playMetronome, 10000);
    
    // Call this function every 30 seconds to create the pause
    setTimeout(pauseMetronome, 30000);
}

// Initialize everything
async function init() {
    await fetchImageList();
    changeImage();
    setInterval(changeImage, 6000); // Change image every 6 seconds
    increaseBPM();
    playMetronome();
    initBgMusic(); // Start the background music quietly and looped
    pauseMetronome(); // Start the metronome pause functionality
}

// Security check - Hide overlay if code is correct
function checkCode() {
    const enteredCode = document.getElementById("security-code").value;
    const correctCode = "19699";

    if (enteredCode === correctCode) {
        document.getElementById("security-overlay").style.display = "none"; // Hide the overlay
        init(); // Start the app
    } else {
        alert("Incorrect code! Try again."); // Optional, alert on wrong code
    }
}
