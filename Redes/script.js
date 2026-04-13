/**
 * NETWORK ODYSSEY - CORE ENGINE
 * Architecture: Senior Game Loop / State Management
 * Project Lead: Prof. Alan Acosta
 */

// Configuración Global del Motor
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player;
let cursors;
let gameState = {
    name: "",
    character: "",
    currentLevel: 1,
    isDialogueActive: false
};

const game = new Phaser.Game(config);

// --- 1. PRECARGA DE ASSETS ---
function preload() {
    // Usamos assets de alta calidad de servidores de Phaser para asegurar que funcione de inmediato
    this.load.image('network-tiles', 'https://labs.phaser.io/assets/tilemaps/tiles/catastrophi_tiles_16.png');
    this.load.spritesheet('hero', 'https://labs.phaser.io/assets/sprites/multiatlas/emoji/emojis.png', { frameWidth: 64, frameHeight: 64 });
}

// --- 2. LÓGICA DE INICIO Y ESCENA ---
function create() {
    const scene = this;

    // Inicialización de la UI de entrada
    const charCards = document.querySelectorAll('.char-card');
    charCards.forEach(card => {
        card.addEventListener('click', () => {
            charCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            gameState.character = card.dataset.char;
        });
    });

    document.getElementById('btn-establish-connection').addEventListener('click', () => {
        const nameInput = document.getElementById('player-name').value;
        if (nameInput && gameState.character) {
            gameState.name = nameInput;
            launchGame(scene);
        } else {
            alert("ERROR DE ACCESO: Se requiere Identificación y Avatar.");
        }
    });

    cursors = this.input.keyboard.createCursorKeys();
}

// --- 3. LANZAMIENTO Y NARRATIVA ---
function launchGame(scene) {
    // Animación de salida de la UI con GSAP
    gsap.to("#main-interface", { 
        duration: 1, 
        opacity: 0, 
        y: -100, 
        onComplete: () => {
            document.getElementById('main-interface').style.display = 'none';
            initLevelOne(scene);
        }
    });
}

function initLevelOne(scene) {
    // Crear el sprite del jugador basado en la selección
    player = scene.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'hero', 20);
    player.setCollideWorldBounds(true);
    player.setScale(1.2);

    // Secuencia de Diálogo del Profesor Alan Acosta
    const missionScript = [
        `Conexión establecida. ¿Me escuchas, ${gameState.name}?`,
        `Soy el Profesor Alan. Estamos en el Nivel 1: El Origen del Pulso.`,
        `Alguien cortó el enlace físico del servidor principal.`,
        `Usa las flechas del teclado para explorar el nodo. ¡Encuentra el Router!`
    ];

    triggerDialogue(missionScript);
}

// --- 4. MOTOR DE DIÁLOGO (TYPEWRITER) ---
function triggerDialogue(lines) {
    const wrapper = document.getElementById('dialogue-wrapper');
    const output = document.getElementById('text-output');
    wrapper.classList.remove('ui-hidden');
    gameState.isDialogueActive = true;

    let currentLine = 0;

    const typeText = (text) => {
        output.innerHTML = "";
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                output.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
                setTimeout(nextBlock, 2500);
            }
        }, 40);
    };

    const nextBlock = () => {
        currentLine++;
        if (currentLine < lines.length) {
            typeText(lines[currentLine]);
        } else {
            gsap.to("#dialogue-wrapper", { duration: 0.5, opacity: 0, onComplete: () => {
                wrapper.classList.add('ui-hidden');
                gameState.isDialogueActive = false;
            }});
        }
    };

    typeText(lines[currentLine]);
}

// --- 5. GAME LOOP (MOVIMIENTO PROFESIONAL) ---
function update() {
    if (player && !gameState.isDialogueActive) {
        player.setVelocity(0);

        const speed = 250;

        if (cursors.left.isDown) {
            player.setVelocityX(-speed);
        } else if (cursors.right.isDown) {
            player.setVelocityX(speed);
        }

        if (cursors.up.isDown) {
            player.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            player.setVelocityY(speed);
        }

        // Animación simple de escala al moverse
        if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0) {
            player.setAlpha(0.8);
        } else {
            player.setAlpha(1);
        }
    }
}

/* MOTOR DE JUEGO AVANZADO - PATRÓN SINGLETON */
class NetworkGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            pixelArt: true, // Crucial para estética profesional
            physics: { default: 'arcade' },
            scene: { preload: this.preload, create: this.create, update: this.update }
        };
        this.game = new Phaser.Game(this.config);
    }

    preload() {
        // Cargamos recursos que no parezcan dibujos de Paint
        this.load.spritesheet('main_char', 'https://labs.phaser.io/assets/sprites/multiatlas/emoji/emojis.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('particle', 'https://labs.phaser.io/assets/particles/green.png');
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        
        // Emisor de partículas para el rastro del jugador (Efecto Tron)
        this.emitter = this.add.particles(0, 0, 'particle', {
            speed: 100,
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 400
        });

        this.player = this.physics.add.sprite(400, 300, 'main_char', 50);
        this.emitter.startFollow(this.player);

        // Cámara con suavizado (Smooth Follow)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        
        // El diálogo del Profesor Alan ahora entra con una animación de interferencia
        this.triggerAlanMission();
    }

    update() {
        const cursors = this.input.keyboard.createCursorKeys();
        const speed = 350;
        
        // Movimiento con aceleración/desaceleración para evitar el "movimiento rígido"
        if (cursors.left.isDown) this.player.setAccelerationX(-speed * 2);
        else if (cursors.right.isDown) this.player.setAccelerationX(speed * 2);
        else this.player.setAccelerationX(0);

        if (cursors.up.isDown) this.player.setAccelerationY(-speed * 2);
        else if (cursors.down.isDown) this.player.setAccelerationY(speed * 2);
        else this.player.setAccelerationY(0);

        this.player.setDrag(1500); // Esto da la sensación de "peso" profesional
    }

    triggerAlanMission() {
        // Usamos la API de Web Speech o un sistema de texto con GLITCH
        const ui = document.getElementById('dialogue-wrapper');
        gsap.fromTo(ui, { skewX: 20, opacity: 0 }, { skewX: 0, opacity: 1, duration: 0.5 });
    }
}

new NetworkGame();