const counterContainer = document.getElementById('counter-container');
const inputQuestionArea = document.getElementById('input-question-area');
const promptInput = document.getElementById('prompt-input');
const transitionCircle = document.getElementById('transition-circle');
const pageTwo = document.getElementById('page-two');
const userResponseDisplay = document.getElementById('user-response');
const aiAnswerDisplay = document.getElementById('ai-answer');
const preLaunchScreen = document.getElementById('pre-launch-screen');
const soundConsentButton = document.getElementById('sound-consent-button');
const counterSound = document.getElementById('counter-sound');

counterSound.volume = 0.5;

const target = 100000;
let count = 0;
const startDelay = 1;
const finalDelay = 0.1;
const threshold = 1000;
const transitionDuration = 1500;
let transitionStarted = false;

const aiResponses = [
    "C'est une vision inspirante. Chaque grand projet commence par une idée ! Analysons l'impact de cette somme sur ce rêve...",
    "Un choix audacieux ! Ce montant pourrait en effet être le catalyseur d'une transformation majeure. Préparons le bilan.",
    "Quelle belle intention ! Même si 100 000 € n'est qu'un début pour certains rêves, il peut changer une vie. Voyons la suite.",
    "Absolument. Transformer l'argent en expérience ou en sécurité est souvent la meilleure des stratégies. Votre 'pourquoi' est puissant.",
    "Un investissement intelligent ! La liberté financière se construit pas à pas. Votre objectif est maintenant notre point de départ."
];

function formatNumber(num) {
    return num.toLocaleString('fr-FR') + ' €';
}


function startSound() {
    return counterSound.play().catch(error => {
        console.log("Lecture du son bloquée ou erreur : " + error);
    });
}


function stopSound() {
    const fadeInterval = setInterval(() => {
        if (counterSound.volume > 0.1) {
            counterSound.volume -= 0.1;
        } else {
            counterSound.pause();
            counterSound.volume = 0.5;
            clearInterval(fadeInterval);
        }
    }, 50);
}


function updateCounter() {
    if (count < target) {
        let delay = startDelay;
        let step = 1;

        if (count >= threshold) {
            const progress = (count - threshold) / (target - threshold);
            delay = Math.max(finalDelay, startDelay * (1 - progress));
            step = Math.ceil((target - count) / 100);
            if (step < 1) step = 1;
        } else if (count > 5000) {
            delay = Math.max(finalDelay, startDelay - (count / target) * startDelay);
            step = Math.floor(count / 1000) + 1;
            if (step > 500) step = 500;
        }

        count = Math.min(target, count + step);
        counterContainer.textContent = formatNumber(count);

        setTimeout(updateCounter, delay);
    } else {
        counterContainer.textContent = formatNumber(target);
        stopSound();
        showQuestionArea();
    }
}


window.activateSoundAndStart = function() {
    soundConsentButton.disabled = true;

    startSound();

    soundConsentButton.classList.add('sound-active');
    soundConsentButton.textContent = "Son Activé. Lancement...";

    setTimeout(() => {
        preLaunchScreen.style.opacity = '0';

        setTimeout(() => {
            preLaunchScreen.style.visibility = 'hidden';
            counterContainer.style.opacity = '1';

            updateCounter();
        }, 1000);
    }, 500);
}

function showQuestionArea() {
    inputQuestionArea.style.display = 'block';
    setTimeout(() => {
        inputQuestionArea.style.opacity = '1';
        promptInput.focus();
    }, 100);
}


window.handleInput = function() {
    if (transitionStarted) return;

    const userInput = promptInput.value.trim();

    if (userInput.length > 3) {
        userResponseDisplay.textContent = userInput;

        const randomIndex = Math.floor(Math.random() * aiResponses.length);
        aiAnswerDisplay.textContent = aiResponses[randomIndex];

        startTransition();
    } else {
        promptInput.style.border = '2px solid red';
        setTimeout(() => {
            promptInput.style.border = 'none';
        }, 500);
    }
}

function startTransition() {
    transitionStarted = true;
    counterContainer.style.opacity = '0';
    inputQuestionArea.style.opacity = '0';

    setTimeout(() => {
        transitionCircle.style.transform = 'translate(-50%, -50%) scale(50)';
    }, 500);

    setTimeout(() => {
        pageTwo.style.opacity = '1';
        pageTwo.style.zIndex = '250';
        document.body.style.backgroundColor = '#1A1A1A';
    }, 1000);

    setTimeout(() => {
        transitionCircle.style.display = 'none';
    }, transitionDuration + 500);
}

promptInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        window.handleInput();
    }
});
