const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext('2d');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
let snake = [];
let foodX, foodY, dx, dy, score, changingDirection;
let highScore = localStorage.getItem('highScore') || 0;

document.getElementById('highScore').innerText = "High Score: " + highScore;

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetHighScore);
document.addEventListener('keydown', changeDirection);

function startGame() {
    resetGame();
    main();
    stopConfetti();
    createFood();
    startButton.textContent = 'Restart Game';
    stopConfetti();
}

function resetGame() {
    snake = [
        { x: 150, y: 150 },
        { x: 140, y: 150 },
        { x: 130, y: 150 },
        { x: 120, y: 150 },
        { x: 110, y: 150 },
    ];
    dx = 10;
    dy = 0;
    score = 0;
    changingDirection = false;
    document.getElementById('score').innerText = 'Score: 0';
    clearCanvas();
}
function resetHighScore() {
    highScore = 0;
    localStorage.setItem('highScore', highScore);
    document.getElementById('highScore').innerText = 'High Score: ' + highScore;
}

function main() {
    if (didGameEnd()) {
        updateHighScore();
        return;
    }
    setTimeout(() => {
        changingDirection = false;
        clearCanvas();
        drawFood();
        advanceSnake();
        drawSnake();
        stopConfetti();
        main();
    }, 100);
}
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').innerText = ' Your High Score is : ' + highScore;
        showCongratsMessage();
        stopConfetti();
        startConfetti();
    }
}

function didGameEnd() {
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) return true;
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > gameCanvas.width - 10;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > gameCanvas.height - 10;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function randomNumber(max, min) {
    return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function createFood() {
    foodX = randomNumber(0, gameCanvas.width - 10);
    foodY = randomNumber(0, gameCanvas.height - 10);
    snake.forEach(snakePart => {
        if (snakePart.x === foodX && snakePart.y === foodY) {
            createFood();
        }
    });
}

function advanceSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        document.getElementById('score').innerText = "Your Score is : " + score;
        createFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawSnakePart(snakePart) {
    ctx.fillStyle = 'lightgreen';
    ctx.strokeStyle = 'black';
    ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
    ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(foodX, foodY, 10, 10);
    ctx.strokeRect(foodX, foodY, 10, 10);
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    if (keyPressed === LEFT_KEY && dx !== 10) {
        dx = -10;
        dy = 0;
    }
    if (keyPressed === RIGHT_KEY && dx !== -10) {
        dx = 10;
        dy = 0;
    }
    if (keyPressed === UP_KEY && dy !== 10) {
        dx = 0;
        dy = -10;
    }
    if (keyPressed === DOWN_KEY && dy !== -10) {
        dx = 0;
        dy = 10;
    }
}

function showCongratsMessage() {
    const congratsMessage = document.getElementById('congratsMessage');
    congratsMessage.style.display = 'block';
    congratsMessage.style.opacity = '1';
    // setTimeout(() => {
    //     congratsMessage.style.opacity = '0';
    //     setTimeout(() => congratsMessage.style.display = 'none', 10000);
    // }, 2000);
}
let confettiInterval;
let confettiAnimationId;

function startConfetti() {
    const confettiParticles = [];
    const confettiCount = 14;
    const gravity = 0.05;
    const colors = ['#e57373', '#f06292', '#ba68c8', '#64b5f6', '#4db6ac', '#51c084', '#ff654f', '#ff4d', '#a1887f'];

    function addConfetti() {
        for (let i = 0; i < confettiCount; i++) {
            confettiParticles.push({
                x: Math.random() * gameCanvas.width,
                y: -10,
                size: Math.random() * 10 + 2,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 1.4 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    function drawConfetti() {
        clearCanvas();
        drawSnake();
        drawFood();

        confettiParticles.forEach((particle, index) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();

            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedY += gravity;

            if (particle.y > gameCanvas.height) {
                particle.y = -10;
                particle.x = Math.random() * gameCanvas.width;
                particle.speedY = Math.random() * 2 + 0.5;
            }
        });

        confettiAnimationId = requestAnimationFrame(drawConfetti);
    }

    addConfetti();

    confettiInterval = setInterval(addConfetti, 5000);
    drawConfetti();
}

function stopConfetti() {
    clearInterval(confettiInterval);
    cancelAnimationFrame(confettiAnimationId);
}

