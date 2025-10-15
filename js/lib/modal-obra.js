// /js/modal-obra.js
import { enableImageZoom, disableImageZoom } from './image-zoom.js';
export function mountObraModal() {
const root = document.createElement('div');
root.id = 'obra-modal-root';
root.className = 'fixed inset-0 hidden z-50';
root.innerHTML = `
<div class="absolute inset-0 bg-black/60" data-close></div>
<div class="absolute inset-0 grid place-items-center p-4">
<article class="bg-white max-w-5xl w-full grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl">
<figure class="bg-neutral-100 aspect-[4/3] md:aspect-auto md:h-full">
<img id="obra-img" alt="Obra" class="w-full h-full object-contain"/>
</figure>
<section class="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
<header class="mb-4">
<h2 id="obra-titulo" class="text-2xl font-semibold leading-tight"></h2>
<p id="obra-autor" class="text-sm text-neutral-600"></p>
</header>
<dl class="space-y-2 text-sm">
<div><dt class="font-medium">Técnica</dt><dd id="obra-tecnica" class="text-neutral-700"></dd></div>
<div><dt class="font-medium">Tamaño</dt><dd id="obra-tamano" class="text-neutral-700"></dd></div>
</dl>
<p id="obra-descripcion" class="mt-4 text-neutral-800 leading-relaxed"></p>
<div class="mt-6 flex justify-end">
<button data-close class="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90">Cerrar</button>
</div>
</section>
</article>
</div>
`;
document.body.appendChild(root);

// Estado inicial
window.__modalOpen = false;


// cerrar por capa oscura o botón
root.addEventListener('click', (e) => {
if (e.target.matches('[data-close]')) hideObraModal();
});


// ESC para cerrar
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') hideObraModal();
});


// Trap focus within modal for accessibility
root.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    const focusableElements = root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
});

}


export function showObraModal(obra, callbacks = {}) {
  console.log('showObraModal called with:', obra);
  const root = document.getElementById('obra-modal-root');
  if (!root) {
    console.error('Modal root not found!');
    return;
  }
  console.log('Modal root found, showing modal...');

  // Fill modal content
  root.querySelector('#obra-img').src = obra.imagen;
  root.querySelector('#obra-img').alt = obra.titulo;
  root.querySelector('#obra-titulo').textContent = obra.titulo;
  root.querySelector('#obra-autor').textContent = `${obra.autor} · ${obra.rol ?? ''}`.trim();
  root.querySelector('#obra-tecnica').textContent = obra.tecnica || '—';
  root.querySelector('#obra-tamano').textContent = obra.tamano || '—';
  root.querySelector('#obra-descripcion').textContent = obra.descripcion || '';

  // Show modal by removing hidden class and block body scroll
  root.classList.remove('hidden');
  window.__modalOpen = true;
  window.dispatchEvent(new CustomEvent('obra-modal-open'));
  document.body.style.overflow = 'hidden';

  // Focus on the close button for accessibility
  const closeButton = root.querySelector('[data-close]');
  if (closeButton) {
    closeButton.focus();
  }

  // Enable image zoom
  enableImageZoom();

  // Execute onOpen callback if provided
  if (callbacks.onOpen) {
    callbacks.onOpen();
  }
}


export function hideObraModal(callbacks = {}) {
  const root = document.getElementById('obra-modal-root');
  if (!root) return;
  root.classList.add('hidden');
  window.__modalOpen = false;
  window.dispatchEvent(new CustomEvent('obra-modal-close'));

  // Restore body scroll
  document.body.style.overflow = 'auto';

  // Disable image zoom
  disableImageZoom();

  // Execute onClose callback if provided
  if (callbacks.onClose) {
    callbacks.onClose();
  }

  // Restore focus to the Three.js canvas for interaction
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.focus();
  }
}