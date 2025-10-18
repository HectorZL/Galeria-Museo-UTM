import * as THREE from 'three';

export class VaultCeiling {
  constructor(scene, halfW, length, wallH) {
    this.scene = scene;
    this.halfW = halfW;
    this.length = length;
    this.wallH = wallH;
    this.radius = halfW;
    
    this.createVault();
  }

  createVault() {
    // Calculate vault dimensions to match walls
    const vaultRadius = this.halfW;
    const vaultLength = this.length;
    const wallThickness = 0.1; // Match wall thickness
    
    // Create the vault geometry
    const vaultGeo = new THREE.CylinderGeometry(
      vaultRadius,     // radiusTop
      vaultRadius,     // radiusBottom
      vaultLength,     // height
      32,              // radialSegments (increased for smoother curve)
      1,               // heightSegments
      true,            // openEnded
      0,               // thetaStart
      Math.PI          // thetaLength (half cylinder)
    );

    // Create a more refined material for the ceiling
    const vaultMat = new THREE.MeshStandardMaterial({
      color: 0xF8F8F8,  // Slightly off-white
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.1
    });

    const vault = new THREE.Mesh(vaultGeo, vaultMat);
    
    // Position and rotate the vault to align with walls
    vault.rotation.x = -Math.PI/2;  // Rotate to be horizontal
    vault.rotation.y = -Math.PI/2;  // Rotate to align with the gallery
    
    // Position the vault to sit exactly on top of the walls
    vault.position.set(0, this.wallH, 0);
    
    this.scene.add(vault);
  }
}

// This component creates a barrel vault ceiling that spans the width of the gallery.
