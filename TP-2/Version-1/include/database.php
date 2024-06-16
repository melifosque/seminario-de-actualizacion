<?php
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "address_book";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("La conexión ha fallado: " . $conn->connect_error);
}

?>
