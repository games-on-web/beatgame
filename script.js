const imageElement = document.getElementById("image");
const clickSound = document.getElementById("click-sound");
const messageElement = document.getElementById("random-message");
const aimTextElement = document.getElementById("aim-text");
const withTextElement = document.getElementById("with-text");

aimTextElement.style.display = "none";
withTextElement.style.display = "none";

let images = [];
let currentBPM = 60;
let stage = 0;
let metronomeTimeout;
const bgAudio = new Audio("bg.mp3");

const messages = [
    "Eat all left!",
    "Spit on it!"
];

// Fetch the image list from images.json 
async function fetchImageList() {
    const response = await fetch('./images.json');
    const data = await response.json();
    images = data.images;
}

// Change the displayed image
function changeImage() {
    if (images.length > 0) {
        const randomImage = images[Math.floor(Math.random() * images.length)];
        imageElement.src = randomImage;
    }
}

// Play metronome sound and vibrate on each beat
function playMetronome() {
    // Play the metronome sound
    clickSound.volume = 0.1;
    clickSound.currentTime = 0;
    clickSound.play();

    // Check if the vibrate checkbox is checked
    if (document.getElementById("vibrate-checkbox").checked) {
        setTimeout(() => {
            if ("vibrate" in navigator) {
                navigator.vibrate(300); // Vibrate for 300 milliseconds
            }
        }, 200); // Small delay for best sound alignment
    }

    // Set the interval based on the current BPM
    const interval = 60000 / currentBPM;
    
    // Clear previous timeout and set the next beat
    clearTimeout(metronomeTimeout);
    metronomeTimeout = setTimeout(playMetronome, interval);
}

// Function to increase BPM and make the metronome more challenging
function increaseBPM() {
    if (stage === 0) {
        currentBPM = 20 + Math.floor(Math.random() * 40); // Stage 0: 20 to 60 BPM
    } else if (stage === 1) {
        currentBPM = 60 + Math.floor(Math.random() * 40); // Stage 1: 60 to 100 BPM
    } else if (stage === 2) {
        currentBPM = 100 + Math.floor(Math.random() * 50); // Stage 2: 100 to 150 BPM
    } else if (stage === 3) {
        currentBPM = 150 + Math.floor(Math.random() * 60); // Stage 3: 150 to 210 BPM
    } else if (stage === 4) {
        currentBPM = 210 + Math.floor(Math.random() * 70); // Stage 4: 210 to 280 BPM
    } else if (stage === 5) {
        currentBPM = 280 + Math.floor(Math.random() * 70); // Stage 5: 280 to 350 BPM
    } else if (stage === 6) {
        currentBPM = 350 + Math.floor(Math.random() * 80); // Stage 6: TURBO
    }
    
    stage++;
    
    // If we reach the highest stage, go to mid stage
    if (stage > 6) {
        stage = 3;
    }
    
    setTimeout(increaseBPM, 25000); // Increase BPM every 25s
}

// Initialize background music
function initBgMusic() {
    // Check if the background music checkbox is checked
    if (document.getElementById("background-checkbox").checked) {
        bgAudio.volume = 0.5;
        bgAudio.loop = true;
        bgAudio.play();
    } else {
        bgAudio.pause(); // Pause background music if not checked
    }
}

// Pause the metronome for 15 seconds every 50 seconds + show message
function pauseMetronome() {
    clearTimeout(metronomeTimeout);
    showRandomMessage();
    setTimeout(playMetronome, 20000); // Resume the metronome after 15 seconds
    setTimeout(pauseMetronome, 50000); // Pause the metronome again after 50 seconds
}

// Show a random message for a longer duration with wait
function showRandomMessage() {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    messageElement.textContent = randomMessage;
    messageElement.style.display = "block";

    const messageDuration = 8000;  // Message will be shown for 8 seconds

    setTimeout(() => {
        messageElement.style.display = "none"; // Hide the message
    }, messageDuration);
}

// Initialize everything
async function init() {
    await fetchImageList();
    changeImage();
    setInterval(changeImage, 8000);
    increaseBPM();
    playMetronome();
    initBgMusic();
    pauseMetronome();
}

// Code validation function for security
function checkCode() {
    const enteredCode = document.getElementById("security-code").value;
    const correctCode = " 19699";  // Example code for checking.

    if (enteredCode === correctCode) {
        document.getElementById("security-overlay").style.display = "none";
        init();  // Call the init() function to start the game
    } else {
        alert("Incorrect code! Try again.");
    }
}

// Add event listeners to checkboxes to start/stop background music and vibration
document.getElementById("background-checkbox").addEventListener('change', initBgMusic);
document.getElementById("vibrate-checkbox").addEventListener('change', playMetronome);
