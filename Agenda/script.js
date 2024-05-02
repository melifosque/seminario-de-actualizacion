document.addEventListener("DOMContentLoaded", function(event) {
    const toggleNavbar = (toggleId, navId, bodyId, headerId) => {
        const toggle = document.getElementById(toggleId),
              nav = document.getElementById(navId),
              bodypd = document.getElementById(bodyId),
              headerpd = document.getElementById(headerId);
    
        if (toggle && nav && bodypd && headerpd) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('show');
                toggle.classList.toggle('bx-x');
                bodypd.classList.toggle('body-pd');
                headerpd.classList.toggle('body-pd');
            });
        }
    }

    toggleNavbar('header-toggle', 'nav-bar', 'body-pd', 'header');

    const addContactLink = document.getElementById('agregar_contacto_link');
    const searchContactLink = document.getElementById('buscar_contacto_link');
    const addContactContainer = document.getElementById('add-contact-form');
    const searchContactContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const contactList = document.getElementById('contact-list');
    const messageBox = document.getElementById('message-box');
    const addContactForm = document.querySelector('#add-contact-form form');

    const showSection = (sectionToShow, sectionToHide) => {
        sectionToShow.style.display = 'block';
        sectionToHide.style.display = 'none';
    };

    addContactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar que el formulario se envíe normalmente

        // Obtener los valores del formulario
        const name = document.getElementById('name').value.trim();
        const surname = document.getElementById('surname').value.trim();
        const email = document.getElementById('email').value.trim();
        const number = document.getElementById('number').value.trim();

        // Aquí puedes realizar cualquier validación de los datos del formulario si es necesario

        // Llamar a una función para agregar el contacto
        addContact(name, surname, email, number);
    });

    const addContact = (name, surname, email, number) => {
        // Realizar una solicitud al servidor para agregar el contacto
        fetch('config.php?action=add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `name=${encodeURIComponent(name)}&surname=${encodeURIComponent(surname)}&email=${encodeURIComponent(email)}&number=${encodeURIComponent(number)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message);
            } else {
                showError(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    };

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm !== '') {
            searchContacts(searchTerm);
        }
    });

    const switchSection = (linkToShow, sectionToShow, sectionToHide) => {
        linkToShow.addEventListener('click', function(event) {
            event.preventDefault();
            showSection(sectionToShow, sectionToHide);
        });
    };

    switchSection(addContactLink, addContactContainer, searchContactContainer);
    switchSection(searchContactLink, searchContactContainer, addContactContainer);

    const displayContacts = (contacts) => {
        contactList.innerHTML = '';
        contacts.forEach(contact => {
            const listItem = document.createElement('li');
            listItem.textContent = `${contact.name} ${contact.surname} (${contact.email})`;
            contactList.appendChild(listItem);
        });
    };

    const showMessage = (message, isError = false) => {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.style.backgroundColor = isError ? 'red' : '';
    };

    const searchContacts = (searchTerm) => {
        fetch(`config.php?action=search&name=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayContacts(data.contacts);
                } else {
                    showMessage(data.message, true);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Hubo un error al realizar la búsqueda.', true);
            });
    };

    const deleteContact = (contactId) => {
        fetch('config.php?action=delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'ID=' + encodeURIComponent(contactId)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message);
            } else {
                showMessage(data.message, true);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Hubo un error al eliminar el contacto.', true);
        });
    };

    const showContactOptions = (contactId) => {
        const optionsModal = document.getElementById('contact-options');
        optionsModal.style.display = 'block';

        const closeButton = optionsModal.querySelector('.close');
        const editButton = document.getElementById('edit-contact-button');
        const deleteButton = document.getElementById('delete-contact-button');

        closeButton.addEventListener('click', function() {
            optionsModal.style.display = 'none';
        });

        deleteButton.addEventListener('click', function() {
            deleteContact(contactId);
        });
    };
});


    