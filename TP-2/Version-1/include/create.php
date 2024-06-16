<?php
include_once "database.php";
include_once "ContactManager.php";

$response = [];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $surname = $_POST['surname'];
    $email = $_POST['email'];
    $number = $_POST['number'];

    $contactManager = new ContactManager($conn);

    try {
        $contact_id = $contactManager->createContact($name, $surname, $email, $number);
        $response = ["status" => "success", "message" => "Contacto agregado exitosamente con ID: $contact_id"];
    } catch (Exception $e) {
        $response = ["status" => "error", "message" => "Error al agregar el contacto: " . $e->getMessage()];
    }
}

echo json_encode($response);
?>
