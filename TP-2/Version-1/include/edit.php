<?php
include_once "database.php"; // Conexión a la base de datos
include_once "ContactManager.php"; // Clase ContactManager

$contactManager = new ContactManager($conn);

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Obtener los datos del formulario
    $id = $_POST['id'];
    $name = $_POST['name'];
    $surname = $_POST['surname'];
    $email = $_POST['email'];
    $number = $_POST['number'];

    try {
        
        $contactManager->updateContact($id, $name, $surname, $email);

        $contactManager->updateContactNumber($id, $number);

        $response = [
            'status' => 'success',
            'message' => 'Contacto actualizado correctamente'
        ];
    } catch (Exception $e) {
        $response = [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
    
    // Devolver la respuesta como JSON
    header('Content-Type: application/json');
    echo json_encode($response);
}
?>
