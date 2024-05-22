const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const mysql = require('mysql')

const conexion = mysql.createConnection({
    host: 'localhost' ,
    database: 'simulacion_integrador' ,
    user: 'root' ,
    password: ''
})

conexion.connect(function(err){
    if(err){
        console.log("Error")
    }else{
        console.log("Conexion exitosa")
    }
  })

// Configurar el motor de vistas como Pug
app.set('view engine', 'pug');
// Establecer la carpeta de vistas
app.set('views', path.join(__dirname, 'views')); // Cambio aquí

// Servir archivos estáticos desde la carpeta "styles"
app.use('/styles', express.static(path.join(__dirname, 'styles')));

// Servir archivos estáticos desde la carpeta "scripts"
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para renderizar el archivo index.pug
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/principal',(req,res)=>{

  let pacientes
  conexion.query("SELECT `nombre`, `apellido` FROM paciente;",(err,resultados)=>{
    pacientes = resultados
    console.log(resultados)
    res.render('principal',{pacientes:resultados})
  })
})

app.post('/submit-form',(req,res)=>{
  const datosRecibidos = req.body
  console.log(datosRecibidos)
  
  conexion.query('INSERT INTO prescripcion SET ?', datosRecibidos, (error, resultados) => {
    if (error) {
        console.error('Error al insertar datos:', error);
        return;
    }
    console.log('Datos insertados correctamente:', resultados);
});

  const responseHTML = `
  <script>
      alert('¡Los datos del formulario fueron recibidos correctamente!');
      window.history.back(); // Volver a la página anterior 
  </script>
  `;
res.send(responseHTML);
})





// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});





		