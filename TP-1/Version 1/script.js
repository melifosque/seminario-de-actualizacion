document.addEventListener('DOMContentLoaded', function () {
    const baseURL = 'http://localhost/TP%201/Version%201/api.php';

    // Función para cargar usuarios desde la API y mostrarlos en la tabla
    function cargarUsuarios() {
        fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accion: 'obtener_usuarios' }),
        })
        .then(response => response.json())
        .then(data => {
            const usuariosTable = document.getElementById('usuariosTable');
            const tbody = usuariosTable.getElementsByTagName('tbody')[0];
            tbody.innerHTML = ''; 
            data.forEach(usuario => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.grupo_id}</td>
                    <td>
                        <button onclick="editarUsuario(${usuario.id})">Editar</button>
                        <button onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error:', error));
    }

    // Llamar a la función para cargar usuarios al cargar la página
    cargarUsuarios();

    // Función para crear un nuevo usuario
    document.getElementById('crearUsuarioForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Evitar el comportamiento por defecto del formulario

        const nombre = document.getElementById('nombreUsuario').value;
        const grupoId = document.getElementById('grupoIdUsuario').value;

        fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accion: 'crear_usuario',
                nombre: nombre,
                grupo_id: grupoId
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarUsuarios(); // Recargar la tabla después de crear un usuario
                // Limpiar los campos del formulario
                document.getElementById('nombreUsuario').value = '';
                document.getElementById('grupoIdUsuario').value = '';
            } else {
                alert('Error al crear el usuario');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Función para editar un usuario
    window.editarUsuario = function (id) {
        const nombreUsuarioEdit = prompt('Nuevo nombre del usuario:');
        const grupoIdEdit = prompt('Nuevo ID del grupo:');
        if (nombreUsuarioEdit && grupoIdEdit) {
            fetch(baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accion: 'editar_usuario',
                    id: id,
                    nombre: nombreUsuarioEdit,
                    grupo_id: grupoIdEdit
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cargarUsuarios();
                } else {
                    alert('Error al editar el usuario');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

    // Función para eliminar un usuario
    window.eliminarUsuario = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            fetch(baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accion: 'eliminar_usuario',
                    id: id
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cargarUsuarios();
                } else {
                    alert('Error al eliminar el usuario');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }
});
const baseURL = 'http://localhost/TP%201/Version%201/api.php';

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
    }
    return response.json();
}

async function loadOptions(selectId, action) {
    try {
        const data = await postData(baseURL, { accion: action });
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Selecciona...</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.text = item.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando opciones:', error);
    }
}

async function loadDataAndOptions() {
    await loadOptions('grupoIdUsuario', 'obtener_grupos');
    await loadOptions('grupoIdsAsociar', 'obtener_grupos');
    await loadOptions('idUsuarioAsociar', 'obtener_usuarios');
    await loadOptions('idUsuarioEdit', 'obtener_usuarios');
    await loadOptions('grupoIdEdit', 'obtener_grupos');
    await loadOptions('grupoIdAsociarAcciones', 'obtener_grupos');
    await loadOptions('accionIdsAsociar', 'obtener_acciones');
    await loadOptions('idAccionEdit', 'obtener_acciones');
    await loadOptions('idAccionDelete', 'obtener_acciones');
}



document.addEventListener('DOMContentLoaded', loadDataAndOptions);

document.getElementById('crearUsuarioForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombreUsuario = document.getElementById('nombreUsuario').value;
    const grupoId = document.getElementById('grupoIdUsuario').value;
    const response = await postData(baseURL, { accion: 'crear_usuario', nombre: nombreUsuario, grupo_id: grupoId });
    console.log(response);
});

document.getElementById('editarUsuarioForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idUsuario = document.getElementById('idUsuarioEdit').value;
    const nuevoNombreUsuario = document.getElementById('nombreUsuarioEdit').value;
    const nuevoGrupoId = document.getElementById('grupoIdEdit').value;
    const response = await postData(baseURL, { accion: 'editar_usuario', id_usuario: idUsuario, nombre: nuevoNombreUsuario, grupo_id: nuevoGrupoId });
    console.log(response);
});

document.getElementById('eliminarUsuarioForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idUsuario = document.getElementById('idUsuarioDelete').value;
    const response = await postData(baseURL, { accion: 'eliminar_usuario', id_usuario: idUsuario });
    console.log(response);
});

document.getElementById('crearGrupoForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombreGrupo = document.getElementById('nombreGrupo').value;
    const response = await postData(baseURL, { accion: 'crear_grupo', nombre: nombreGrupo });
    console.log(response);
});

document.getElementById('editarGrupoForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idGrupo = document.getElementById('idGrupoEdit').value;
    const nuevoNombreGrupo = document.getElementById('nombreGrupoEdit').value;
    const response = await postData(baseURL, { accion: 'editar_grupo', id_grupo: idGrupo, nombre: nuevoNombreGrupo });
    console.log(response);
});

document.getElementById('eliminarGrupoForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idGrupo = document.getElementById('idGrupoDelete').value;
    const response = await postData(baseURL, { accion: 'eliminar_grupo', id_grupo: idGrupo });
    console.log(response);
});

document.getElementById('crearAccionForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombreAccion = document.getElementById('nombreAccion').value;
    const response = await postData(baseURL, { accion: 'crear_accion', nombre: nombreAccion });
    console.log(response);
});

document.getElementById('editarAccionForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idAccion = document.getElementById('idAccionEdit').value;
    const nuevoNombreAccion = document.getElementById('nombreAccionEdit').value;
    const response = await postData(baseURL, { accion: 'editar_accion', id_accion: idAccion, nombre: nuevoNombreAccion });
    console.log(response);
});

document.getElementById('eliminarAccionForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idAccion = document.getElementById('idAccionDelete').value;
    const response = await postData(baseURL, { accion: 'eliminar_accion', id_accion: idAccion });
    console.log(response);
});

document.getElementById('asociarGruposUsuarioForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idUsuario = document.getElementById('idUsuarioAsociar').value;
    const grupoIds = Array.from(document.getElementById('grupoIdsAsociar').selectedOptions).map(option => option.value);
    const response = await postData(baseURL, { accion: 'asociar_grupos_usuario', id_usuario: idUsuario, grupo_ids: grupoIds });
    console.log(response);
});

document.getElementById('asociarAccionesGruposForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const idGrupo = document.getElementById('grupoIdAsociarAcciones').value;
    const accionIds = Array.from(document.getElementById('accionIdsAsociar').selectedOptions).map(option => option.value);
    const response = await postData(baseURL, { accion: 'asociar_acciones_grupo', id_grupo: idGrupo, accion_ids: accionIds });
    console.log(response);
});
