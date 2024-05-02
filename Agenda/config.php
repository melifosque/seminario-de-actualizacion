<?php
include_once "include/database.php";
include_once "crud.php";

$action = $_GET['action'] ?? '';

$contactManager = new ContactManager($conn);

// Manejar la acción de agregar un contacto
if ($action === 'add' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST["name"];
    $surname = $_POST["surname"];
    $email = $_POST["email"];
    $number = $_POST["number"];

    try {
        // Llamar al método createContact de ContactManager
        $contact_id = $contactManager->createContact($name, $surname, $email, $number);
        // Imprimir respuesta JSON indicando éxito
        echo json_encode(["success" => true, "message" => "Contacto agregado correctamente", "contact_id" => $contact_id]);
    } catch (Exception $e) {
        // Imprimir respuesta JSON indicando error
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// Manejar la acción de eliminar un contacto
if ($action === 'delete') {
    $contact_id = $_POST['id'] ?? '';

    try {
        // Llamar al método deleteContact de ContactManager
        $success = $contactManager->deleteContact($contact_id);
        if ($success) {
            echo json_encode(["success" => true, "message" => "Contacto eliminado correctamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al eliminar el contacto"]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// Manejar la acción de actualizar un contacto
if ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $contact_id = $_POST['id'] ?? '';
    $name = $_POST["name"] ?? '';
    $surname = $_POST["surname"] ?? '';
    $email = $_POST["email"] ?? '';

    try {
        // Llamar al método updateContact de ContactManager
        $success = $contactManager->updateContact($contact_id, $name, $surname, $email);
        if ($success) {
            echo json_encode(["success" => true, "message" => "Contacto actualizado correctamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al actualizar el contacto"]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// Manejar la acción de buscar contactos por nombre
if ($action === 'search') {
    $name = $_GET['name'] ?? '';
    try {
        $contacts = $contactManager->searchContactsByName($name);
        echo json_encode(["success" => true, "contacts" => $contacts]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// Si ninguna acción válida es especificada, retornar un mensaje de acción no válida en forma de "message box"
$response = array(
    'success' => false,
    'message' => 'Acción no válida'
);
echo json_encode($response);
?>
