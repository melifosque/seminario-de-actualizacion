<?php
session_start();
include_once "database.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['user_name'];
    $password = $_POST['password'];

    // Buscar el usuario en la base de datos
    $sql = "SELECT user_name, password FROM users WHERE user_name = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        // Iniciar sesión
        $_SESSION['user_name'] = $user['user_name'];
        echo json_encode(array('status' => 'success', 'message' => 'Inicio de sesión exitoso.'));
    } else {
        echo json_encode(array('status' => 'error', 'message' => 'Usuario o contraseña incorrectos.'));
    }

    $stmt->close();
    $conn->close();
}
?>
