import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

/**
 * Lädt das 3D-Modell und fügt es zur Szene hinzu
*/
export function loadModel(scene, collisionObjects) {
    const loadingScreen = document.getElementById("loading-screen");
    const loadingBar = document.getElementById('loading-bar');
    const loadingPercentage = document.getElementById('loading-percentage');
    
    // Loading Manager
    const loadingManager = new THREE.LoadingManager();

    // Fortschritt anzeigen
    loadingManager.onProgress = (url, loaded, total) => {
        const progress = Math.round((loaded / total) * 100);
        loadingBar.style.width = `${progress}%`;
        loadingPercentage.textContent = `${progress}%`;
    };

    // Wenn alles fertig ist
    loadingManager.onLoad = () => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                startButton.style.display = 'block';
            }, 800);
        }, 500);
    };

    const loader = new GLTFLoader(loadingManager);

    loader.load(
        "assets/MainV1_10.glb",
        (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            // Alle Meshes durchlaufen und optimieren
            model.traverse((child) => {
                if (child.isMesh) {
                    // Doppelseitige Materialien für bessere Sichtbarkeit
                    child.material.side = THREE.DoubleSide;
                    
                    // Material-Verbesserungen - MINIMAL und selektiv
                    if (child.material) {
                        // Berechne Helligkeit des Materials
                        let brightness = 0.5;
                        if (child.material.color) {
                            const r = child.material.color.r || 0;
                            const g = child.material.color.g || 0;
                            const b = child.material.color.b || 0;
                            brightness = (r + g + b) / 3;
                        }

                        // Erkenne Boden/Wände (sehr große Meshes, flach)
                        let isBigSurface = false;
                        if (child.geometry && child.geometry.boundingBox) {
                            child.geometry.computeBoundingBox();
                            const box = child.geometry.boundingBox;
                            const sizeX = box.max.x - box.min.x;
                            const sizeZ = box.max.z - box.min.z;
                            // Wenn sehr groß und flach = wahrscheinlich Boden/Wand
                            if ((sizeX > 50 || sizeZ > 50) && child.position.y < 5) {
                                isBigSurface = true;
                            }
                        }

                        // === NUR DUNKLE MATERIALIEN ANFASSEN (< 15% Helligkeit) ===
                        // Das sind meistens schwarze Auto-Teile
                        if (brightness < 0.15) {
                            // Nur emissive hinzufügen, NICHTS anderes ändern
                            child.material.emissive = new THREE.Color(0x2a2a2a);
                            child.material.emissiveIntensity = 0.4;
                        }
                        // Sehr dunkle aber nicht ganz schwarz (15-25%)
                        else if (brightness < 0.25) {
                            child.material.emissive = new THREE.Color(0x1a1a1a);
                            child.material.emissiveIntensity = 0.2;
                        }

                        // === ROTE MATERIALIEN (Ferraris, etc.) ===
                        if (child.material.color) {
                            const r = child.material.color.r || 0;
                            const g = child.material.color.g || 0;
                            const b = child.material.color.b || 0;
                            
                            // Erkenne Rot: R > G und R > B, und deutlich sichtbar
                            const isRed = r > 0.5 && r > g * 1.3 && r > b * 1.3;
                            
                            if (isRed) {
                                // Matte rote Materialien: weniger Metalness, mehr Roughness
                                if (child.material.metalness !== undefined) {
                                    // Reduziere Metalness von max 0.8 auf ~0.4
                                    child.material.metalness = Math.min(child.material.metalness, 0.25);
                                }
                                if (child.material.roughness !== undefined) {
                                    // Erhöhe Roughness für matteres Finish
                                    child.material.roughness = Math.max(child.material.roughness, 0.4);
                                }
                            }
                        }

                        // === BODEN/WÄNDE SEPARIEREN ===
                        if (isBigSurface) {
                            // Reduziere Glanz auf Boden/Wänden
                            if (child.material.metalness !== undefined) {
                                child.material.metalness = Math.min(child.material.metalness, 0.1);
                            }
                            if (child.material.roughness !== undefined) {
                                child.material.roughness = Math.max(child.material.roughness, 0.4);
                            }
                        }

                        child.material.needsUpdate = true;
                    }

                    // Mesh zu Kollisionsobjekten hinzufügen
                    collisionObjects.push(child);
                }
            });

            console.log("✅ Modell erfolgreich geladen und optimiert");
            console.log("🎨 Material-Philosophie:");
            console.log("  • Originaleffekte bewahrt - Nur schwarz anfassen");
            console.log("  • Dunkel (<15%): Emissive +0.4");
            console.log("  • Sehr dunkel (15-25%): Emissive +0.2");
            console.log("  • Rot-Materialien: Metalness ≤0.4, Roughness ≥0.5 (matter)");
            console.log("  • Boden/Wände: Glanz reduziert, Roughness erhöht");
        },
        (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            console.log(`Lade Modell: ${percent.toFixed(0)}%`);
        },
        (error) => {
            console.error("❌ Fehler beim Laden des Modells:", error);
        }
    );
}