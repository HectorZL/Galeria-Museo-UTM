# Sistema LOD de Texturas para Galería de Museo

## Introducción

Este proyecto implementa un sistema avanzado de Level of Detail (LOD) para texturas en Three.js que elimina los tirones y picos de memoria al acercarse a las obras de arte.

## Características

- ✅ **Carga diferida inteligente**: Precarga 2-3 niveles de resolución sin bloquear el hilo principal
- ✅ **Transiciones suaves**: Cambia entre niveles de detalle basado en distancia sin congelamientos
- ✅ **Gestión automática de memoria**: Libera texturas de alta resolución cuando ya no son necesarias
- ✅ **Sistema de caché eficiente**: Evita recargas innecesarias de texturas ya cargadas
- ✅ **Configuración flexible**: Ajusta umbrales de distancia según las necesidades de tu escena

## Estructura de Archivos

Para usar el sistema LOD, organiza tus texturas en la carpeta `assets/obras/` con el siguiente patrón:

```
assets/obras/
├── obra1_512.jpg      # Baja resolución (distancia > 15)
├── obra1_1024.jpg     # Media resolución (distancia > 6)
└── obra1_2048.jpg     # Alta resolución (distancia ≤ 6)
```

## Uso Básico

El sistema LOD se activa automáticamente cuando:

1. **Creas una instancia de `Artwork`** con un `renderer` válido
2. **Las texturas siguen el patrón de nomenclatura** establecido

```javascript
// En GalleryScene.js
addArtwork(artworkData, renderer) {
  const artwork = new Artwork(artworkData, renderer); // ← El renderer activa LOD
  // ...
}
```

## Configuración Avanzada

### Personalizar Umbrales de Distancia

Puedes ajustar los umbrales de distancia en el archivo `TextureLOD.js`:

```javascript
_pickLOD(distance) {
  if (distance > 20) return this.urls[0];    // 512px - Muy lejos
  if (distance > 10) return this.urls[1];    // 1024px - Lejos
  if (distance > 3)  return this.urls[2];    // 2048px - Medio
  return this.urls[3];                       // 4096px - Cerca (si tienes)
}
```

### Pre-carga Manual

Para forzar la pre-carga de ciertas texturas:

```javascript
// En Artwork.js
async preloadLODTextures() {
  if (this.textureLOD) {
    await this.textureLOD.preloadLODs(['512', '1024']); // Carga solo estos niveles
  }
}
```

## Optimización con KTX2 (Recomendado)

Para reducir aún más el uso de VRAM (60-80%), convierte tus texturas a formato KTX2 usando Basis Universal:

### Instalación de herramientas

```bash
# Instalar toktx (parte de KhronosGroup/KTX-Software)
npm install -g ktx-software

# O usando Docker
docker run -it --rm -v $(pwd):/workdir khronosgroup/ktx:latest toktx --help
```

### Comandos de conversión

```bash
# Convertir una textura a KTX2 con compresión BasisU
toktx --bcmp --encode basis-lz --assign_oetf srgb obra1.ktx2 obra1_2048.jpg

# Crear mipmap para mejor calidad
toktx --bcmp --encode basis-lz --assign_oetf srgb --genmipmap obra1.ktx2 obra1_2048.jpg
```

### Integración con Three.js

Para usar KTX2, necesitarás el loader correspondiente:

```javascript
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

const loader = new KTX2Loader();
loader.setTranscoderPath('js/libs/basis/');

// En TextureLOD.js, reemplaza TextureLoader con KTX2Loader
// this.loader = new KTX2Loader();
```

## Troubleshooting

### Problemas comunes

1. **Texturas no cargan**: Verifica que los archivos sigan el patrón de nomenclatura correcto
2. **Tirones persisten**: Asegúrate de que el renderer tenga `outputColorSpace = THREE.SRGBColorSpace`
3. **Alto uso de memoria**: Implementa limpieza manual con `textureLOD.dispose()`

### Debug

Para monitorear el comportamiento del LOD:

```javascript
// En TextureLOD.js
this.onChange = (lod) => {
  console.log(`Cambiado a LOD ${lod}, memoria usada: ${this.getMemoryUsage()} bytes`);
};
```

## Resultados Esperados

- ✅ **De lejos (>15 unidades)**: 512px, mínimo uso de VRAM
- ✅ **Medio (6-15 unidades)**: 1024px, textura media
- ✅ **Cerca (≤6 unidades)**: 2048px cuando ya está cargada (sin congelación)
- ✅ **Transiciones suaves**: Sin tirones ni picos de memoria
- ✅ **Calidad visual**: Mipmaps + anisotropía reducen brillos y aliasing
