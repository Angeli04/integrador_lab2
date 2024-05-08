const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Configurar el motor de vistas como Pug
app.set('view engine', 'pug');
// Establecer la carpeta de vistas
app.set('views', path.join(__dirname, 'views')); // Cambio aquí

// Servir archivos estáticos desde la carpeta "styles"
app.use('/styles', express.static(path.join(__dirname, 'styles')));

// Servir archivos estáticos desde la carpeta "scripts"
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));


// Ruta para renderizar el archivo index.pug
app.get('/', (req, res) => {
  res.render('index');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
