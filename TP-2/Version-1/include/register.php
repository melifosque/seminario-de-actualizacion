<?php
session_start();
include_once "database.php";

// Establecer el manejo de errores para mostrarlos en el navegador
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar si la solicitud es POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener datos del formulario
    $username = $_POST['new-username'];
    $password = $_POST['new-password'];
    $full_name = $_POST['full-name']; // Asegúrate de que coincida con el nombre del campo en tu formulario

    // Validaciones de seguridad y hash de la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insertar usuario en la base de datos
    $sql = "INSERT INTO users (user_name, password, full_name) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        echo json_encode(array('status' => 'error', 'message' => 'Error al preparar la consulta: ' . $conn->error));
        exit; // Salir del script si hay un error en la preparación de la consulta
    }

    // Vincular parámetros y ejecutar la consulta
    $stmt->bind_param("sss", $username, $hashed_password, $full_name);
    if ($stmt->execute()) {
        // Guardar información de sesión si es necesario
        $_SESSION['user_name'] = $username;
        
        // Respuesta exitosa en JSON
        echo json_encode(array('status' => 'success', 'message' => 'Usuario registrado correctamente.'));
    } else {
        // Error al ejecutar la consulta
        echo json_encode(array('status' => 'error', 'message' => 'Error al registrar usuario: ' . $stmt->error));
    }

    // Cerrar la declaración preparada y la conexión
    $stmt->close();
    $conn->close();
}
?>
