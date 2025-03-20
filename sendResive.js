// URL base de la API
const API_URL = 'https://chat.calicheoficial.lat/messages';

// Obtener mensajes desde la API
const getMessages = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`Error al obtener mensajes: ${response.status}`);
    }
    return await response.json();
};

// Enviar un mensaje a la API
const postMessage = async (message) => {
    const body = JSON.stringify(message);
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });
    if (!response.ok) {
        throw new Error(`Error al enviar mensaje: ${response.status}`);
    }
    return await response.json();
};

export {getMessages, postMessage}
