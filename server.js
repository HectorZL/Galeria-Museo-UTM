const express = require('express');
const path = require('path');
const app = express();

// Usar el puerto de Vercel o 3000 por defecto
const port = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static(__dirname));
app.use('/three', express.static(path.join(__dirname, 'node_modules/three')));

// Ruta principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejador de errores
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

// Iniciar el servidor solo si no estamos en Vercel
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
  });
}

// Exportar el servidor para Vercel
export default app;
