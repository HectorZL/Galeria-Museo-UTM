import * as THREE from 'three';
import { Artwork } from '../models/Artwork.js';

export class GalleryScene {
  constructor(length = 100) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFF8E1); // Warm cream background
    this.halfW = 5;
    this.length = length; // Dynamic length
    this.wallH = 5;
    this.artworks = [];
    this.setupLights();
    this.createGallery();
  }

  setLength(newLength) {
    this.length = Math.max(30, newLength); // Ensure minimum length of 30 units
    
    // Remove existing gallery elements except artworks
    const objectsToRemove = [];
    this.scene.traverse((object) => {
      if (object !== this.scene && !object.userData?.isArtwork) {
        objectsToRemove.push(object);
      }
    });
    objectsToRemove.forEach(obj => this.scene.remove(obj));
    
    // Rebuild gallery elements
    this.setupLights();
    this.createGallery();
  }

  setupLights() {
    this.scene.add(new THREE.AmbientLight(0xFFFFFE, 0.3)); // Very light warm ambient light
    const key = new THREE.DirectionalLight(0xFFFFFE, 0.2); // Very light warm directional light
    key.position.set(2, 5, 2);
    this.scene.add(key);
  }

  createGallery() {
    // Floor with checkered very light lead gray and white pattern
    const floorGeometry = new THREE.PlaneGeometry(2 * this.halfW, this.length);
    // Create checkered floor pattern - very light lead gray and white tiles
    const floorMaterial = new THREE.MeshLambertMaterial({
      
      map: this.createFloorTexture()
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    this.scene.add(floor);

    // Walls white
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xF00FF, opacity: 0.15, transparent: true }); // White with reduced opacity

    const wallL = new THREE.Mesh(
      new THREE.PlaneGeometry(this.wallH, this.length),
      wallMat
    );
    wallL.position.set(-this.halfW, this.wallH/2, 0);
    wallL.rotation.y = Math.PI/2;
    this.scene.add(wallL);

    const wallR = wallL.clone();
    wallR.position.x = this.halfW;
    wallR.rotation.y = -Math.PI/2;
    this.scene.add(wallR);

    // End wall to prevent infinite look
    const endWallMat = new THREE.MeshLambertMaterial({ color: 0xF0F0F0, opacity: 0.8, transparent: true });
    const endWall = new THREE.Mesh(
      new THREE.PlaneGeometry(2 * this.halfW, this.wallH),
      endWallMat
    );
    endWall.position.set(0, this.wallH/2, this.length/2);
    this.scene.add(endWall);

    // Barrel vault ceiling
    this.createVaultCeiling();
  }

  createFloorTexture() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('textura/madera.jpg');
    
    // Set texture wrapping and repeat for seamless tiling
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, this.length / 10); // Adjust repeat based on floor size
    
    return texture;
  }

  addArtwork(artworkData) {
    const artwork = new Artwork(artworkData);
    const objects = artwork.getObjects();
    objects.forEach(obj => this.scene.add(obj));
    this.artworks.push(artwork);
    return artwork;
  }

  getScene() {
    return this.scene;
  }

  createVaultCeiling() {
    // Radio ≈ medio ancho del pasillo para que la bóveda "apoye" en los muros
    const radius = this.halfW;            // 5
    const vaultLength = this.length;      // Dynamic length

    // CylinderGeometry: medio cilindro (thetaLength = Math.PI), sin tapas (openEnded = true)
    const vaultGeo = new THREE.CylinderGeometry(
      radius,           // radiusTop
      radius,           // radiusBottom
      vaultLength,      // height (luego será eje X)
      48,               // radialSegments (suavidad del arco)
      1,                // heightSegments
      true,             // openEnded (sin tapas)
      0,                // thetaStart
      Math.PI           // thetaLength (medio cilindro)
    );

    // Material blanco cálido muy suave (Lambert para reaccionar a tus luces)
    const vaultMat = new THREE.MeshLambertMaterial({
      color: 0xFFFFFE,
      side: THREE.DoubleSide
    });

    const vault = new THREE.Mesh(vaultGeo, vaultMat);

    // Ajustamos la rotación para que coincida con la orientación del piso
    vault.rotation.x =     -Math.PI/2;; // Misma rotación que el piso
    vault.rotation.y =     -Math.PI/2;;
    vault.rotation.z = 0;

    // Posicionamos la bóveda en el centro del techo
    vault.position.set(0, this.wallH + radius, 0);
    
    // Opcional: ajustar la escala si es necesario
    // vault.scale.set(1, 1, 1);

    this.scene.add(vault);
  }
}
