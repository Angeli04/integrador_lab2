const formulario = document.getElementById('formulario')
const selectProfesion = document.getElementById('profesion')
const labelMatricula = document.getElementById('matricula')
const divOcultoMedico = document.getElementById('ocultoMedico')
const divOcultoPaciente = document.getElementById('ocultoPaciente')



document.addEventListener('DOMContentLoaded', () => {
    // Función para verificar si el radio button "medico" está seleccionado
    const verificarRol = () => {
        const radioMedico = document.getElementById('medico');
        const radioPaciente = document.getElementById('paciente');
        const radioAdmin = document.getElementById('admin');

        if (radioMedico.checked) {
            console.log('El rol seleccionado es Médico');
            divOcultoMedico.style.display = "block";
            añadirRequired(divOcultoMedico)
        } else {
            console.log('El rol seleccionado no es Médico');
            divOcultoMedico.style.display = "none"
            eliminarRequired(divOcultoMedico)
        }

        if (radioPaciente.checked) {
            console.log('El rol seleccionado es Paciente');
            divOcultoPaciente.style.display = "block";
            añadirRequired(divOcultoPaciente)
        } else {
            console.log('El rol seleccionado no es paciente');
            divOcultoPaciente.style.display = "none"
            eliminarRequired(divOcultoPaciente)
        }

    };

    const eliminarRequired = (elemento) => {
        const inputs = elemento.querySelectorAll('input[required]');
        inputs.forEach((input) => {
          input.removeAttribute('required');
        });
        const select = elemento.querySelectorAll('select[required]');
        select.forEach((sel)=>{
            sel.removeAttribute('required')
        })
    }

    const añadirRequired = (elemento) => {
        const inputs = elemento.querySelectorAll('input');
        inputs.forEach((input) => {
          input.setAttribute('required', true);
        });
        const select = elemento.querySelectorAll('select');
        select.forEach((sel)=>{
            sel.setAttribute('required',true)
        })
    }

    // Ejecutar la función cuando se carga la página
    verificarRol();
    // Ejecutar la función cada vez que el estado del radio button cambie
    document.querySelectorAll('input[type=radio]').forEach((radio) => {
        radio.addEventListener('change', verificarRol);
    });
    ///Lo de abajo funciona para traer los planes en base a las obras sociales
    const selObra = document.getElementById('obraSocial').addEventListener("input",function(){
        let selectedValue = this.value;
        console.log(selectedValue)
        fetch('/planes',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({valor:selectedValue})
        })
        .then(respose => respose.text())
        .then(data=>{
            const selPlan = document.getElementById('plan')
            selPlan.innerHTML=""
            console.log('Success:', data)
            const planes = JSON.parse(data).tabla
            console.log(planes)
            planes.forEach(element => {
                let op = document.createElement("option")
                op.textContent = element.nombre
                op.value = element.ID
                selPlan.appendChild(op)
            });
        })
        .catch(err=>{
            if(err){
                throw err
            }
        })
    })

});
