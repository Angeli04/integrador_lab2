document.addEventListener('DOMContentLoaded', function () {
  let medicamentosInput = document.getElementById('medicamentos');
  let medicamentoIDInput = document.getElementById('medicamentoID');
  let medicamentosInput2 = document.getElementById('medicamentos2');
  let medicamentoIDInput2 = document.getElementById('medicamentoID2');
  let medicamentosInput3 = document.getElementById('medicamentos3');
  let medicamentoIDInput3 = document.getElementById('medicamentoID3');
  let pacienteInput = document.getElementById('pacientes');
  let pacienteIDInput = document.getElementById('pacienteID');
  let prestacionInput = document.getElementById('prestaciones');
  let prestacionesIDInput = document.getElementById('prestacionID')
  let logout = document.getElementById('logout')
  let sumar = document.getElementById('sumar')
  let restar = document.getElementById('restar')
  let selPrestacion = document.getElementById('prestaciones')
  let divMedicamentos2 = document.getElementById('divmedicamentos2')
  let divMedicamentos3 = document.getElementById('divmedicamentos3')
  let contador = 1;

  medicamentosInput.addEventListener('input', function () {
    let options = document.querySelectorAll('#medicamentoSug option');
    let inputValue = medicamentosInput.value;
    let medicamentoID = '';

    options.forEach(function (option) {
      if (option.value === inputValue) {
        medicamentoID = option.getAttribute('data-value');
      }
    });
    //console.log(medicamentoID)
    medicamentoIDInput.value = medicamentoID; // Actualiza el valor del campo oculto
  });

  medicamentosInput2.addEventListener('input', function () {
    let options = document.querySelectorAll('#medicamentoSug option');
    let inputValue = medicamentosInput2.value;
    let medicamentoID2 = '';

    options.forEach(function (option) {
      if (option.value === inputValue) {
        medicamentoID2 = option.getAttribute('data-value');
      }
    });
    //console.log(medicamentoID)
    medicamentoIDInput2.value = medicamentoID2; // Actualiza el valor del campo oculto
  });

  medicamentosInput3.addEventListener('input', function () {
    let options = document.querySelectorAll('#medicamentoSug option');
    let inputValue = medicamentosInput3.value;
    let medicamentoID3 = '';

    options.forEach(function (option) {
      if (option.value === inputValue) {
        medicamentoID3 = option.getAttribute('data-value');
      }
    });
    //console.log(medicamentoID)
    medicamentoIDInput3.value = medicamentoID3; // Actualiza el valor del campo oculto
  });

  pacienteInput.addEventListener('input', function () {
    let options = document.querySelectorAll('#pacienteSug option');
    let inputValue = pacienteInput.value;
    let pacienteID = ''

    options.forEach(function (option) {
      if (option.value === inputValue) {
        pacienteID = option.getAttribute('paciente-data-value')
      }
    });
    pacienteIDInput.value = pacienteID
  })

  prestacionInput.addEventListener('input', function () {
    let options = document.querySelectorAll('#prestacionSug option');
    let inputValue = prestacionInput.value;
    let prestacionID = ''

    options.forEach(function (option) {
      if (option.value === inputValue) {
        prestacionID = option.getAttribute('prestacion-data-value');
      }
    })
    prestacionesIDInput.value = prestacionID;
  })

  logout.addEventListener("click", function () {
    fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => {
        if (response.ok) {
          window.location.href = '/'
        } else {
          console.log("Error al cerrar sesion")
        }
      })
      .catch(error => {
        console.log('Error:', error)
      })
  })

  selPrestacion.addEventListener('input', function () {

    let selectedValue = document.getElementById('prestacionID').value
    fetch('/lados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: selectedValue })
    })
      .then(response => response.text())
      .then(data => {
        const selLado = document.getElementById('lado')
        selLado.innerHTML = ""
        console.log('Success:', data)
        const lados = JSON.parse(data).tabla
        console.log(lados)
        lados.forEach(element => {
          let op = document.createElement('option')
          op.textContent = element.Descripcion
          op.value = element.lado_id
          selLado.appendChild(op)

        });
      })
      .catch(err => {
        if (err) throw err
      })
  })

  sumar.addEventListener("click", () => {
    //alert("sumaste")
    if (contador === 1) {
      divMedicamentos2.style.visibility = "visible";
      medicamentoIDInput2.setAttribute('required', true);
      contador++
      //sumar.disabled = false
    } else if (contador === 2) {
      divMedicamentos3.style.visibility = "visible";
      medicamentoIDInput3.setAttribute('required', true);
      contador++
    }
  })

  restar.addEventListener("click", () => {
    //lert("restaste")
    if (contador === 3) {
      divMedicamentos3.style.visibility = "hidden"
      medicamentoIDInput3.setAttribute("required", false)
      contador--
    } else if (contador === 2) {
      divMedicamentos2.style.visibility = "hidden"
      medicamentoIDInput2.setAttribute("required", false)
      contador-- 
    }
  })

});