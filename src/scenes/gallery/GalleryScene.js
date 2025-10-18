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
    this.columns = []; // Track columns for updates
    
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
    
    // Don't add columns here, they'll be added when artworks are added
  }
  
  addColumns() {
    console.log('Adding columns...');
    const columnRadius = 0.15; // Thinner columns
    const columnHeight = this.wallH - 0.5; // Slightly shorter than walls
    
    // Create column geometry
    const columnGeometry = new THREE.CylinderGeometry(
      columnRadius,
      columnRadius * 1.1, // Slightly wider at the bottom
      columnHeight,
      16
    );
    
    // Create a default material first
    const defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Brown color
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Function to create a material with texture that will be applied later
    const createTexturedMaterial = () => {
      const material = defaultMaterial.clone();
      const textureLoader = new THREE.TextureLoader();
      
      textureLoader.load(
        'textura/madera.jpg',
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 3);
          texture.anisotropy = 16;
          
          material.map = texture;
          material.needsUpdate = true;
        },
        undefined,
        (error) => {
          console.error('Error loading wood texture:', error);
          // Keep the default material if texture loading fails
        }
      );
      
      return material;
    };
    
    // Load texture and apply to all columns when ready
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'textura/madera.jpg',
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 3);
        texture.anisotropy = 16;
        
        // Update all existing columns with the texture
        this.columns.forEach(column => {
          column.material.map = texture;
          column.material.needsUpdate = true;
        });
      },
      undefined,
      (error) => {
        console.error('Error loading wood texture:', error);
      }
    );
    
    // Get artwork positions to place columns between them
    const artworkPositions = this.artworks.map(artwork => {
      const position = new THREE.Vector3();
      artwork.getObjects()[0].getWorldPosition(position);
      return position.z;
    }).sort((a, b) => a - b);
    
    // Calculate column positions between artworks
    const columnPositions = [];
    const minDistanceBetweenColumns = 3; // Minimum distance between columns
    
    // Add columns between artworks, ensuring minimum distance
    for (let i = 0; i < artworkPositions.length - 1; i++) {
      const pos1 = artworkPositions[i];
      const pos2 = artworkPositions[i + 1];
      const distance = Math.abs(pos2 - pos1);
      
      if (distance >= minDistanceBetweenColumns) {
        const midPoint = (pos1 + pos2) / 2;
        // Only add column if it's not too close to existing columns
        const isFarEnough = columnPositions.every(p => Math.abs(p - midPoint) >= minDistanceBetweenColumns);
        if (isFarEnough) {
          columnPositions.push(midPoint);
        }
      }
    }
    
    // Add columns at calculated positions
    columnPositions.forEach(z => {
      const wallOffset = 0.05; // Small offset to avoid z-fighting
      
      // Create left column with default material
      const leftColumn = new THREE.Mesh(columnGeometry, defaultMaterial.clone());
      leftColumn.position.set(
        -this.halfW + columnRadius + wallOffset,
        columnHeight / 2,
        z
      );
      leftColumn.castShadow = true;
      leftColumn.receiveShadow = true;
      leftColumn.userData.isColumn = true;
      this.scene.add(leftColumn);
      this.columns.push(leftColumn);
      
      // Create right column with default material
      const rightColumn = new THREE.Mesh(columnGeometry, defaultMaterial.clone());
      rightColumn.position.set(
        this.halfW - columnRadius - wallOffset,
        columnHeight / 2,
        z
      );
      rightColumn.castShadow = true;
      rightColumn.receiveShadow = true;
      rightColumn.userData.isColumn = true;
      this.scene.add(rightColumn);
      this.columns.push(rightColumn);
      
      console.log(`Added columns at z=${z.toFixed(2)}`);
    });
  }
  
  addColumnBase(x, z, radius) {
    const baseGeometry = new THREE.CylinderGeometry(
      radius * 1.5, // radiusTop
      radius * 1.8, // radiusBottom
      radius * 0.8, // height
      16            // Increased segments for smoother look
    );
    
    // Create wood material for base
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('textura/madera.jpg', (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 2);
      texture.anisotropy = 16;
    });
    
    const baseMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.5,
      metalness: 0.3,
      bumpScale: 0.1,
      side: THREE.DoubleSide
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(x, radius * 0.4, z);
    base.castShadow = true;
    base.receiveShadow = true;
    this.scene.add(base);
    
    // Add a small shadow under the base for better grounding
    const shadowGeometry = new THREE.CircleGeometry(radius * 1.5, 32);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.01, z); // Slightly above the floor
    this.scene.add(shadow);
  }

  addArtwork(artworkData) {
    const artwork = new Artwork(artworkData);
    const objects = artwork.getObjects();
    objects.forEach(obj => this.scene.add(obj));
    this.artworks.push(artwork);
    this.updateColumns(); // Update columns when adding new artwork
    return artwork;
  }
  
  // Clear existing columns from the scene
  clearColumns() {
    this.columns.forEach(column => {
      this.scene.remove(column);
    });
    this.columns = [];
  }
  
  // Update columns based on current artwork positions
  updateColumns() {
    // Remove existing columns
    this.clearColumns();
    
    // If we have less than 2 artworks, no need for columns
    if (this.artworks.length < 2) return;
    
    // Re-add columns with updated positions
    this.addColumns();
  }

  getScene() {
    return this.scene;
  }
}
