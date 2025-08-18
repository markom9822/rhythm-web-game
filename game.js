
const gameContainer = document.getElementById('laneContainer');
const scoreDisplay = document.getElementById('score');

const leftArrowImage = document.getElementById("leftArrow");
const rightArrowImage = document.getElementById("rightArrow");
const drummerImage =  document.getElementById("drummer");

const infoText = document.getElementById("infoText");

// audio
const drumSound = new Audio('./sounds/drum_sound_8bit.wav');
drumSound.volume = 0.6;
const hurtSound = new Audio('./sounds/man_hurt_8bit.wav');
hurtSound.volume = 0.8;
const gameOverSound = new Audio('./sounds/kabuki_yoooo_8bit.wav');
gameOverSound.volume = 0.8;

let health = 5;
const healthContainer = document.getElementById('healthContainer');
healthContainer.innerHTML = ""; 

const hitZoneY = 500 - 50; // position of hit zone from top
let highScore = 0;
let score = 0;

let infoTimeoutId = null;
let gameRunning = false;
let notes = [];

window.addEventListener("DOMContentLoaded", () => {

    const gameOverMenu = document.getElementById("gameOverMenu");
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
}

function handleResetGameState() {
    health = 5;
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

    const note = document.createElement('div');
    note.classList.add('note');
    note.style.left = lane === 'left' ? '0%' : '50%';
    note.style.top = '-30px';

    gameContainer.appendChild(note);
    notes.push({ element: note, lane, y: -30 });
}

function gameLoop() {

    if(!gameRunning) return;

    for (let i = notes.length - 1; i >= 0; i--) {

        let note = notes[i];
        note.y += getFallingSpeed(score); // falling speed
        note.element.style.top = note.y + 'px';

        if (note.y > 500) {
            // missed completely
            showInfo("MISS", "red");

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

    for (let i = 0; i < 5; i++)
    {
        const heartImg = document.createElement('img');
        heartImg.width = 50;
        heartImg.height = 50;
        heartImg.className = 'heart';

        if (health - i > 0.5) {
            heartImg.src = './images/Full_heart.png';
        }
        else if (health - i == 0.5){
            heartImg.src = './images/Half_heart.png';
        }
         else {
            heartImg.src = './images/Empty_heart.png';
        }

        healthContainer.appendChild(heartImg);
    }
}

function getFallingSpeed(score) {

    return Math.min(2 + Math.floor(score / 10) * 0.5, 10)
}

function decreaseHealth() {

    if(health > 0)
    {
        hurtSound.currentTime = 0;
        hurtSound.play();
        health -= 0.5;
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
    }, 500)
}

function hit(lane) {

    if(!gameRunning) return;

    for (let i = 0; i < notes.length; i++) {

        let note = notes[i];

        if (note.lane === lane) {

            let diff = Math.abs((note.y + 15) - hitZoneY);

            if (diff < 20) {

                // good hit
                score++;
                showInfo("HIT", "green");
            
            } else {

                // missed hit
                showInfo("MISS", "red");
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
    showInfo("MISS", "red");
    decreaseHealth();
    updateHealthVisuals();
    updateScore();
}

document.addEventListener('keydown', (e) => {

    if(!gameRunning) return;

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
});

document.addEventListener('keydown', (e) => {

    if(!gameRunning) return;

    if(!e.repeat)
    {
        if (e.code === 'ArrowLeft')
        {
            hit('left');
        } 
    
        if (e.code === 'ArrowRight')
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

});

function getSpawnInterval(score) {

    return Math.max(1000 - Math.floor(score * 10 ) * 0.5, 500)
}

function scheduleNextNote() {
    if(!gameRunning) return;

    const lane = Math.random() < 0.5 ? 'left' : 'right';
    spawnNote(lane);

    // Dynamically re-evaluate spawn interval
    setTimeout(scheduleNextNote, getSpawnInterval(score));
}

scheduleNextNote();

updateHealthVisuals();

gameLoop();