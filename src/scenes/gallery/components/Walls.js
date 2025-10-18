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
    // Calculate wall dimensions to match floor edges
    const wallThickness = 0.1; // Thin wall thickness
    const wallLength = this.length;
    const wallHeight = this.wallH;
    
    // Create wall material with higher opacity
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      opacity: 0.8,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-this.halfW + wallThickness/2, wallHeight/2, 0);
    this.scene.add(leftWall);

    // Right wall
    const rightWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(this.halfW - wallThickness/2, wallHeight/2, 0);
    this.scene.add(rightWall);
    
    // Front wall (if needed)
    const frontWallGeometry = new THREE.BoxGeometry(this.halfW * 2, wallHeight, wallThickness);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, wallHeight/2, -this.length/2 + wallThickness/2);
    this.scene.add(frontWall);
    
    // Back wall (if needed)
    const backWall = frontWall.clone();
    backWall.position.z = this.length/2 - wallThickness/2;
    this.scene.add(backWall);
  }
}

// This component creates the side walls of the gallery with the specified material and dimensions.
