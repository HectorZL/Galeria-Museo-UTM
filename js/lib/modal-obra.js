// /js/modal-obra.js
export function mountObraModal() {
const root = document.createElement('div');
root.id = 'obra-modal-root';
root.className = 'fixed inset-0 hidden';
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


// cerrar por capa oscura o botón
root.addEventListener('click', (e) => {
if (e.target.matches('[data-close]')) hideObraModal();
});


// ESC para cerrar
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') hideObraModal();
});
}


export function showObraModal(obra) {
const root = document.getElementById('obra-modal-root');
if (!root) return;
root.querySelector('#obra-img').src = obra.imagen;
root.querySelector('#obra-img').alt = obra.titulo;
root.querySelector('#obra-titulo').textContent = obra.titulo;
root.querySelector('#obra-autor').textContent = `${obra.autor} · ${obra.rol ?? ''}`.trim();
root.querySelector('#obra-tecnica').textContent = obra.tecnica || '—';
root.querySelector('#obra-tamano').textContent = obra.tamano || '—';
root.querySelector('#obra-descripcion').textContent = obra.descripcion || '';
root.classList.remove('hidden');
}


export function hideObraModal() {
const root = document.getElementById('obra-modal-root');
if (!root) return;
root.classList.add('hidden');
}