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
    
    // Directional light
    const key = new THREE.DirectionalLight(0xFFFFFE, 0.2);
    key.position.set(2, 5, 2);
    this.scene.add(key);
  }

  createGallery() {
    // Create floor
    this.floor = new Floor(this.scene, this.halfW, this.length);
    
    // Create walls
    this.walls = new Walls(this.scene, this.halfW, this.length, this.wallH);
    
    // Create vault ceiling
    this.vaultCeiling = new VaultCeiling(this.scene, this.halfW, this.length, this.wallH);
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
