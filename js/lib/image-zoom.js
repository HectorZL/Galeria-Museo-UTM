// js/lib/image-zoom.js
// Funcionalidad para zoom en imágenes dentro del modal

let currentZoom = 1;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let translateX = 0;
let translateY = 0;
let imgElement = null;

export function enableImageZoom() {
  const modal = document.getElementById('obra-modal-root');
  if (!modal) return;

  imgElement = modal.querySelector('#obra-img');
  if (!imgElement) return;

  // Crear controles de zoom
  const controls = document.createElement('div');
  controls.id = 'zoom-controls';
  controls.className = 'absolute top-4 right-4 flex space-x-2';
  controls.innerHTML = `
    <button id="zoom-in" class="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors" title="Acercar">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
      </svg>
    </button>
    <button id="zoom-out" class="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors" title="Alejar">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
      </svg>
    </button>
    <button id="zoom-reset" class="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors" title="Restablecer zoom">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
    </button>
  `;

  // Añadir controles al modal
  const modalContent = modal.querySelector('.absolute.inset-0.grid');
  if (modalContent) {
    modalContent.appendChild(controls);
  }

  // Hacer la imagen zoomable y arrastrable
  imgElement.style.cursor = 'grab';
  imgElement.style.transition = 'transform 0.2s ease';

  // Eventos para controles
  controls.querySelector('#zoom-in').addEventListener('click', () => zoomIn());
  controls.querySelector('#zoom-out').addEventListener('click', () => zoomOut());
  controls.querySelector('#zoom-reset').addEventListener('click', () => resetZoom());

  // Eventos para zoom con rueda del mouse
  imgElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  });

  // Eventos para arrastrar
  imgElement.addEventListener('mousedown', (e) => {
    if (currentZoom > 1) {
      isDragging = true;
      dragStartX = e.clientX - translateX;
      dragStartY = e.clientY - translateY;
      imgElement.style.cursor = 'grabbing';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && currentZoom > 1) {
      translateX = e.clientX - dragStartX;
      translateY = e.clientY - dragStartY;
      updateTransform();
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    imgElement.style.cursor = currentZoom > 1 ? 'grab' : 'default';
  });

  // Prevenir arrastrar por defecto
  imgElement.addEventListener('dragstart', (e) => e.preventDefault());
}

function zoomIn() {
  if (currentZoom < 3) { // Máximo zoom 3x
    currentZoom += 0.25;
    updateTransform();
  }
}

function zoomOut() {
  if (currentZoom > 1) {
    currentZoom -= 0.25;
    updateTransform();
  }
}

function resetZoom() {
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  updateTransform();
  imgElement.style.cursor = 'default';
}

function updateTransform() {
  if (imgElement) {
    imgElement.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    imgElement.style.cursor = currentZoom > 1 ? 'grab' : 'default';
  }
}

export function disableImageZoom() {
  const controls = document.getElementById('zoom-controls');
  if (controls) {
    controls.remove();
  }

  if (imgElement) {
    imgElement.style.transform = 'none';
    imgElement.style.cursor = 'default';
    imgElement.style.transition = 'none';
  }

  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  isDragging = false;
  imgElement = null;
}
