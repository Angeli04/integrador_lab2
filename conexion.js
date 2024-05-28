const mysql = require('mysql');

const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'integrador_lab2',
    user: 'root',
    password: ''
});

conexion.connect(function(err){
    if(err){
        console.error("Error de conexión:", err);
    } else {
        console.log("Conexión exitosa a la base de datos");
    }
});

module.exports = conexion;
