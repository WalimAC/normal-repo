// CONFIGURATION
const counterElement = document.getElementById('counter-container');
const counterSound = document.getElementById('counter-sound');
const soundConsentButton = document.getElementById('sound-consent-button');
const typingSound = document.getElementById('typing-sound');

const target = 100000;
let count = 0;

// VARIABLES 3D
let scene, camera, renderer;
let screenMesh;
let monitorGroup;
let allScreenMaterials = [];

const colors = {
    blue: new THREE.Color(0x0078D7),
    red: new THREE.Color(0xff3333),
    green: new THREE.Color(0x8BC34A),
    dark: new THREE.Color(0x050505),
    light: new THREE.Color(0x8BC34A)
};
const bgState = { color: new THREE.Color(0x050505) };

// --- GESTION AUDIO SCROLL ---
const musicAudio = document.getElementById('background-music');
let audioUnlocked = false;

// --- DÉMARRAGE DE LA NARRATION FINALE ET ENCHAÎNEMENT DES PILIERS ---

// 1. NARRATION RACCOURCIE ET PLUS PERCUTANTE
const NIRD_NARRATIVE = `Notre ambition : libérer l'école de la dépendance numérique. En adoptant les logiciels libres et en valorisant le matériel existant, nous transformons l'obsolescence en durabilité. Cela permet d'économiser des milliers d'euros d'argent public et de réduire drastiquement l'empreinte environnementale. NIRD n'est pas qu'un logiciel, c'est un mouvement.`;

function startTypingNarrative() {
    const finalSection = document.getElementById('step-linux');
    const contentWrapper = finalSection.querySelector('.content-wrapper');

    contentWrapper.style.cssText = `
        align-items: flex-start;
        max-width: 90%;
        padding-left: 5%;
        margin: 0;
    `;

    // 1. INSÉRER LE GROS TITRE BLANC EN CODE FONT
    let titleElement = contentWrapper.querySelector('#final-big-title');
    if (!titleElement) {
        titleElement = document.createElement('h1');
        titleElement.id = 'final-big-title';
        titleElement.textContent = "C'est précisément l'ambition de la démarche NIRD.";
        titleElement.style.cssText = `
            color: white;
            font-size: 6em;
            font-weight: 900;
            text-align: left;
            text-transform: uppercase;
            opacity: 0;
            margin-bottom: 50px;
            font-family: 'Space Grotesk', 'monospace', sans-serif;
            text-shadow: 0 0 10px rgba(139, 195, 74, 0.8);
            line-height: 1;
        `;
        contentWrapper.appendChild(titleElement);
    }

    // 2. ANIMER LE TITRE AVANT LA NARRATION
    gsap.to(titleElement, { opacity: 1, duration: 1.5, ease: "power2.out", onComplete: () => { // Durée augmentée

            // 3. INSÉRER LE CONTENEUR DE LA NARRATION
            let narrativeContainer = contentWrapper.querySelector('#narrative-text');
            if (!narrativeContainer) {
                narrativeContainer = document.createElement('p');
                narrativeContainer.id = 'narrative-text';
                narrativeContainer.style.cssText = `
                font-size: 1.8em;
                max-width: 900px;
                text-align: left;
                color: white;
                opacity: 0;
                font-family: 'monospace', 'Courier New', monospace;
                border-right: 2px solid white;
                padding-right: 5px;
                text-shadow: 0 0 5px rgba(139, 195, 74, 0.5);
                text-transform: uppercase;
            `;
                contentWrapper.appendChild(narrativeContainer);
            }

            // 4. DÉMARRER LA NARRATION AVEC EFFET MACHINE À ÉCRIRE
            gsap.to(narrativeContainer, { opacity: 1, duration: 0.8, onComplete: () => { // Durée augmentée
                    let cursor = { char: 0 };
                    let lastCharCount = 0;
                    narrativeContainer.innerHTML = ""; // Utiliser innerHTML pour les spans

                    // Mots clés à colorer en vert pour l'illustration narrative
                    const keywords = [
                        { text: "LIBÉRER L'ÉCOLE", color: '#8BC34A' },
                        { text: "LOGICIELS LIBRES", color: '#8BC34A' },
                        { text: "DURABILITÉ", color: '#8BC34A' },
                        { text: "ÉCONOMISER DES MILLIERS D'EUROS", color: '#8BC34A' },
                        { text: "MOUVEMENT", color: '#8BC34A' },
                    ];

                    const textUpperCase = NIRD_NARRATIVE.toUpperCase();

                    gsap.to(cursor, {
                        char: textUpperCase.length,
                        // 2. DURATION AUGMENTÉE (ex: de 12 à 20) pour une lecture plus lente
                        duration: 20,
                        ease: "none",
                        onUpdate: () => {
                            let currentText = textUpperCase.substring(0, Math.round(cursor.char));

                            // 3. APPLICATION DE L'ILLUSTRATION NARRATIVE (changement de couleur)
                            keywords.forEach(kw => {
                                const kwUpper = kw.text;
                                if (currentText.includes(kwUpper)) {
                                    // Remplacer le mot clé écrit par sa version colorée
                                    currentText = currentText.replace(kwUpper, `<span style="color: ${kw.color}; text-shadow: 0 0 10px rgba(139, 195, 74, 0.8);">${kwUpper}</span>`);
                                }
                            });

                            narrativeContainer.innerHTML = currentText; // Utiliser innerHTML

                            if (Math.round(cursor.char) > lastCharCount && typingSound) {
                                const clone = typingSound.cloneNode();
                                clone.volume = 0.5;
                                clone.play().catch(e => console.log("Erreur de lecture audio : ", e));
                            }
                            lastCharCount = Math.round(cursor.char);
                        },
                        onComplete: () => {
                            // Rendu final avec tous les mots clés colorés
                            let finalHtml = textUpperCase;
                            keywords.forEach(kw => {
                                const kwUpper = kw.text;
                                finalHtml = finalHtml.replace(kwUpper, `<span style="color: ${kw.color}; text-shadow: 0 0 10px rgba(139, 195, 74, 0.8);">${kwUpper}</span>`);
                            });

                            narrativeContainer.innerHTML = finalHtml;
                            narrativeContainer.style.borderRight = 'none';

                            setTimeout(displaySouverainete, 2000); // 4. Délai ajusté après la fin de l'écriture
                        }
                    });
                }});
        }});
}

function displaySouverainete() {
    const finalSection = document.getElementById('step-linux');
    const contentWrapper = finalSection.querySelector('.content-wrapper');

    gsap.to(contentWrapper.children, { opacity: 0, duration: 1, onComplete: () => { // Durée augmentée pour l'enchaînement
            contentWrapper.innerHTML = '';

            const title = document.createElement('h2');
            title.textContent = "Étapes 1 - INCLUSION & SOUVERAINETÉ";
            title.style.cssText = `
            color: #8BC34A; font-size: 4em; font-weight: 900; text-align: left;
            text-transform: uppercase; margin-bottom: 30px; opacity: 0;
            font-family: 'Space Grotesk', 'monospace', sans-serif;
            text-shadow: 0 0 10px rgba(139, 195, 74, 0.5);
        `;
            contentWrapper.appendChild(title);

            const actions = [
                "Identifier un enseignant volontaire comme contact NIRD.",
                "Sensibiliser l'équipe éducative aux enjeux du numérique inclusif, responsable et durable.",
                "Se mettre en réseau via Tchap pour partager ressources et retours d'expérience.",
                "Informer la direction et la collectivité pour soutenir la démarche.",
            ]

            const ul = document.createElement('ul');
            ul.style.cssText = `
            list-style: none; padding: 0; font-family: 'monospace', 'Courier New', monospace;
            text-transform: uppercase; font-size: 1.5em; color: white; text-align: left;
        `;
            contentWrapper.appendChild(ul);

            gsap.to(title, { opacity: 1, duration: 1, onComplete: () => {
                    actions.forEach((text, index) => {
                        const li = document.createElement('li');
                        li.textContent = text;
                        li.style.opacity = 0;
                        li.style.marginBottom = '15px';
                        ul.appendChild(li);

                        gsap.to(li, {
                            opacity: 1,
                            duration: 0.8, // Durée augmentée
                            delay: index * 0.6, // Délai augmenté
                            onComplete: (index === actions.length - 1) ? () => {
                                setTimeout(displayLogicielLibre, 3000); // Délai augmenté
                            } : null
                        });
                    });
                }});
        }});
}

function displayLogicielLibre() {
    const finalSection = document.getElementById('step-linux');
    const contentWrapper = finalSection.querySelector('.content-wrapper');

    gsap.to(contentWrapper.children, { opacity: 0, duration: 1, onComplete: () => { // Durée augmentée
            contentWrapper.innerHTML = '';

            const title = document.createElement('h2');
            title.textContent = "Étapes 2 - RESPONSABILITÉ & LOGICIELS LIBRES";
            title.style.cssText = `
            color: #8BC34A; font-size: 4em; font-weight: 900; text-align: left;
            text-transform: uppercase; margin-bottom: 30px; opacity: 0;
            font-family: 'Space Grotesk', 'monospace', sans-serif;
            text-shadow: 0 0 10px rgba(139, 195, 74, 0.5);
        `;
            contentWrapper.appendChild(title);

            const actions = [
                "Installer et utiliser des postes Linux (neufs ou reconditionnés).",
                "Créer un club informatique pour impliquer les élèves dans le reconditionnement.",
                "Former enseignants et élèves à l'utilisation et à l'appropriation des outils.",
                "Suivi par la direction et échanges avec la collectivité pour aspects logistiques.",
            ];

            const ul = document.createElement('ul');
            ul.style.cssText = `
            list-style: none; padding: 0; font-family: 'monospace', 'Courier New', monospace;
            text-transform: uppercase; font-size: 1.5em; color: white; text-align: left;
        `;
            contentWrapper.appendChild(ul);

            gsap.to(title, { opacity: 1, duration: 1, onComplete: () => {
                    actions.forEach((text, index) => {
                        const li = document.createElement('li');
                        li.textContent = text;
                        li.style.opacity = 0;
                        li.style.marginBottom = '15px';
                        ul.appendChild(li);

                        gsap.to(li, {
                            opacity: 1,
                            duration: 0.8, // Durée augmentée
                            delay: index * 0.6, // Délai augmenté
                            onComplete: (index === actions.length - 1) ? () => {
                                setTimeout(displayDureeDeVie, 3000); // Délai augmenté
                            } : null
                        });
                    });
                }});
        }});
}

function displayDureeDeVie() {
    const finalSection = document.getElementById('step-linux');
    const contentWrapper = finalSection.querySelector('.content-wrapper');

    gsap.to(contentWrapper.children, { opacity: 0, duration: 1, onComplete: () => { // Durée augmentée
            contentWrapper.innerHTML = '';

            const title = document.createElement('h2');
            title.textContent = "Étapes 3 : DURABILITÉ & RECONDITIONNEMENT";
            title.style.cssText = `
            color: #8BC34A; font-size: 4em; font-weight: 900; text-align: left;
            text-transform: uppercase; margin-bottom: 30px; opacity: 0;
            font-family: 'Space Grotesk', 'monospace', sans-serif;
            text-shadow: 0 0 10px rgba(139, 195, 74, 0.5);
        `;
            contentWrapper.appendChild(title);

            const actions = [
                "Intégrer progressivement les postes Linux dans le parc informatique.",
                "Inscrire la démarche dans le projet d'établissement et instances officielles.",
                "Valoriser l'expérience auprès de la communauté éducative et de la collectivité.",
                "Assurer pérennité et cohérence du parc et du réseau éducatif.",
            ];

            const ul = document.createElement('ul');
            ul.style.cssText = `
            list-style: none; padding: 0; font-family: 'monospace', 'Courier New', monospace;
            text-transform: uppercase; font-size: 1.5em; color: white; text-align: left;
        `;
            contentWrapper.appendChild(ul);

            gsap.to(title, { opacity: 1, duration: 1, onComplete: () => {
                    actions.forEach((text, index) => {
                        const li = document.createElement('li');
                        li.textContent = text;
                        li.style.opacity = 0;
                        li.style.marginBottom = '15px';
                        ul.appendChild(li);
                        gsap.to(li, {
                            opacity: 1,
                            duration: 0.8, // Durée augmentée
                            delay: index * 0.6, // Délai augmenté
                            onComplete: (index === actions.length - 1) ? () => {
                                const lastSection = document.getElementById('step-linux');
                                gsap.to(lastSection, { opacity: 0, duration: 1.5, onComplete: () => { // Durée augmentée
                                        lastSection.style.display = 'none';

                                        const recoSection = document.getElementById('step-reconditionnement');
                                        recoSection.style.display = 'flex';
                                        gsap.to(recoSection, { opacity: 1, duration: 1.5, onComplete: () => { // Durée augmentée
                                                initRecoInteractions();
                                            }});
                                    }});
                            } : null
                        });
                    });
                }});
        }});
}
// --- PARTIE 1 : COMPTEUR (fonctions inchangées) ---
function formatNumber(num) {
    return num.toLocaleString('fr-FR') + ' €';
}

function updateCounter() {
    let step = Math.floor(count / 80) + 50;
    if (count > target * 0.9) step = 500;

    count = Math.min(target, count + step);
    counterElement.textContent = formatNumber(count);

    if (count < target) {
        requestAnimationFrame(updateCounter);
    } else {
        counterSound.pause();
        startNarrative();
    }
}

window.activateSoundAndStart = function () {
    soundConsentButton.classList.add('sound-active');
    soundConsentButton.textContent = "Son Activé. Lancement...";
    soundConsentButton.disabled = true;

    document.getElementById('pre-launch-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('pre-launch-screen').style.display = 'none';
    }, 500);

    counterSound.play().then(() => {
        audioUnlocked = true;
        counterElement.style.opacity = '1';
        updateCounter();
    }).catch(e => {
        audioUnlocked = true;
        counterElement.style.opacity = '1';
        updateCounter();
    });
}

function startNarrative() {
    const veil = document.getElementById('transition-veil');
    veil.style.opacity = '1';

    setTimeout(() => {
        document.getElementById('intro-sequence').style.display = 'none';
        document.getElementById('narrative-experience').style.opacity = '1';
        document.body.classList.remove('locked-scroll');

        initThreeJS();
        initScrollTimeline();

        setupScrollAudio();

        gsap.to(veil, { opacity: 0, duration: 1.5 });
    }, 1000);
}

function setupScrollAudio() {
    if (!musicAudio || !audioUnlocked) return;

    musicAudio.play().catch(e => console.error("Erreur lecture musique: ", e));

    ScrollTrigger.create({
        trigger: "#main-scroll-track",
        start: "top top",
        end: "bottom bottom",

        onEnter: () => {
            gsap.to(musicAudio, { volume: 0.5, duration: 2, ease: "power1.out" });
            if (musicAudio.paused) musicAudio.play();
        },
        onLeave: () => {
            gsap.to(musicAudio, {
                volume: 0, duration: 2, ease: "power1.in", onComplete: () => {
                    if (musicAudio) musicAudio.pause();
                }
            });
        },
        onEnterBack: () => {
            gsap.to(musicAudio, { volume: 0.5, duration: 2, ease: "power1.out" });
            if (musicAudio.paused) musicAudio.play();
        },
        onLeaveBack: () => {
            gsap.to(musicAudio, {
                volume: 0, duration: 1, ease: "power1.in", onComplete: () => {
                    if (musicAudio) musicAudio.pause();
                }
            });
        }
    });
}


// --- PARTIE 2 : 3D SCENE (fonctions inchangées) ---

function initThreeJS() {
    const canvas = document.querySelector('#webgl');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(colors.dark.getHex(), 0.02);

    const sizes = { width: window.innerWidth, height: window.innerHeight };

    camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(0, 1.5, 12);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(colors.dark);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const screenLight = new THREE.PointLight(colors.blue.getHex(), 1.5, 20);
    screenLight.position.set(0, 2, -4);
    scene.add(screenLight);

    const plasticMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
    const baseScreenMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    window.targetScreenMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: colors.blue.getHex(),
        emissiveIntensity: 0.8
    });

    function createPC(isTarget = false) {
        const group = new THREE.Group();
        const desk = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 1.5), plasticMat);
        desk.position.y = 0;
        group.add(desk);

        const mat = isTarget ? window.targetScreenMat : baseScreenMat.clone();
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.1), mat);
        monitor.position.set(0, 0.6, -0.5);
        group.add(monitor);

        allScreenMaterials.push(monitor.material);

        if (isTarget) screenMesh = monitor;

        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.1), plasticMat);
        stand.position.set(0, 0.3, -0.55);
        group.add(stand);
        const kb = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.4), plasticMat);
        kb.position.set(0, 0.05, 0.2);
        group.add(kb);
        const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.25), plasticMat);
        mouse.position.set(0.7, 0.05, 0.2);
        group.add(mouse);
        return group;
    }

    monitorGroup = createPC(true);
    monitorGroup.position.set(0, 0, -5);
    scene.add(monitorGroup);

    const pcCount = 30;
    const radius = 15;
    const depth = 20;

    for (let i = 0; i < pcCount; i++) {
        const angle = (i / pcCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius * (Math.random() * 0.5 + 0.5);
        const z = Math.sin(angle) * radius * (Math.random() * 0.5 + 0.5) - depth;

        const pc = createPC(false);
        pc.position.set(x, 0, z);
        pc.rotation.y = Math.random() * Math.PI * 2;
        scene.add(pc);
    }

    const clock = new THREE.Clock();

    function tick() {
        screenLight.intensity = 1.5 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
        renderer.render(scene, camera);
        renderer.setClearColor(bgState.color);
        requestAnimationFrame(tick);
    }

    tick();

    window.addEventListener('resize', () => {
        const sizes = { width: window.innerWidth, height: window.innerHeight };
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
    });
}

// --- PARTIE 3 : SCROLL NARRATIF (fonctions inchangées) ----`
function initScrollTimeline() {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#main-scroll-track",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
        }
    });

    tl.to("#initial-scroll-hint", { opacity: 0, duration: 0.5 }, 0);
    tl.to(camera.position, { z: -3.5, y: 0.6, duration: 2 }, 0);
    tl.to("#step-windows", { opacity: 1, duration: 1 })
        .to("#step-windows", { opacity: 0, delay: 1, duration: 0.5 });

    tl.to(window.targetScreenMat.emissive, {
        r: colors.red.r, g: colors.red.g, b: colors.red.b, duration: 0.5
    })
        .to("#step-obsolete", { opacity: 1, duration: 1 }, "<")
        .to("#step-obsolete", { opacity: 0, delay: 1, duration: 0.5 });

    tl.to("#step-cost", { opacity: 1, duration: 1 })
        .to("#step-cost", { opacity: 0, delay: 1, duration: 0.5 });

    tl.to("#step-fight", { opacity: 1, duration: 1 });

    tl.to(camera.position, {
        x: 0.1, duration: 0.1, yoyo: true, repeat: 10,
        ease: "rough({ template: none.out, strength: 1, points: 20, taper: 'none', randomize: true, clamp: false})"
    });

    tl.to("#step-fight", { opacity: 0, duration: 0.5 })
        .to(camera.position, {
            z: 35, y: 6, x: 0, duration: 3, ease: "power2.inOut"
        }, "<");

    allScreenMaterials.forEach((material, index) => {
        const delay = 0.05 * index;
        const targetColorProperty = material.emissive ? material.emissive : material.color;

        tl.to(targetColorProperty, {
            r: colors.green.r, g: colors.green.g, b: colors.green.b,
            duration: 0.8
        }, `-=2.5 + ${delay}`);
    });

    tl.to("body", { backgroundColor: colors.light.getStyle(), duration: 2 }, "-=1");
    tl.to(scene.fog.color, {
        r: colors.light.r, g: colors.light.g, b: colors.light.b, duration: 2
    }, "<");
    tl.to(bgState.color, {
        r: colors.light.r, g: colors.light.g, b: colors.light.b, duration: 2,
    }, "<");

    tl.to(camera.position, {
        z: 60, duration: 2, ease: "power2.in"
    }, ">");

    tl.to(".final-section", { opacity: 1, duration: 1.5, onComplete: () => {
            startTypingNarrative();
        } }, "<");
}



// --- PARTIE 4 : INTERACTIONS NIRD (Linux / Reconditionnement) ---

function initRecoInteractions() {
    gsap.registerPlugin(Draggable);

    const cards = document.querySelectorAll(".drag-card");
    const linuxTarget = document.querySelector(".target-linux");

    const droppedCards = new Set();
    const totalCards = cards.length;
    console.log(`Initialisation des interactions. Total de cartes attendues : ${totalCards}`);

    cards.forEach(card => {

        card.correctlyDropped = false;

        Draggable.create(card, {
            type: "x,y",
            bounds: "#drag-container",
            autoScroll: 1,

            onDrag: function() {
                // La détection visuelle de survol doit rester pour le CSS 'hover'
                if (this.hitTest(linuxTarget, "80%")) {
                    linuxTarget.classList.add("hover");
                } else {
                    linuxTarget.classList.remove("hover");
                }
            },

            onDrop: function(e) {
                console.log(`DEPOT CORRECT (TEST MODE) : ${card.id}. Cartes déposées : ${droppedCards.size}/${totalCards}`);

                linuxTarget.classList.remove("hover");

                // --- TEST CRITIQUE : Suppression de hitTest pour voir le log ---
                // Si la carte n'a jamais été traitée, on la force dans la condition de succès
                if (card.correctlyDropped === false) {

                    card.correctlyDropped = true;
                    droppedCards.add(card.id);
                    card.style.cursor = 'default';

                    // Log du dépôt correct

                    gsap.to(card, {
                        // On positionne quand même au centre pour le visuel
                        x: 0,
                        y: 0,
                        position: 'relative',
                        duration: 0.5,
                        onComplete: () => {
                            // On déplace physiquement la carte DANS le DOM
                            linuxTarget.appendChild(card);
                            Draggable.get(card).disable();
                            card.style.backgroundColor = '#8BC34A';

                            // VÉRIFICATION FINALE
                            if (linuxTarget.children.length === totalCards) {
                                console.log("SUCCÈS GLOBAL (TEST MODE) : Démarrage du mini-jeu d'installation.");
                                showRecoMiniGame();
                            }
                        }
                    });

                } else {
                    // Si échec du dépôt ou déjà déposée, elle revient
                    if (card.correctlyDropped === false) {
                        gsap.to(card, { x: 0, y: 0, duration: 0.3 });
                    }
                }
            }
        });
    });
}


function showRecoMiniGame() {
    const intro = document.getElementById('reco-intro');
    const miniGame = document.getElementById('reco-mini-game');

    gsap.to(intro, { opacity: 0, duration: 1, onComplete: () => {
            intro.style.display = 'none';

            gsap.to(miniGame, { opacity: 1, duration: 1 });

            setupInstallSimulation();
        }});
}

function setupInstallSimulation() {
    const button = document.getElementById('start-install-button');
    const fill = document.getElementById('progress-bar-fill');
    const status = document.getElementById('install-status');
    const success = document.getElementById('reco-success');

    if (!button) {
        console.error("Le bouton d'installation est introuvable.");
        return;
    }

    button.onclick = function() {
        if (button.disabled) return;
        button.disabled = true;

        const installDuration = 6;
        let progress = 0;
        const steps = [
            "Nettoyage du disque (Partitionnement...)",
            "Copie des fichiers système...",
            "Installation du noyau (Kernel)...",
            "Configuration des utilisateurs et logiciels...",
            "Finalisation et optimisation..."
        ];
        let stepIndex = 0;

        status.textContent = steps[stepIndex];

        gsap.to(fill, {
            width: '100%',
            duration: installDuration,
            ease: "power1.inOut",
            onUpdate: function() {
                progress = Math.round(this.progress() * 100);

                if (progress > 20 && stepIndex === 0) {
                    stepIndex++;
                    status.textContent = steps[stepIndex];
                } else if (progress > 40 && stepIndex === 1) {
                    stepIndex++;
                    status.textContent = steps[stepIndex];
                } else if (progress > 60 && stepIndex === 2) {
                    stepIndex++;
                    status.textContent = steps[stepIndex];
                } else if (progress > 85 && stepIndex === 3) {
                    stepIndex++;
                    status.textContent = steps[stepIndex];
                }
            },
            onComplete: function() {
                status.textContent = "Installation réussie ! Redémarrage du système...";
                button.textContent = "Redémarrer le PC (Sauvé !)";
                button.disabled = false;

                gsap.to(success, { opacity: 1, duration: 1, delay: 1 });
            }
        });
    };
}

// --- GESTION DES CARTES INTERACTIVES (APPLE STYLE) ---
window.toggleCard = function(card) {
    // Si la carte est déjà ouverte, on la ferme
    if (card.classList.contains('active')) {
        card.classList.remove('active');
        return;
    }

    // Sinon, on ferme toutes les autres avant d'ouvrir celle-ci (Effet Accordéon)
    document.querySelectorAll('.feature-card').forEach(c => c.classList.remove('active'));

    // On ouvre la carte cliquée
    card.classList.add('active');
}

// --- GESTION DU FLOU AU SCROLL (BLUR) ---
// On écoute le scroll pour flouter le WebGL quand on arrive en bas
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const documentHeight = document.body.scrollHeight - window.innerHeight;

    // On calcule un pourcentage de fin de page (ex: les derniers 500px)
    const triggerDistance = 800; // Commence à flouter 800px avant la fin
    const distanceToBottom = documentHeight - scrollY;

    const canvas = document.querySelector('#webgl');

    if (distanceToBottom < triggerDistance) {
        // Calcule le flou de 0px à 10px en fonction de la proximité du bas
        const blurAmount = Math.max(0, 10 - (distanceToBottom / triggerDistance) * 10);
        canvas.style.filter = `blur(${blurAmount}px)`;
    } else {
        canvas.style.filter = 'blur(0px)';
    }
});