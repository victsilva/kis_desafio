async function generateTemario() {
    // Obtén los valores del formulario
    const tituloCurso = document.getElementById('titulo_curso').value;
    const objetivoCurso = document.getElementById('objetivo_curso').value;
    const descTemario = document.getElementById('desc_temario').value;

    // Crea el payload para la API
    const payload = {
        numResults: 1,
        temperature: 0.7,
        messages: [
            {
                text: `Crea un temario para un curso con el título "${tituloCurso}", objetivo: "${objetivoCurso}", y descripción: "${descTemario}".`,
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
            const suggestion = encodeURIComponent(data.outputs[0].text);
            // Redirige a la página de resultados con el temario como parámetro
            window.location.href = `resultados.html?suggestion=${suggestion}`;
        } else {
            window.location.href = 'resultados.html?suggestion=No%20se%20encontró%20ninguna%20respuesta%20en%20la%20API.';
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'resultados.html?suggestion=Error%20al%20generar%20el%20temario.%20Verifica%20la%20consola%20para%20más%20detalles.';
    }
}
