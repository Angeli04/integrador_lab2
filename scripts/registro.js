const formulario = document.getElementById('formulario')
const extra_medico = document.createElement("h3")
extra_medico.textContent = 'hola'

document.addEventListener('DOMContentLoaded', () => {
    // Función para verificar si el radio button "medico" está seleccionado
    const verificarRol = () => {
        const radioMedico = document.getElementById('medico');
        if (radioMedico.checked) {
            console.log('El rol seleccionado es Médico');
            formulario.appendChild(extra_medico)
        } else {
            console.log('El rol seleccionado no es Médico');
            if (extra_medico.parentNode === formulario) {
                formulario.removeChild(extra_medico);
            }
        }
    };

    // Ejecutar la función cuando se carga la página
    verificarRol();

    // Ejecutar la función cada vez que el estado del radio button cambie
    document.querySelectorAll('input[type=radio]').forEach((radio) => {
        radio.addEventListener('change', verificarRol);
    });
});
