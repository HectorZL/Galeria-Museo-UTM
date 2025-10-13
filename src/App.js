import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GalleryScene } from './scenes/GalleryScene.js';
import { Modal } from './utils/Modal.js';

export class App {
  constructor() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.initModal();
    this.setupEventListeners();
    this.animate();
  }

  initScene() {
    this.gallery = new GalleryScene();
    this.scene = this.gallery.getScene();
    
    // Add artworks to the gallery
    const artworks = [
      { 
        titulo: 'Obra 1 — "Inicio"', 
        z: -20, 
        imgSrc: 'images/1.JPG',
        descripcion: 'Descripción detallada de la obra 1. Haga clic fuera de la imagen para volver.'
      },
      { 
        titulo: 'Obra 2 — "Centro"', 
        z: 0, 
        imgSrc: 'images/2.JPG',
        descripcion: 'Descripción detallada de la obra 2. Haga clic fuera de la imagen para volver.'
      },
    ];

    this.artworks = [];
    artworks.forEach(artwork => {
      this.artworks.push(this.gallery.addArtwork(artwork));
    });
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, 20);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  initControls() {
    this.controls = new PointerLockControls(this.camera, document.body);
    document.body.addEventListener('click', () => this.controls.lock());
    
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.code] = true);
    window.addEventListener('keyup', e => this.keys[e.code] = false);
  }

  initModal() {
    this.modal = new Modal();
    this.modal.onClick(() => {
      this.modal.hide();
      this.controls.lock();
    });
  }

  setupEventListeners() {
    // Raycaster for detecting clicks on artworks
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    window.addEventListener('click', (event) => this.onDocumentClick(event));
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onDocumentClick(event) {
    if (this.controls.isLocked) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      
      // Check all objects in the scene for intersection
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.imgSrc) {
          this.modal.show(object.userData);
          this.controls.unlock();
        }
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

  update() {
    if (this.controls.isLocked) {
      const speed = 2; // Increased speed for better responsiveness
      const deltaTime = 0.016; // Approximate 60fps delta time
      const moveSpeed = speed * deltaTime;

      if (this.keys['KeyW']) this.controls.moveForward(moveSpeed);
      if (this.keys['KeyS']) this.controls.moveForward(-moveSpeed);
      if (this.keys['KeyA']) this.controls.moveRight(-moveSpeed);
      if (this.keys['KeyD']) this.controls.moveRight(moveSpeed);

      // Limit movement within gallery bounds with smoother boundaries
      const halfW = 4.6; // Slightly less than wall position
      const halfL = 45;  // Half of gallery length
      const camera = this.controls.getObject();

      // Smooth boundary checking with clamping
      camera.position.x = Math.max(-halfW, Math.min(halfW, camera.position.x));
      camera.position.z = Math.max(-halfL, Math.min(halfL, camera.position.z));
      camera.position.y = 1.6; // Fixed height

      // Add smooth rotation with mouse movement
      if (this.keys['KeyQ']) this.camera.rotation.y -= 0.02; // Rotate left
      if (this.keys['KeyE']) this.camera.rotation.y += 0.02; // Rotate right
    }
  }
}
