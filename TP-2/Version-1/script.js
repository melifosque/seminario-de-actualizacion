document.addEventListener("DOMContentLoaded", function() {
    const headerToggle = document.getElementById('header-toggle');
    const navBar = document.getElementById('nav-bar');
    const agregarContactoLink = document.getElementById('agregar_contacto_link');
    const buscarContactoLink = document.getElementById('buscar_contacto_link');
    const logoutLink = document.getElementById('logout_link');

    const addContactForm = document.getElementById('add-contact-form');
    const searchContainer = document.getElementById('search-container');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const contactList = document.getElementById('contact-list');
    const editPopup = document.getElementById('editPopup');
    const editForm = document.getElementById('editForm');
    const contactForm = document.getElementById('contact-form');

    headerToggle.addEventListener('click', () => {
        navBar.classList.toggle('show');
    });

    agregarContactoLink.addEventListener('click', () => {
        addContactForm.style.display = 'block';
        searchContainer.style.display = 'none';


    });

    buscarContactoLink.addEventListener('click', () => {
        addContactForm.style.display = 'none';
        searchContainer.style.display = 'block';
    });

    logoutLink.addEventListener('click', function(e) {
        e.preventDefault(); // Prevenir el comportamiento predeterminado del enlace

        fetch('Login/logout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ logout: true })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Convertir la respuesta a JSON
        })
        .then(data => {
            // Manejar la respuesta JSON
            if (data.status === 'success') {
                console.log('Exito al cerrar sesion');
                window.location.href = 'index.html';
            } else {
                console.error('Error en el servidor:', data.message);
    
            }
        })
        .catch(error => {
            console.error('Error al cerrar sesion:', error);
    
        });
    });


    searchButton.addEventListener('click', () => {
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            fetch(`include/search.php?name=${encodeURIComponent(searchQuery)}`)
                .then(response => response.json())
                .then(data => {
                    contactList.innerHTML = '';
                    data.forEach(contact => {
                        const li = document.createElement('li');
                        li.innerHTML = `${contact.name} ${contact.surname} (${contact.email}) - Números: ${contact.numbers} 
                        <button class="edit-button" data-id="${contact.id}">Editar</button> 
                        <button class="delete-button" data-id="${contact.id}">Eliminar</button>`;
                        contactList.appendChild(li);
                    });
                    addEditAndDeleteListeners(data);
                })
                .catch(error => console.error('Error al buscar contactos:', error));
        }
    });

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const id = document.getElementById('contact-id').value;
        const action = id ? 'edit.php' : 'create.php';

        fetch(`include/${action}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showPopup(data.message);
            if (data.status === 'success') {
                contactForm.reset();
                if (action === 'edit.php') {
                    document.getElementById('contact-id').value = '';
                }
                searchButton.click();
            }
        })
        .catch(error => console.error('Error al agregar/editar contacto:', error));
    });

    fetch('include/read.php')
        .then(response => response.json())
        .then(contactos => {
            contactList.innerHTML = '';
            contactos.forEach(contact => {
                const li = document.createElement('li');
                li.innerHTML = `${contact.name} ${contact.surname} (${contact.email}) - Números: ${contact.numbers} 
                <button class="edit-button" data-id="${contact.id}">Editar</button> 
                <button class="delete-button" data-id="${contact.id}">Eliminar</button>`;
                contactList.appendChild(li);
            });
            addEditAndDeleteListeners(contactos);
        })
        .catch(error => console.error('Error al obtener los contactos', error));

    function showContactList() {
        searchContainer.style.display = 'none';
        editPopup.style.display = 'none';
        messageContainer.innerHTML = ''; 

        // Mostrar el contenedor de la lista de contactos
        contactListContainer.style.display = 'block';

        fetch('include/read.php')
            .then(response => response.json())
            .then(contactos => {
        
                contactList.innerHTML = '';

                // Iterar sobre cada contacto y crear un elemento <li> para cada uno
                contactos.forEach(contact => {
                    const li = document.createElement('li');
                    li.innerHTML = `${contact.name} ${contact.surname} (${contact.email}) - Números: ${contact.numbers} 
                        <button class="edit-button" data-id="${contact.id}">Editar</button> 
                        <button class="delete-button" data-id="${contact.id}">Eliminar</button>`;
                    contactList.appendChild(li);
                });

                // Llamar a una función para agregar listeners a los botones de editar y eliminar
                addEditAndDeleteListeners(contactos);
            })
            .catch(error => {
                console.error('Error al obtener los contactos', error);
                messageContainer.innerHTML = 'Error al cargar la lista de contactos.';
            });
    }

    function addEditAndDeleteListeners(data) {
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const contact = data.find(c => c.id == id);

                // Llenar el formulario con los datos del contacto
                document.getElementById('editName').value = contact.name;
                document.getElementById('editSurname').value = contact.surname;
                document.getElementById('editEmail').value = contact.email;
                document.getElementById('editNumber').value = contact.numbers.split(',')[0];

                // Mostrar el modal
                editPopup.style.display = 'block';
                
                // Escuchar el envío del formulario
                editForm.onsubmit = (e) => {
                    e.preventDefault();
                    const formData = new FormData(editForm);
                    formData.append('id', id);

                    fetch('include/edit.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        showPopup(data.message);
                        if (data.status === 'success') {
                            editPopup.style.display = 'none';
                            searchButton.click();
                        }
                    })
                    .catch(error => {
                        console.error('Error al enviar solicitud:', error);
                        showPopup('Error al actualizar el contacto.');
                    });
                };
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const contactId = this.dataset.id;
                fetch(`include/delete.php?id=${contactId}`, {
                    method: 'POST'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    showPopup(data.message);
                    if (data.status === 'success') {
                        searchButton.click();
                    }
                })
                .catch(error => console.error('Error al eliminar el contacto:', error));
            });
        });
    }

    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'popup-message';
        popup.innerText = message;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
});