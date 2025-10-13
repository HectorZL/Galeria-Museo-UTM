import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configuración de seguridad
app.use((req, res, next) => {
  // Configuración de cabeceras de seguridad
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Servir archivos estáticos desde la raíz
app.use(express.static(__dirname));

// Configurar MIME types para archivos estáticos
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const mimeTypes = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.html': 'text/html'
  };

  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext]);
  }
  next();
});

// Ruta específica para imágenes
app.get('/images/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'images', imageName);
  
  if (fs.existsSync(imagePath)) {
    const ext = path.extname(imageName).toLowerCase().substring(1);
    const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    res.setHeader('Content-Type', mimeType);
    res.sendFile(imagePath);
  } else {
    res.status(404).send('Imagen no encontrada');
  }
});

// Ruta principal - servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Algo salió mal en el servidor');
});

// Iniciar el servidor solo si no estamos en Vercel
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
  });
}

export default app;
