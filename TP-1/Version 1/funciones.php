<?php
include 'db.php';

function crearUsuario($nombre, $grupo_id) {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, grupo_id) VALUES (?, ?)");
    $stmt->bind_param("si", $nombre, $grupo_id);
    return $stmt->execute();
}

function editarUsuario($id, $nombre, $grupo_id) {
    global $conn;
    $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, grupo_id = ? WHERE id = ?");
    $stmt->bind_param("sii", $nombre, $grupo_id, $id);
    return $stmt->execute();
}

function eliminarUsuario($id) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $id);
    return $stmt->execute();
}

function crearGrupo($nombre) {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO grupos (nombre) VALUES (?)");
    $stmt->bind_param("s", $nombre);
    return $stmt->execute();
}

function editarGrupo($id, $nombre) {
    global $conn;
    $stmt = $conn->prepare("UPDATE grupos SET nombre = ? WHERE id = ?");
    $stmt->bind_param("si", $nombre, $id);
    return $stmt->execute();
}

function eliminarGrupo($id) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM grupos WHERE id = ?");
    $stmt->bind_param("i", $id);
    return $stmt->execute();
}

function crearAccion($nombre) {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO acciones (nombre) VALUES (?)");
    $stmt->bind_param("s", $nombre);
    return $stmt->execute();
}

function editarAccion($id, $nombre) {
    global $conn;
    $stmt = $conn->prepare("UPDATE acciones SET nombre = ? WHERE id = ?");
    $stmt->bind_param("si", $nombre, $id);
    return $stmt->execute();
}

function eliminarAccion($id) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM acciones WHERE id = ?");
    $stmt->bind_param("i", $id);
    return $stmt->execute();
}

function asignarGrupoAUsuario($usuario_id, $grupo_id) {
    global $conn;
    $stmt = $conn->prepare("UPDATE usuarios SET grupo_id = ? WHERE id = ?");
    $stmt->bind_param("ii", $grupo_id, $usuario_id);
    return $stmt->execute();
}

function asociarAccionAGrupo($accion_id, $grupo_id) {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO grupo_acciones (accion_id, grupo_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $accion_id, $grupo_id);
    return $stmt->execute();
}

function obtenerUsuarios() {
    global $conn;
    $result = $conn->query("SELECT id, nombre, grupo_id FROM usuarios");
    $usuarios = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row;
        }
    }
    return $usuarios;
}

function obtenerGrupos() {
    global $conn;
    $result = $conn->query("SELECT id, nombre FROM grupos");
    $grupos = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $grupos[] = $row;
        }
    }
    return $grupos;
}

function obtenerAcciones() {
    global $conn;
    $result = $conn->query("SELECT id, nombre FROM acciones");
    $acciones = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $acciones[] = $row;
        }
    }
    return $acciones;
}

function obtenerAccionesPorGrupo($grupo_id) {
    global $conn;
    $stmt = $conn->prepare("SELECT id, nombre FROM acciones WHERE id IN (SELECT accion_id FROM grupo_acciones WHERE grupo_id = ?)");
    $stmt->bind_param("i", $grupo_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $acciones = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $acciones[] = $row;
        }
    }
    return $acciones;
}
?>
