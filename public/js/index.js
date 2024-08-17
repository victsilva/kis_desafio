document.getElementById("form_temario").addEventListener("submit", async function(event) {
    event.preventDefault();  // Prevenir el envío del formulario inicialmente

    // Mostrar spinner y bloquear botones
    document.getElementById("spinner-container").classList.remove("d-none");
    document.querySelector(".btn_crear button").disabled = true;
    document.querySelector(".btn_borrar button").disabled = true;
    setFormReadOnly(true); // Hacer los campos solo lectura

    // Obtener los valores de los campos de texto
    var titulo_curso = document.getElementById("titulo_curso").value;
    var dias_curso = document.getElementById('dias').value;
    var horario_inicio = document.getElementById("horario_inicio").value;
    var horario_fin = document.getElementById("horario_fin").value;
    var cantidad_part = document.getElementById("cantidad_part").value;
    var nombre_instructor = document.getElementById("nom_instructor").value;
    var objetivo_curso = document.getElementById("objetivo_curso").value;
    var desc_temario = document.getElementById("desc_temario").value;
    var nivel_curso = document.querySelectorAll('input[name="nivel_curso"]:checked');
    var modalidad = document.getElementsByName("modalidad");
    var materiales = document.getElementById("materiales").value;

    var errorMessage = "";

    // Validaciones
    if (titulo_curso === "" || cantidad_part === "" || nombre_instructor === "" || objetivo_curso === "" || desc_temario === "" || materiales === "") {
        errorMessage += "Rellene los campos vacíos.\n";
    } else if (dias_curso.length === 0) {
        errorMessage += "Por favor, selecciona al menos un día.\n";
    } else if (!horario_inicio || !horario_fin) {
        errorMessage += "Por favor, completa ambos horarios.\n";
    } else if (horario_inicio >= horario_fin) {
        errorMessage += "El horario de inicio no puede ser posterior o igual al horario de fin.\n";
    } else if (nivel_curso.length === 0) {
        errorMessage += "Por favor, selecciona un nivel de curso.\n";
    } else if (![...modalidad].some(m => m.checked)) {
        errorMessage += "Por favor, selecciona una modalidad.\n";
    }

    // Mostrar errores si existen
    if (errorMessage !== "") {
        alert(errorMessage);
        // Ocultar spinner, desbloquear botones y quitar readonly
        document.getElementById("spinner-container").classList.add("d-none");
        document.querySelector(".btn_crear button").disabled = false;
        document.querySelector(".btn_borrar button").disabled = false;
        setFormReadOnly(false);
        return;  // Detener el proceso de envío si hay errores
    }

    // Llama a la función para generar el temario
    await generateTemario();
});

async function generateTemario() {
    // Obtén los valores del formulario
    var tituloCurso = document.getElementById("titulo_curso").value;
    var dias_curso = document.getElementById('dias').value;
    var horarioInicio = document.getElementById("horario_inicio").value;
    var horarioFin = document.getElementById("horario_fin").value;
    var cantidadPart = document.getElementById("cantidad_part").value;
    var nombreInstructor = document.getElementById("nom_instructor").value;
    var objetivoCurso = document.getElementById("objetivo_curso").value;
    var descTemario = document.getElementById("desc_temario").value;
    var nivelCurso = Array.from(document.querySelectorAll('input[name="nivel_curso"]:checked')).map(el => el.nextElementSibling.textContent).join(', ');
    var modalidad = Array.from(document.getElementsByName("modalidad")).filter(el => el.checked).map(el => el.nextElementSibling.textContent).join(', ');
    var materiales = document.getElementById("materiales").value;

    // Obtén la fecha actual en formato DD/MM/YYYY
    const fechaActual = new Date();
    const fechaActualFormateada = fechaActual.toLocaleDateString('es-ES');  // Por ejemplo, '16/08/2024'

    // Crea el payload para la API
    const payload = {
        numResults: 5,
        temperature: 0.7,
        maxTokens: 1500,
        messages: [
            {
                text: `Crea un temario que contenga: la fecha de inicio del curso, temas principales y propios subtemas y la duración de cada tema. 
                Estructura del curso (Distribución de los temas por días y actividades prácticas), requerimientos (equipos, software necesario, 
                conocimientos previos, otros), según esta información: 
                Título del curso: "${tituloCurso}", 
                Cantidad de días: ${dias_curso},
                Objetivo del curso: "${objetivoCurso}", 
                Descripción del temario: "${descTemario}",
                Horario de inicio: ${horarioInicio},
                Horario de fin: ${horarioFin},
                Cantidad de participantes: ${cantidadPart},
                Nombre del instructor: ${nombreInstructor},
                Nivel del curso: ${nivelCurso},
                Modalidad: ${modalidad},
                Materiales: ${materiales},
                Fecha de hoy: ${fechaActualFormateada}`,              
                role: "user"
            }
        ],
        system: "You are an AI assistant for business research. Your responses should be informative and concise."
    };

    const url = "https://api.ai21.com/studio/v1/j2-ultra/chat";
    const headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": "Bearer sG5lGemFnIAlfAaaVrvAxGYSMdmu0rVP"  // Reemplaza con tu propio token
    };

    try {
        // Realiza la solicitud POST
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Respuesta de la IA:', data);  // Imprime toda la respuesta en la consola

        // Verifica la estructura de la respuesta antes de acceder a propiedades
        if (data && data.outputs && data.outputs.length > 0) {
            // Extrae el texto de la respuesta
            let suggestion = data.outputs[0].text;

            // Aplica el formato necesario
            suggestion = formatTemario(suggestion);

            // Redirige a la página de resultados con el temario como parámetro
            window.location.href = `resultados.html?titulo_curso=${encodeURIComponent(tituloCurso)}&nom_instructor=${encodeURIComponent(nombreInstructor)}&horario_inicio=${encodeURIComponent(horarioInicio)}&horario_fin=${encodeURIComponent(horarioFin)}&suggestion=${encodeURIComponent(suggestion)}`;
        } else {
            window.location.href = `resultados.html?titulo_curso=${encodeURIComponent(tituloCurso)}&nom_instructor=${encodeURIComponent(nombreInstructor)}&horario_inicio=${encodeURIComponent(horarioInicio)}&horario_fin=${encodeURIComponent(horarioFin)}&suggestion=No%20se%20encontró%20ninguna%20respuesta%20en%20la%20API.`;
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = `resultados.html?titulo_curso=${encodeURIComponent(tituloCurso)}&nom_instructor=${encodeURIComponent(nombreInstructor)}&horario_inicio=${encodeURIComponent(horarioInicio)}&horario_fin=${encodeURIComponent(horarioFin)}&suggestion=Error%20al%20generar%20el%20temario.%20Verifica%20la%20consola%20para%20más%20detalles.`;
    } finally {
        // Ocultar spinner, desbloquear botones y quitar readonly
        document.getElementById("spinner-container").classList.add("d-none");
        document.querySelector(".btn_crear button").disabled = false;
        document.querySelector(".btn_borrar button").disabled = false;
        setFormReadOnly(false);
    }
}

function setFormReadOnly(readonly) {
    const fields = [
        'titulo_curso', 'dias', 'horario_inicio', 'horario_fin', 'cantidad_part', 
        'nom_instructor', 'objetivo_curso', 'desc_temario', 'materiales'
    ];
    fields.forEach(fieldId => {
        document.getElementById(fieldId).readOnly = readonly;
    });

    // Manejar campos de selección
    document.querySelectorAll('input[name="nivel_curso"]').forEach(input => {
        input.disabled = readonly;
    });

    document.querySelectorAll('input[name="modalidad"]').forEach(input => {
        input.disabled = readonly;
    });
}

function formatTemario(texto) {
    // Asume que el texto viene en formato JSON y debe ser formateado
    return texto.replace(/\n/g, "<br>");
}
