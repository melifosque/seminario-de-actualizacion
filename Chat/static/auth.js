document.addEventListener('DOMContentLoaded', () => {
    const loginDiv = document.getElementById('login'); 
    const captchaImg = document.getElementById('captcha-img');
    const refreshCaptchaBtn = document.getElementById('refresh-captcha');

    const forms = ['login', 'register', 'user-validation-form', 'sms-verification-form', 
        'email-verification-form', 'security-questions-form', 
        'reset-password-form', 'recover-method-selection', 'chat'];
    const historyStack = [];

    // Mostrar formulario según su ID y actualizar historial de navegación
    function showForm(formId) {
        console.log(`Mostrando formulario: ${formId}`);
        forms.forEach(id => {
            const formElement = document.getElementById(id);
            if (formElement) formElement.style.display = 'none';
        });
        const selectedForm = document.getElementById(formId);
        if (selectedForm) {
            selectedForm.style.display = 'block';
            updateHistory(formId);
        } else {
            console.error(`Formulario ${formId} no encontrado.`);
        }
    }

    // Actualizar historial de navegación de formularios
    function updateHistory(formId) {
        if (historyStack.length === 0 || historyStack[historyStack.length - 1] !== formId) {
            historyStack.push(formId);
        }
    }

    document.querySelectorAll('.back-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (historyStack.length > 1) {
                historyStack.pop();
                showForm(historyStack[historyStack.length - 1]);
            }
        });
    });

    showForm('login');

    function setupButtonEvent(buttonId, formId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                showForm(formId);
                console.log(`Botón ${buttonId} presionado. Mostrando formulario: ${formId}`);
            });
        } else {
            console.error(`Botón con ID ${buttonId} no encontrado.`);
        }
    }

    setupButtonEvent('go-login', 'login');
    setupButtonEvent('go-register', 'register');
    setupButtonEvent('forgot-password', 'user-validation-form');
    // Refrescar CAPTCHA
    refreshCaptchaBtn?.addEventListener('click', () => {
        captchaImg.src = '/captcha?' + new Date().getTime();
    });

    // Registro de usuario
    document.getElementById('register-btn')?.addEventListener('click', () => {
        const registerData = {
            username: document.getElementById('reg_username').value.trim(),
            email: document.getElementById('reg_email').value.trim(),
            password: document.getElementById('reg_password').value.trim(),
            captchaResponse: document.getElementById('captcha_response').value.trim(),
            phoneNumber: document.querySelector('input[name="phone_number"]').value.trim(),
            securityAnswers: Array.from({ length: 5 }, (_, i) => document.getElementById(`security_answer${i + 1}`).value.trim())
        };

        if (Object.values(registerData).some(value => !value)) {
            alert('Por favor, complete todos los campos requeridos');
            return;
        }

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Registro exitoso! Por favor, inicia sesión.');
                showForm('login');
            } else {
                alert(data.message);
            }
        })
        .catch(error => alert(error.message));
    });

    // Inicio de sesión
    document.getElementById('login-btn')?.addEventListener('click', () => {
        const username = document.getElementById('login_username').value.trim();
        const password = document.getElementById('login_password').value.trim();

        if (!username || !password) {
            alert('Por favor, complete ambos campos');
            return;
        }

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loginDiv.style.display = 'none';
                document.getElementById('rooms').style.display = 'block';
            } else {
                alert(data.message);
            }
        })
        .catch(error => alert(error.message));
    });

    // Validación de usuario para recuperación de contraseña
    document.getElementById('validate-user-btn')?.addEventListener('click', () => {
        const identifier = document.getElementById('identifier').value.trim();
        const captchaResponse = document.getElementById('captcha_response2').value.trim();

        if (!identifier || !captchaResponse) {
            alert('Por favor, complete todos los campos');
            return;
        }

        sessionStorage.setItem('identifier', identifier);

        fetch('/validate-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, captcha: captchaResponse })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showForm('recover-method-selection');
            } else {
                alert(data.message);
                document.getElementById('captcha-img-recover').src = '/captcha?' + new Date().getTime();
            }
        })
        .catch(error => alert('Error de red: ' + error.message));
    });

    // Continuar con el método de recuperación
    document.getElementById('continue-recovery')?.addEventListener('click', () => {
        const selectedMethod = document.querySelector('input[name="recover_method"]:checked');
        const identifier = sessionStorage.getItem('identifier');

        if (!selectedMethod) {
            alert('Por favor, seleccione un método de recuperación.');
            return;
        }

        const method = selectedMethod.value;
        showForm(method === 'sms' ? 'sms-verification-form' : method === 'email' ? 'email-verification-form' : 'security-questions-form');

        const urlMap = {
            'sms': '/send-sms-code',
            'email': '/send-email-code',
            'security_questions': '/verify-security-questions'
        };

        fetch(urlMap[method], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        })
        .then(response => response.json())
        .then(data => alert(data.success ? 'Código enviado.' : data.message))
        .catch(error => alert('Error de red: ' + error.message));
    });

    // Verificar código de SMS o correo
    function verifyCode(btnId, inputId, url, successMessage) {
        document.getElementById(btnId)?.addEventListener('click', () => {
            const code = document.getElementById(inputId).value.trim();
            if (!code) return alert('Por favor, ingrese el código.');

            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.success ? successMessage : 'Código incorrecto.');
                if (data.success) showForm('reset-password-form');
            })
            .catch(error => alert(error.message));
        });
    }

    verifyCode('verify-sms-btn', 'sms_code', '/verify-sms-code', 'Código verificado correctamente.');
    verifyCode('verify-email-btn', 'verification_code_email', '/verify-email-code', 'Código de correo verificado correctamente.');

    // Restablecer contraseña
    document.getElementById('reset-password-btn')?.addEventListener('click', () => {
        const identifier = sessionStorage.getItem('identifier');
        const newPassword = document.getElementById('new-password')?.value.trim();

        if (!newPassword || !identifier) {
            alert('Por favor, complete todos los campos');
            return;
        }

        fetch('/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, newPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Contraseña actualizada correctamente.');
                showForm('login');
            } else {
                alert(data.message);
            }
        })
        .catch(error => alert(error.message));
    });

    // Cerrar sesión
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        fetch('/logout', { method: 'POST' })
        .then(response => response.json())
        .then(() => {
            alert("Sesión cerrada exitosamente");
            location.reload();
        })
        .catch(error => alert('Error al cerrar sesión: ' + error.message));
    });
});
