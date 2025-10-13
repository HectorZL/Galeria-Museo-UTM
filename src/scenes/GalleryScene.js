import * as THREE from 'three';
import { Artwork } from '../models/Artwork.js';

export class GalleryScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.halfW = 5;
    this.length = 100;
    this.wallH = 5;
    this.artworks = [];
    this.setupLights();
    this.createGallery();
  }

  setupLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(2, 5, 2);
    this.scene.add(key);
  }

  createGallery() {
    // Floor with marble-like texture
    const floorGeometry = new THREE.PlaneGeometry(2 * this.halfW, this.length);
    const floorMaterial = new THREE.MeshLambertMaterial({
      color: 0x888888,
      map: this.createFloorTexture()
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    this.scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

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

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(2 * this.halfW, this.length),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    ceiling.rotation.x = Math.PI/2;
    ceiling.position.y = this.wallH;
    this.scene.add(ceiling);
  }

  createFloorTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;

    // Create classic museum floor pattern - checkerboard marble tiles
    const tileSize = 128;
    const colors = [
      '#f5f5f0', // Off-white marble
      '#e8e8e0'  // Slightly darker marble
    ];

    // Draw checkerboard pattern
    for (let x = 0; x < canvas.width; x += tileSize) {
      for (let y = 0; y < canvas.height; y += tileSize) {
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);
        const colorIndex = (tileX + tileY) % 2;

        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, tileSize, tileSize);

        // Add subtle marble veining using deterministic pattern
        const veinSeed = (tileX * 7 + tileY * 13) % 100;
        if (veinSeed > 70) {
          ctx.strokeStyle = `rgba(200, 200, 190, ${(veinSeed - 70) / 30 * 0.3 + 0.1})`;
          ctx.lineWidth = ((veinSeed - 70) / 30 * 2) + 1;
          ctx.beginPath();

          // Create consistent vein pattern based on tile position
          const startX = x + (tileX * 17) % tileSize;
          const startY = y;
          const endX = x + (tileY * 23) % tileSize;
          const endY = y + tileSize;

          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

        // Add texture variation using deterministic pattern
        const textureSeed = (tileX * 11 + tileY * 19) % 100;
        if (textureSeed > 80) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(textureSeed - 80) / 20 * 0.2})`;
          const spotX = x + (tileX * 29) % tileSize;
          const spotY = y + (tileY * 31) % tileSize;
          ctx.fillRect(spotX, spotY, 20, 20);
        }
      }
    }

    // Add grout lines between tiles
    ctx.strokeStyle = '#d0d0c8';
    ctx.lineWidth = 2;

    for (let x = 0; x <= canvas.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
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
