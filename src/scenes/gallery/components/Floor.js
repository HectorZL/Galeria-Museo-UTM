import * as THREE from 'three';

export class Floor {
  constructor(scene, halfW, length) {
    this.scene = scene;
    this.halfW = halfW;
    this.length = length;
    
    this.createFloor();
  }

  createFloorTexture() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('textura/madera.jpg');
    
    // Configure texture properties for better appearance
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10); // Adjust the scale of the texture
    texture.anisotropy = 16; // For better texture quality
    
    return texture;
  }

  createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(2 * this.halfW, this.length);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: this.createFloorTexture(),
      roughness: 0.8,
      metalness: 0.2
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    this.scene.add(floor);
  }
}

// This component creates a checkered floor for the gallery with the specified dimensions.
