import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

/**
 * Lädt das 3D-Modell und fügt es zur Szene hinzu
*/
export function loadModel(scene, collisionObjects) {
    const loadingScreen = document.getElementById("loading-screen");
    const loadingBar = document.getElementById('loading-bar');
    const loadingPercentage = document.getElementById('loading-percentage');
    // loading manager
    const loadingManager = new THREE.LoadingManager();

    // fortschritt anzeigen
    loadingManager.onProgress = (url, loaded, total) => {
        const progress = Math.round((loaded / total) * 100);
        loadingBar.style.width = `${progress}%`;
        loadingPercentage.textContent = `${progress}%`;
    };

    // Wenn alles fertig ist:
    loadingManager.onLoad = () => {
        // kurze Verzögerung für smooth Übergang
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                startButton.style.display = 'block'; // Zeige den Startbutton
            }, 800);
        }, 500);
    };

    const loader = new GLTFLoader(loadingManager);

    loader.load(
        "assets/MainV1_7.glb",
        (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            // Alle Meshes durchlaufen und für Kollision vorbereiten
            model.traverse((child) => {
                if (child.isMesh) {
                    // Doppelseitige Materialien für bessere Sichtbarkeit
                    child.material.side = THREE.DoubleSide;

                    // Mesh zu Kollisionsobjekten hinzufügen
                    collisionObjects.push(child);
                }
            });

            console.log("Modell erfolgreich geladen");
        },
        (progress) => {
            // Ladefortschritt
            const percent = (progress.loaded / progress.total) * 100;
            console.log(`Lade Modell: ${percent.toFixed(0)}%`);
        },
        (error) => {
            console.error("Fehler beim Laden des Modells:", error);
        }
    );
}
