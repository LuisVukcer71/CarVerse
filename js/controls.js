import * as THREE from "https://esm.sh/three@0.160.0";
import { PointerLockControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

const keys = {};
let speed = 0.4;
const raycaster = new THREE.Raycaster();

/**
 * Initialisiert die PointerLockControls und Bewegungssteuerung
 */
export function initControls(camera, renderer) {
  const controls = new PointerLockControls(camera, renderer.domElement);

  // Tastatureingaben registrieren
  document.addEventListener("keydown", (e) => (keys[e.code] = true));
  document.addEventListener("keyup", (e) => (keys[e.code] = false));

  // Speed-Steuerung exportieren
  window.setPlayerSpeed = (newSpeed) => {
    speed = newSpeed;
  };

  return {
    controls,
    movePlayer: (controls, collisionObjects) =>
      movePlayer(controls, collisionObjects, camera),
  };
}

/**
 * Prüft ob Bewegung möglich ist (Kollisionserkennung)
 */
function canMove(moveVector, camera, collisionObjects) {
  const direction = moveVector.clone().normalize();
  const distance = moveVector.length();
  raycaster.set(camera.position, direction);
  const intersects = raycaster.intersectObjects(collisionObjects, true);
  return !(intersects.length > 0 && intersects[0].distance < distance + 0.5);
}

/**
 * Bewegt den Spieler basierend auf Tastatureingaben
 */
function movePlayer(controls, collisionObjects, camera) {
  // Nicht bewegen wenn Menü offen ist
  if (!controls.isLocked) return;

  let moveX = 0;
  let moveZ = 0;

  // WASD und Pfeiltasten
  if (keys["KeyA"] || keys["ArrowLeft"]) moveX -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) moveX += 1;
  if (keys["KeyW"] || keys["ArrowUp"]) moveZ += 1;
  if (keys["KeyS"] || keys["ArrowDown"]) moveZ -= 1;

  if (moveX === 0 && moveZ === 0) return;

  // Blickrichtung auf y=0 projizieren
  const forward = new THREE.Vector3();
  controls.getDirection(forward);
  forward.y = 0;
  forward.normalize();

  // Rechtsvektor berechnen
  const right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize();

  // Bewegungsvektor zusammensetzen
  const movement = new THREE.Vector3();
  movement.addScaledVector(forward, moveZ);
  movement.addScaledVector(right, moveX);

  // Geschwindigkeit skalieren (diagonale Bewegung gleich schnell)
  if (movement.length() > 0) movement.normalize().multiplyScalar(speed);

  // Kollision prüfen
  if (canMove(movement, camera, collisionObjects)) {
    camera.position.add(movement);
  }

  // Höhe fixieren
  camera.position.y = 4;
}
