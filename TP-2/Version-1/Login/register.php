<?php
session_start();
include_once "../include/database.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['new-username'];
    $password = $_POST['new-password'];
    $full_name = $_POST['full-name'];

    // Validar y hash de la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insertar usuario en la base de datos
    $sql = "INSERT INTO users (user_name, password, full_name) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);

    // Verificar si la preparación de la consulta fue exitosa
    if ($stmt === false) {
        $error_message = 'Error al preparar la consulta: ' . $conn->error;
        echo json_encode(array('status' => 'error', 'message' => $error_message));
        exit; // Salir del script si hay un error
    }

    // Vincular parámetros y ejecutar la consulta
    $stmt->bind_param("sss", $username, $hashed_password, $full_name);
    if ($stmt->execute()) {
        // Obtener el ID del usuario recién registrado
        $user_id = $stmt->insert_id;

        // Guardar información de sesión
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;

        echo json_encode(array('status' => 'success', 'message' => 'Usuario registrado correctamente.'));
    } else {
        // Verificar si el usuario ya existe en la base de datos
        if ($stmt->errno == 1062) { // Código de error para duplicados (clave única)
            echo json_encode(array('status' => 'error', 'message' => 'El nombre de usuario ya está en uso.'));
        } else {
            echo json_encode(array('status' => 'error', 'message' => 'Error al registrar usuario: ' . $stmt->error));
        }
    }

    // Cerrar la declaración preparada y la conexión
    $stmt->close();
    $conn->close();
}
?>
