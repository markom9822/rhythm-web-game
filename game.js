// document elements
const laneContainer = document.getElementById('laneContainer');
const playerContainer = document.getElementById('playerContainer');
const scoreDisplay = document.getElementById('score');
const leftArrowImage = document.getElementById("leftArrow");
const rightArrowImage = document.getElementById("rightArrow");
const drummerImage =  document.getElementById("drummer");
const infoText = document.getElementById("infoText");
const healthContainer = document.getElementById('healthContainer');
healthContainer.innerHTML = ""; 
const gameOverMenu = document.getElementById("gameOverMenuBackground");

// constant variables
const MAX_NOTE_SPAWN_DELAY = 1000;
const MIN_NOTE_SPAWN_DELAY = 500;
const HIT_INFO_TIMEOUT = 500;

const MAX_NOTE_FALL_SPEED = 10;
const MIN_NOTE_FALL_SPEED = 2;

const MAX_HEALTH = 5;
const HEALTH_DECREMENT = 0.5;
const SPEED_SCORE_THRESHOLD = 10;
const HIT_TEXT_COLOUR = "#48f542";
const MISS_TEXT_COLOUR = "#f54542";

// audio
const drumSound = new Audio('./sounds/drum_sound_8bit.wav');
drumSound.volume = 0.6;
const hurtSound = new Audio('./sounds/man_hurt_8bit.wav');
hurtSound.volume = 0.8;
const gameOverSound = new Audio('./sounds/kabuki_yoooo_8bit.wav');
gameOverSound.volume = 0.8;
const bkgMusic = new Audio('./sounds/japanese_bkg_music_8bit.wav');
bkgMusic.volume = 0.1;
bkgMusic.loop = true;

let health = MAX_HEALTH;
const hitZoneY = 500 - 50; // position of hit zone from top
let highScore = 0;
let score = 0;
let infoTimeoutId = null;
let gameRunning = false;
let notes = [];

window.addEventListener("DOMContentLoaded", () => {

    gameOverMenu.style.display = "none";

    const startMenu = document.getElementById("startMenuBackground");
    const startButton = document.getElementById("startButton");

    const restartButton = document.getElementById("restartButton");

    restartButton.addEventListener("click", () => {
        // Hide menu
        gameOverMenu.style.display = "none";
        handleResetGameState();
        gameRunning = true;
        gameLoop();
        scheduleNextNote();

        bkgMusic.pause()
        bkgMusic.currentTime = 0;
    });

    startButton.addEventListener("click", () => {
        // Hide menu
        startMenu.style.display = "none";
        gameRunning = true;
        gameLoop();
        scheduleNextNote();
    });
});

function handleGameOver() {

    gameOverMenu.style.display = "flex";
    const highscoreText = document.getElementById("highscore");
   
    highScore = score > highScore ? score : highScore;
    highscoreText.textContent = 'Highscore: ' + highScore;

    gameOverSound.currentTime = 0;
    gameOverSound.play();

    bkgMusic.currentTime = 0;
    bkgMusic.play();
}

function handleResetGameState() {
    health = MAX_HEALTH;
    score = 0;
    notes.forEach(note => note.element.remove());
    notes = [];
    updateHealthVisuals();
    scoreDisplay.textContent = 'Score: ' + score;
    infoText.textContent = "";

    leftArrowImage.src = "./images/Left_arrow_unpressed.png"; 
    rightArrowImage.src = "./images/Right_arrow_unpressed.png";
    drummerImage.src = "./images/Japanese_drummer_idle.png";
}

function spawnNote(lane) {

    const noteImg = document.createElement('img');
    noteImg.width = 90;
    noteImg.height = 30;
    noteImg.className = 'note';
    noteImg.src = './images/drum_bar.png';

    noteImg.style.left = lane === 'left' ? '0%' : '50%';
    noteImg.style.top = '-30px';

    laneContainer.appendChild(noteImg);
    notes.push({ element: noteImg, lane, y: -30 });
}

function gameLoop() {

    if(!gameRunning) return;

    for (let i = notes.length - 1; i >= 0; i--) {

        let note = notes[i];
        note.y += getFallingSpeed(score); // falling speed
        note.element.style.top = note.y + 'px';

        if (note.y > 500) {
            // missed completely
            showInfo("MISS", MISS_TEXT_COLOUR);

            updateScore();
            decreaseHealth();
            updateHealthVisuals();
            
            note.element.remove();
            notes.splice(i, 1);
        }
    }

    // need to check for game over
    if(health == 0)
    {
        // game over
        gameRunning = false;
        notes.forEach((note) => {note.element.remove()})
        handleGameOver();
    }

    requestAnimationFrame(gameLoop);
}

function updateHealthVisuals() {

    healthContainer.innerHTML = '';

    for (let i = 0; i < MAX_HEALTH; i++)
    {
        const heartImg = document.createElement('img');
        heartImg.width = 50;
        heartImg.height = 50;
        heartImg.className = 'heart';

        if (health - i > HEALTH_DECREMENT) {
            heartImg.src = './images/Full_heart.png';
        }
        else if (health - i == HEALTH_DECREMENT){
            heartImg.src = './images/Half_heart.png';
        }
         else {
            heartImg.src = './images/Empty_heart.png';
        }

        healthContainer.appendChild(heartImg);
    }
}

function getFallingSpeed(score) {

    return Math.min(MIN_NOTE_FALL_SPEED + Math.floor(score / SPEED_SCORE_THRESHOLD) * 0.5, MAX_NOTE_FALL_SPEED)
}

function decreaseHealth() {

    if(health > 0)
    {
        hurtSound.currentTime = 0;
        hurtSound.play();
        health -= HEALTH_DECREMENT;
        triggerShake(healthContainer);
    }
}

function updateScore() {

    if(!gameRunning) return;

    scoreDisplay.textContent = 'Score: ' + score;
}

function showInfo(text, colour) {

    if(!gameRunning) return;

    if(infoTimeoutId)
    {
        clearTimeout(infoTimeoutId);
    }

    infoText.textContent = text;
    infoText.style.color = colour;

    infoTimeoutId = setTimeout(() => {
        infoText.textContent = "";
        infoTimeoutId = null;
    }, HIT_INFO_TIMEOUT)
}

function hit(lane) {

    if(!gameRunning) return;

    for (let i = 0; i < notes.length; i++) {

        let note = notes[i];

        if (note.lane === lane) {

            let diff = Math.abs((note.y + 15) - hitZoneY);

            if (diff < 30) {

                // good hit
                score++;
                showInfo("HIT", HIT_TEXT_COLOUR);
            
            } else {

                // missed hit
                showInfo("MISS", MISS_TEXT_COLOUR);
                decreaseHealth();
                updateHealthVisuals();
            }

            updateScore();
            note.element.remove();
            notes.splice(i, 1);
            return;
        }
    }

    // No note in lane to hit
    showInfo("MISS", MISS_TEXT_COLOUR);
    decreaseHealth();
    updateHealthVisuals();
    updateScore();
}

document.addEventListener('keydown', (e) => {

    if(!gameRunning) return;

    triggerDrumShake(drummerImage);

    if (e.code === 'ArrowLeft')
    {
        leftArrowImage.src = "./images/Left_arrow_pressed.png";
        drummerImage.src = "./images/Japanese_drummer_left_hit.png";
        drumSound.currentTime = 0;
        drumSound.play();
    } 

    if (e.code === 'ArrowRight')
    {
        rightArrowImage.src = "./images/Right_arrow_pressed.png";
        drummerImage.src = "./images/Japanese_drummer_right_hit.png";
        drumSound.currentTime = 0;
        drumSound.play();
    }

    if (e.code === 'KeyA')
    {
        leftArrowImage.src = "./images/A_key_pressed.png";
        drummerImage.src = "./images/Japanese_drummer_left_hit.png";
        drumSound.currentTime = 0;
        drumSound.play();
    } 

    if (e.code === 'KeyD')
    {
        rightArrowImage.src = "./images/D_key_pressed.png";
        drummerImage.src = "./images/Japanese_drummer_right_hit.png";
        drumSound.currentTime = 0;
        drumSound.play();
    }
});

document.addEventListener('keydown', (e) => {

    if(!gameRunning) return;

    if(!e.repeat)
    {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA')
        {
            hit('left');
        } 
    
        if (e.code === 'ArrowRight' || e.code === 'KeyD')
        {
            hit('right');
        }
    }
});

document.addEventListener('keyup', (e) => {

    if(!gameRunning) return;

    if (e.code === 'ArrowLeft')
    {
        leftArrowImage.src = "./images/Left_arrow_unpressed.png"; 
        drummerImage.src = "./images/Japanese_drummer_idle.png";
    } 

    if (e.code === 'ArrowRight')
    {
        rightArrowImage.src = "./images/Right_arrow_unpressed.png";
        drummerImage.src = "./images/Japanese_drummer_idle.png";
    }

    if (e.code === 'KeyA')
    {
        leftArrowImage.src = "./images/A_key_unpressed.png"; 
        drummerImage.src = "./images/Japanese_drummer_idle.png";
    } 

    if (e.code === 'KeyD')
    {
        rightArrowImage.src = "./images/D_key_unpressed.png";
        drummerImage.src = "./images/Japanese_drummer_idle.png";
    }
});

function getSpawnInterval(score) {

    return Math.max(MAX_NOTE_SPAWN_DELAY - Math.floor(score * SPEED_SCORE_THRESHOLD ) * 0.5, MIN_NOTE_SPAWN_DELAY)
}

function scheduleNextNote() {
    if(!gameRunning) return;

    const lane = Math.random() < 0.5 ? 'left' : 'right';
    spawnNote(lane);

    // Dynamically re-evaluate spawn interval
    setTimeout(scheduleNextNote, getSpawnInterval(score));
}

function triggerShake(container) {
    container.classList.add('shake');
    setTimeout(() => {
        container.classList.remove('shake');
    }, 200)
}

function triggerDrumShake(container) {
    container.classList.add('drumShake');
    setTimeout(() => {
        container.classList.remove('drumShake');
    }, 200)
}

scheduleNextNote();
updateHealthVisuals();
gameLoop();