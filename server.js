const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Sirve la app y también three desde node_modules
app.use(express.static(__dirname));
app.use('/three', express.static(path.join(__dirname, 'node_modules/three')));

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
