import * as THREE from "https://esm.sh/three@0.160.0";

// Maximale Interaktionsdistanz in Einheiten
const MAX_INTERACTION_DISTANCE = 20;

/**
 * Erstellt eine Canvas-Texture mit Text
 */
function createTextTexture(text, width = 512, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Hintergrund
  ctx.fillStyle = '#212121';
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 60px Inter';
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
function handleButtonClick(button, material, distance, buttonid, carData) {
  console.log('Button wurde gedrückt!');
  console.log('Button ID:', buttonid);
  console.log('Entfernung:', (distance/10).toFixed(2));
  console.log('Auto-Daten:', carData);

  // Visuelles Feedback
  material.emissiveIntensity = 0.8;

  setTimeout(() => {
    material.emissiveIntensity = 0.2;
  }, 200);

  // Popup mit Auto-Daten füllen
  updatePopupContent(carData);
}

/**
 * Aktualisiert den Popup-Inhalt mit Auto-Daten
 */
function updatePopupContent(carData) {
  // Popup-Elemente holen
  const popupTitle = document.querySelector('#popup h2');
  const popupContent = document.getElementById('inhalt1');

  if (!carData) {
    popupTitle.textContent = 'Keine Daten';
    popupContent.innerHTML = '<p>Für dieses Fahrzeug sind noch keine Informationen verfügbar.</p>';
    return;
  }

  // Titel mit Logo setzen
  let logoSrc = '';
  if (carData.Marke) {
    const marke = carData.Marke.toLowerCase();
    if (marke === 'ferrari') {
      logoSrc = 'assets/logos/ferrari.png';
    } else if (marke === 'tesla') {
      logoSrc = 'assets/logos/tesla.png';
    }
    else if (marke === 'bmw') {
      logoSrc = 'assets/logos/bmw.png';
    }
  }

  if (logoSrc) {
    popupTitle.innerHTML = `<img src="${logoSrc}" alt="${carData.Marke} Logo" class="popup-logo"><br>${carData.titel || 'Unbekanntes Fahrzeug'}`;
  } else {
    popupTitle.textContent = carData.titel || 'Unbekanntes Fahrzeug';
  }

  // Content zusammenbauen
  let html = '';

  if (carData.Marke) {
    html += `<p><strong>Marke:</strong> ${carData.Marke}</p>`;
  }

  if (carData.Erscheinungsjahr) {
    html += `<p><strong>Erscheinungsjahr:</strong> ${carData.Erscheinungsjahr}</p>`;
  }

  if (carData.Leistung) {
    html += `<p><strong>Leistung:</strong> ${carData.Leistung}</p>`;
  }

  if (carData["0-100 Zeit"]) {
    html += `<p><strong>0-100 km/h:</strong> ${carData["0-100 Zeit"]}</p>`;
  }

  if (carData.fließtext) {
    html += `<hr style="margin: 15px 0; opacity: 0.3;" />`;
    html += `<p style="text-align: justify; line-height: 1.6;">${carData.fließtext}</p>`;
  }

  popupContent.innerHTML = html;
}

/**
 * Erstellt mehrere interaktive Buttons an verschiedenen Positionen
 */
export function createMultipleButtons(scene, camera, controls, openPopupCallback, positions, autosData) {
  const buttons = [];
  const interactionRaycaster = new THREE.Raycaster();
  const centerPoint = new THREE.Vector2(0, 0);

  positions.forEach((pos, index) => {
    // Button-Geometrie abhängig von Position
    let buttonGeometry;
    if (pos.x > 50 || pos.x < -50) {
      buttonGeometry = new THREE.BoxGeometry(2, 1, 0.2);
    } else {
      buttonGeometry = new THREE.BoxGeometry(0.2, 1, 2);
    }

    const textTexture = createTextTexture("INFOS");

    const buttonMaterial = new THREE.MeshStandardMaterial({
      map: textTexture,
      emissive: 0x212121,
      emissiveIntensity: 0.2
    });

    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(pos.x, pos.y, pos.z);
    button.userData.id = `button_${index}`;
    button.userData.buttonid = pos.buttonid; // ButtonID speichern
    button.userData.isInteractive = true;

    scene.add(button);
    buttons.push(button);
  });

  // Click-Handler für alle Buttons
  document.addEventListener('click', () => {
    if (!controls.isLocked) return;

    interactionRaycaster.setFromCamera(centerPoint, camera);
    const intersects = interactionRaycaster.intersectObjects(buttons);

    if (intersects.length > 0) {
      const distance = intersects[0].distance;
      const button = intersects[0].object;
      const buttonid = button.userData.buttonid;

      if (distance <= MAX_INTERACTION_DISTANCE) {
        // Auto-Daten aus JSON holen
        const carData = autosData.find(car => car.buttonid === buttonid);

        // Popup öffnen und Daten anzeigen
        openPopupCallback();
        handleButtonClick(button, button.material, distance, buttonid, carData);
      } else {
        console.log(`Button zu weit entfernt: ${distance.toFixed(2)}m (max ${MAX_INTERACTION_DISTANCE}m)`);
      }
    }
  });

  return buttons;
}
