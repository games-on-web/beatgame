const imageElement = document.getElementById("image");
const bpmElement = document.getElementById("bpm");
const clickSound = document.getElementById("click-sound");
const messageElement = document.createElement("div");
messageElement.id = "random-message";
document.body.appendChild(messageElement);

let images = [];
let currentBPM = 60;
let stage = 0;
let metronomeTimeout;
//
const bgAudio = new Audio("bg.mp3");
const messages = [
    "Aim on face!",
    "Aim on thighs!",
    "Put on sock!",
    "Put off sock!",
    "Only tip!",
    "Full strokes!",
    "Eat all left!",
    "Use toy.",
    "Aim on tummmy.",
    "No hands, only mind."
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

// Flash the BPM text on every beat
function flashText() {
    bpmElement.style.color = "red";
    setTimeout(() => {
        bpmElement.style.color = "white";
    }, 100);
}

// Play metronome sound
function playMetronome() {
    clickSound.volume = 0.2;
    clickSound.currentTime = 0;
    clickSound.play();
    const interval = 60000 / currentBPM;
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
    }

    bpmElement.textContent = `BPM: ${currentBPM}`;
    
    stage++;
    
    // If we reach the highest stage, keep it there
    if (stage > 5) {
        stage = 5;
    }
    
    setTimeout(increaseBPM, 25000); // Increase BPM every 15 seconds
}

// Initialize background music and loop it at 100% volume
function initBgMusic() {
    bgAudio.volume = 0.5;
    bgAudio.loop = true;
    bgAudio.play();
}

// Pause the metronome for 10 seconds every 30 seconds
function pauseMetronome() {
    clearTimeout(metronomeTimeout);
    setTimeout(playMetronome, 10000);
    setTimeout(pauseMetronome, 30000);
}

// Show a random message for 7 seconds every 30 seconds
function showRandomMessage() {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    messageElement.textContent = randomMessage;
    messageElement.style.display = "block";
    setTimeout(() => {
        messageElement.style.display = "none";
    }, 7000);
    setTimeout(showRandomMessage, 30000);
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
    showRandomMessage(); // Start showing random messages
}

// Security check - Hide overlay if code is correct
function checkCode() {
    const enteredCode = document.getElementById("security-code").value;
    const correctCode = "19699";

    if (enteredCode === correctCode) {
        document.getElementById("security-overlay").style.display = "none";
        init();
    } else {
        alert("Incorrect code! Try again.");
    }
}
