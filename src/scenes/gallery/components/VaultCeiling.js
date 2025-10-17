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
    const vaultGeo = new THREE.CylinderGeometry(
      this.radius,     // radiusTop
      this.radius,     // radiusBottom
      this.length,     // height
      48,              // radialSegments
      1,               // heightSegments
      true,            // openEnded
      0,               // thetaStart
      Math.PI          // thetaLength (half cylinder)
    );

    const vaultMat = new THREE.MeshLambertMaterial({
      color: 0xFFFFFE,
      side: THREE.DoubleSide
    });

    const vault = new THREE.Mesh(vaultGeo, vaultMat);
    
    // Apply rotations to position the vault correctly
    vault.rotation.x = -Math.PI/2;
    vault.rotation.y = -Math.PI/2;
    vault.rotation.z = 0;

    // Position the vault at the top of the walls
    vault.position.set(0, this.wallH + this.radius, 0);

    this.scene.add(vault);
  }
}

// This component creates a barrel vault ceiling that spans the width of the gallery.
