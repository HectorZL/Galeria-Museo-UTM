import * as THREE from 'three';

export class Floor {
  constructor(scene, halfW, length) {
    this.scene = scene;
    this.halfW = halfW;
    this.length = length;
    
    this.createFloor();
  }

  createFloorTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;

    // Create checkered floor pattern - very light lead gray and white tiles
    const tileSize = 128;
    const leadColor = '#E8E8E8';
    const whiteColor = '#FFFFFF';

    // Draw checkered pattern
    for (let x = 0; x < canvas.width; x += tileSize) {
      for (let y = 0; y < canvas.height; y += tileSize) {
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);
        const isLead = (tileX + tileY) % 2 === 0;

        ctx.fillStyle = isLead ? leadColor : whiteColor;
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(2 * this.halfW, this.length);
    const floorMaterial = new THREE.MeshLambertMaterial({
      color: 0xE8E8E8,
      map: this.createFloorTexture()
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    this.scene.add(floor);
  }
}

// This component creates a checkered floor for the gallery with the specified dimensions.
