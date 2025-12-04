// CONFIGURATION
const counterElement = document.getElementById('counter-container');
const counterSound = document.getElementById('counter-sound');
const soundConsentButton = document.getElementById('sound-consent-button');

const target = 100000;
let count = 0;

// VARIABLES 3D
let scene, camera, renderer;
let screenMesh; // L'écran cible
let monitorGroup; // Le groupe complet (écran+pied) pour animer si besoin

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
        // FIN DU COMPTEUR -> LANCEMENT DIRECT
        counterSound.pause();
        startNarrative();
    }
}

window.activateSoundAndStart = function() {
    document.getElementById('sound-consent-button').style.display = 'none';
    document.getElementById('pre-launch-screen').style.opacity = '0';
    setTimeout(() => { document.getElementById('pre-launch-screen').style.display = 'none'; }, 500);

    counterSound.play().then(() => {
        counterElement.style.opacity = '1';
        updateCounter();
    }).catch(e => {
        console.log("Autoplay bloqué, lancement forcé");
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

        gsap.to(veil, { opacity: 0, duration: 1.5 });
    }, 1000);
}

// --- PARTIE 2 : 3D SCENE (SALLE INFORMATIQUE) ---
function initThreeJS() {
    const canvas = document.querySelector('#webgl');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02); // Brouillard noir

    const sizes = { width: window.innerWidth, height: window.innerHeight };

    camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(0, 1.5, 12); // Vue d'ensemble
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050505);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Lumière bleue (Windows) venant des écrans
    const screenLight = new THREE.PointLight(0x0078D7, 1.5, 20);
    screenLight.position.set(0, 2, -4);
    scene.add(screenLight);

    // --- CONSTRUCTION DES PC (GÉOMÉTRIE) ---
    // Matériaux
    const plasticMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Écran éteint/noir au fond
    // Le matériau de l'écran cible qui va changer de couleur
    window.targetScreenMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x0078D7, // Bleu Windows
        emissiveIntensity: 0.8
    });

    // Fonction pour créer un poste de travail complet
    function createPC(isTarget = false) {
        const group = new THREE.Group();

        // 1. Le Bureau (Table)
        const deskGeo = new THREE.BoxGeometry(3, 0.1, 1.5);
        const desk = new THREE.Mesh(deskGeo, plasticMat);
        desk.position.y = 0;
        group.add(desk);

        // 2. L'Écran (Monitor)
        const monitorGeo = new THREE.BoxGeometry(1.6, 1.0, 0.1);
        const mat = isTarget ? window.targetScreenMat : screenMat;
        const monitor = new THREE.Mesh(monitorGeo, mat);
        monitor.position.set(0, 0.6, -0.5);
        group.add(monitor);
        if(isTarget) screenMesh = monitor; // On garde la ref

        // Pied écran
        const standGeo = new THREE.BoxGeometry(0.2, 0.6, 0.1);
        const stand = new THREE.Mesh(standGeo, plasticMat);
        stand.position.set(0, 0.3, -0.55);
        group.add(stand);

        // 3. Clavier
        const kbGeo = new THREE.BoxGeometry(1.0, 0.05, 0.4);
        const kb = new THREE.Mesh(kbGeo, plasticMat);
        kb.position.set(0, 0.05, 0.2); // Posé sur la table devant
        group.add(kb);

        // 4. Souris
        const mouseGeo = new THREE.BoxGeometry(0.15, 0.04, 0.25);
        const mouse = new THREE.Mesh(mouseGeo, plasticMat);
        mouse.position.set(0.7, 0.05, 0.2); // À droite du clavier
        group.add(mouse);

        return group;
    }

    // Création du poste principal (Cible)
    monitorGroup = createPC(true);
    monitorGroup.position.set(0, 0, -5); // Position centrale fond
    scene.add(monitorGroup);

    // Création des autres PC autour (Ambiance salle)
    const positions = [
        {x: -4, z: -5, r: 0.2}, {x: 4, z: -5, r: -0.2}, // Voisins
        {x: -3, z: -2, r: 0.5}, {x: 3, z: -2, r: -0.5}, // Devant cotés
        {x: -5, z: -8, r: 0}, {x: 5, z: -8, r: 0}       // Fond
    ];

    positions.forEach(pos => {
        const pc = createPC(false);
        pc.position.set(pos.x, 0, pos.z);
        pc.rotation.y = pos.r;
        scene.add(pc);
    });

    // Loop
    const clock = new THREE.Clock();
    function tick() {
        // Petit effet de respiration de la lumière
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
            trigger: "#main-scroll-track", // On scrolle cette div géante
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Douceur
            // pin: true // Pas besoin de pin le track, on a une scene fixe
        }
    });

    // --- PHASE 1 : APPROCHE & ZOOM ÉCRAN ---
    // On avance la caméra vers Z = -3.5 (juste devant l'écran à Z=-5)
    tl.to(camera.position, { z: -3.5, y: 0.6, duration: 2 });

    // --- PHASE 2 : LE RÉCIT DÉFILE SUR L'ÉCRAN ---
    // Affiche Windows 10
    tl.to("#step-windows", { opacity: 1, duration: 1 })
        .to("#step-windows", { opacity: 0, delay: 1, duration: 0.5 }); // Disparait

    // Affiche Obsolescence + Change lumière en Rouge
    tl.call(() => { window.targetScreenMat.emissive.setHex(0xff3333); })
        .to("#step-obsolete", { opacity: 1, duration: 1 })
        .to("#step-obsolete", { opacity: 0, delay: 1, duration: 0.5 });

    // Affiche Coût
    tl.to("#step-cost", { opacity: 1, duration: 1 })
        .to("#step-cost", { opacity: 0, delay: 1, duration: 0.5 });

    // Affiche Combat (Goliath)
    tl.to("#step-fight", { opacity: 1, duration: 1 });

    // EFFET DE COMBAT (Secousses caméra + Ecran)
    tl.to(camera.position, {
        x: 0.1, duration: 0.1, yoyo: true, repeat: 10,
        ease: "rough({ template: none.out, strength: 1, points: 20, taper: 'none', randomize: true, clamp: false})"
    });

    // --- PHASE 3 : LIBÉRATION (LINUX) ---
    // La caméra recule et monte
    tl.to("#step-fight", { opacity: 0, duration: 0.5 }) // Cache texte combat
        .to(camera.position, { z: 5, y: 5, x: 0, duration: 3, ease: "power2.inOut" })
        .to(camera.rotation, { x: -0.5 }, "<"); // Regarde vers le bas

    // Changement d'ambiance : Le fond devient Vert Clair
    tl.to("body", { backgroundColor: "#e8f5e9", duration: 2 }, "<")
        .to(scene.fog, { color: "#e8f5e9", density: 0.01, duration: 2 }, "<")
        .call(() => {
            // L'écran devient Vert Linux
            window.targetScreenMat.emissive.setHex(0x4CAF50);
            renderer.setClearColor(0xe8f5e9);
        }, null, "<");

    // Affiche le final
    tl.to(".final-section", { opacity: 1, duration: 2 });
}