import * as THREE from 'three';

export class ClassicTheme {
  getConfig() {
    return {
      name: 'Classic',
      description: 'Tema clásico de museo tradicional con paredes blancas y suelo de mármol'
    };
  }

  getSceneColors() {
    return {
      background: 0xffffff,
      floor: 0x888888,
      walls: 0xeeeeee,
      ceiling: 0xffffff
    };
  }

  getFloorMaterial() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;

    // Create classic museum floor pattern - checkerboard marble tiles
    const tileSize = 128;
    const colors = [
      '#f5f5f0', // Off-white marble
      '#e8e8e0'  // Slightly darker marble
    ];

    // Draw checkerboard pattern
    for (let x = 0; x < canvas.width; x += tileSize) {
      for (let y = 0; y < canvas.height; y += tileSize) {
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);
        const colorIndex = (tileX + tileY) % 2;

        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, tileSize, tileSize);

        // Add subtle marble veining using deterministic pattern
        const veinSeed = (tileX * 7 + tileY * 13) % 100;
        if (veinSeed > 70) {
          ctx.strokeStyle = `rgba(200, 200, 190, ${(veinSeed - 70) / 30 * 0.3 + 0.1})`;
          ctx.lineWidth = ((veinSeed - 70) / 30 * 2) + 1;
          ctx.beginPath();

          // Create consistent vein pattern based on tile position
          const startX = x + (tileX * 17) % tileSize;
          const startY = y;
          const endX = x + (tileY * 23) % tileSize;
          const endY = y + tileSize;

          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

        // Add texture variation using deterministic pattern
        const textureSeed = (tileX * 11 + tileY * 19) % 100;
        if (textureSeed > 80) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(textureSeed - 80) / 20 * 0.2})`;
          const spotX = x + (tileX * 29) % tileSize;
          const spotY = y + (tileY * 31) % tileSize;
          ctx.fillRect(spotX, spotY, 20, 20);
        }
      }
    }

    // Add grout lines between tiles
    ctx.strokeStyle = '#d0d0c8';
    ctx.lineWidth = 2;

    for (let x = 0; x <= canvas.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    return new THREE.MeshLambertMaterial({
      color: this.getSceneColors().floor,
      map: new THREE.CanvasTexture(canvas)
    });
  }

  getWallMaterial() {
    return new THREE.MeshLambertMaterial({
      color: this.getSceneColors().walls
    });
  }

  getLightingConfig() {
    return {
      ambient: { color: 0xffffff, intensity: 0.7 },
      directional: {
        color: 0xffffff,
        intensity: 0.6,
        position: { x: 2, y: 5, z: 2 }
      }
    };
  }

  getFrameStyle() {
    return {
      color: '#2a2a2a',
      width: 0.15,
      style: 'classic'
    };
  }
}
