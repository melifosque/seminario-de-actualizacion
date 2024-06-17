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

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(loginForm);

        fetch('Login/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Usuario o contraseña incorrectos');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.replace('login.html');
                }, 500);
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error en el inicio de sesión:', error);
            showMessage(error.message, 'error');
        });
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
    
        fetch('Login/register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showMessage(data.message, 'success');
                registerForm.reset(); 
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error en el registro:', error);
            showMessage('Error al registrar usuario: ' + error.message, 'error');
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
