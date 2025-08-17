const gameContainer = document.getElementById('laneContainer');
const scoreDisplay = document.getElementById('score');

const leftArrowImage = document.getElementById("leftArrow");
const rightArrowImage = document.getElementById("rightArrow");
const drummerImage =  document.getElementById("drummer");

const infoText = document.getElementById("infoText");

let health = 5;
const healthContainer = document.getElementById('healthContainer');
healthContainer.innerHTML = ""; 


const hitZoneY = 500 - 50; // position of hit zone from top
let score = 0;
const fallingSpeed = 2; // speed of falling bars

let infoTimeoutId = null;

let notes = [];

function spawnNote(lane) {

    const note = document.createElement('div');
    note.classList.add('note');
    note.style.left = lane === 'left' ? '0%' : '50%';
    note.style.top = '-30px';

    gameContainer.appendChild(note);
    notes.push({ element: note, lane, y: -30 });
}

function gameLoop() {

    for (let i = notes.length - 1; i >= 0; i--) {

        let note = notes[i];
        note.y += fallingSpeed; // falling speed
        note.element.style.top = note.y + 'px';

        if (note.y > 500) {
            // missed completely
            score--;

            showInfo("MISS", "red");

            updateScore();
            note.element.remove();
            notes.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
}

function updateHealth() {

    console.log(health)

    healthContainer.innerHTML = '';

    for (let i = 0; i < 5; i++)
    {

        console.log(i)

        const heartImg = document.createElement('img');
        heartImg.width = 50;
        heartImg.height = 50;
        heartImg.className = 'heart';

        if (i < health) {
            heartImg.src = './images/Full_heart.png';
        }
        else if (i < health - 1){
            heartImg.src = './images/Half_heart.png';
        }
         else {
            heartImg.src = './images/Empty_heart.png';
        }

        healthContainer.appendChild(heartImg);
    }
}

function updateScore() {

    scoreDisplay.textContent = 'Score: ' + score;
}

function showInfo(text, colour) {

    if(infoTimeoutId)
    {
        clearTimeout(infoTimeoutId);
    }

    infoText.textContent = text;
    infoText.style.color = colour;

    infoTimeoutId = setTimeout(() => {
        infoText.textContent = "";
        infoTimeoutId = null;
    }, 1000)
}

function hit(lane) {

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
                score--;

                showInfo("MISS", "red");

                health -= 0.5;
                updateHealth();
            }

            updateScore();
            note.element.remove();
            notes.splice(i, 1);
            return;
        }
    }

    // No note in lane to hit
    score--;
    showInfo("MISS", "red");
    health -= 0.5;
    updateHealth();

    updateScore();
}

document.addEventListener('keydown', (e) => {

    if (e.code === 'ArrowLeft')
    {
        leftArrowImage.src = "./images/Left_arrow_pressed.png";
        drummerImage.src = "./images/Japanese_drummer_left_hit.png";
    } 

    if (e.code === 'ArrowRight')
    {
        rightArrowImage.src = "./images/Right_arrow_pressed.png";
        drummerImage.src = "./images/Japanese_drummer_right_hit.png";
    }
});

document.addEventListener('keydown', (e) => {

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

// spawn notes on one lane

setInterval(() => 
{
    //const lane = Math.random() < 0.5 ? 'left' : 'right';
    //spawnNote(lane);

}, 1000);

updateHealth();

gameLoop();
