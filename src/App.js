import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GalleryScene } from './scenes/GalleryScene.js';
import { Modal } from './utils/Modal.js';
import { loadObras } from '../js/lib/obras.js';
import { mountObraModal, showObraModal } from '../js/lib/modal-obra.js';

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

  async initScene() {
    this.gallery = new GalleryScene();
    this.scene = this.gallery.getScene();

    // Load obras data from JSON
    try {
      const obrasData = await loadObras();
      this.obras = obrasData.list;
    } catch (error) {
      console.error('Error loading obras:', error);
      // Fallback to hardcoded data if JSON fails
      this.obras = [
        {
          titulo: 'Obra 1 — "Inicio"',
          z: -6,
          imagen: 'images/1.JPG',
          descripcion: 'Descripción detallada de la obra 1.'
        },
        {
          titulo: 'Obra 2 — "Centro"',
          z: 6,
          imagen: 'images/2.JPG',
          descripcion: 'Descripción detallada de la obra 2.'
        },
      ];
    }

    // Add artworks to the gallery with proper spacing
    const artworkSpacing = 6;
    const artworks = this.obras.map((obra, index) => ({
      titulo: `${obra.id} — "${obra.titulo}"`,
      z: -artworkSpacing + (index * artworkSpacing),
      imgSrc: obra.imagen,
      descripcion: obra.descripcion,
      // Store additional data for the modal
      obraData: obra
    }));

    this.artworks = [];
    artworks.forEach(artwork => {
      this.artworks.push(this.gallery.addArtwork(artwork));
    });
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, 0); // Start in the center of the gallery
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

    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false
    };

    document.addEventListener('keydown', (e) => {
      switch(e.key.toLowerCase()) {
        case 'w': this.keys.w = true; break;
        case 's': this.keys.s = true; break;
        case 'a': this.keys.a = true; break;
        case 'd': this.keys.d = true; break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch(e.key.toLowerCase()) {
        case 'w': this.keys.w = false; break;
        case 's': this.keys.s = false; break;
        case 'a': this.keys.a = false; break;
        case 'd': this.keys.d = false; break;
      }
    });
  }

  initModal() {
    // Initialize the new modal system
    mountObraModal();

    // Keep old modal as fallback
    this.oldModal = new Modal();
    this.oldModal.onClick(() => {
      this.oldModal.hide();
      this.controls.lock();
    });
  }

  setupEventListeners() {
    // Raycaster for detecting clicks on artworks
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Mouse move listener for hover effects
    window.addEventListener('mousemove', (event) => this.onDocumentMouseMove(event));
    window.addEventListener('click', (event) => this.onDocumentClick(event));
    window.addEventListener('resize', () => this.onWindowResize());

    // Store current hovered object for cursor changes
    this.hoveredObject = null;
  }

  onDocumentMouseMove(event) {
    if (!this.controls.isLocked) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check all objects in the scene for intersection
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      // Reset cursor for all objects first
      this.scene.traverse((obj) => {
        if (obj.userData && obj.userData.isArtwork) {
          obj.material.emissive.setHex(0x000000);
        }
      });

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData && object.userData.isArtwork) {
          // Highlight the hovered artwork
          object.material.emissive.setHex(0x333333);
          document.body.style.cursor = 'pointer';
          this.hoveredObject = object;
        } else {
          document.body.style.cursor = 'auto';
          this.hoveredObject = null;
        }
      } else {
        document.body.style.cursor = 'auto';
        this.hoveredObject = null;
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
      const speed = 5; // Increased speed for better responsiveness
      const deltaTime = 0.016; // Approximate 60fps delta time
      const moveSpeed = speed * deltaTime;

      // Movement controls with direct position manipulation for better control
      const camera = this.controls.getObject();
      const direction = new THREE.Vector3();

      // Get input - corrected for standard WASD movement
      const moveX = (this.keys.a ? 1 : 0) - (this.keys.d ? 1 : 0);
      const moveZ = (this.keys.w ? 1 : 0) - (this.keys.s ? 1 : 0);

      // Get camera forward and right vectors
      camera.getWorldDirection(direction);
      const forward = new THREE.Vector3(direction.x, 0, direction.z).normalize();
      const right = new THREE.Vector3(direction.z, 0, -direction.x).normalize();

      // Calculate movement vector
      const moveVector = new THREE.Vector3();
      moveVector.add(forward.multiplyScalar(moveZ * moveSpeed));
      moveVector.add(right.multiplyScalar(moveX * moveSpeed));

      // Apply movement
      if (Math.abs(moveX) > 0 || Math.abs(moveZ) > 0) {
        camera.position.add(moveVector);
      }

      // Limit movement within gallery bounds
      const halfW = 4.6; // Slightly less than wall position
      const halfL = 60;  // Increased gallery length for better movement
      camera.position.x = Math.max(-halfW, Math.min(halfW, camera.position.x));
      camera.position.z = Math.max(-halfL, Math.min(halfL, camera.position.z));
      camera.position.y = 1.6; // Fixed height
    }
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
          // Try to use new modal system first
          if (object.userData.obraData) {
            showObraModal(object.userData.obraData);
          } else {
            // Fallback to old modal system
            this.oldModal.show(object.userData);
          }
          this.controls.unlock();
        }
      }
    }
  }
}
