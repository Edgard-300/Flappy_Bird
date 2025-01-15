// Elementos del DOM
const container = document.getElementById('game-container');
const bird = document.getElementById('bird');
const scoreElement = document.getElementById('score');

// Configuración básica
const GAME_CONFIG = {
    GRAVITY: 0.5,
    JUMP_FORCE: -8,
    TUBE_SPEED: 2,
    TUBE_GAP: 150
};

// Estado del juego
const gameState = {
    isPlaying: false,
    score: 0,
    velocity: 0,
    birdY: 250,
    tubes: []
};

// Inicializar pájaro
function initBird() {
    bird.style.top = `${gameState.birdY}px`;
    bird.style.left = '50px';
}

// Salto
function jump(e) {
    e.preventDefault();
    
    if (!gameState.isPlaying) {
        gameState.isPlaying = true;
        requestAnimationFrame(gameLoop);
        return;
    }
    
    gameState.velocity = GAME_CONFIG.JUMP_FORCE;
}

// Crear tubo
function createTube() {
    const tubeHeight = Math.random() * (container.clientHeight - GAME_CONFIG.TUBE_GAP - 100) + 50;
    
    const topTube = document.createElement('div');
    topTube.className = 'tube top';
    topTube.style.height = `${tubeHeight}px`;
    
    const bottomTube = document.createElement('div');
    bottomTube.className = 'tube bottom';
    bottomTube.style.height = `${container.clientHeight - tubeHeight - GAME_CONFIG.TUBE_GAP}px`;
    bottomTube.style.top = `${tubeHeight + GAME_CONFIG.TUBE_GAP}px`;
    
    container.appendChild(topTube);
    container.appendChild(bottomTube);
    
    gameState.tubes.push({
        top: topTube,
        bottom: bottomTube,
        x: container.clientWidth,
        scored: false
    });
}

// Actualizar tubos
function updateTubes() {
    gameState.tubes.forEach((tube, index) => {
        tube.x -= GAME_CONFIG.TUBE_SPEED;
        tube.top.style.left = `${tube.x}px`;
        tube.bottom.style.left = `${tube.x}px`;
        
        // Sumar punto
        if (!tube.scored && tube.x < 50) {
            tube.scored = true;
            gameState.score++;
            scoreElement.textContent = gameState.score;
        }
        
        // Eliminar tubos fuera de pantalla
        if (tube.x < -60) {
            container.removeChild(tube.top);
            container.removeChild(tube.bottom);
            gameState.tubes.splice(index, 1);
        }
    });
}

// Verificar colisiones
function checkCollision() {
    const birdRect = bird.getBoundingClientRect();
    
    // Colisión con bordes
    if (gameState.birdY < 0 || gameState.birdY > container.clientHeight - bird.clientHeight) {
        return true;
    }
    
    // Colisión con tubos
    for (const tube of gameState.tubes) {
        const topTubeRect = tube.top.getBoundingClientRect();
        const bottomTubeRect = tube.bottom.getBoundingClientRect();
        
        if (
            birdRect.right > topTubeRect.left &&
            birdRect.left < topTubeRect.right &&
            (birdRect.top < topTubeRect.bottom || birdRect.bottom > bottomTubeRect.top)
        ) {
            return true;
        }
    }
    
    return false;
}

// Loop principal
function gameLoop() {
    if (!gameState.isPlaying) return;
    
    // Actualizar pájaro
    gameState.velocity += GAME_CONFIG.GRAVITY;
    gameState.birdY += gameState.velocity;
    bird.style.top = `${gameState.birdY}px`;
    
    // Crear nuevos tubos
    if (gameState.tubes.length === 0 || 
        gameState.tubes[gameState.tubes.length - 1].x < container.clientWidth - 200) {
        createTube();
    }
    
    updateTubes();
    
    // Verificar game over
    if (checkCollision()) {
        gameState.isPlaying = false;
        alert(`Game Over! Score: ${gameState.score}`);
        resetGame();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Reiniciar juego
function resetGame() {
    gameState.tubes.forEach(tube => {
        container.removeChild(tube.top);
        container.removeChild(tube.bottom);
    });
    
    Object.assign(gameState, {
        isPlaying: false,
        score: 0,
        velocity: 0,
        birdY: 250,
        tubes: []
    });
    
    scoreElement.textContent = '0';
    initBird();
}

// Event listeners
document.addEventListener('mousedown', jump);
document.addEventListener('touchstart', jump, { passive: false });
document.addEventListener('keydown', e => {
    if (e.code === 'Space') jump(e);
});

// Inicializar
initBird();