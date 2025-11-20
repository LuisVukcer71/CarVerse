import * as THREE from "https://esm.sh/three@0.160.0";

/**
 * Initialisiert die Szene, Kamera und Renderer
 */
export function initScene() {
  // Szene erstellen
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 80, 250);
  
  // Kamera erstellen
  const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.set(0, 4, 15);
  
  // Renderer erstellen
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  
  // Tone Mapping für bessere Beleuchtung
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  document.body.appendChild(renderer.domElement);
  
  // Beleuchtung hinzufügen
  setupLighting(scene);
  
  return { scene, camera, renderer };
}

/**
 * Erstellt eine visuelle Markierung für Lichtquellen (Development Helper)
 */
function createLightMarker(scene, position, color = 0xffff00, size = 0.5) {
  const geometry = new THREE.SphereGeometry(size, 16, 16);
  const material = new THREE.MeshBasicMaterial({ 
    color: color,
    emissive: color,
    emissiveIntensity: 1
  });
  const marker = new THREE.Mesh(geometry, material);
  marker.position.copy(position);
  scene.add(marker);
  return marker;
}

/**
 * Richtet die Beleuchtung der Szene ein (ohne Schatten)
 */
function setupLighting(scene) {
  // === 1. AMBIENT LIGHT (Grundhelligkeit) ===
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  // Kein Marker für Ambient (ist überall)

  // === 2. HEMISPHERE LIGHT (Himmel/Boden) ===
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 0.8);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);
  createLightMarker(scene, hemiLight.position, 0x00ffff, 1); // Cyan Marker

  // === 3. DIRECTIONAL LIGHT (Hauptlicht von oben) ===
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(0, 100, 0);
  scene.add(dirLight);
  createLightMarker(scene, dirLight.position, 0xffff00, 1.5); // Gelber Marker

  // === 4. HAUPT-POINT LIGHTS (Einer pro Wand) ===
  
  // Vorne (z negativ)
  const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 120);
  pointLight1.position.set(0, 20, -90);
  scene.add(pointLight1);
  createLightMarker(scene, pointLight1.position, 0xff0000, 1); // Rot

  // Links (x negativ)
  const pointLight2 = new THREE.PointLight(0xffffff, 1.5, 120);
  pointLight2.position.set(-90, 20, 0);
  scene.add(pointLight2);
  createLightMarker(scene, pointLight2.position, 0x00ff00, 1); // Grün

  // Hinten (z positiv)
  const pointLight3 = new THREE.PointLight(0xffffff, 1.5, 120);
  pointLight3.position.set(0, 20, 90);
  scene.add(pointLight3);
  createLightMarker(scene, pointLight3.position, 0x0000ff, 1); // Blau

  // Rechts (x positiv)
  const pointLight4 = new THREE.PointLight(0xffffff, 1.5, 120);
  pointLight4.position.set(90, 20, 0);
  scene.add(pointLight4);
  createLightMarker(scene, pointLight4.position, 0xff00ff, 1); // Magenta

  // === 5. INNEN-LICHTER (Von Mitte nach außen) ===
  // Diese beleuchten die Rückseiten der Autos
  
  const innerLight1 = new THREE.PointLight(0xffffff, 1.2, 100);
  innerLight1.position.set(0, 15, -50);
  scene.add(innerLight1);
  createLightMarker(scene, innerLight1.position, 0xffa500, 0.8); // Orange

  const innerLight2 = new THREE.PointLight(0xffffff, 1.2, 100);
  innerLight2.position.set(-50, 15, 0);
  scene.add(innerLight2);
  createLightMarker(scene, innerLight2.position, 0xffa500, 0.8); // Orange

  const innerLight3 = new THREE.PointLight(0xffffff, 1.2, 100);
  innerLight3.position.set(0, 15, 50);
  scene.add(innerLight3);
  createLightMarker(scene, innerLight3.position, 0xffa500, 0.8); // Orange

  const innerLight4 = new THREE.PointLight(0xffffff, 1.2, 100);
  innerLight4.position.set(50, 15, 0);
  scene.add(innerLight4);
  createLightMarker(scene, innerLight4.position, 0xffa500, 0.8); // Orange

  // === 6. ECKEN-LICHTER ===
  const cornerLights = [
    { x: -70, z: -70 },  // Vorne-Links
    { x: 70, z: -70 },   // Vorne-Rechts
    { x: -70, z: 70 },   // Hinten-Links
    { x: 70, z: 70 }     // Hinten-Rechts
  ];

  cornerLights.forEach(pos => {
    const fillLight = new THREE.PointLight(0xffffff, 0.8, 90);
    fillLight.position.set(pos.x, 15, pos.z);
    scene.add(fillLight);
    createLightMarker(scene, fillLight.position, 0xffffff, 0.6); // Weiß
  });

  // === 7. ZENTRAL-SPOTLIGHT ===
  const spotLight = new THREE.SpotLight(0xffffff, 1.5);
  spotLight.position.set(0, 60, 0);
  spotLight.angle = Math.PI / 3;
  spotLight.penumbra = 0.2;
  spotLight.decay = 1.5;
  spotLight.distance = 200;
  scene.add(spotLight);
  scene.add(spotLight.target);
  createLightMarker(scene, spotLight.position, 0xffff00, 1.2); // Gelb

  // === 8. RIM LIGHTS (Konturenbeleuchtung) ===
  const rimLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  rimLight1.position.set(-50, 80, -50);
  scene.add(rimLight1);
  createLightMarker(scene, rimLight1.position, 0xff69b4, 1); // Pink

  const rimLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
  rimLight2.position.set(50, 80, 50);
  scene.add(rimLight2);
  createLightMarker(scene, rimLight2.position, 0xff69b4, 1); // Pink

  console.log("✅ Beleuchtung mit visuellen Markern geladen");
  console.log("🔴 Rot = Vorne | 🟢 Grün = Links | 🔵 Blau = Hinten | 🟣 Magenta = Rechts");
  console.log("🟠 Orange = Innen-Lichter | ⚪ Weiß = Ecken | 🟡 Gelb = Zentral | 🩷 Pink = Rim");
}