// TextureLOD.js with KTX2 compression support
import { TextureLoader, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

export class TextureLOD {
  constructor(renderer, urlsByLOD /* {512:'',1024:'',2048:''} */, {
    anisotropy = Math.max(1, Math.floor(renderer.capabilities.getMaxAnisotropy()/4)),
    onChange = () => {}
  } = {}) {
    this.renderer = renderer;
    this.urls = Object.keys(urlsByLOD).map(n => parseInt(n,10)).sort((a,b)=>a-b);
    this.map = new Map(Object.entries(urlsByLOD).map(([k,v])=>[parseInt(k,10), v]));
    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/'); // Path to Basis Universal transcoder
    this.ktx2Loader.detectSupport(this.renderer);
    this.anisotropy = anisotropy;
    this.onChange = onChange;

    this.currentLOD = null;
    this.texture = null;
    this.cache = new Map(); // LOD -> texture
    this.loadingPromises = new Map(); // LOD -> Promise for ongoing loads
  }

  async _loadLOD(lod) {
    // Return cached texture if available
    if (this.cache.has(lod)) {
      return this.cache.get(lod);
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(lod)) {
      return this.loadingPromises.get(lod);
    }

    // Start loading with KTX2Loader
    const loadPromise = new Promise((res, rej)=>{
      this.ktx2Loader.load(
        this.map.get(lod),
        (tex) => {
          tex.colorSpace = SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = LinearMipmapLinearFilter;
          tex.magFilter = LinearFilter;
          tex.anisotropy = this.anisotropy;
          tex.needsUpdate = true;
          this.cache.set(lod, tex);
          this.loadingPromises.delete(lod);
          res(tex);
        },
        undefined,
        (err) => {
          this.loadingPromises.delete(lod);
          rej(err);
        }
      );
    });

    this.loadingPromises.set(lod, loadPromise);
    return loadPromise;
  }

  // distancia -> LOD objetivo (ajusta umbrales a tu escena/escala)
  _pickLOD(distance) {
    if (distance <= 1) return this.urls[0];    // 512 for very close (≤1 unit)
    if (distance > 6)  return this.urls[0];    // 512 for far away
    return this.urls[1];                       // 1024 for medium distance
  }

  async updateForDistance(distance, material) {
    const target = this._pickLOD(distance);
    if (this.currentLOD === target) return;

    try {
      // Pre-carga sin bloquear y cambia cuando esté lista
      const tex = await this._loadLOD(target);

      if (material.map !== tex) {
        material.map = tex;
        material.needsUpdate = true;
        this.texture = tex;

        // opcional: libera niveles altos cuando te alejas
        for (const [lod, t] of this.cache.entries()) {
          if (lod !== target) {
            t.dispose();
            this.cache.delete(lod);
          }
        }

        this.currentLOD = target;
        this.onChange(target);
      }
    } catch (error) {
      console.error('Error loading LOD texture:', error);
    }
  }

  // Preload multiple LOD levels for smoother transitions
  async preloadLODs(lodLevels = null) {
    const levelsToLoad = lodLevels || this.urls;
    const promises = levelsToLoad.map(lod => this._loadLOD(lod));
    await Promise.allSettled(promises);
  }

  dispose() {
    for (const t of this.cache.values()) {
      t.dispose();
    }
    this.cache.clear();
    this.loadingPromises.clear();
    this.ktx2Loader.dispose(); // Dispose of the KTX2Loader
  }

  // Get current memory usage estimate
  getMemoryUsage() {
    let totalSize = 0;
    for (const [lod, texture] of this.cache.entries()) {
      // Estimate texture memory usage (rough calculation)
      const size = lod * lod * 4; // RGBA bytes
      totalSize += size;
    }
    return totalSize;
  }
}
