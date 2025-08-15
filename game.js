const gameContainer = document.getElementById('laneContainer');
const scoreDisplay = document.getElementById('score');
const hitZoneY = 500 - 50; // position of hit zone from top
let score = 0;

const fallingSpeed = 2;

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
            updateScore();
            note.element.remove();
            notes.splice(i, 1);
        }
    }
    requestAnimationFrame(gameLoop);
}

function updateScore() {
    scoreDisplay.textContent = 'Score: ' + score;
}

function hit(lane) {
    for (let i = 0; i < notes.length; i++) {
        let note = notes[i];
        if (note.lane === lane) {
            let diff = Math.abs((note.y + 15) - hitZoneY);
            if (diff < 20) {
                // good hit
                score++;
            } else {
                score--;
            }
            updateScore();
            note.element.remove();
            notes.splice(i, 1);
            return;
        }
    }
    // No note in lane to hit
    score--;
    updateScore();
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') hit('left');
    if (e.code === 'ArrowRight') hit('right');
});

// spawn notes every 1 second randomly on one lane
setInterval(() => {
    const lane = Math.random() < 0.5 ? 'left' : 'right';
    spawnNote(lane);
}, 1000);

gameLoop();
