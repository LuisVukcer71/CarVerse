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
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 4, 15);

  // Renderer erstellen
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  document.body.appendChild(renderer.domElement);

  setupLighting(scene);

  return { scene, camera, renderer };
}

function createLightMarker(
  scene,
  position,
  color = 0xffff00,
  size = 0.5,
  debug = false
) {
  if (!debug) return; // Nur anzeigen wenn debug=true

  const geometry = new THREE.SphereGeometry(size, 16, 16);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1,
  });
  const marker = new THREE.Mesh(geometry, material);
  marker.position.copy(position);
  scene.add(marker);
  return marker;
}

function setupLighting(scene) {
  const lichtkugeln = false; // für debug kugeln

  // Grundhelligkeit
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // HemisphereLight
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.7);
  scene.add(hemiLight);
  createLightMarker(scene, hemiLight.position, 0x00ffff, 1, lichtkugeln);

  // DirectionalLight

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight1.position.set(0, 5, -125);
  scene.add(dirLight1);
  createLightMarker(scene, dirLight1.position, 0xff6b6b, 1, lichtkugeln);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight2.position.set(-125, 5, 0);
  scene.add(dirLight2);
  createLightMarker(scene, dirLight2.position, 0x4ecdc4, 1, lichtkugeln);

  const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight3.position.set(0, 5, 125);
  scene.add(dirLight3);
  createLightMarker(scene, dirLight3.position, 0xffe66d, 1, lichtkugeln);

  const dirLight4 = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight4.position.set(125, 5, 0);
  scene.add(dirLight4);
  createLightMarker(scene, dirLight4.position, 0x95e1d3, 1, lichtkugeln);

  const dirLight5 = new THREE.DirectionalLight(0xffffff, 4);
  dirLight4.position.set(0, 40, 0);
  scene.add(dirLight5);
  createLightMarker(scene, dirLight5.position, 0x95e1d3, 1, lichtkugeln);

  // Pointlights

  const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 180);
  pointLight1.position.set(0, 30, -85);
  scene.add(pointLight1);
  createLightMarker(scene, pointLight1.position, 0xff0000, 0.8, lichtkugeln);

  const pointLight2 = new THREE.PointLight(0xffffff, 1.5, 180);
  pointLight2.position.set(-88, 30, 0);
  scene.add(pointLight2);
  createLightMarker(scene, pointLight2.position, 0x00ff00, 0.8, lichtkugeln);

  const pointLight3 = new THREE.PointLight(0xffffff, 1.5, 180);
  pointLight3.position.set(0, 30, 88);
  scene.add(pointLight3);
  createLightMarker(scene, pointLight3.position, 0x0000ff, 0.8, lichtkugeln);

  const pointLight4 = new THREE.PointLight(0xffffff, 1.5, 180);
  pointLight4.position.set(88, 30, 0);
  scene.add(pointLight4);
  createLightMarker(scene, pointLight4.position, 0xff00ff, 0.8, lichtkugeln);
}
