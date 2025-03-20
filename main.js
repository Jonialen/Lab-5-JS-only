import {getMessages, postMessage} from "./sendResive.js"
 // Dibujar los mensajes en la página
const drawMessages = async () => {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = ''; // Limpiar el contenido anterior

    const h1 = document.createElement('h1');
    h1.textContent = 'Messages';
    appDiv.appendChild(h1);

    const ul = document.createElement('ul');

    try {
        const messages = await getMessages();
        messages.forEach((message) => {
            const li = document.createElement('li');

            const user = document.createElement('span');
            user.textContent = `${message.user}: `;
            user.style.fontWeight = 'bold';

            const text = document.createElement('span');
            text.textContent = message.text;

            li.appendChild(user);
            li.appendChild(text);
            ul.appendChild(li);
        });
    } catch (error) {
        console.error(error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error al cargar los mensajes.';
        errorMessage.style.color = 'red';
        appDiv.appendChild(errorMessage);
    }

    appDiv.appendChild(ul);
};

// Dibujar el input para enviar mensajes
const drawInput = () => {
    const appDiv = document.getElementById('app');

    const div = document.createElement('div');

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Escribe tu mensaje...';

    const button = document.createElement('button');
    button.textContent = 'Enviar';
    button.onclick = async () => {
        const message = {
            text: textarea.value,
            user: 'Jonialen',         };

        if (message.text.trim() === '') {
            alert('Por favor, escribe un mensaje.');
            return;
        }

        try {
            await postMessage(message);
            textarea.value = ''; // Limpiar el textarea
            await drawMessages(); // Recargar los mensajes
        } catch (error) {
            console.error(error);
            alert('Error al enviar el mensaje.');
        }
    };

    div.appendChild(textarea);
    div.appendChild(button);
    appDiv.appendChild(div);
};

// Función principal
const main = async () => {
    await drawMessages();
    drawInput();
};

// Ejecutar la función principal
main();
