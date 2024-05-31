const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const conexion = require('./conexion');
const bcrypt = require('bcrypt')
const session = require('express-session');
const { error } = require('console');
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

app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para renderizar el archivo index.pug
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/principal', (req, res) => {

  let pacientes
  conexion.query("SELECT `nombre`, `apellido` FROM paciente;", (err, resultados) => {
    pacientes = resultados
    console.log(resultados)
    res.render('principal', { pacientes: resultados })
  })
})

app.get('/register', (req, res) => {
//  let profesiones
// let obrasSociales


  promiseProfesion = new Promise((resolve,reject)=>{
    conexion.query('SELECT * FROM profesion;', (err, resultados) => {
      if (err){
        reject(err);
      }else{
        resolve(resultados)
      }
    })
  })

  promiseObras = new Promise((resolve,reject)=>{
    conexion.query('SELECT ID, nombre FROM obra_social', (err, resultados) => {
      if(err){
        reject(err)
      }else{
        resolve(resultados)
      }
    })
  })
 
Promise.all([promiseProfesion,promiseObras])
  .then(([profesiones,obrasSociales])=>{
    res.render('register',{profesiones,obrasSociales});
  })
  .catch((err)=>{
    console.log('error en consulta a base de datos:',err)
    res.status(500).json({error: 'Error en la consulta a base de datos' })
  })
    


})

app.post('/register', async (req, res) => {
  const {
    username, email, password, confirm_password, documento, nombre, apellido, fecha_nacimiento, sexo, domicilio, role_id, profesion, matricula, obraSocial, plan
  } = req.body

  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    conexion.beginTransaction(err => {

      if (err) { throw err; }

      const insertPersona = 'INSERT INTO persona (Documento, Nombre, Apellido, FechaNacimiento, Sexo, Domicilio) VALUES (?,?,?,?,?,?)';

      conexion.query(insertPersona, [documento, nombre, apellido, fecha_nacimiento, sexo, domicilio], (err, result) => {
        if (err) {
          return conexion.rollback(() => {
            throw err;
          })
        }
      })

      const insertUser = 'INSERT INTO users (username, password, email, `role-id`, `persona-documento`) VALUES (?,?,?,?,?)';
      conexion.query(insertUser, [username, hashedPassword, email, role_id, documento], (err, result) => {
        if (err) {
          return conexion.rollback(() => {
            throw err
          })
        }
      })

      if (role_id == 2) {
        const insertProfesional = 'INSERT INTO `profesional`(`PersonaDocumento`, `Profesion`, `Matricula`) VALUES (?,?,?)';

        conexion.query(insertProfesional, [documento, profesion, matricula], (err, result) => {
          if (err) {
            return conexion.rollback(() => {
              throw err
            })
          }
        })
      }

      if(role_id == 3) {
        const insertPaciente = 'INSERT INTO `paciente` (`PersonaDocumento`, `plan`) VALUES (?,?)';

        conexion.query(insertPaciente,[documento,plan],(err,result)=>{
          if(err){
            return conexion.rollback(()=>{
              throw err
            })
          }
        })
      }

      conexion.commit(err => {
        if (err) {
          return conexion.rollback(() => {
            throw err
          })
        }
        res.send('<script>window.history.back();</script>;')
      })
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' })
  }
})

app.post('/submit-form', (req, res) => {
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

app.post('/planes', bodyParser.json(), (req, res) => {
  let val = req.body.valor;
  console.log(typeof(val)); // Debería mostrar "string"
  console.log(val); // Para verificar el valor

  conexion.query('SELECT * FROM `plan` WHERE id_obra_social = ?;',[val],(err,result)=>{
    if(err){
      throw err
    }
    res.json({ tabla:result });
  })
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});





