<?php
include_once "database.php"; // Incluir el archivo con la conexión a la base de datos
include_once "ContactManager.php"; // Incluir la clase ContactManager

$contactManager = new ContactManager($conn);

$contacts = $contactManager->getContactsWithNumbers();

header('Content-Type: application/json');
echo json_encode($contacts);

?>
