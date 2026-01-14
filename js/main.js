import { initScene } from "./scene.js";
import { initControls } from "./controls.js";
import { initUI } from "./ui.js";
import { loadModel } from "./model.js";
import { createMultipleButtons } from "./interactive.js";
import { createMinimap } from "./minimap.js";
import { createTVs } from "./tv.js";
import { initProgress } from "./progress.js";
import { initProgressUI } from "./progressUI.js";

// Auto-Daten laden
async function loadAutosData() {
  try {
    const response = await fetch("http://localhost:3000/cars");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der cars.json:", error);
    return [];
  }
}

// Marken-Daten laden
async function loadMarkenData() {
  try {
    const marken = ["ferrari", "tesla", "porsche", "bmw"];
    const allMarkenData = [];

    for (const marke of marken) {
      const response = await fetch(`http://localhost:3000/${marke}`);
      const data = await response.json();
      console.log(data);

      data.forEach((item, index) => {
        allMarkenData.push({
          ...item,
          buttonid: `${marke}_${item.id}`,
          Marke: marke.charAt(0).toUpperCase() + marke.slice(1),
        });
      });
    }

    return allMarkenData;
  } catch (error) {
    console.error("Fehler beim Laden der Markendaten:", error);
    return [];
  }
}

// Button-Barrieren erstellen (Radius 7, mit Koordinaten-Verschiebung)
function createButtonBarriers(buttonPositions) {
  const barriers = [];
  const BARRIER_RADIUS = 8;
  const BARRIER_OFFSET = 7;

  // Nur die regulären Buttons (nicht die Marken-Buttons)
  const regularButtons = buttonPositions.slice(0, 24);

  regularButtons.forEach((button) => {
    let barrierX = button.x;
    let barrierZ = button.z;

    // Verschiebe X-Koordinate wenn negativ und klein (zwischen -13 und -12)
    if (button.x < 0 && button.x > -15 && button.x < -10) {
      barrierX = button.x - BARRIER_OFFSET; // -7 Punkte
    }
    // Verschiebe X-Koordinate wenn positiv und klein (zwischen 12 und 13)
    else if (button.x > 0 && button.x > 10 && button.x < 15) {
      barrierX = button.x + BARRIER_OFFSET; // +7 Punkte
    }

    // Verschiebe Z-Koordinate wenn negativ und klein (zwischen -13 und -12)
    if (button.z < 0 && button.z > -15 && button.z < -10) {
      barrierZ = button.z - BARRIER_OFFSET; // -7 Punkte
    }
    // Verschiebe Z-Koordinate wenn positiv und klein (zwischen 12 und 13)
    else if (button.z > 0 && button.z > 10 && button.z < 15) {
      barrierZ = button.z + BARRIER_OFFSET; // +7 Punkte
    }

    barriers.push({
      position: { x: barrierX, y: button.y, z: barrierZ },
      radius: BARRIER_RADIUS,
      originalButton: button,
    });
  });

  console.log(`✅ ${barriers.length} Button-Barrieren erstellt`);
  return barriers;
}

// === Hauptinitialisierung ===
async function init() {
  const { scene, camera, renderer } = initScene();
  const { controls, movePlayer } = initControls(camera, renderer);
  const collisionObjects = [];

  // UI initialisieren
  const uiAPI = initUI(controls);

  // Progress System initialisieren
  const progressAPI = initProgress(camera);
  const progressUI = initProgressUI(progressAPI, controls);

  // Modell laden
  loadModel(scene, collisionObjects);

  // Auto-Daten und Marken-Daten laden
  const autosData = await loadAutosData();
  const markenData = await loadMarkenData();
  const allData = [...autosData, ...markenData];

  console.log("Autos:", autosData.length);
  console.log("Marken:", markenData.length);
  console.log("Gesamt:", allData.length);

  // Buttons erstellen
  const buttonPositions = [
    //Buttons vorne
    { x: -13, y: 1, z: -111, buttonid: 1 },
    { x: 13, y: 1, z: -111, buttonid: 2 },
    { x: -13, y: 1, z: -89.5, buttonid: 3 },
    { x: 13, y: 1, z: -89.5, buttonid: 4 },
    { x: -13, y: 1, z: -68, buttonid: 5 },
    { x: 13, y: 1, z: -68, buttonid: 6 },

    //Buttons Links
    { x: -110, y: 1, z: -13, buttonid: 7 },
    { x: -110, y: 1, z: 13, buttonid: 8 },
    { x: -88.5, y: 1, z: -13, buttonid: 9 },
    { x: -88.5, y: 1, z: 13, buttonid: 10 },
    { x: -67, y: 1, z: -13, buttonid: 11 },
    { x: -67, y: 1, z: 13, buttonid: 12 },

    //Buttons Hinten
    { x: 12.5, y: 1, z: 110, buttonid: 13 },
    { x: -13, y: 1, z: 110, buttonid: 14 },
    { x: 12.5, y: 1, z: 88.5, buttonid: 15 },
    { x: -13, y: 1, z: 88.5, buttonid: 16 },
    { x: 12.5, y: 1, z: 67, buttonid: 17 },
    { x: -13, y: 1, z: 67, buttonid: 18 },

    //Buttons Rechts
    { x: 110.5, y: 1, z: 13, buttonid: 19 },
    { x: 110.5, y: 1, z: -13, buttonid: 20 },
    { x: 89.5, y: 1, z: 13, buttonid: 21 },
    { x: 89.5, y: 1, z: -13, buttonid: 22 },
    { x: 68, y: 1, z: 13, buttonid: 23 },
    { x: 68, y: 1, z: -13, buttonid: 24 },

    //Buttons Marken
    { x: -20, y: 4, z: -128.8, buttonid: "ferrari_1" },
    { x: 0, y: 4, z: -128.8, buttonid: "ferrari_2" },
    { x: 20, y: 4, z: -128.8, buttonid: "ferrari_3" },

    { x: -128.8, y: 4, z: -20, buttonid: "tesla_1" },
    { x: -128.8, y: 4, z: 0, buttonid: "tesla_2" },
    { x: -128.8, y: 4, z: 20, buttonid: "tesla_3" },

    { x: -20, y: 4, z: 128.8, buttonid: "porsche_1" },
    { x: 0, y: 4, z: 128.8, buttonid: "porsche_2" },
    { x: 20, y: 4, z: 128.8, buttonid: "porsche_3" },

    { x: 128.8, y: 4, z: -20, buttonid: "bmw_1" },
    { x: 128.8, y: 4, z: 0, buttonid: "bmw_2" },
    { x: 128.8, y: 4, z: 20, buttonid: "bmw_3" },
  ];

  createMultipleButtons(
    scene,
    camera,
    controls,
    uiAPI.openPopup,
    buttonPositions,
    allData
  );

  // Button-Barrieren erstellen
  const buttonBarriers = createButtonBarriers(buttonPositions);

  // Minimap & TVs
  const minimap = createMinimap(scene, camera, progressAPI);
  const tvSystem = createTVs(scene, camera);

  console.log("✅ Alles bereit!");
  console.log("🎮 Steuerung:");
  console.log("   I = Einstellungen");
  console.log("   P = Fortschritt");
  console.log("   WASD = Bewegen");

  // Render Loop
  function animate() {
    requestAnimationFrame(animate);
    movePlayer(controls, collisionObjects, camera, buttonBarriers);
    progressAPI.update();
    minimap.update();
    tvSystem.update();
    renderer.render(scene, camera);
  }
  animate();

  // Resize Handler
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

init();
