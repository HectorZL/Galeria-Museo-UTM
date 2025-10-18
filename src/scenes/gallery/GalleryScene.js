import * as THREE from 'three';
import { Artwork } from '../../models/Artwork.js';
import { Floor } from './components/Floor.js';
import { Walls } from './components/Walls.js';
import { VaultCeiling } from './components/VaultCeiling.js';

export class GalleryScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFF8E1); // Warm cream background
    
    // Gallery dimensions
    this.halfW = 5;
    this.length = 100;
    this.wallH = 5;
    
    this.artworks = [];
    
    this.setupLights();
    this.createGallery();
  }

  setupLights() {
    // Ambient light
    this.scene.add(new THREE.AmbientLight(0xFFFFFE, 0.3));
    
    // Create a group for all lights
    this.lights = new THREE.Group();
    this.scene.add(this.lights);
    
    // Add ceiling lights
    this.addCeilingLights();
  }
  
  addCeilingLights() {
    const lightDistance = 8; // Distance between lights
    const lightCount = Math.floor(this.length / lightDistance);
    const lightHeight = this.wallH - 0.3; // Slightly below ceiling
    
    for (let i = 0; i < lightCount; i++) {
      const z = -this.length/2 + (i + 0.5) * lightDistance;
      
      // Add point light only (no fixture mesh)
      const pointLight = new THREE.PointLight(0xFFFFFF, 1.2, 12, 1.5);
      pointLight.position.set(0, lightHeight, z);
      this.lights.add(pointLight);
    }
  }

  createGallery() {
    // Create floor
    this.floor = new Floor(this.scene, this.halfW, this.length);
    
    // Create walls
    this.walls = new Walls(this.scene, this.halfW, this.length, this.wallH);
    
    // Create vault ceiling
    this.vaultCeiling = new VaultCeiling(this.scene, this.halfW, this.length, this.wallH);
    
    // Add columns
    this.addColumns();
  }
  
  addColumns() {
    console.log('Adding columns...');
    const artworkSpacing = 4; // Space between artworks
    const columnSpacing = artworkSpacing * 3; // Place a column every 3 artworks
    const columnCount = Math.floor(this.length / columnSpacing);
    const columnRadius = 0.15; // Thinner columns (reduced from 0.3)
    const columnHeight = this.wallH - 0.5; // Slightly shorter than walls
    
    // Create a more visible column geometry
    const columnGeometry = new THREE.CylinderGeometry(
      columnRadius, // radiusTop
      columnRadius * 1.1, // Slightly wider at the bottom
      columnHeight, // height
      16            // radialSegments
    );
    
    // Fallback material in case texture fails to load
    const fallbackMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Brown color as fallback
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Try to load wood texture with error handling
    let columnMaterial;
    try {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        'textura/madera.jpg',
        (texture) => {
          console.log('Wood texture loaded successfully');
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 2);
          
          columnMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.2
          });
          
          // Update all columns with the loaded texture
          this.scene.traverse((child) => {
            if (child.userData.isColumn) {
              child.material = columnMaterial;
            }
          });
        },
        undefined,
        (error) => {
          console.error('Error loading wood texture:', error);
        }
      );
    } catch (error) {
      console.error('Error setting up texture loader:', error);
      columnMaterial = fallbackMaterial;
    }
    
    // Use fallback material initially
    columnMaterial = columnMaterial || fallbackMaterial;
    
    // Calculate column positions based on artwork spacing
    const columnPositions = [];
    const startZ = -this.length/2 + columnSpacing/2; // Start after the first section
    
    for (let i = 0; i < columnCount; i++) {
      const z = startZ + (i * columnSpacing);
      columnPositions.push(z);
    }
    
    columnPositions.forEach(z => {
      // Position columns slightly away from walls to avoid z-fighting
      const wallOffset = 0.05;
      
      // Left column
      const leftColumn = new THREE.Mesh(columnGeometry, columnMaterial.clone());
      leftColumn.position.set(
        -this.halfW + columnRadius + wallOffset, 
        columnHeight/2, 
        z
      );
      leftColumn.castShadow = true;
      leftColumn.receiveShadow = true;
      leftColumn.userData.isColumn = true;
      this.scene.add(leftColumn);
      
      // Right column
      const rightColumn = leftColumn.clone();
      rightColumn.position.x = this.halfW - columnRadius - wallOffset;
      this.scene.add(rightColumn);
      
      console.log(`Added columns at z=${z}`);
    });
    
    // Debug markers removed
  }
  
  addColumnBase(x, z, radius) {
    const baseGeometry = new THREE.CylinderGeometry(
      radius * 1.5, // radiusTop
      radius * 1.8, // radiusBottom
      radius * 0.8, // height
      8             // radialSegments
    );
    
    // Reuse wood texture for base
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('textura/madera.jpg');
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    
    const baseMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(x, radius * 0.4, z);
    this.scene.add(base);
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
}
