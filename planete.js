// --- CONFIGURATION ---
const canvas = document.querySelector('#webgl-planet');
const scene = new THREE.Scene();
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
const textureLoader = new THREE.TextureLoader();

// --- DONNÉES DES ÉTABLISSEMENTS (Ajustées pour coller à la carte) ---
// type: 'college' (bleu), 'lycee' (rouge), 'ecole' (vert)
const schoolsData = [
    // HAUTS-DE-FRANCE
    { name: "Lycée Carnot", loc: "Bruay-la-Buissière", x: 0.6, y: 2.3, type: 'lycee' },
    { name: "Lycée pro. Jean Lurçat", loc: "Bruay-sur-l'Escaut", x: 0.9, y: 2.4, type: 'lycee' },
    { name: "Collège des 7 vallées", loc: "Hesdin", x: 0.3, y: 2.1, type: 'college' },

    // GRAND EST
    { name: "Lycée Jean Monnet", loc: "Strasbourg", x: 3.2, y: 1.0, type: 'lycee' },
    { name: "Lycée H. Nessel", loc: "Haguenau", x: 3.1, y: 1.2, type: 'lycee' },
    { name: "Collège Les Cuvelles", loc: "Vaucouleurs", x: 2.0, y: 0.9, type: 'college' },

    // ÎLE-DE-FRANCE
    { name: "Lycée S. de Beauvoir", loc: "Garges-lès-Gonesse", x: 0.6, y: 1.1, type: 'lycee' },

    // NORMANDIE & BRETAGNE
    { name: "Lycée Jacques Prevert", loc: "Pont-Audemer", x: -0.2, y: 1.2, type: 'lycee' },
    { name: "Collège Coat Mez", loc: "Bretagne", x: -2.8, y: 0.7, type: 'college' },

    // AUVERGNE-RHÔNE-ALPES
    { name: "Lycée La Martinière", loc: "Lyon", x: 1.8, y: -0.6, type: 'lycee' },
    { name: "Lycée de la Plaine de l’Ain", loc: "Ambérieu", x: 2.0, y: -0.5, type: 'lycee' },
    { name: "Collège Victor Vasarely", loc: "Grenoble", x: 2.1, y: -1.0, type: 'college' },
    { name: "Lycée Marie Curie", loc: "Echirolles", x: 2.1, y: -1.1, type: 'lycee' },
    { name: "Lycée Alain Borne", loc: "Montélimar", x: 1.7, y: -1.4, type: 'lycee' },
    { name: "Lycée Vincent d’Indy", loc: "Privas", x: 1.6, y: -1.3, type: 'lycee' },

    // OCCITANIE
    { name: "Cité scolaire Bellevue", loc: "Albi", x: 0.5, y: -1.9, type: 'lycee' },
    { name: "École élém. L. Barrié", loc: "Pechbonnieu", x: 0.3, y: -1.8, type: 'ecole' },

    // HORS CARTE (Simulé sur le côté)
    { name: "Collège Uporu", loc: "Polynésie", x: -5.0, y: -2.5, type: 'college' }
];

// Couleurs NIRD
const colors = {
    lycee: 0xff3333,   // Rouge
    college: 0x3366ff, // Bleu
    ecole: 0x4CAF50    // Vert
};

let schoolPoints = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let mapGroup, starsSystem;

// --- INITIALISATION ---
function init() {
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Position caméra (On regarde la carte de face)
    camera.position.set(0, 0, 10);
    scene.add(camera);

    createSpace();
    createMapBoard(); // Création de la carte
    animateEntrance();

    // Loop
    const clock = new THREE.Clock();
    function tick() {
        const time = clock.getElapsedTime();

        // Animation douce de l'univers
        if(starsSystem) starsSystem.rotation.z = time * 0.01;

        // La carte flotte doucement
        if(mapGroup) {
            mapGroup.rotation.y = Math.sin(time * 0.2) * 0.05;
            mapGroup.rotation.x = Math.cos(time * 0.15) * 0.02;
        }

        // Animation des points (Pulsation)
        schoolPoints.forEach((p, i) => {
            const scale = 1 + Math.sin(time * 3 + i) * 0.1;
            p.mesh.scale.setScalar(scale);
            p.glow.scale.setScalar(scale * 1.2);
        });

        handleRaycast();
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    tick();

    // Events
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
}

// --- CRÉATION DE LA CARTE ---
function createMapBoard() {
    mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // 1. Le panneau Carte (L'image que tu as donnée)
    // On charge la texture
    const mapTexture = textureLoader.load('assets/map-france.jpg');

    // Géométrie du plan (Ratio de l'image environ 4:3)
    const geometry = new THREE.PlaneGeometry(8, 6);
    const material = new THREE.MeshBasicMaterial({
        map: mapTexture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });

    const mapPlane = new THREE.Mesh(geometry, material);
    mapGroup.add(mapPlane);

    // Ajout d'un cadre technologique autour
    const frameGeo = new THREE.PlaneGeometry(8.2, 6.2);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x4CAF50, wireframe: true, transparent: true, opacity: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -0.01; // Juste derrière
    mapGroup.add(frame);

    // 2. Les Points Interactifs (Par dessus la carte)
    const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const glowGeo = new THREE.SphereGeometry(0.15, 16, 16);

    schoolsData.forEach(school => {
        const color = colors[school.type] || 0xffffff;

        const pointMat = new THREE.MeshBasicMaterial({ color: color });
        const glowMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.4 });

        const point = new THREE.Mesh(sphereGeo, pointMat);
        const glow = new THREE.Mesh(glowGeo, glowMat);

        // Positionnement (Z légèrement positif pour sortir de la carte)
        point.position.set(school.x, school.y, 0.1);
        glow.position.set(school.x, school.y, 0.1);

        point.userData = school; // Stockage des données pour le clic
        glow.userData = school;

        mapGroup.add(point);
        mapGroup.add(glow);

        // On garde une référence pour l'animation
        schoolPoints.push({ mesh: point, glow: glow });
    });
}

function createSpace() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const posArray = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        posArray[i] = (Math.random() - 0.5) * 50;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({size: 0.1, color: 0xffffff, transparent:true, opacity:0.6});
    starsSystem = new THREE.Points(starGeo, starMat);
    scene.add(starsSystem);
}

// --- ANIMATION D'ENTRÉE ---
function animateEntrance() {
    mapGroup.scale.set(0, 0, 0);
    gsap.to(mapGroup.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "back.out(1.7)" });

    // La caméra recule un peu pour vue d'ensemble
    camera.position.z = 2;
    gsap.to(camera.position, { z: 8, duration: 2, ease: "power2.out" });
}

// --- INTERACTION ---
function onMouseMove(event) {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;

    // Tooltip suit la souris
    const tooltip = document.getElementById('school-tooltip');
    tooltip.style.left = event.clientX + 'px';
    tooltip.style.top = event.clientY + 'px';
}

function handleRaycast() {
    raycaster.setFromCamera(mouse, camera);
    // On cherche l'intersection avec les points (sphères)
    const objectsToTest = schoolPoints.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(objectsToTest);
    const tooltip = document.getElementById('school-tooltip');

    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        const school = intersects[0].object.userData;

        tooltip.textContent = school.name;
        tooltip.classList.add('visible');

        // Effet de survol (grossissement)
        intersects[0].object.scale.setScalar(1.8);
    } else {
        document.body.style.cursor = 'default';
        tooltip.classList.remove('visible');

        // Reset taille (géré aussi dans la boucle tick, donc simple reset ici suffisant si pas d'anim complexe)
    }
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const objectsToTest = schoolPoints.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(objectsToTest);

    if (intersects.length > 0) {
        const school = intersects[0].object.userData;
        openDetails(school);
    }
}

function openDetails(school) {
    document.getElementById('detail-title').textContent = school.name;
    document.getElementById('detail-location').textContent = school.loc;

    // Change le style du badge selon le type
    const badge = document.querySelector('.stat-val');
    if(school.type === 'lycee') badge.style.color = '#ff3333';
    else if(school.type === 'college') badge.style.color = '#3366ff';
    else badge.style.color = '#4CAF50';

    const details = document.getElementById('school-details');
    details.classList.add('active');
}

window.closeSchoolDetails = function() {
    document.getElementById('school-details').classList.remove('active');
}

function onResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
}

init();