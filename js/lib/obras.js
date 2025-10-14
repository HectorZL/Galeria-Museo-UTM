// /js/obras.js
let _cache = null;


export async function loadObras() {
if (_cache) return _cache;
const res = await fetch('/data/obras.json');
if (!res.ok) throw new Error('No se pudo cargar obras.json');
const data = await res.json();
// indexado útil
const byId = new Map(data.map(o => [String(o.id), o]));
const bySlug = new Map(data.map(o => [o.slug, o]));
_cache = { list: data, byId, bySlug };
return _cache;
}