const imageElement = document.getElementById("image");
const clickSound = document.getElementById("click-sound");
const messageElement = document.getElementById("random-message");
const aimTextElement = document.getElementById("aim-text");
const withTextElement = document.getElementById("with-text");

let images = [];
let currentBPM = 60;
let stage = 0;
let metronomeTimeout;
const bgAudio = new Audio("bg.mp3");

const messages = [
    "Eat all left!",
    "Spit on it!",
    "Toggle sock!",
    "Aim on face!",
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

    // Vibrate the phone on each beat (100ms vibration)
    if ("vibrate" in navigator) {
        navigator.vibrate(150); // Vibrate for 100 milliseconds
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
        stage = 4;
    }
    
    setTimeout(increaseBPM, 25000); // Increase BPM every 25s
}

// Initialize background music
function initBgMusic() {
    bgAudio.volume = 0.5;
    bgAudio.loop = true;
    bgAudio.play();
}

// Pause the metronome for 15 seconds every 50 seconds + show message
function pauseMetronome() {
    clearTimeout(metronomeTimeout);
    updateAimAndWith();
    showRandomMessage();
    setTimeout(playMetronome, 15000); // Resume the metronome after 15 seconds
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

// Update the "Aim" and "With" texts
function updateAimAndWith() {
    const randomAim = aimList[Math.floor(Math.random() * aimList.length)];
    const randomWith = withList[Math.floor(Math.random() * withList.length)];

    aimTextElement.textContent = `Aim: ${randomAim}`;
    withTextElement.textContent = `With: ${randomWith}`;
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
