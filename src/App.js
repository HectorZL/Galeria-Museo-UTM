import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GalleryScene } from './scenes/GalleryScene.js';
import { loadObras } from '../js/lib/obras.js';
import { mountObraModal, showObraModal } from '../js/lib/modal-obra.js';

// Helper function to safely handle material emissive properties
function withEmissive(obj, fn) {
  if (!obj || !obj.material) return;
  const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
  for (const m of mats) {
    if (m && m.emissive) fn(m);
  }
}

export class App {
  constructor() {
    // Modal state management
    this.modalOpen = false;
    this.INTERSECTED = null;

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.initModal();
    this.setupEventListeners();
    this.setupModalStateSync(); // Add modal state synchronization
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
          imagen: '/images/1.JPG',
          descripcion: 'Descripción detallada de la obra 1.'
        },
        {
          titulo: 'Obra 2 — "Centro"',
          z: 6,
          imagen: '/images/2.JPG',
          descripcion: 'Descripción detallada de la obra 2.'
        },
      ];
    }

    // Add artworks to the gallery with proper spacing - 5 on left, 5 on right
    const artworkSpacing = 8; // Increased spacing for better visibility
    const artworks = this.obras.map((obra, index) => {
      const side = index % 2 === 0 ? 'left' : 'right'; // Alternate sides
      const wallOffset = side === 'left' ? -this.gallery.halfW + 0.1 : this.gallery.halfW - 0.1; // Position near walls
      const zPosition = -20 + (Math.floor(index / 2) * artworkSpacing); // Back to original spacing

      return {
        titulo: `${obra.id} — "${obra.titulo}"`,
        x: wallOffset,
        z: zPosition,
        imgSrc: obra.imagen,
        descripcion: obra.descripcion,
        // Store additional data for the modal
        obraData: obra
      };
    });

    this.artworks = [];
    artworks.forEach(artwork => {
      this.artworks.push(this.gallery.addArtwork(artwork));
    });
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, -23); // Start at beginning of artworks, slightly behind first one
    this.camera.rotation.y = Math.PI; // Rotate 180 degrees to face opposite direction
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Add crosshair for center-screen clicking
    this.createCrosshair();
  }

  createCrosshair() {
    // Create crosshair element
    this.crosshair = document.createElement('div');
    this.crosshair.id = 'crosshair';
    this.crosshair.style.position = 'fixed';
    this.crosshair.style.top = '50%';
    this.crosshair.style.left = '50%';
    this.crosshair.style.width = '20px';
    this.crosshair.style.height = '20px';
    this.crosshair.style.transform = 'translate(-50%, -50%)';
    this.crosshair.style.pointerEvents = 'none';
    this.crosshair.style.zIndex = '1000';

    // Create crosshair lines
    const horizontalLine = document.createElement('div');
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.top = '50%';
    horizontalLine.style.left = '0';
    horizontalLine.style.width = '100%';
    horizontalLine.style.height = '2px';
    horizontalLine.style.backgroundColor = '#ffffff';
    horizontalLine.style.transform = 'translateY(-50%)';

    const verticalLine = document.createElement('div');
    verticalLine.style.position = 'absolute';
    verticalLine.style.left = '50%';
    verticalLine.style.top = '0';
    verticalLine.style.width = '2px';
    verticalLine.style.height = '100%';
    verticalLine.style.backgroundColor = '#ffffff';
    verticalLine.style.transform = 'translateX(-50%)';

    // Add lines to crosshair
    this.crosshair.appendChild(horizontalLine);
    this.crosshair.appendChild(verticalLine);

    // Add to document body
    document.body.appendChild(this.crosshair);
  }

  initControls() {
    this.controls = new PointerLockControls(this.camera, document.body);
    document.body.addEventListener('click', (event) => {
      console.log('Click event triggered, modalOpen:', this.modalOpen); // Debug log
      if (!this.modalOpen && !window.__modalOpen) { // No bloquear controles si modal está abierto
        console.log('Attempting to lock controls'); // Debug log
        this.controls.lock();
      } else {
        console.log('Controls blocked because modal is open'); // Debug log
      }
    });

    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false
    };

    document.addEventListener('keydown', (e) => {
      if (this.modalOpen || window.__modalOpen) return; // Bloquear teclado si modal está abierto
      switch(e.key.toLowerCase()) {
        case 'w': this.keys.w = true; break;
        case 's': this.keys.s = true; break;
        case 'a': this.keys.a = true; break;
        case 'd': this.keys.d = true; break;
      }
    });

    document.addEventListener('keyup', (e) => {
      if (this.modalOpen || window.__modalOpen) return; // Bloquear teclado si modal está abierto
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
    console.log('Initializing modal system...');
    mountObraModal();

    // Check if modal was created
    const modalRoot = document.getElementById('obra-modal-root');
    console.log('Modal root element:', modalRoot);
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

  setupModalStateSync() {
    // Mantener un flag local pero también escuchar eventos del modal
    this.modalOpen = !!window.__modalOpen;
    window.addEventListener('obra-modal-open', () => { this.modalOpen = true; });
    window.addEventListener('obra-modal-close', () => { this.modalOpen = false; });
  }

  onDocumentMouseMove(event) {
    if (this.modalOpen) return;

    if (this.controls.isLocked) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the raycaster with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check for intersections with all objects in the scene
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      // Reset previous hover state
      if (this.INTERSECTED) {
        withEmissive(this.INTERSECTED, m => m.emissive.setHex(this.INTERSECTED._origHex ?? 0x000000));
        this.INTERSECTED = null;
        document.body.style.cursor = 'auto';
      }

      // Check for new intersections
      if (intersects.length > 0) {
        // Find the first object with isArtwork in userData
        const artworkIntersect = intersects.find(intersect => 
          intersect.object.userData && intersect.object.userData.isArtwork
        );

        if (artworkIntersect) {
          const object = artworkIntersect.object;
          this.INTERSECTED = object;
          
          // Highlight the hovered artwork
          withEmissive(object, m => {
            if (!object._origHex) object._origHex = m.emissive.getHex();
            m.emissive.setHex(0x555555);
          });
          
          document.body.style.cursor = 'pointer';
          this.hoveredObject = object;
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
    if (this.modalOpen) return; // Block all updates when modal is open

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
      const halfL = 60;  // Back to original gallery length bounds
      camera.position.x = Math.max(-halfW, Math.min(halfW, camera.position.x));
      camera.position.z = Math.max(-halfL, Math.min(halfL, camera.position.z));
      camera.position.y = 1.6; // Fixed height

      // Check distance to artworks and load high-res textures for nearby ones
      this.checkArtworkDistances(camera);
    }
  }

  onDocumentClick(event) {
    if (this.modalOpen || !this.controls.isLocked) return;

    // Usar el centro de la pantalla para el raycasting (lo que ve el usuario)
    const centerX = 0; // Centro en coordenadas normalizadas (-1 a 1)
    const centerY = 0;

    // Crear un rayo desde el centro de la pantalla
    this.mouse.x = centerX;
    this.mouse.y = centerY;

    // Update the raycaster with the camera and center position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections with all objects in the scene
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      // Find the first object with isArtwork in userData
      const artworkIntersect = intersects.find(intersect =>
        intersect.object.userData && intersect.object.userData.isArtwork
      );

      if (artworkIntersect) {
        const object = artworkIntersect.object;
        console.log('Clicked artwork:', object.userData);

        // Load high-res texture immediately for clicked artwork if needed
        if (object.userData.imgSrc) {
          const artwork = this.artworks.find(art => art.imgSrc === object.userData.imgSrc);
          if (artwork && artwork.loadHighResTexture) {
            artwork.loadHighResTexture();
          }
        }

        // Show the modal if we have the required data
        if (object.userData.obraData) {
          console.log('Showing modal for artwork:', object.userData.obraData.titulo);

          showObraModal(object.userData.obraData, {
            onOpen: () => {
              this.modalOpen = true;
              if (this.controls.isLocked) {
                this.controls.unlock();
              }
            },
            onClose: () => {
              this.modalOpen = false;
              console.log('modalOpen is now:', this.modalOpen);
              // Restore focus to canvas for immediate interaction
              if (this.renderer && this.renderer.domElement) {
                this.renderer.domElement.focus();
              }
              // Note: Controls will be re-enabled on next user click via the event listener in initControls
            }
          });
        } else {
          console.log('No obraData found, cannot show modal');
        }
      } else {
        console.log('No artwork found at center of screen');
      }
    } else {
      console.log('No objects found at center of screen');
    }
  }

  checkArtworkDistances(camera) {
    this.artworks.forEach(artwork => {
      const distance = camera.position.distanceTo(artwork.mesh.position);
      artwork.updateQuality(distance);
    });
  }

  getScene() {
    return this.scene;
  }
}
