// Función para abrir el modal de mejoras
function abrirModal() {
    const modalElement = document.getElementById('modal_mejoras');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Función para formatear el temario
function formatTemario(text) {
    return text.trim().replace(/\n\n/g, '\n');
}

// Función para obtener los parámetros de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Obtener los parámetros desde la URL
const tituloCurso = getQueryParam('titulo_curso');
const nombreInstructor = getQueryParam('nom_instructor');
const horario = getQueryParam('horario_inicio');
const resultado = getQueryParam('suggestion');

// Mostrar la información del curso
document.getElementById('titulo').textContent = `Título del Curso: ${tituloCurso || 'No disponible'}`;
document.getElementById('instructor').textContent = `Instructor: ${nombreInstructor || 'No disponible'}`;
document.getElementById('horario').textContent = `Horario: ${horario || 'No disponible'}`;

// Función para extraer y desglosar la fecha de inicio
function extractAndFormatDate(text) {
    const fechaRegex = /Fecha de inicio: (\d{1,2}\/\d{1,2}\/\d{4})/;
    const match = text.match(fechaRegex);

    if (match) {
        const fecha = match[1];
        const [day, month, year] = fecha.split('/');
        document.getElementById('fecha_inicio').innerHTML = `Fecha de inicio: ${day}/${month}/${year}`;
        return text.replace(fechaRegex, '').replace(/\n/g, '<br/>');
    } else {
        return text.replace(/\n/g, '<br/>') || 'No se obtuvo resultado.';
    }
}

// Limpiar el contenido del div resultado y mostrar solo los datos necesarios
const resultadoContenido = resultado ? extractAndFormatDate(decodeURIComponent(resultado)) : 'No se obtuvo resultado.';
document.getElementById('resultado').innerHTML = resultadoContenido;

// Función para generar el PDF
async function generatePDF() {
    const { jsPDF } = window.jspdf;

    html2canvas(document.getElementById('resultado')).then(canvas => {
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 300; // Ancho de la imagen en mm
        const pageHeight = 555; // Alto de la página en mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('temario.pdf');
    });
}

// Escuchar el evento de envío del formulario de mejoras
document.getElementById('mejoras_form').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevenir el envío del formulario inicialmente

    document.getElementById('loading').classList.remove('d-none'); // Mostrar indicador de carga

    const nivelLenguaje = document.getElementById('nivel_lenguaje').value;
    const distribucionTemas = document.getElementById('distribucion_temas').value;
    const modificarHorario = document.getElementById('modificar_horario').value;

    const temarioOriginal = document.getElementById('resultado').innerText;

    const prompt = `Mejora el siguiente temario teniendo en cuenta los siguientes ajustes:
- Nivel de Lenguaje: ${nivelLenguaje}%
- Distribución de Temas: ${distribucionTemas}
- Modificación de Horario: ${modificarHorario}
Temario Original:
${temarioOriginal}`;

    try {
        // Envía la solicitud a la API de AI21 para obtener la mejora del temario
        const response = await fetch('https://api.ai21.com/studio/v1/j2-ultra/chat', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer sG5lGemFnIAlfAaaVrvAxGYSMdmu0rVP', // Reemplaza con tu clave de API
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                maxTokens: 1000, // Ajusta el número de tokens según sea necesario
                temperature: 0.7,
                stop: ['\n']
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Error en la solicitud de mejora: ${errorDetails}`);
        }

        const data = await response.json();
        const temarioMejorado = data.completions[0].text;

        // Mostrar el nuevo temario mejorado
        document.getElementById('resultado').innerHTML = formatTemario(temarioMejorado);
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo procesar la mejora.');
    } finally {
        document.getElementById('loading').classList.add('d-none'); // Ocultar indicador de carga
    }
});

// Actualizar el texto del valor del rango en tiempo real
document.getElementById('nivel_lenguaje').addEventListener('input', function() {
    document.getElementById('nivel_lenguaje_value').textContent = `${this.value}%`;
    document.getElementById('nivel_lenguaje_val').value = this.value;
});
