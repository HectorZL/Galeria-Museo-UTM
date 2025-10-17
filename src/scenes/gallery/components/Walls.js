import * as THREE from 'three';

export class Walls {
  constructor(scene, halfW, length, wallH) {
    this.scene = scene;
    this.halfW = halfW;
    this.length = length;
    this.wallH = wallH;
    this.wallMat = new THREE.MeshLambertMaterial({ 
      color: 0xFFFFFF, 
      opacity: 0.15, 
      transparent: true 
    });
    
    this.createWalls();
  }

  createWalls() {
    // Left wall
    const wallL = new THREE.Mesh(
      new THREE.PlaneGeometry(this.wallH, this.length),
      this.wallMat
    );
    wallL.position.set(-this.halfW, this.wallH/2, 0);
    wallL.rotation.y = Math.PI/2;
    this.scene.add(wallL);

    // Right wall
    const wallR = wallL.clone();
    wallR.position.x = this.halfW;
    wallR.rotation.y = -Math.PI/2;
    this.scene.add(wallR);
  }
}

// This component creates the side walls of the gallery with the specified material and dimensions.
