import * as THREE from "https://esm.sh/three@0.160.0";

/**
 * Erstellt eine Canvas-Texture mit Text
 */
function createTextTexture(text, width = 512, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Hintergrund
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Erstellt interaktive 3D-Buttons in der Szene
 */
export function createInteractiveButton(scene, camera, controls, openPopupCallback, buttonText = "KLICK MICH") {
  // Button Geometrie und Material mit Text-Texture
  const buttonGeometry = new THREE.BoxGeometry(2, 1, 0.2);
  const textTexture = createTextTexture(buttonText);
  
  const buttonMaterial = new THREE.MeshStandardMaterial({ 
    map: textTexture,
    emissive: 0xff0000,
    emissiveIntensity: 0.2
  });
  
  const button3D = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button3D.position.set(0, 4, -129);
  button3D.userData.isInteractive = true; // Marker für interaktive Objekte
  scene.add(button3D);
  
  // Raycaster für Interaktion
  const interactionRaycaster = new THREE.Raycaster();
  const centerPoint = new THREE.Vector2(0, 0);
  
  // Click-Handler
  document.addEventListener('click', () => {
    if (!controls.isLocked) return;
    
    // Raycasting vom Kamera-Zentrum
    interactionRaycaster.setFromCamera(centerPoint, camera);
    const intersects = interactionRaycaster.intersectObject(button3D);
    
    if (intersects.length > 0 ){
      // Nur wenn Button getroffen wurde: Popup öffnen
      openPopupCallback();
      handleButtonClick(button3D, buttonMaterial, intersects[0].distance);
    }
  });
  
  return button3D;
}

/**
 * Behandelt Button-Klicks mit visuellem Feedback
 */
function handleButtonClick(button, material, distance) {
  console.log('Button wurde gedrückt!');
  console.log('Entfernung:', distance.toFixed(2));
  
  // Visuelles Feedback
  material.emissiveIntensity = 0.8;
  
  setTimeout(() => {
    material.emissiveIntensity = 0.2;
  }, 200);
  
  // Hier können weitere Aktionen ausgelöst werden
  // z.B. Popup öffnen, Audio abspielen, etc.
}

/**
 * Erstellt mehrere interaktive Objekte an verschiedenen Positionen
 */
export function createMultipleInteractives(scene, camera, controls, positions) {
  const buttons = [];
  
  positions.forEach((pos, index) => {
    const buttonGeometry = new THREE.BoxGeometry(2, 1, 0.2);
    const buttonMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff6b6b,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    });
    
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(pos.x, pos.y, pos.z);
    button.userData.id = `button_${index}`;
    button.userData.isInteractive = true;
    
    scene.add(button);
    buttons.push(button);
  });
  
  return buttons;
}