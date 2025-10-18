import * as THREE from 'three';

export class Artwork {
  constructor({ titulo, x = 0, z = 0, imgSrc, descripcion = '', obraData = null }) {
    this.titulo = titulo;
    this.x = x;
    this.z = z;
    this.imgSrc = imgSrc;
    this.descripcion = descripcion;
    this.obraData = obraData; // Store full obra data for modal
    this.highResLoaded = false;
    this.lowResLoaded = false;
    this.currentQuality = 'low'; // 'low', 'medium', 'high'
    this.fadeProgress = 0; // For smooth transitions
    this.mesh = this.createArtwork();
  }

  createArtwork() {
    const group = new THREE.Group();
    
    // Create frame
    const frameWidth = 2;  // Increased width to accommodate frame
    const frameHeight = 2.5; // Increased height to accommodate frame
    const frameDepth = 0.1;
    const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513,  // Brown wood color
      side: THREE.DoubleSide
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    
    // Create artwork image
    const textureLoader = new THREE.TextureLoader();
    this.loadLowResTexture();
    const material = new THREE.MeshBasicMaterial({
      map: this.lowResTexture,
      side: THREE.DoubleSide
    });

    // Slightly smaller than frame
    const imageWidth = frameWidth * 0.9;
    const imageHeight = frameHeight * 0.9;
    const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
    const image = new THREE.Mesh(geometry, material);
    image.position.z = 0.051; // Slightly in front of the frame
    
    // Create info panel with glass effect - now more square
    const panelSize = 0.5; // Square size
    const panelGeometry = new THREE.PlaneGeometry(panelSize, panelSize);
    
    // Glass material
    const panelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      transparent: true,
      opacity: 0.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      ior: 1.5,
      envMapIntensity: 1.0,
      side: THREE.DoubleSide
    });
    
    const infoPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    
    // Position panel to the right of the artwork (or left if on right wall)
    const panelOffset = (frameWidth / 2) + (panelSize / 2) + 0.1; // Small gap
    infoPanel.position.set(
      this.x < 0 ? -panelOffset : panelOffset,
      0.2, // Slightly higher to center vertically
      0
    );
    
    // Add title to the panel
    this.createTitlePanel().then(titleMesh => {
      titleMesh.position.set(0, 0, 0.01); // Slightly in front of the panel
      infoPanel.add(titleMesh);
    });
    
    // Add userData to panel for click detection
    infoPanel.userData = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      imgSrc: this.imgSrc,
      isInfoPanel: true,
      obraData: this.obraData,
      isArtwork: true // To ensure it's picked up by the raycaster
    };
    
    // Add frame and image to group
    group.add(frame);
    group.add(image);
    group.add(infoPanel);
    
    // Add userData to all child meshes for click detection
    const userData = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      imgSrc: this.imgSrc,
      isArtwork: true,
      obraData: this.obraData
    };
    
    frame.userData = userData;
    image.userData = userData;
    
    // Position the entire group and set rotation based on side
    group.position.set(this.x, 2.2, this.z);
    group.rotation.y = this.x < 0 ? Math.PI/2 : -Math.PI/2;
    
    // Add interactivity to the group
    group.userData = userData;
    group.cursor = 'pointer';

    return group;
  }
  
  async createTitlePanel() {
    const canvas = document.createElement('canvas');
    const size = 256; // Smaller canvas for the smaller panel
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw semi-transparent background with rounded corners
    const cornerRadius = 15; // Smaller radius for smaller panel
    ctx.fillStyle = 'rgba(40, 40, 40, 0.7)';
    this.roundRect(ctx, 0, 0, size, size, cornerRadius);
    ctx.fill();
    
    // Draw title text (split into multiple lines if needed)
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const maxWidth = size * 0.9; // Use more of the available width
    const lineHeight = size / 6;  // Slightly more compact line height
    let y = size * 0.5;          // Start lower in the panel
    
    // Calculate maximum font size that fits
    let fontSize = Math.min(size / 8, 24); // Start with a smaller base font size
    ctx.font = `bold ${fontSize}px Arial`;
    
    // Split title into words and create lines
    const words = this.titulo.split(' ');
    const lines = [];
    let line = '';
    
    // First pass: calculate how many lines we'll need
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    
    // Adjust font size if we have too many lines
    if (lines.length > 2) {
      fontSize = Math.max(12, fontSize - (lines.length - 2) * 2);
      ctx.font = `bold ${fontSize}px Arial`;
    }
    
    // Calculate starting y position to center the text
    y = (size - (lines.length - 1) * lineHeight) / 2;
    
    // Draw all lines
    for (const textLine of lines) {
      ctx.fillText(textLine, size / 2, y);
      y += lineHeight;
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9
    });
    
    const geometry = new THREE.PlaneGeometry(0.6, 0.6); // Slightly smaller than panel
    return new THREE.Mesh(geometry, material);
  }
  
  // Helper function to draw rounded rectangles
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  createTitle() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 120;

    // Fondo semitransparente con esquinas redondeadas
    const cornerRadius = 20;
    ctx.fillStyle = 'rgba(40, 40, 40, 0.85)';
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(canvas.width - cornerRadius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius);
    ctx.lineTo(canvas.width, canvas.height - cornerRadius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - cornerRadius, canvas.height);
    ctx.lineTo(cornerRadius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.fill();

    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dividir el título en líneas si es necesario
    const maxWidth = canvas.width * 0.9;
    const words = this.titulo.split(' ');
    let line = '';
    const lines = [];

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Dibujar líneas de texto
    const lineHeight = 40;
    const startY = (canvas.height - (lines.length - 1) * lineHeight) / 2;

    lines.forEach((text, i) => {
      ctx.fillText(text.trim(), canvas.width / 2, startY + (i * lineHeight));
    });

    const titleTexture = new THREE.CanvasTexture(canvas);
    const titleMaterial = new THREE.MeshBasicMaterial({
      map: titleTexture,
      transparent: true,
      opacity: 0.95
    });

    // Calcular el tamaño del título proporcional al tamaño de la imagen
    const imageWidth = 2.2; // Ancho de la imagen
    const imageHeight = 2.75; // Alto de la imagen

    // Hacer que el título tenga aproximadamente el 80% del ancho de la imagen
    const titleWidth = Math.min(imageWidth * 0.8, 3.0);
    const titleHeight = 0.25 + (lines.length * 0.08);

    const titleGeometry = new THREE.PlaneGeometry(titleWidth, titleHeight);
    const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);

    // Posicionar el título perfectamente centrado debajo de la imagen
    const imageY = 2.2; // Posición Y de la imagen
    const imageZ = this.z; // Posición Z de la imagen

    titleMesh.position.set(
      this.x, // Same x position as the artwork
      imageY - imageHeight/2 - titleHeight/2 - 0.3, // Below the image with space
      this.z - 0.1 // Same z position as the artwork
    );

    // Rotate title to match artwork rotation
    titleMesh.rotation.y = this.x < 0 ? Math.PI/2 : -Math.PI/2;

    return titleMesh;
  }

  getObjects() {
    return [this.mesh]; // Title is now part of the mesh
  }

  createBlurredTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;

    // Create a simple blurred placeholder (gray gradient)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#cccccc');
    gradient.addColorStop(1, '#aaaaaa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some blur effect by drawing semi-transparent overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new THREE.CanvasTexture(canvas);
  }

  loadHighResTexture() {
    if (this.highResLoaded) return this.highResTexture; // Already loaded

    const textureLoader = new THREE.TextureLoader();
    const highResTexture = textureLoader.load(this.imgSrc, (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      this.highResLoaded = true;
      this.setHighResTexture(texture);
      // Update the material map to use high-res texture
      this.mesh.children[1].material.map = texture;
      this.mesh.children[1].material.needsUpdate = true;
    });
    this.setHighResTexture(highResTexture);
    return highResTexture;
  }

  loadLowResTexture() {
    if (this.lowResLoaded) return this.lowResTexture; // Already loaded

    const textureLoader = new THREE.TextureLoader();
    // Create a 512x512 version by resizing the image
    this.createLowResTexture().then(lowResTexture => {
      this.lowResLoaded = true;
      this.setLowResTexture(lowResTexture);
      this.mesh.children[1].material.map = lowResTexture;
      this.mesh.children[1].material.needsUpdate = true;
    });
    return this.lowResTexture;
  }

  createLowResTexture() {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;

        // Maintain aspect ratio and center the image
        const aspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

        if (aspect > 1) {
          drawWidth = 512;
          drawHeight = 512 / aspect;
          offsetY = (512 - drawHeight) / 2;
        } else {
          drawWidth = 512 * aspect;
          drawHeight = 512;
          offsetX = (512 - drawWidth) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        resolve(texture);
      };
      img.src = this.imgSrc;
    });
  }

  updateQuality(distance) {
    let targetQuality = 'low';

    if (distance < 5) {
      targetQuality = 'high';
    } else if (distance < 15) {
      targetQuality = 'medium';
    }

    if (targetQuality !== this.currentQuality) {
      this.fadeProgress = 0;
      this.currentQuality = targetQuality;
      this.startQualityTransition(targetQuality);
    }
  }

  startQualityTransition(targetQuality) {
    // For now, just switch immediately, but we can add fade logic here
    switch (targetQuality) {
      case 'high':
        if (!this.highResLoaded) {
          this.loadHighResTexture();
        } else {
          this.mesh.children[1].material.map = this.highResTexture;
        }
        break;
      case 'medium':
        // For medium, we could use a 1024x1024 version or the high-res with reduced quality
        if (!this.highResLoaded) {
          this.loadHighResTexture();
        } else {
          this.mesh.children[1].material.map = this.highResTexture;
        }
        break;
      case 'low':
        if (!this.lowResLoaded) {
          this.loadLowResTexture();
        } else {
          this.mesh.children[1].material.map = this.lowResTexture;
        }
        break;
    }
    this.mesh.children[1].material.needsUpdate = true;
  }

  // Store references to textures for quick switching
  setLowResTexture(texture) {
    this.lowResTexture = texture;
  }

  setHighResTexture(texture) {
    this.highResTexture = texture;
  }
}
