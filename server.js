import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configurar cabeceras para permitir módulos ES
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.set('Content-Type', 'application/javascript');
  }
  next();
});

// Servir archivos estáticos
app.use(express.static(__dirname, {
  extensions: ['html', 'js', 'css', 'json', 'png', 'jpg', 'jpeg', 'gif']
}));

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
