<?php
session_start();
include_once "../include/database.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];


    $sql = "SELECT * FROM users WHERE user_name = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        if (password_verify($password, $row['user_password'])) {

            $_SESSION['username'] = $row['user_name'];
            echo json_encode(array('status' => 'success', 'message' => 'Inicio de sesión exitoso.'));
        } else {
            echo json_encode(array('status' => 'error', 'message' => 'Usuario o contraseña incorrectos.'));
        }
    } else {
        echo json_encode(array('status' => 'error', 'message' => 'Usuario o contraseña incorrectos.'));
    }

    $stmt->close();
    $conn->close();
}else {
    echo json_encode(array('status' => 'error', 'message' => 'en login de solicitud no permitido.'));
}
?>
