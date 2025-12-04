// CONFIGURATION
const counterElement = document.getElementById('counter-container');
const counterSound = document.getElementById('counter-sound');
const soundConsentButton = document.getElementById('sound-consent-button');

const target = 100000;
let count = 0;

// VARIABLES 3D
let scene, camera, renderer;
let screenMesh;
let monitorGroup;

const colors = {
    blue: new THREE.Color(0x0078D7),
    red: new THREE.Color(0xff3333),
    green: new THREE.Color(0x4CAF50),
    dark: new THREE.Color(0x050505),
    light: new THREE.Color(0xe8f5e9)
};
const bgState = { color: new THREE.Color(0x050505) };

// --- GESTION AUDIO SCROLL ---
const musicAudio = document.getElementById('background-music');
let audioUnlocked = false;


// --- PARTIE 1 : COMPTEUR ---
function formatNumber(num) { return num.toLocaleString('fr-FR') + ' €'; }

function updateCounter() {
    let step = Math.floor(count / 80) + 50;
    if(count > target * 0.9) step = 500;

    count = Math.min(target, count + step);
    counterElement.textContent = formatNumber(count);

    if (count < target) {
        requestAnimationFrame(updateCounter);
    } else {
        counterSound.pause();
        startNarrative();
    }
}

window.activateSoundAndStart = function() {
    // Applique l'effet haptique épuré
    soundConsentButton.classList.add('sound-active');
    soundConsentButton.textContent = "Son Activé. Lancement...";
    soundConsentButton.disabled = true;

    document.getElementById('pre-launch-screen').style.opacity = '0';
    setTimeout(() => { document.getElementById('pre-launch-screen').style.display = 'none'; }, 500);

    // Tente de démarrer le son du compteur pour débloquer l'audio
    counterSound.play().then(() => {
        audioUnlocked = true;
        counterElement.style.opacity = '1';
        updateCounter();
    }).catch(e => {
        // En cas d'échec de lecture automatique, l'audio est débloqué
        // mais le son ne démarre que sur une action explicite. On continue.
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

        // DÉMARRAGE DE LA LOGIQUE AUDIO SCROLL
        setupScrollAudio();

        gsap.to(veil, { opacity: 0, duration: 1.5 });
    }, 1000);
}

// --- NOUVELLE FONCTION : GESTION DE L'AUDIO PAR LE SCROLL ---
function setupScrollAudio() {
    if (!musicAudio || !audioUnlocked) {
        console.warn("Musique non disponible ou non débloquée.");
        return;
    }

    // Tente de démarrer la musique (débloquée par le clic initial)
    musicAudio.play().catch(e => console.error("Erreur lecture musique: ", e));

    // Utiliser ScrollTrigger pour gérer l'entrée/sortie de la zone 3D
    ScrollTrigger.create({
        trigger: "#main-scroll-track",
        start: "top top",
        end: "bottom bottom",

        onEnter: () => {
            // L'utilisateur entre dans la zone 3D : Fondu d'entrée
            gsap.to(musicAudio, { volume: 0.5, duration: 2, ease: "power1.out" });
            if (musicAudio.paused) musicAudio.play();
        },
        onLeave: () => {
            // L'utilisateur scroll vers le bas après l'expérience 3D : Fondu de sortie
            gsap.to(musicAudio, { volume: 0, duration: 2, ease: "power1.in", onComplete: () => {
                    if(musicAudio) musicAudio.pause();
                } });
        },
        onEnterBack: () => {
            // L'utilisateur revient dans la zone 3D par le bas : Fondu d'entrée
            gsap.to(musicAudio, { volume: 0.5, duration: 2, ease: "power1.out" });
            if (musicAudio.paused) musicAudio.play();
        },
        onLeaveBack: () => {
            // L'utilisateur remonte vers l'intro : Fondu de sortie
            gsap.to(musicAudio, { volume: 0, duration: 1, ease: "power1.in", onComplete: () => {
                    if(musicAudio) musicAudio.pause();
                } });
        }
    });
}


// --- PARTIE 2 : 3D SCENE ---

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
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

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
        const mat = isTarget ? window.targetScreenMat : screenMat;
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.1), mat);
        monitor.position.set(0, 0.6, -0.5);
        group.add(monitor);
        if(isTarget) screenMesh = monitor;
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

    const positions = [
        {x: -4, z: -5, r: 0.2}, {x: 4, z: -5, r: -0.2},
        {x: -3, z: -2, r: 0.5}, {x: 3, z: -2, r: -0.5},
        {x: -5, z: -8, r: 0}, {x: 5, z: -8, r: 0}
    ];
    positions.forEach(pos => {
        const pc = createPC(false);
        pc.position.set(pos.x, 0, pos.z);
        pc.rotation.y = pos.r;
        scene.add(pc);
    });

    const clock = new THREE.Clock();
    function tick() {
        screenLight.intensity = 1.5 + Math.sin(clock.getElapsedTime()*2) * 0.3;
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
    });
}

// --- PARTIE 3 : SCROLL NARRATIF (GSAP) ---
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

    // --- PHASE 1 : APPROCHE & ZOOM ÉCRAN ---
    tl.to(camera.position, { z: -3.5, y: 0.6, duration: 2 }, 0);

    // --- PHASE 2 : LE RÉCIT DÉFILE SUR L'ÉCRAN ---
    tl.to("#step-windows", { opacity: 1, duration: 1 })
        .to("#step-windows", { opacity: 0, delay: 1, duration: 0.5 });

    tl.to(window.targetScreenMat.emissive, {
        r: colors.red.r, g: colors.red.g, b: colors.red.b,
        duration: 0.5
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

    // --- PHASE 3 : LIBÉRATION (LINUX) ---
    tl.to("#step-fight", { opacity: 0, duration: 0.5 })
        .to(camera.position, { z: 5, y: 5, x: 0, duration: 3, ease: "power2.inOut" })
        .to(camera.rotation, { x: -0.5 }, "<");

    tl.to("body", { backgroundColor: "#e8f5e9", duration: 2 }, "<");

    tl.to(scene.fog.color, {
        r: colors.light.r, g: colors.light.g, b: colors.light.b,
        duration: 2
    }, "<");

    tl.to(bgState.color, {
        r: colors.light.r, g: colors.light.g, b: colors.light.b,
        duration: 2,
        onUpdate: () => renderer.setClearColor(bgState.color)
    }, "<");

    tl.to(window.targetScreenMat.emissive, {
        r: colors.green.r, g: colors.green.g, b: colors.green.b,
        duration: 2
    }, "<");

    tl.to(".final-section", { opacity: 1, duration: 2 });
}