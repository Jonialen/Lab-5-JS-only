import {getMessages, postMessage} from "./sendResive.js"

// Detecta links en mensajes y los convierte en previews
const parseMessage = (text) => {
    // Regex para URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Reemplazar URLs con sus previews
    return text.replace(urlRegex, (url) => {
        // Verificar si es una imagen
        if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
            return `<div class="image-preview"><img src="${url}" class="message-image" alt="Imagen"></div>`;
        }
        
        // Vista previa de páginas web (sin API externa)
        return `
            <div class="web-preview">
                <a href="${url}" target="_blank" class="message-link">
                    <h4>${getDomainFromUrl(url)}</h4>
                    <p>Haz clic para visitar el enlace</p>
                </a>
            </div>
        `;
    });
};

// Extraer dominio de una URL
const getDomainFromUrl = (url) => {
    try {
        const domain = new URL(url).hostname;
        return domain;
    } catch (e) {
        return url;
    }
};

// Dibujar mensajes en la página
const drawMessages = async () => {
    const messageList = document.querySelector('.message-list');
    const wasScrolledToBottom = messageList.scrollTop + messageList.clientHeight >= messageList.scrollHeight - 10;

    try {
        const messages = await getMessages();
        
        // No borrar todo el contenido para evitar parpadeos
        if (messages.length > 0) {
            // Verificar si hay nuevos mensajes
            const currentMessages = messageList.querySelectorAll('.message-item');
            if (currentMessages.length !== messages.length) {
                messageList.innerHTML = '';
                for (let { user, text } of messages) {
                    const li = document.createElement('li');
                    li.classList.add('message-item');
                    li.innerHTML = `<strong>${user}:</strong> ${parseMessage(text)}`;
                    
                    // Animación de aparición
                    li.style.opacity = '0';
                    li.style.transform = 'translateY(20px)';
                    messageList.appendChild(li);
                    
                    // Forzar reflow para que la animación funcione
                    void li.offsetWidth;
                    
                    // Aplicar animación
                    li.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    li.style.opacity = '1';
                    li.style.transform = 'translateY(0)';
                }
            }
        }

        if (wasScrolledToBottom) {
            messageList.scrollTop = messageList.scrollHeight;
        }
    } catch (error) {
        console.error(error);
    }
};

// Cambiar tema (claro/oscuro)
const toggleTheme = () => {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', isDarkMode);
    
    // Cambiar texto del botón
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.textContent = isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
};

// Calcular altura del input container para ajustar el padding
const updateInputContainerHeight = () => {
    const inputContainer = document.querySelector('.input-container');
    const mainContainer = document.querySelector('.main-container');
    if (inputContainer && mainContainer) {
        // Obtener altura real del contenedor de input
        const height = inputContainer.offsetHeight;
        // Añadir un poco de margen extra para seguridad
        mainContainer.style.paddingBottom = `${height + 10}px`;
    }
};

// Dibujar el input para enviar mensajes
const drawInput = () => {
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Escribe tu mensaje... (máx. 140 caracteres)';
    textarea.maxLength = 140;
    textarea.classList.add('input-textarea');
    textarea.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await sendMessage();
        }
    });

    const charCounter = document.createElement('div');
    charCounter.classList.add('char-counter');
    charCounter.textContent = '0/140';
    
    // Actualizar contador de caracteres
    textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        charCounter.textContent = `${count}/140`;
        
        // Cambiar color cuando se acerca al límite
        if (count > 120) {
            charCounter.style.color = '#ff6b6b';
        } else {
            charCounter.style.color = '';
        }
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const button = document.createElement('button');
    button.textContent = 'Enviar';
    button.classList.add('input-button');
    button.onclick = sendMessage;

    async function sendMessage() {
        // Capturar el valor actual del textarea y luego limpiar
        const messageText = textarea.value.trim();
        if (!messageText) return alert('Por favor, escribe un mensaje.');
        
        // Limpiar el textarea ANTES de enviar el mensaje
        textarea.value = '';
        charCounter.textContent = '0/140';
        
        // Enviar el mensaje capturado
        const message = { text: messageText, user: 'Jonialen' };
        try {
            await postMessage(message);
            await drawMessages();
        } catch (error) {
            console.error(error);
            alert('Error al enviar el mensaje.');
        }
    }

    const themeToggle = document.createElement('button');
    themeToggle.classList.add('theme-toggle');
    
    // Verificar si hay una preferencia guardada
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Modo Claro';
    } else {
        themeToggle.textContent = '🌙 Modo Oscuro';
    }
    
    themeToggle.onclick = toggleTheme;

    inputContainer.appendChild(textarea);
    inputContainer.appendChild(charCounter);
    buttonContainer.appendChild(button);
    buttonContainer.appendChild(themeToggle);
    inputContainer.appendChild(buttonContainer);
    document.body.appendChild(inputContainer);
    
    // Actualizar el padding después de que el DOM se haya actualizado
    setTimeout(updateInputContainerHeight, 0);
    
    // Actualizar también cuando cambie el tamaño de la ventana
    window.addEventListener('resize', updateInputContainerHeight);
};

// Auto-refresh de mensajes sin perder el scroll
let refreshInterval;
const startAutoRefresh = () => {
    refreshInterval = setInterval(drawMessages, 5000);
};

// Función principal
const main = async () => {
    // Crear contenedor principal
    const mainContainer = document.createElement('div');
    mainContainer.classList.add('main-container');
    
    // Crear lista de mensajes
    const messageList = document.createElement('ul');
    messageList.classList.add('message-list');
    
    mainContainer.appendChild(messageList);
    document.body.appendChild(mainContainer);
    
    await drawMessages();
    drawInput();
    startAutoRefresh();
};

// Aplicar estilos CSS
const applyStyles = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            height: 100vh; 
            background: #f4f4f4;
            transition: background-color 0.3s ease, color 0.3s ease;
            overflow: hidden;
        }
        
        body.dark-mode {
            background: #222;
            color: #eee;
        }
        
        body.dark-mode .message-list {
            background: #333;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
        }
        
        body.dark-mode .message-item {
            border-bottom: 1px solid #555;
        }
        
        body.dark-mode .input-container {
            background: #333;
            box-shadow: 0px -2px 6px rgba(0, 0, 0, 0.3);
        }
        
        body.dark-mode .input-textarea {
            background: #444;
            color: #eee;
            border: 1px solid #555;
        }
        
        body.dark-mode .web-preview {
            background: #444;
        }
        
        body.dark-mode .web-preview p {
            color: #ccc;
        }
        
        .main-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding-bottom: 80px; /* Valor inicial, se actualizará con JS */
            box-sizing: border-box;
            position: relative;
        }
        
        .message-list { 
            list-style: none; 
            padding: 10px; 
            flex-grow: 1; 
            overflow-y: auto; 
            background: #fff; 
            border-radius: 8px; 
            margin: 10px; 
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .message-item { 
            padding: 8px; 
            border-bottom: 1px solid #ddd;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .message-image { 
            max-width: 100%; 
            max-height: 300px;
            display: block; 
            margin-top: 5px; 
            border-radius: 8px;
        }
        
        .message-link { 
            color: #007bff; 
            text-decoration: none; 
            font-weight: bold;
        }
        
        .message-link:hover { 
            text-decoration: underline;
        }
        
        .image-preview { 
            max-width: 250px; 
            margin-top: 5px;
        }
        
        .web-preview { 
            background: #f9f9f9; 
            padding: 10px; 
            border-radius: 8px; 
            margin-top: 5px;
            border-left: 3px solid #007bff;
        }
        
        .web-preview h4 { 
            margin: 0; 
            font-size: 16px; 
            color: #007bff;
        }
        
        .web-preview p { 
            font-size: 14px; 
            color: #555; 
            margin: 5px 0 0;
        }
        
        .input-container { 
            position: fixed; 
            bottom: 0; 
            left: 0;
            width: 100%; 
            background: #fff; 
            padding: 10px; 
            display: flex; 
            flex-wrap: wrap;
            align-items: center;
            box-shadow: 0px -2px 6px rgba(0, 0, 0, 0.1);
            box-sizing: border-box;
            z-index: 100;
        }
        
        .button-container {
            display: flex;
            align-items: center;
            margin-left: 10px;
        }
        
        .input-textarea { 
            flex: 1; 
            padding: 10px; 
            border: 1px solid #ccc; 
            border-radius: 4px; 
            resize: none;
            min-height: 40px;
            font-family: Arial, sans-serif;
        }
        
        .char-counter {
            margin: 0 10px;
            font-size: 12px;
            color: #666;
        }
        
        .input-button { 
            padding: 10px 15px; 
            cursor: pointer; 
            background: #007bff; 
            color: white; 
            border: none; 
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        .input-button:hover { 
            background: #0056b3;
        }
        
        .theme-toggle {
            margin-left: 10px;
            padding: 10px 15px;
            cursor: pointer;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        .theme-toggle:hover {
            background: #5a6268;
        }
        
        /* Estilos responsivos para móviles */
        @media (max-width: 768px) {
            .input-container {
                flex-direction: column;
                padding: 10px;
            }
            
            .input-textarea {
                width: 100%;
                margin-bottom: 10px;
            }
            
            .button-container {
                display: flex;
                width: 100%;
                margin-left: 0;
            }
            
            .input-button, .theme-toggle {
                flex: 1;
                margin: 5px;
            }
            
            .char-counter {
                align-self: flex-end;
                margin-bottom: 5px;
            }
        }
    `;
    document.head.appendChild(style);
};

// Ejecutar
applyStyles();
main();
