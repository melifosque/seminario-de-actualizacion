document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const messageContainer = document.getElementById('message-container');
    const showRegisterFormLink = document.getElementById('show-register-form');
    const showLoginFormLink = document.getElementById('show-login-form');

    showRegisterFormLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        clearMessages();
    });

    showLoginFormLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        clearMessages();
    });

    // Escuchar el envío del formulario de inicio de sesión
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('Login/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Usuario o contraseña incorrectos');
            }
            return response.json();
        })
        .then(data => {
            showMessage(data.message, 'success');
            setTimeout(() => {
                window.location.replace('index.html'); // Redirigir al usuario a la página principal
            }, 2000); // Redireccionar después de 2 segundos
        })
        .catch(error => {
            console.error('Error en el inicio de sesión:', error);
            showMessage(error.message, 'error');
        });
    });

    // Escuchar el envío del formulario de registro
    registerForm.addEventListener('submit', function(e) {
   
            e.preventDefault(); // Evitar que el formulario se envíe automáticamente
    
            const formData = new FormData(registerForm);
    
            fetch('Login/register.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                showMessage(data.message, 'success');
                registerForm.reset(); // Limpiar formulario después del registro exitoso
            })
            .catch(error => {
                console.error('Error en el registro:', error);
                showMessage('Error al registrar usuario', 'error');
            });
        });

    function showMessage(message, type) {
        messageContainer.innerHTML = message;
        messageContainer.style.display = 'block';
        messageContainer.className = `message ${type}`;
    }

    function clearMessages() {
        messageContainer.style.display = 'none';
        messageContainer.innerHTML = '';
    }
});
