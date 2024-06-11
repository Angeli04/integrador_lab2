const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const conexion = require('./conexion');
const bcrypt = require('bcrypt')
const session = require('express-session');
const { promiseHooks } = require('v8');
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

app.use(session({
  secret: 'argentina campeon del mundo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next()
  } else {
    res.send("error de autenticacion");
  }
}

// Ruta para renderizar el archivo index.pug
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/paciente', (req, res) => {
  res.render('paciente')
})

app.get('/admin', (req, res) => {
  res.render('admin')
})

app.get('/principal', isAuthenticated, async (req, res) => {
  let user = req.session.user
  let medico = req.session.medico
  try {
    let pacientes = await new Promise((resolve, reject) => {
      conexion.query("SELECT p.ID, per.Documento, per.Nombre, per.Apellido, per.FechaNacimiento, per.Sexo, per.Domicilio, p.plan FROM paciente p JOIN persona per ON p.PersonaDocumento = per.Documento;", async (err, resultados) => {
        if (err) reject(err)
        else resolve(resultados)
      })
    })

    let medicamentos = await new Promise((resolve, reject) => {
      conexion.query('SELECT * FROM medicamento;', async (err, resultados) => {
        if (err) reject(err);
        else resolve(resultados);
      })
    })



    let lados = await new Promise((resolve, reject) => {
      conexion.query('SELECT * FROM lado;', async (err, resultados) => {
        if (err) reject(err)
        else resolve(resultados)
      })
    })

    let prestaciones = await new Promise((resolve, reject) => {
      conexion.query('SELECT * FROM prestacion;', async (err, resultados) => {
        if (err) reject(err)
        else resolve(resultados)
      })
    })
    
    //res.send(medico)
    res.render('principal', { pacientes: pacientes, medicamentos: medicamentos, prestaciones: prestaciones, user:user, medico:medico})
  } catch (error) {
    console.error("Error al obtener datos de la base de datos:", error)
    res.status(500).send("Error al obtener datos de la base de datos");
  }

});

app.get('/register', (req, res) => {
  //  let profesiones
  // let obrasSociales


  promiseProfesion = new Promise((resolve, reject) => {
    conexion.query('SELECT * FROM profesion;', (err, resultados) => {
      if (err) {
        reject(err);
      } else {
        resolve(resultados)
      }
    })
  })

  promiseObras = new Promise((resolve, reject) => {
    conexion.query('SELECT ID, nombre FROM obra_social', (err, resultados) => {
      if (err) {
        reject(err)
      } else {
        resolve(resultados)
      }
    })
  })

  Promise.all([promiseProfesion, promiseObras])
    .then(([profesiones, obrasSociales]) => {
      res.render('register', { profesiones, obrasSociales });
    })
    .catch((err) => {
      console.log('error en consulta a base de datos:', err)
      res.status(500).json({ error: 'Error en la consulta a base de datos' })
    })



});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error al cerrar sesión;', err);
      res.status(500).send("Error al cerrar sesión")
    } else {
      res.status(200).send('sesion cerrada')
    }
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

        conexion.query('SELECT * FROM `refeps`', (err, result) => {
          let listaMatriculas = result
          result.forEach(element => {
            if (element.matricula === matricula) {
              const insertProfesional = 'INSERT INTO `profesional`(`PersonaDocumento`, `Profesion`, `Matricula`) VALUES (?,?,?)';
              conexion.query(insertProfesional, [documento, profesion, matricula], (err, result) => {
                if (err) {
                  return conexion.rollback(() => {
                    throw err
                  })
                }
              })
            }
          })
        })
      }


if (role_id == 3) {
  const insertPaciente = 'INSERT INTO `paciente` (`PersonaDocumento`, `plan`) VALUES (?,?)';

  conexion.query(insertPaciente, [documento, plan], (err, result) => {
    if (err) {
      return conexion.rollback(() => {
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
});

app.post('/submit-form',(req, res) => {
  const datosRecibidos = req.body
  let medico = req.session.medico

  // Obtener la fecha actual
  const fechaActual = new Date();

  // Formatear la fecha actual en YYYY-MM-DD
  const anioActual = fechaActual.getFullYear();
  const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0'); // El mes empieza en 0
  const diaActual = String(fechaActual.getDate()).padStart(2, '0');
  const fechaActualFormateada = `${anioActual}-${mesActual}-${diaActual}`;

  // Crear una copia de la fecha actual y agregar 30 días
  const fechaFutura = new Date(fechaActual);
  fechaFutura.setDate(fechaFutura.getDate() + 30);

  // Formatear la fecha futura en YYYY-MM-DD
  const anioFuturo = fechaFutura.getFullYear();
  const mesFuturo = String(fechaFutura.getMonth() + 1).padStart(2, '0');
  const diaFuturo = String(fechaFutura.getDate()).padStart(2, '0');
  const fechaFuturaFormateada = `${anioFuturo}-${mesFuturo}-${diaFuturo}`;

  
  let queryInsert = 'INSERT INTO `prescripcion`(`ProfesionalID`, `PacienteID`, `Diagnostico`, `FechaPrescripcion`, `Vigencia`) VALUES (?,?,?,?,?)'


  conexion.query(queryInsert,[medico[0].profesionalID,datosRecibidos.PacienteID,datosRecibidos.diagnostico,fechaActualFormateada,fechaFuturaFormateada],async (error, resultados) => {
    if (error) {
      console.error('Error al insertar datos:', error);
      return;
    }
    console.log('Datos insertados correctamente:'/*,resultados*/);
    let idultimo = await resultados.insertId

    conexion.query('INSERT INTO `prestacion-prescripcion`(`ID`, `Descripcion`, `Indicacion`, `Justificacion`, `ID-prescripcion`, `ID-prestacion`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]')',()=>{

    })

    conexion.query(()=>{

    })

  })

  conexion.commit(err => {
    if (err) {
      return conexion.rollback(() => {
        throw err
      })
    }
  })

  const responseHTML = `
  <script>
      alert('¡Los datos del formulario fueron recibidos correctamente!');
      window.history.back(); // Volver a la página anterior 
  </script>
  `;
  res.send(datosRecibidos);
});

app.post('/lados',bodyParser.json(),(req,res)=>{
  let val = req.body.valor
  conexion.query('SELECT lado.ID AS lado_id, lado.Descripcion FROM lado_prestacion JOIN lado ON lado_prestacion.ID_lado = lado.ID WHERE ID_prestacion = ?;',[val],(err,result)=>{
   if(err){
     throw err
   }
   res.json({tabla:result})
  })
})

app.post('/planes', bodyParser.json(), (req, res) => {
  let val = req.body.valor;
  console.log(typeof (val)); // Debería mostrar "string"
  console.log(val); // Para verificar el valor

  conexion.query('SELECT * FROM `plan` WHERE id_obra_social = ?;', [val], (err, result) => {
    if (err) {
      throw err
    }
    res.json({ tabla: result });
  })
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Consulta a la base de datos
  conexion.query('SELECT * FROM users WHERE email = ?', [email], async (err, rows) => {
    if (err) {
      console.error('Error en la consulta a la base de datos:', err);
      return res.status(500).json({ message: 'Error del servidor' });
    }

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email no encontrado' });
    }

    const user = rows[0];

    // Verificación de la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    
    let DNI = user['persona-documento']

    let medico= await new Promise((resolve,reject)=>{
      conexion.query('SELECT profesional.ID AS profesionalID, profesional.PersonaDocumento AS DNI, profesional.Matricula, persona.Apellido, profesion.nombre AS nombreProfesion, profesional.especialidad, persona.Nombre, persona.Domicilio FROM profesional JOIN profesion ON profesional.Profesion = profesion.ID JOIN persona on profesional.PersonaDocumento = persona.Documento WHERE profesional.PersonaDocumento = ?;',[DNI],(err,result)=>{
        if(err){
          reject(err)
        }else{
          resolve(result)
        }
      })
    }) 

    req.session.userId = user.ID; // Guarda el ID del usuario en la sesión
    req.session.roleId = user['role-id']; // Guarda el role-id del usuario en la sesión

    // Redireccionar según el rol del usuario
    if (user['role-id'] === 2) {
      
      req.session.user = user
      req.session.medico = medico
      res.redirect('http://localhost:3000/principal');

    } else if (user['role-id'] === 3) {
      return res.redirect('http://localhost:3000/paciente');
    } else {
      return res.redirect('http://localhost:3000/admin');
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});