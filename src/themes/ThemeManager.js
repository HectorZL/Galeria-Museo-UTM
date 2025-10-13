import { ClassicTheme } from './ClassicTheme.js';
import { ContemporaryTheme } from './ContemporaryTheme.js';

export class ThemeManager {
  constructor() {
    this.themes = {
      classic: new ClassicTheme(),
      contemporary: new ContemporaryTheme()
    };
    this.currentTheme = 'classic';
  }

  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      return true;
    }
    console.warn(`Tema "${themeName}" no encontrado. Usando tema clásico.`);
    this.currentTheme = 'classic';
    return false;
  }

  getCurrentTheme() {
    return this.themes[this.currentTheme];
  }

  getThemeNames() {
    return Object.keys(this.themes);
  }

  getThemeConfig() {
    return this.getCurrentTheme().getConfig();
  }

  // Método para obtener colores específicos del tema actual
  getSceneColors() {
    return this.getCurrentTheme().getSceneColors();
  }

  getFloorMaterial() {
    return this.getCurrentTheme().getFloorMaterial();
  }

  getWallMaterial() {
    return this.getCurrentTheme().getWallMaterial();
  }

  getLightingConfig() {
    return this.getCurrentTheme().getLightingConfig();
  }

  getFrameStyle() {
    return this.getCurrentTheme().getFrameStyle();
  }
}
