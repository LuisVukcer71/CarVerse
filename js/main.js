import { initScene } from './scene.js';
import { initControls } from './controls.js';
import { initUI } from './ui.js';
import { loadModel } from './model.js';
import { createInteractiveButton } from './interactive.js';

// === Hauptinitialisierung ===
const { scene, camera, renderer } = initScene();
const { controls, movePlayer } = initControls(camera, renderer);
const collisionObjects = [];

// UI initialisieren und API erhalten
const uiAPI = initUI(controls);


// Modell laden
loadModel(scene, collisionObjects);

// Interaktive Elemente erstellen
createInteractiveButton(scene, camera, controls, uiAPI.openPopup);

// === Render Loop ===
function animate() {
  requestAnimationFrame(animate);
  movePlayer(controls, collisionObjects);
  renderer.render(scene, camera);
}
animate();

// === Resize Handler ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});