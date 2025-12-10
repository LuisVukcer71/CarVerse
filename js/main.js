import { initScene } from './scene.js';
import { initControls } from './controls.js';
import { initUI } from './ui.js';
import { loadModel } from './model.js';
import { createMultipleButtons } from './interactive.js';
import { createMinimap } from './minimap.js'; 
import { createTVs } from './tv.js';


// Auto-Daten laden
async function loadAutosData() {
    try {
        const response = await fetch('http://localhost:3000/cars');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der cars.json:', error);
        return [];
    }
}

// Marken-Daten laden
async function loadMarkenData() {
    try {
        const marken = ['ferrari', 'tesla', 'porsche', 'bmw'];
        const allMarkenData = [];
        
        for (const marke of marken) {
            const response = await fetch(`http://localhost:3000/${marke}`);
            const data = await response.json();
            
            // Jedes Element mit buttonid versehen
            data.forEach((item, index) => {
                allMarkenData.push({
                    ...item,
                    buttonid: `${marke}_${item.id}`,
                    Marke: marke.charAt(0).toUpperCase() + marke.slice(1)
                });
            });
        }
        
        return allMarkenData;
    } catch (error) {
        console.error('Fehler beim Laden der Markendaten:', error);
        return [];
    }
}

// === Hauptinitialisierung ===
async function init() {
    const { scene, camera, renderer } = initScene();
    const { controls, movePlayer } = initControls(camera, renderer);
    const collisionObjects = [];

    // UI initialisieren und API erhalten
    const uiAPI = initUI(controls);

    // Modell laden
    loadModel(scene, collisionObjects);

    // Auto-Daten und Marken-Daten laden
    const autosData = await loadAutosData();
    const markenData = await loadMarkenData();
    
    // Beide Datensätze kombinieren
    const allData = [...autosData, ...markenData];
    
    console.log('Autos:', autosData.length);
    console.log('Marken:', markenData.length);
    console.log('Gesamt:', allData.length);

    // Mehrere Buttons an verschiedenen Positionen erstellen
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
        // Ferrari - Vorne/Oben
        { x: -20, y: 4, z: -128.8, buttonid: 'ferrari_1' },
        { x: 0, y: 4, z: -128.8, buttonid: 'ferrari_2' },
        { x: 20, y: 4, z: -128.8, buttonid: 'ferrari_3' },
        
        // Tesla - Links
        { x: -128.8, y: 4, z: -20, buttonid: 'tesla_1' },
        { x: -128.8, y: 4, z: 0, buttonid: 'tesla_2' },
        { x: -128.8, y: 4, z: 20, buttonid: 'tesla_3' },
        
        // Porsche - Hinten/Unten
        { x: -20, y: 4, z: 128.8, buttonid: 'porsche_1' },
        { x: 0, y: 4, z: 128.8, buttonid: 'porsche_2' },
        { x: 20, y: 4, z: 128.8, buttonid: 'porsche_3' },
        
        // BMW - Rechts
        { x: -128.8, y: 4, z: -20, buttonid: 'bmw_1' },
        { x: -128.8, y: 4, z: 0, buttonid: 'bmw_2' },
        { x: -128.8, y: 4, z: 20, buttonid: 'bmw_3' }
    ];

    createMultipleButtons(scene, camera, controls, uiAPI.openPopup, buttonPositions, allData);

    // === MINIMAP ===
    const minimap = createMinimap(scene, camera);
    console.log('Minimap initialisiert');

    const tvSystem = createTVs(scene, camera);
    console.log('TV-System initialisiert');

    // === Render Loop ===
    function animate() {
        requestAnimationFrame(animate);
        movePlayer(controls, collisionObjects);
        minimap.update(); 
        tvSystem.update();
        renderer.render(scene, camera);
    }
    animate();

    // === Resize Handler ===
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// App starten
init();