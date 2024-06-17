<?php
session_start();

$_SESSION = array(); // Vaciar todas las variables de sesión
session_destroy();   // Destruir la sesión

header('Content-Type: application/json');
echo json_encode(array('status' => 'success'));
exit;
?>