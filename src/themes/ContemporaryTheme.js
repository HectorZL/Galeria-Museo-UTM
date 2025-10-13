import * as THREE from 'three';

export class ContemporaryTheme {
  getConfig() {
    return {
      name: 'Contemporary',
      description: 'Tema contemporáneo con paredes marfil, suelo de cemento pulido y acentos modernos'
    };
  }

  getSceneColors() {
    return {
      background: 0xf8f8f8,
      floor: 0xcccccc,
      walls: 0xfffff0, // Marfil
      ceiling: 0xf5f5f5
    };
  }

  getFloorMaterial() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;

    // Create polished concrete floor pattern
    const baseColor = '#cccccc';

    // Fill with base concrete color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add concrete texture variations using deterministic pattern
    for (let x = 0; x < canvas.width; x += 4) {
      for (let y = 0; y < canvas.height; y += 4) {
        // Use deterministic noise based on position
        const noise = Math.sin(x * 0.1 + y * 0.15) * Math.cos(x * 0.08 + y * 0.12) * 10;
        const variation = Math.floor((noise + 10) / 2);

        if (variation > 0) {
          ctx.fillStyle = `rgba(${120 + variation}, ${120 + variation}, ${120 + variation}, 0.3)`;
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // Add subtle darker patches for realistic concrete look using deterministic positions
    for (let i = 0; i < 30; i++) {
      // Use deterministic positioning based on index
      const seed = i * 7; // Prime number for good distribution
      const patchX = (seed * 73) % canvas.width; // 73 is prime
      const patchY = (seed * 137) % canvas.height; // 137 is prime
      const patchSize = ((seed * 17) % 40) + 20; // 17 is prime

      const gradient = ctx.createRadialGradient(
        patchX, patchY, 0,
        patchX, patchY, patchSize
      );

      gradient.addColorStop(0, 'rgba(100, 100, 100, 0.2)');
      gradient.addColorStop(1, 'rgba(140, 140, 140, 0.05)');

      ctx.fillStyle = gradient;
      ctx.fillRect(patchX - patchSize, patchY - patchSize, patchSize * 2, patchSize * 2);
    }

    // Add very subtle linear patterns (like concrete forms)
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
    ctx.lineWidth = 1;

    for (let y = 0; y < canvas.height; y += 80) {
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
      ambient: { color: 0xffffff, intensity: 0.8 },
      directional: {
        color: 0xffffff,
        intensity: 0.4,
        position: { x: 2, y: 5, z: 2 }
      },
      spotlights: [
        {
          color: 0xffffff,
          intensity: 0.6,
          position: { x: 3, y: 4, z: -5 },
          target: { x: 4.95, y: 2, z: -5 },
          angle: Math.PI / 6,
          penumbra: 0.3
        },
        {
          color: 0xffffff,
          intensity: 0.6,
          position: { x: 3, y: 4, z: 5 },
          target: { x: 4.95, y: 2, z: 5 },
          angle: Math.PI / 6,
          penumbra: 0.3
        }
      ]
    };
  }

  getFrameStyle() {
    return {
      color: '#1a1a1a', // Negro/gris oscuro para marcos modernos
      width: 0.12,
      style: 'contemporary'
    };
  }
}
