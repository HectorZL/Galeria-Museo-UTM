// js/lib/image-zoom.js — robusto y sin NPEs
let currentZoom = 1;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let translateX = 0, translateY = 0;
let imgElement = null;
let root = null;

// Handlers nombrados para poder removerlos
function onWheel(e) {
  if (!imgElement) return;
  e.preventDefault();
  const delta = Math.sign(e.deltaY) * -0.1;
  currentZoom = Math.max(1, Math.min(6, currentZoom + delta));
  imgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}
function onMouseDown(e) {
  if (!imgElement || currentZoom === 1) return;
  isDragging = true;
  dragStartX = e.clientX - translateX;
  dragStartY = e.clientY - translateY;
  imgElement.style.cursor = 'grabbing';
}
function onMouseMove(e) {
  if (!imgElement || !isDragging) return;
  translateX = e.clientX - dragStartX;
  translateY = e.clientY - dragStartY;
  imgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}
function onMouseUp() {
  if (!imgElement) return;
  isDragging = false;
  imgElement.style.cursor = currentZoom > 1 ? 'grab' : 'default';
}
function zoomIn() {
  if (!imgElement) return;
  currentZoom = Math.min(6, currentZoom + 0.25);
  imgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
  imgElement.style.cursor = currentZoom > 1 ? 'grab' : 'default';
}
function zoomOut() {
  if (!imgElement) return;
  currentZoom = Math.max(1, currentZoom - 0.25);
  if (currentZoom === 1) { translateX = 0; translateY = 0; }
  imgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
  imgElement.style.cursor = currentZoom > 1 ? 'grab' : 'default';
}
function zoomReset() {
  if (!imgElement) return;
  currentZoom = 1; translateX = 0; translateY = 0; isDragging = false;
  imgElement.style.transform = 'none';
  imgElement.style.cursor = 'default';
}

export function enableImageZoom() {
  root = document.getElementById('obra-modal-root');
  if (!root) return;
  imgElement = root.querySelector('#obra-img');
  if (!imgElement) return;

  // Controles (se crean si no existen)
  let ui = root.querySelector('[data-zoom-ui]');
  if (!ui) {
    const modalContent = root.querySelector('.absolute.inset-0.grid');
    if (!modalContent) return;
    ui = document.createElement('div');
    ui.setAttribute('data-zoom-ui', 'true');
    ui.className = 'pointer-events-none absolute inset-0';
    ui.innerHTML = `
      <div class="pointer-events-auto fixed bottom-4 right-4 grid gap-2">
        <button id="zoom-in" class="p-2 rounded-lg bg-black/60 text-white" title="Acercar">+</button>
        <button id="zoom-out" class="p-2 rounded-lg bg-black/60 text-white" title="Alejar">−</button>
        <button id="zoom-reset" class="p-2 rounded-lg bg-black/60 text-white" title="Restablecer">○</button>
      </div>`;
    modalContent.appendChild(ui);
  }

  // Listeners
  imgElement.addEventListener('wheel', onWheel, { passive: false });
  imgElement.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  ui.querySelector('#zoom-in')?.addEventListener('click', zoomIn);
  ui.querySelector('#zoom-out')?.addEventListener('click', zoomOut);
  ui.querySelector('#zoom-reset')?.addEventListener('click', zoomReset);
}

export function disableImageZoom() {
  if (!root) { imgElement = null; return; }
  const ui = root.querySelector('[data-zoom-ui]');

  // Quitar listeners si el elemento aún existe
  if (imgElement) {
    imgElement.removeEventListener('wheel', onWheel);
    imgElement.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    imgElement.style.transform = 'none';
    imgElement.style.cursor = 'default';
  }
  ui?.querySelector('#zoom-in')?.removeEventListener('click', zoomIn);
  ui?.querySelector('#zoom-out')?.removeEventListener('click', zoomOut);
  ui?.querySelector('#zoom-reset')?.removeEventListener('click', zoomReset);

  // Reset de estado
  currentZoom = 1;
  translateX = 0; translateY = 0;
  isDragging = false;
  imgElement = null;
  root = null;
}
