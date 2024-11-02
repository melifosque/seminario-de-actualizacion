const socket = io.connect(`http://${document.domain}:${location.port}`);
const chatDiv = document.getElementById('chat');
const roomsDiv = document.getElementById('rooms');
let currentUsername = '';
let sharedKey = '';
let currentRoom = '';

function updateRoomList(rooms) {
    const availableRoomsList = document.getElementById('room-list');

    while (availableRoomsList.firstChild) {
        availableRoomsList.removeChild(availableRoomsList.firstChild);
    }

    rooms.forEach((room) => {
        const li = document.createElement('li');
        li.textContent = room;
        li.className = 'list-group-item list-group-item-action';
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            document.getElementById('room').value = room; // Manejar clic en la sala
            console.log(`Seleccionado para unirse a la sala: ${room}`);
        });
        availableRoomsList.appendChild(li);
    });
}

// Solicitar las salas al cargar
fetch('/rooms')
    .then(response => response.json())
    .then(updateRoomList)
    .catch(error => console.error('Error al cargar salas:', error));

document.getElementById('createRoom').addEventListener('click', () => {
    const room = document.getElementById('room').value.trim();
    if (room) {
        socket.emit('createRoom', { room });
        document.getElementById('room').value = '';
    } else {
        alert('Por favor, ingrese un nombre de sala.');
    }
});

socket.on('updateRooms', updateRoomList);

document.getElementById('join').addEventListener('click', () => {
    const username = document.getElementById('login_username')?.value.trim();
    const room = document.getElementById('room').value.trim();

    if (username && room) {
        currentUsername = username;
        currentRoom = room;
        socket.emit('join', { username, room });

        roomsDiv.style.display = 'none';
        chatDiv.style.display = 'block';

        fetch(`/getSharedKey/${room}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener la clave compartida');
                return response.json();
            })
            .then(data => { sharedKey = data.key; })
            .catch(error => console.error('Error obteniendo la clave compartida:', error));
    } else {
        alert('Por favor, ingrese ambos campos.');
    }
});

// Manejo de errores
socket.on('error', (data) => {
    alert(data.msg);
});

// Función para enviar mensajes
function sendMessage() {
    const message = document.getElementById('message').value.trim();

    if (message && sharedKey) {
        const encryptedMessage = CryptoJS.AES.encrypt(message, sharedKey).toString();
        socket.emit('message', { msg: encryptedMessage, room: currentRoom, username: currentUsername });
        document.getElementById('message').value = ''; 
        const messagesContainer = document.getElementById('messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

document.getElementById('send').addEventListener('click', sendMessage);

document.getElementById('message').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage(); 
        event.preventDefault(); 
    }
});

socket.on('message', data => {
    const encryptedMessage = data.msg;
    const li = document.createElement('li');

    if (encryptedMessage.startsWith('¡')) { 
        li.textContent = encryptedMessage;
    } else {
        const decryptedMessage = CryptoJS.AES.decrypt(encryptedMessage, sharedKey).toString(CryptoJS.enc.Utf8);
        const sender = data.username === currentUsername ? 'Yo' : data.username; 
        li.textContent = `${sender}: ${decryptedMessage}`; 
        li.classList.add(data.username === currentUsername ? 'sender' : 'receiver');
    }

    document.getElementById('messages').appendChild(li);
});

// Funcionalidad de emojis
const emojiButton = document.getElementById('emoji-button');
const emojiPicker = document.getElementById('emoji-picker');
const messageInput = document.getElementById('message');

emojiButton.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

emojiPicker.addEventListener('click', (event) => {
    if (event.target.classList.contains('emoji')) {
        const emoji = event.target.dataset.emoji;
        messageInput.value += emoji;  
        emojiPicker.style.display = 'none';
    }
});

// Manejo del botón volver atrás
document.getElementById('back-btn-chat').addEventListener('click', function() {
    console.log('Botón volver atrás presionado');
    roomsDiv.style.display = 'block'; // Mostrar el formulario de "Unirse a la sala"
    chatDiv.style.display = 'none'; // Ocultar el chat
});

// Manejo del botón cerrar sesión
document.getElementById('logout-btn-chat').addEventListener('click', () => {
    fetch('/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(() => {
        alert("Sesión cerrada exitosamente");
        location.reload();
    });
});