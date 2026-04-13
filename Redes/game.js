document.addEventListener('DOMContentLoaded', () => {
    // Animación de entrada con GSAP
    const tl = gsap.timeline();

    tl.from(".glitch", { duration: 1, opacity: 0, y: -50, ease: "bounce" })
      .from(".input-group", { duration: 0.5, opacity: 0, x: -30 }, "-=0.2")
      .from(".char-card", { duration: 0.5, opacity: 0, scale: 0, stagger: 0.1 }, "-=0.3")
      .from("#access-btn", { duration: 0.8, opacity: 0, y: 30 }, "+=0.2");

    // Lógica de selección
    const cards = document.querySelectorAll('.char-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            // Sonido de feedback (opcional)
            playSelectSound();
        });
    });

    document.getElementById('access-btn').addEventListener('click', () => {
        const name = document.getElementById('player-name').value;
        const selectedChar = document.querySelector('.char-card.selected');

        if (!name || !selectedChar) {
            alert("SISTEMA: Identificación y Avatar requeridos para el acceso.");
            return;
        }

        // Transición épica al juego
        gsap.to("#main-menu", { duration: 1, opacity: 0, scale: 1.5, onComplete: () => {
            console.log("Iniciando Network Odyssey para: " + name);
            // Aquí llamarías a la función que inicia el motor Phaser
            initGame(name, selectedChar.dataset.char);
        }});
    });
});

function playSelectSound() {
    // Aquí podrías integrar un AudioContext para sonidos de 8 bits
}


// engine/dialogue.js
export const DialogueSystem = {
    messages: {
        intro: (name) => [
            `Estableciendo conexión segura...`,
            `¡Acceso concedido! Bienvenido al nodo central, ${name}.`,
            `Soy el Profesor Alan Acosta, tu guía en esta arquitectura.`,
            `Las redes de la ciudad han colapsado y tú eres nuestro mejor sysadmin.`,
            `Tu primera misión: Restaurar el enlace físico en el Nivel 1.`
        ]
    },
    
    display(scene, textList, onComplete) {
        let index = 0;
        const textBox = document.createElement('div');
        textBox.id = 'dialogue-ui';
        document.body.appendChild(textBox);

        const showNext = () => {
            if (index < textList.length) {
                this.typeWriter(textBox, textList[index], () => {
                    index++;
                    setTimeout(showNext, 2000); // Pausa entre diálogos
                });
            } else {
                textBox.remove();
                if (onComplete) onComplete();
            }
        };
        showNext();
    },

    typeWriter(element, text, callback) {
        let i = 0;
        element.innerHTML = "> ";
        const timer = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                callback();
            }
        }, 30); // Velocidad de escritura profesional
    }
};