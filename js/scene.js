import * as THREE from "https://esm.sh/three@0.160.0";

/**
 * Initialisiert die Szene, Kamera und Renderer
 */
export function initScene() {
  // Szene erstellen
  const scene = new THREE.Scene();
  
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
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  
  // Beleuchtung hinzufügen
  setupLighting(scene);
  
  return { scene, camera, renderer };
}

/**
 * Richtet die Beleuchtung der Szene ein
 */
function setupLighting(scene) {
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);
  
  // Hemisphere Light
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  hemiLight.position.set(0, 10, 0);
  scene.add(hemiLight);
  
  // Point Light
  const pointLight = new THREE.PointLight(0xffffff, 1, 50);
  pointLight.position.set(0, 5, 0);
  scene.add(pointLight);
}