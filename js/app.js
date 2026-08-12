import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.getElementById("earthCanvas");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0.18, 4.25);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2.65;
controls.maxDistance = 5.4;
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

// ---------- Polo Norte estilizado ----------
const northPole = new THREE.Group();
northPole.position.set(0, 1.42, 0);
earthGroup.add(northPole);

// Plataforma nevada
const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(0.25, 0.30, 0.07, 32),
  new THREE.MeshStandardMaterial({ color: 0xf6fbff, roughness: 0.9 })
);
platform.position.y = 0.045;
northPole.add(platform);

// Ciudad
function addBuilding(x, z, h, w, color, roofColor) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, w),
    new THREE.MeshStandardMaterial({ color, roughness: 0.75 })
  );
  body.position.y = h / 2 + 0.07;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(w * 0.72, h * 0.42, 4),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 })
  );
  roof.position.y = h + 0.28;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  // Ventanas cálidas
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xffd66b });
  for (const y of [0.28, 0.55]) {
    if (y < h) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.16, w * 0.18), windowMat);
      win.position.set(0, y, w / 2 + 0.006);
      group.add(win);
    }
  }

  group.position.set(x, 0, z);
  northPole.add(group);
  return group;
}

addBuilding(-0.22, -0.08, 0.42, 0.18, 0xb22a34, 0x1f6b48);
addBuilding(0.03, -0.02, 0.57, 0.22, 0x326e9d, 0xb62c37);
addBuilding(0.24, 0.06, 0.36, 0.17, 0x9d2632, 0x1f6b48);
addBuilding(-0.02, 0.20, 0.48, 0.19, 0x8c6c32, 0xb62c37);

// Torre central
const tower = new THREE.Group();
const towerBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.11, 0.62, 20),
  new THREE.MeshStandardMaterial({ color: 0xc28a38, roughness: 0.55, metalness: 0.15 })
);
towerBody.position.y = 0.39;
tower.add(towerBody);

const towerRoof = new THREE.Mesh(
  new THREE.ConeGeometry(0.14, 0.28, 20),
  new THREE.MeshStandardMaterial({ color: 0xb72d37, roughness: 0.7 })
);
towerRoof.position.y = 0.84;
tower.add(towerRoof);

const starTop = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.08, 0),
  new THREE.MeshBasicMaterial({ color: 0xffd65b })
);
starTop.position.y = 1.02;
tower.add(starTop);
northPole.add(tower);

// Árbol central
const tree = new THREE.Group();
for (let i = 0; i < 3; i++) {
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.13 - i * 0.025, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0x1d754b, roughness: 0.8 })
  );
  cone.position.y = 0.18 + i * 0.14;
  tree.add(cone);
}
const trunk = new THREE.Mesh(
  new THREE.CylinderGeometry(0.025, 0.03, 0.13, 10),
  new THREE.MeshStandardMaterial({ color: 0x70431f })
);
trunk.position.y = 0.08;
tree.add(trunk);
tree.position.set(0.30, 0, -0.16);
northPole.add(tree);

// Casita de Santa
const santaHouse = new THREE.Group();
const houseBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.27, 0.20, 0.25),
  new THREE.MeshStandardMaterial({ color: 0x9b2630, roughness: 0.8 })
);
houseBody.position.y = 0.17;
santaHouse.add(houseBody);
const houseRoof = new THREE.Mesh(
  new THREE.ConeGeometry(0.22, 0.22, 4),
  new THREE.MeshStandardMaterial({ color: 0xf3f5f6, roughness: 0.9 })
);
houseRoof.position.y = 0.38;
houseRoof.rotation.y = Math.PI / 4;
santaHouse.add(houseRoof);
santaHouse.position.set(-0.28, 0, 0.18);
northPole.add(santaHouse);

// Iluminación cálida sobre la aldea
const villageLight = new THREE.PointLight(0xffc65e, 1.8, 2.4);
villageLight.position.set(0, 0.7, 0.15);
northPole.add(villageLight);

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

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Rotación independiente y lenta de la Tierra.
  earth.rotation.y = elapsed * 0.035;
  clouds.rotation.y = elapsed * 0.047;

  // Pequeño movimiento de la aldea para que tenga vida.
  northPole.rotation.y = Math.sin(elapsed * 0.25) * 0.025;

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
