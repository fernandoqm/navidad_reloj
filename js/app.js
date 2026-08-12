import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.getElementById("earthCanvas");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0.18, 4.9);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.05;
controls.maxDistance = 6.2;
controls.target.set(0, 0.18, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;

scene.add(new THREE.AmbientLight(0x9fc5ff, 0.28));

const sun = new THREE.DirectionalLight(0xffffff, 3.0);
sun.position.set(5, 3, 4);
scene.add(sun);

const fill = new THREE.DirectionalLight(0x5b8dff, 0.32);
fill.position.set(-4, -1, -3);
scene.add(fill);

const loader = new THREE.TextureLoader();
const earthTextureUrl = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
const earthBumpUrl = "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg";
const earthSpecularUrl = "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg";
const cloudsUrl = "https://threejs.org/examples/textures/planets/earth_clouds_1024.png";

const earthGroup = new THREE.Group();
scene.add(earthGroup);
earthGroup.rotation.z = THREE.MathUtils.degToRad(-23.4);

const earthGeometry = new THREE.SphereGeometry(1.42, 96, 96);

const earthMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(earthTextureUrl),
  bumpMap: loader.load(earthBumpUrl),
  bumpScale: 0.035,
  specularMap: loader.load(earthSpecularUrl),
  specular: new THREE.Color(0x3f5875),
  shininess: 8
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);

// ---------- Luz parpadeante sobre Costa Rica ----------
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const costaRicaPos = latLonToVector3(9.75, -83.75, 1.435);

const costaRicaLight = new THREE.Mesh(
  new THREE.SphereGeometry(0.014, 12, 12),
  new THREE.MeshBasicMaterial({ color: 0xffe066 })
);
costaRicaLight.position.copy(costaRicaPos);
earth.add(costaRicaLight);

const costaRicaGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.032, 12, 12),
  new THREE.MeshBasicMaterial({
    color: 0xffcf4d,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
costaRicaGlow.position.copy(costaRicaPos);
earth.add(costaRicaGlow);

const cloudMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(cloudsUrl),
  transparent: true,
  opacity: 0.72,
  depthWrite: false
});

const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(1.455, 96, 96),
  cloudMaterial
);
earthGroup.add(clouds);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.49, 96, 96),
  new THREE.MeshBasicMaterial({
    color: 0x6cbcff,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  })
);
earthGroup.add(atmosphere);

// ---------- Estrellas ----------
const starGeometry = new THREE.BufferGeometry();
const starCount = 1800;
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const r = 18 + Math.random() * 25;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.cos(phi);
  positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}

starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, sizeAttenuation: true })
);
scene.add(stars);

// ---------- Estrellas fugaces (cruzan el cielo, pasan detrás de la Tierra) ----------
const shootingStars = [];
let nextShootingStarAt = 1.5;

function spawnShootingStar(elapsed) {
  const length = 0.7 + Math.random() * 0.5;
  const streak = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 0.006, length, 6, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  const side = Math.random() < 0.5 ? -1 : 1;
  const start = new THREE.Vector3(
    side * (9 + Math.random() * 4),
    2 + Math.random() * 5,
    -6 - Math.random() * 14
  );
  const target = new THREE.Vector3(
    (Math.random() - 0.5) * 3,
    (Math.random() - 0.5) * 2,
    -4 - Math.random() * 10
  );
  const dir = target.clone().sub(start).normalize();

  streak.position.copy(start);
  streak.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  streak.userData.dir = dir;
  streak.userData.speed = 9 + Math.random() * 5;
  streak.userData.birth = elapsed;
  streak.userData.life = 1.1 + Math.random() * 0.6;

  scene.add(streak);
  shootingStars.push(streak);
}

// ---------- Villa de Santa (assets de Kenney "Holiday Kit", CC0) ----------
const northPole = new THREE.Group();
northPole.position.set(0, 1.42, 0);
earthGroup.add(northPole);

const GROUND_Y = 0.08;

// Todo el conjunto (plataforma + aldea + luz) va dentro de este grupo para
// poder achicarlo de golpe sin tener que recalcular cada posición.
const polarVillage = new THREE.Group();
polarVillage.scale.setScalar(0.25);
northPole.add(polarVillage);

const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(0.32, 0.38, 0.07, 32),
  new THREE.MeshStandardMaterial({ color: 0xf6fbff, roughness: 0.9 })
);
platform.position.y = 0.045;
polarVillage.add(platform);

const villageLight = new THREE.PointLight(0xffc65e, 1.6, 2.2);
villageLight.position.set(0, 0.6, 0.1);
polarVillage.add(villageLight);

const MODEL_SCALE = 0.2;
const village = new THREE.Group();
village.position.set(0, GROUND_Y, 0);
village.scale.setScalar(MODEL_SCALE);
polarVillage.add(village);

const gltfLoader = new GLTFLoader();
const modelCache = {};

function loadModel(name) {
  if (!modelCache[name]) {
    modelCache[name] = new Promise((resolve, reject) => {
      gltfLoader.load(
        `assets/models/holiday/${name}.glb`,
        (gltf) => resolve(gltf.scene),
        undefined,
        reject
      );
    });
  }
  return modelCache[name];
}

function instance(template, x, z, opts = {}) {
  const obj = template.clone(true);
  obj.position.set(x, opts.y ?? 0, z);
  if (opts.rotationY) obj.rotation.y = opts.rotationY;
  if (opts.scale) obj.scale.setScalar(opts.scale);
  return obj;
}

async function buildSantaVillage() {
  const [
    doorway, windowA, windowB, wallWreath, roof,
    treeA, treeB, treeDecorated, snowman, reindeer,
    presentCube, presentRound, lantern, bench, sled,
    locomotive, tender, wagon, snowPile, candyRed, candyGreen
  ] = await Promise.all([
    loadModel("cabin-doorway"), loadModel("cabin-window-a"), loadModel("cabin-window-b"),
    loadModel("cabin-wall-wreath"), loadModel("cabin-roof-snow-chimney"),
    loadModel("tree-snow-a"), loadModel("tree-snow-b"), loadModel("tree-decorated-snow"),
    loadModel("snowman"), loadModel("reindeer"),
    loadModel("present-a-cube"), loadModel("present-a-round"), loadModel("lantern"),
    loadModel("bench"), loadModel("sled"),
    loadModel("train-locomotive"), loadModel("train-tender"), loadModel("train-wagon"),
    loadModel("snow-pile"), loadModel("candy-cane-red"), loadModel("candy-cane-green")
  ]);

  // Cabaña: 4 piezas de pared en el mismo origen, rotadas 90° cada una
  // (así calzan sin huecos, tal como las diseñó Kenney), más el techo encima.
  const cabin = new THREE.Group();
  cabin.add(instance(doorway, 0, 0, { rotationY: 0 }));
  cabin.add(instance(wallWreath, 0, 0, { rotationY: Math.PI / 2 }));
  cabin.add(instance(windowB, 0, 0, { rotationY: Math.PI }));
  cabin.add(instance(windowA, 0, 0, { rotationY: -Math.PI / 2 }));
  cabin.add(instance(roof, 0, 0, { y: 1 }));
  cabin.position.set(0, 0, -0.9);
  village.add(cabin);

  village.add(instance(treeA, 1.15, -0.25, { scale: 1.05 }));
  village.add(instance(treeB, -1.15, -0.45));
  village.add(instance(treeA, 1.05, 0.95, { scale: 0.9, rotationY: 1.1 }));
  village.add(instance(treeB, -1.05, 0.85, { scale: 1.1, rotationY: 2.4 }));

  village.add(instance(treeDecorated, 0, 0.55));
  village.add(instance(presentCube, 0.26, 0.75, { rotationY: 0.4 }));
  village.add(instance(presentRound, -0.24, 0.68, { rotationY: 1.2 }));

  village.add(instance(snowman, 0.6, -0.95, { rotationY: -0.6 }));
  village.add(instance(reindeer, 0.95, -0.65, { rotationY: -1.4 }));

  village.add(instance(lantern, 0.5, -0.05));
  village.add(instance(lantern, -0.5, -0.05));
  village.add(instance(bench, 0.7, 0.3, { rotationY: -2.2 }));
  village.add(instance(sled, -0.7, -0.05, { rotationY: 0.5 }));

  village.add(instance(candyRed, 0.16, -0.15));
  village.add(instance(candyGreen, -0.16, -0.15));

  village.add(instance(snowPile, 0.45, -1.35, { scale: 0.9 }));
  village.add(instance(snowPile, -0.95, 0.15, { scale: 1.1 }));
  village.add(instance(snowPile, 0.85, -0.15, { scale: 0.8 }));

  // Piezas alineadas en +Z (la locomotora al frente) para que coincida
  // con la orientación que calcula el loop de animación.
  const trainGroup = new THREE.Group();
  trainGroup.add(instance(locomotive, 0, 0, { rotationY: -Math.PI / 2 }));
  trainGroup.add(instance(tender, 0, -0.55, { rotationY: -Math.PI / 2 }));
  trainGroup.add(instance(wagon, 0, -0.95, { rotationY: -Math.PI / 2 }));
  village.add(trainGroup);

  return trainGroup;
}

let trainRig = null;
buildSantaVillage()
  .then((trainGroup) => { trainRig = trainGroup; })
  .catch((err) => console.error("No se pudo cargar la aldea:", err));

// ---------- Controles UI ----------
let autoMessages = true;
let messageIndex = 0;
let messageTimer;

const messages = [
  ["🦌", "Reporte de los renos", "¡Los renos ya están en el gimnasio! Rudolph pidió vacaciones después de tres vueltas... pero nadie le aprobó el permiso."],
  ["🧝", "Noticias del taller", "Los elfos están fabricando juguetes a toda velocidad. Uno pidió café... y le dieron chocolate caliente. Problema resuelto."],
  ["🎁", "Producción de regalos", "La fábrica va al 98%. La máquina de envolver se detuvo porque un elfo se quedó dormido encima. Recursos Humanos ya intervino."],
  ["🎅", "Oficina de Santa", "Santa está revisando la lista. Dice que en Costa Rica hay mucha gente esperando regalos... y también tamales. Está tomando nota."],
  ["☕", "Pausa oficial", "El comité de elfos decretó cinco minutos de chocolate caliente. Duraron siete. Nadie se quejó."],
  ["🚂", "Tren navideño", "El tren polar ya encendió motores. El maquinista dice que todo está listo, excepto una galleta que desapareció misteriosamente."],
  ["🇨🇷", "Mensaje para Costa Rica", "Desde el Polo Norte reportan que el cargamento de espíritu navideño para Costa Rica ya salió. ¡Favor dejar espacio para los tamales!"],
  ["🎄", "Alerta en la aldea", "Se escucharon campanas en la plaza. No era Santa. Era un elfo practicando para el concierto de Navidad."],
  ["📦", "Control de calidad", "Todos los regalos pasaron la inspección. Uno no pasó porque decía 'para el próximo año'. El elfo responsable está recibiendo capacitación."],
  ["🥕", "Crisis de zanahorias", "Los renos reportaron que faltan zanahorias. Santa respondió: 'Revisen la bodega'. La bodega respondió: '¿Cuál bodega?'"],
];

const polarFacts = [
  "En el Polo Norte nadie pregunta qué día es. Todos saben que se acerca Navidad.",
  "Los elfos trabajan rápido, pero jamás rechazan una buena taza de chocolate caliente.",
  "La ruta Costa Rica → Polo Norte tiene prioridad especial en diciembre. 🎅",
  "La fábrica tiene una regla: si suena una campana, alguien debe sonreír.",
  "Rudolph asegura que puede volar sin GPS. Santa todavía no está convencido.",
  "La estación polar tiene salida de emergencia... por si llegan demasiados regalos."
];

// ---------- Burbujas de conversación de la aldea ----------
const villageChatterLines = [
  "🎅 ¡Ho ho ho! ¿Alguien vio mis lentes? Los necesito para leer la lista.",
  "🧝 Turno de café en el taller... otra vez.",
  "🦌 Rudolph dice que su nariz brilla más los lunes.",
  "❄️ Aquí nieva tanto que hasta los pingüinos se confunden de polo.",
  "🎄 El árbol pidió vacaciones de las luces parpadeantes.",
  "🇨🇷 Alguien preguntó si hay tamales en la ruta a Costa Rica.",
  "🎁 Un regalo se escapó... lo estamos persiguiendo.",
  "🔔 Las campanas están practicando para el solo de Navidad.",
  "🧝 Recuerden: ¡para Dana siempre son libros!!!",
  "☃️ El muñeco de nieve pidió más botones. Nadie sabe para qué.",
  "🚂 El tren pitó tres veces... nadie sabe por qué, pero sonó navideño.",
  "🎅 Santa revisó la lista dos veces. La tercera fue solo para confirmar.",
  "🧝 Un elfo se comió una galleta 'de prueba'... iban 47 pruebas hoy.",
  "🦌 Rudolph exige que le digan 'Capitán Rudolph' desde ahora.",
  "❄️ Se declaró estado de emergencia: alguien perdió un guante. Solo uno.",
  "🎁 El regalo #4,382,011 se envolvió con la etiqueta al revés. Nadie lo notó.",
  "🧦 Las medias navideñas están en huelga. Piden más chimenea.",
  "🔔 Una campana sonó sola. Los elfos culpan al espíritu navideño... o al viento.",
  "🎅 Santa intentó bajar por la chimenea de práctica. Se quedó atascado 3 veces.",
  "🧝 Turno extra de villancicos: alguien inventó una versión en reggaetón.",
  "🦌 Los renos votaron: el trineo necesita aire acondicionado.",
  "❄️ Se perdió un copo de nieve VIP. Recompensa: chocolate caliente.",
  "🎄 El árbol de la plaza pidió un aumento de luces. Se lo negaron... por ahora.",
  "🧝 Alerta: alguien envolvió el gato del taller como si fuera un regalo."
];

let lastChatterIndex = -1;
function showVillageChatter() {
  const bubble = document.getElementById("villageChatter");
  const text = document.getElementById("villageChatterText");
  if (!bubble || !text) return;

  let index = Math.floor(Math.random() * villageChatterLines.length);
  if (villageChatterLines.length > 1 && index === lastChatterIndex) {
    index = (index + 1) % villageChatterLines.length;
  }
  lastChatterIndex = index;

  text.textContent = villageChatterLines[index];
  bubble.classList.add("show");
  setTimeout(() => bubble.classList.remove("show"), 4000);
}

function scheduleVillageChatter() {
  setTimeout(() => {
    showVillageChatter();
    scheduleVillageChatter();
  }, 6000 + Math.random() * 4000);
}

setTimeout(() => {
  showVillageChatter();
  scheduleVillageChatter();
}, 2500);

function showMessage(index) {
  messageIndex = (index + messages.length) % messages.length;
  const [icon, title, text] = messages[messageIndex];

  document.getElementById("messageIcon").textContent = icon;
  document.getElementById("messageTitle").textContent = title;
  document.getElementById("messageText").textContent = text;

  document.getElementById("polarFact").textContent =
    polarFacts[messageIndex % polarFacts.length];

  showToast(`${icon} ${title}: ${text}`);
}

function nextMessage() {
  showMessage(messageIndex + 1);
}

function startMessageTimer() {
  clearInterval(messageTimer);
  if (autoMessages) {
    messageTimer = setInterval(nextMessage, 8500);
  }
}

document.getElementById("nextMessage").addEventListener("click", nextMessage);

document.querySelectorAll(".hotspot").forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    showToast(hotspot.dataset.message);
  });
});

document.getElementById("toggleAutoMessage").addEventListener("click", () => {
  autoMessages = !autoMessages;
  startMessageTimer();
  showToast(autoMessages ? "💬 Noticias automáticas activadas." : "💬 Noticias automáticas pausadas.");
});

document.getElementById("toggleRotate").addEventListener("click", () => {
  controls.autoRotate = !controls.autoRotate;
  showToast(controls.autoRotate ? "🌎 La Tierra vuelve a girar." : "⏸️ Tierra pausada.");
});

document.getElementById("toggleInfo").addEventListener("click", () => {
  document.getElementById("infoPanel").classList.remove("hidden");
});

document.getElementById("closeInfo").addEventListener("click", () => {
  document.getElementById("infoPanel").classList.add("hidden");
});

let toastTimeout;
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 5200);
}

// ---------- Cuenta regresiva: Costa Rica UTC-6 ----------
const christmas = new Date("2026-12-25T00:00:00-06:00");

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  let diff = christmas.getTime() - now.getTime();

  if (diff <= 0) {
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    document.querySelector(".subtitle").textContent = "¡Feliz Navidad desde Costa Rica! 🎄🇨🇷";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ---------- Estrellas HTML para profundidad visual ----------
const starContainer = document.getElementById("stars");
for (let i = 0; i < 90; i++) {
  const star = document.createElement("span");
  star.className = "star";
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.animationDelay = `${Math.random() * 3}s`;
  star.style.opacity = `${0.15 + Math.random() * 0.65}`;
  starContainer.appendChild(star);
}

// ---------- Resize + render ----------
function resize() {
  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 600;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();
let lastElapsed = 0;

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const delta = elapsed - lastElapsed;
  lastElapsed = elapsed;

  // Estrellas fugaces: nacen, cruzan el cielo (pasando detrás de la Tierra) y se apagan.
  if (elapsed > nextShootingStarAt) {
    spawnShootingStar(elapsed);
    nextShootingStarAt = elapsed + 1.5 + Math.random() * 3;
  }
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const streak = shootingStars[i];
    const age = elapsed - streak.userData.birth;
    const lifeT = age / streak.userData.life;
    if (lifeT >= 1) {
      scene.remove(streak);
      streak.geometry.dispose();
      streak.material.dispose();
      shootingStars.splice(i, 1);
      continue;
    }
    streak.position.addScaledVector(streak.userData.dir, streak.userData.speed * delta);
    streak.material.opacity = lifeT < 0.15
      ? lifeT / 0.15
      : lifeT > 0.7
        ? Math.max(0, 1 - (lifeT - 0.7) / 0.3)
        : 1;
  }

  // Rotación independiente y lenta de la Tierra.
  earth.rotation.y = elapsed * 0.035;
  clouds.rotation.y = elapsed * 0.047;

  // Luz parpadeante sobre Costa Rica.
  const crBlinkOn = Math.floor(elapsed / 0.6) % 2 === 0;
  costaRicaLight.visible = crBlinkOn;
  costaRicaGlow.visible = crBlinkOn;

  // Tren navideño recorriendo la aldea en bucle.
  if (trainRig) {
    const angle = elapsed * 0.35;
    const rx = 1.55;
    const rz = 1.45;
    trainRig.position.set(Math.cos(angle) * rx, 0, Math.sin(angle) * rz);
    const dirX = -rx * Math.sin(angle);
    const dirZ = rz * Math.cos(angle);
    trainRig.rotation.y = Math.atan2(dirX, dirZ);
  }

  controls.update();
  renderer.render(scene, camera);
}

showMessage(0);
startMessageTimer();
animate();

setTimeout(() => {
  document.getElementById("loading").classList.add("done");
}, 900);

window.addEventListener("error", (event) => {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.innerHTML = "<div style=\"font-size:42px\">🎄</div><div>La fábrica necesita conexión para cargar la Tierra 3D.</div><div style=\"font-family:Montserrat,Arial,sans-serif;font-size:11px;color:#9db0c5;margin-top:8px\">Si abriste index.html directamente, publícalo en GitHub Pages o usa un servidor local.</div>";
  }
});
