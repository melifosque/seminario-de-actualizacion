<?php
session_start();

include_once "../include/database.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    function clean_input($data) {
        $data = trim($data);
        $data = htmlspecialchars($data);
        return $data;
    }

    $username = clean_input($_POST['new_username']);
    $password = $_POST['new_password']; // No limpiar la contraseña aquí
    $full_name = clean_input($_POST['full_name']);

    // Validar que los campos no estén vacíos
    if (empty($username)) {
        echo json_encode(array('status' => 'error', 'message' => 'El campo Usuario está vacío.'));
        exit;
    }
    if (empty($password)) {
        echo json_encode(array('status' => 'error', 'message' => 'El campo Contraseña está vacío.'));
        exit;
    }
    if (empty($full_name)) {
        echo json_encode(array('status' => 'error', 'message' => 'El campo Nombre Completo está vacío.'));
        exit;
    }

    // Hash de la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insertar usuario en la base de datos
    $sql = "INSERT INTO users (user_name, user_password, full_name) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);

    // Verificar si hubo un error en la preparación de la consulta
    if ($stmt === false) {
        $error_message = 'Error al preparar la consulta: ' . $conn->error;
        echo json_encode(array('status' => 'error', 'message' => $error_message));
        exit; // Salir del script si hay un error en la preparación
    }

    // Vincular parámetros y ejecutar la consulta
    $stmt->bind_param("sss", $username, $hashed_password, $full_name);

    if ($stmt->execute()) {
        $_SESSION['username'] = $username;
        echo json_encode(array('status' => 'success', 'message' => 'Usuario registrado correctamente.'));
    } else {
        // Verificar si hubo un error específico al intentar insertar el usuario
        if ($stmt->errno == 1062) {
            echo json_encode(array('status' => 'error', 'message' => 'El nombre de usuario ya está en uso.'));
        } else {
            echo json_encode(array('status' => 'error', 'message' => 'Error al registrar usuario: ' . $stmt->error));
        }
    }

    // Cerrar la declaración preparada y la conexión a la base de datos
    $stmt->close();
    $conn->close();
} else {
    // Si el método de solicitud no es POST, mostrar mensaje de error
    echo json_encode(array('status' => 'error', 'message' => 'Método de solicitud no permitido.'));
}
?>
