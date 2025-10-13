import * as THREE from 'three';

export class Artwork {
  constructor({ titulo, z, imgSrc, descripcion = '' }) {
    this.titulo = titulo;
    this.z = z;
    this.imgSrc = imgSrc;
    this.descripcion = descripcion;
    this.mesh = this.createArtwork();
  }

  createArtwork() {
    const group = new THREE.Group();
    
    // Create frame
    const frameWidth = 2.4;  // Increased width to accommodate frame
    const frameHeight = 3.0; // Increased height to accommodate frame
    const frameDepth = 0.1;
    const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513,  // Brown wood color
      side: THREE.DoubleSide
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    
    // Create artwork image
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.imgSrc, (texture) => {
      texture.encoding = THREE.sRGBEncoding;
    });

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    // Slightly smaller than frame
    const imageWidth = frameWidth * 0.9;
    const imageHeight = frameHeight * 0.9;
    const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
    const image = new THREE.Mesh(geometry, material);
    image.position.z = 0.051; // Slightly in front of the frame
    
    // Add frame and image to group
    group.add(frame);
    group.add(image);
    
    // Position the entire group
    group.position.set(4.95, 2.2, this.z);
    group.rotation.y = -Math.PI/2;

    // Add interactivity to the group
    group.userData = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      imgSrc: this.imgSrc
    };
    group.cursor = 'pointer';

    return group;
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
      4.95, // Misma posición X que la imagen (centrada horizontalmente)
      imageY - imageHeight/2 - titleHeight/2 - 0.3, // Debajo de la imagen con espacio
      imageZ - 0.1 // Misma posición Z que la imagen (centrada en profundidad)
    );
    titleMesh.rotation.y = -Math.PI/2;

    return titleMesh;
  }

  getObjects() {
    return [this.mesh, this.createTitle()];
  }
}
