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
      position: { x: 0, y: 14, z: -127.9 },
      rotation: { x: 0, y: 0, z: 0 },
      size: { width: 8.889 * 2, height: 5 * 2 },
      videoSrc: "assets/videos/ferrari.mp4",
    },
    {
      name: "Tesla TV",
      position: { x: -127.9, y: 14, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      size: { width: 8.889 * 2, height: 5 * 2 },
      videoSrc: "assets/videos/tesla.mp4",
    },
    {
      name: "Porsche TV",
      position: { x: 0, y: 14, z: 127.9 },
      rotation: { x: 0, y: Math.PI, z: 0 },
      size: { width: 8.889 * 2, height: 5 * 2 },
      videoSrc: "assets/videos/porsche.mp4",
    },
    {
      name: "BMW TV",
      position: { x: 127.9, y: 14, z: 0 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      size: { width: 8.889 * 2, height: 5 * 2 },
      videoSrc: "assets/videos/bmw.mp4",
    },
  ];

  const tvs = [];

  // Erstelle jeden Fernseher
  tvConfigs.forEach((config) => {
    const tv = createTV(scene, config);
    tvs.push(tv);
  });

  // Update-Funktion für alle TVs
  function updateTVs() {
    tvs.forEach((tv) => {
      const distance = camera.position.distanceTo(tv.mesh.position);

      if (distance <= ACTIVATION_RANGE) {
        if (tv.video.paused) {
          tv.video.play().catch((e) => console.log("Video autoplay:", e));
        }
      } else {
        if (!tv.video.paused) {
          tv.video.pause();
        }
      }
    });
  }

  return { update: updateTVs };
}

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
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Position und Rotation setzen
  mesh.position.set(config.position.x, config.position.y, config.position.z);
  mesh.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);

  scene.add(mesh);

  return { mesh, video, texture: videoTexture };
}
