import * as THREE from "https://esm.sh/three@0.160.0";


export function createMinimap(scene, camera) {
  // Minimap-Container 
  const minimapContainer = document.createElement('div');
  minimapContainer.id = 'minimap';
  document.body.appendChild(minimapContainer);

  // Canvas für Minimap 
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  canvas.style.cssText = 'display: block; width: 100%; height: 100%;';
  minimapContainer.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');

  // Museum-Dimensionen erweitert (mehr Raum um die Buttons herum)
  const MUSEUM_SIZE = 260;
  const MUSEUM_HALF = MUSEUM_SIZE / 2;

  // Markenlogos 
  const logos = {
    ferrari: new Image(),
    tesla: new Image(),
    bmw: new Image(),
    porsche: new Image()
  };

  logos.ferrari.src = 'assets/logos/ferrari.png';
  logos.tesla.src = 'assets/logos/tesla.png';
  logos.bmw.src = 'assets/logos/bmw.png';
  logos.porsche.src = 'assets/logos/porsche.png';

  let logosLoaded = 0;
  Object.values(logos).forEach(img => {
    img.onload = () => {
      logosLoaded++;
      if (logosLoaded === 4) {
        drawMinimap();
      }
    };
  });


  function worldToMinimap(worldX, worldZ) {
    const x = ((worldX + MUSEUM_HALF) / MUSEUM_SIZE) * canvas.width;
    const y = ((worldZ + MUSEUM_HALF) / MUSEUM_SIZE) * canvas.height;
    return { x, y };
  }


  function drawLogo(logo, centerX, centerZ, size = 25) {
    if (!logo.complete) return;
    
    const pos = worldToMinimap(centerX, centerZ);
    const halfSize = size / 2;
    
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.drawImage(logo, pos.x - halfSize, pos.y - halfSize, size, size);
    ctx.restore();
  }


  function drawLocationDot(x, y, rotation, size = 10) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);


    const coneLength = 20;
    const coneWidth = 25;
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, -coneLength/2, coneLength);
    gradient.addColorStop(0, 'rgba(66, 133, 244, 0.3)');
    gradient.addColorStop(0.5, 'rgba(66, 133, 244, 0.15)');
    gradient.addColorStop(1, 'rgba(66, 133, 244, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-coneWidth/2, -coneLength);
    ctx.lineTo(coneWidth/2, -coneLength);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(66, 133, 244, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
    ctx.fill();


    ctx.fillStyle = '#4285F4';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }


  function drawMinimap() {
    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hintergrund
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;

    // Mittelraum
    const centerSize = 25;
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(-centerSize, -centerSize)));
    ctx.lineTo(...Object.values(worldToMinimap(centerSize, -centerSize)));
    ctx.lineTo(...Object.values(worldToMinimap(centerSize, centerSize)));
    ctx.lineTo(...Object.values(worldToMinimap(-centerSize, centerSize)));
    ctx.closePath();
    ctx.stroke();

    // Ferrari
    const topRoom = worldToMinimap(-40, -125);
    const topRoom2 = worldToMinimap(40, -125);
    const topRoom3 = worldToMinimap(40, -50);
    const topRoom4 = worldToMinimap(-40, -50);
    ctx.beginPath();
    ctx.moveTo(topRoom.x, topRoom.y);
    ctx.lineTo(topRoom2.x, topRoom2.y);
    ctx.lineTo(topRoom3.x, topRoom3.y);
    ctx.lineTo(topRoom4.x, topRoom4.y);
    ctx.closePath();
    ctx.stroke();

    // Gang oben
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(-7, -50)));
    ctx.lineTo(...Object.values(worldToMinimap(-7, -28)));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(7, -50)));
    ctx.lineTo(...Object.values(worldToMinimap(7, -28)));
    ctx.stroke();

    // Porsche
    const bottomRoom = worldToMinimap(-40, 50);
    const bottomRoom2 = worldToMinimap(40, 50);
    const bottomRoom3 = worldToMinimap(40, 125);
    const bottomRoom4 = worldToMinimap(-40, 125);
    ctx.beginPath();
    ctx.moveTo(bottomRoom.x, bottomRoom.y);
    ctx.lineTo(bottomRoom2.x, bottomRoom2.y);
    ctx.lineTo(bottomRoom3.x, bottomRoom3.y);
    ctx.lineTo(bottomRoom4.x, bottomRoom4.y);
    ctx.closePath();
    ctx.stroke();

    // Gang unten
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(-7, 28)));
    ctx.lineTo(...Object.values(worldToMinimap(-7, 50)));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(7, 28)));
    ctx.lineTo(...Object.values(worldToMinimap(7, 50)));
    ctx.stroke();

    // Tesla
    const leftRoom = worldToMinimap(-125, -40);
    const leftRoom2 = worldToMinimap(-125, 40);
    const leftRoom3 = worldToMinimap(-50, 40);
    const leftRoom4 = worldToMinimap(-50, -40);
    ctx.beginPath();
    ctx.moveTo(leftRoom.x, leftRoom.y);
    ctx.lineTo(leftRoom2.x, leftRoom2.y);
    ctx.lineTo(leftRoom3.x, leftRoom3.y);
    ctx.lineTo(leftRoom4.x, leftRoom4.y);
    ctx.closePath();
    ctx.stroke();

    // Gang links
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(-50, -7)));
    ctx.lineTo(...Object.values(worldToMinimap(-28, -7)));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(-50, 7)));
    ctx.lineTo(...Object.values(worldToMinimap(-28, 7)));
    ctx.stroke();

    // BMW
    const rightRoom = worldToMinimap(50, -40);
    const rightRoom2 = worldToMinimap(50, 40);
    const rightRoom3 = worldToMinimap(125, 40);
    const rightRoom4 = worldToMinimap(125, -40);
    ctx.beginPath();
    ctx.moveTo(rightRoom.x, rightRoom.y);
    ctx.lineTo(rightRoom2.x, rightRoom2.y);
    ctx.lineTo(rightRoom3.x, rightRoom3.y);
    ctx.lineTo(rightRoom4.x, rightRoom4.y);
    ctx.closePath();
    ctx.stroke();

    // Gang rechts
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(28, -7)));
    ctx.lineTo(...Object.values(worldToMinimap(50, -7)));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(...Object.values(worldToMinimap(28, 7)));
    ctx.lineTo(...Object.values(worldToMinimap(50, 7)));
    ctx.stroke();

    // === Marken-Logos in den Räumen ===
    drawLogo(logos.ferrari, 0, -87.5, 30);
    drawLogo(logos.porsche, 0, 87.5, 30);
    drawLogo(logos.tesla, -87.5, 0, 30);
    drawLogo(logos.bmw, 87.5, 0, 30);

    // Standort
    const playerPos = worldToMinimap(camera.position.x, camera.position.z);
    
    // Blickrichtung berechnen
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const angle = Math.atan2(forward.z, forward.x) + Math.PI / 2;

  
    drawLocationDot(playerPos.x, playerPos.y, angle, 8);

    // Koordinaaten
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(`X: ${camera.position.x.toFixed(1)}`, 5, canvas.height - 10);
    ctx.textAlign = 'right';
    ctx.fillText(`Z: ${camera.position.z.toFixed(1)}`, canvas.width - 5, canvas.height - 10);
  }


  function updateMinimap() {
    drawMinimap();
  }

  // Initiales Zeichnen
  drawMinimap();

  return {
    update: updateMinimap,
    element: minimapContainer
  };
}