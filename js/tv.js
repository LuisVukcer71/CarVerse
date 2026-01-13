import * as THREE from "https://esm.sh/three@0.160.0";

// Aktivierungsreichweite in Einheiten
const ACTIVATION_RANGE = 80;

/**
 * Erstellt Video-Fernseher an verschiedenen Positionen
 * @param {THREE.Scene} scene - Die Three.js Szene
 * @param {THREE.Camera} camera - Die Kamera für Distanzberechnung
 * @returns {Object} - API mit update() Funktion
 */
export function createTVs(scene, camera) {
  // TV-Konfigurationen (Position, Rotation, Video)
  const tvConfigs = [
    {
      name: "Ferrari TV",
      position: { x: 0, y: 17, z: -128.8 },
      rotation: { x: 0, y: 0, z: 0 },
      size: { width: 24, height: 13.5 },
      videoSrc: "assets/videos/ferrari.mp4"
    },
    {
      name: "Tesla TV",
      position: { x: -128.8, y: 17, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      size: { width: 24, height: 13.5 },
      videoSrc: "assets/videos/tesla.mp4"
    },
    {
      name: "Porsche TV",
      position: { x: 0, y: 17, z: 128.8 },
      rotation: { x: 0, y: Math.PI, z: 0 },
      size: { width: 24, height: 13.5 },
      videoSrc: "assets/videos/porsche.mp4"
    },
    {
      name: "BMW TV",
      position: { x: 128.8, y: 17, z: 0 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      size: { width: 24, height: 13.5 },
      videoSrc: "assets/videos/bmw.mp4"
    }
  ];

  const tvs = [];

  // Erstelle jeden Fernseher
  tvConfigs.forEach(config => {
    const tv = createTV(scene, config);
      tvs.push(tv);
  });

  // Update-Funktion für alle TVs
  function updateTVs() {
    tvs.forEach(tv => {
      const distance = camera.position.distanceTo(tv.mesh.position);
      
      if (distance <= ACTIVATION_RANGE) {
        // Only autoplay if the user hasn't manually paused this TV
        if (!tv.userPaused && tv.video.paused) {
          tv.video.play().catch(e => console.log("Video autoplay:", e));
        }
      } else {
        if (!tv.video.paused) {
          tv.video.pause();
        }
      }
    });
  }

  // Interactivity: click to toggle pause/play, double-click to restart from 0 and play
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let clickTimeout = null;

  function getIntersectedTV(event) {
    // If pointer lock is active (no reliable mouse coords), raycast from screen center
    if (document.pointerLockElement) {
      mouse.x = 0;
      mouse.y = 0;
      raycaster.setFromCamera(mouse, camera);
    } else {
      // left click only: ignore other buttons
      if (event.button !== undefined && event.button !== 0) return null;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
    }
    const meshes = tvs.map(t => t.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);
    if (intersects.length === 0) return null;
    const mesh = intersects[0].object;
    return tvs.find(t => t.mesh === mesh) || null;
  }

  function onClick(event) {
    const tv = getIntersectedTV(event);
    if (!tv) return;

    // Wait a bit to allow dblclick to cancel
    if (clickTimeout) clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      // Toggle user pause state
      tv.userPaused = !tv.userPaused;
      if (tv.userPaused) {
        try { tv.video.pause(); } catch (e) {}
      } else {
        tv.video.play().catch(() => {});
      }
      clickTimeout = null;
    }, 220);
  }

  function onDblClick(event) {
    const tv = getIntersectedTV(event);
    if (!tv) return;
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
    // Restart from beginning and play
    tv.userPaused = false;
    try {
      tv.video.currentTime = 0;
      tv.video.play().catch(() => {});
    } catch (e) {
      // some browsers may throw if currentTime set before loaded; ignore
    }
  }

  window.addEventListener('click', onClick);
  window.addEventListener('dblclick', onDblClick);

  return { update: updateTVs };
}

/**
 * Erstellt einen einzelnen TV
 */
function createTV(scene, config) {
  // Video-Element erstellen
  const video = document.createElement("video");
  video.src = config.videoSrc;
  video.loop = true;
  video.muted = true; // Muted für Autoplay
  video.playsInline = true;
  video.crossOrigin = "anonymous";

  // Video-Texture erstellen
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  // TV-Screen Geometrie
  const geometry = new THREE.PlaneGeometry(
    config.size.width,
    config.size.height
  );

  // Material mit Video-Texture
  const material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  
  // Position und Rotation setzen
  mesh.position.set(config.position.x, config.position.y, config.position.z);
  mesh.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);

  scene.add(mesh);

  return { mesh, video, texture: videoTexture, userPaused: false };
}