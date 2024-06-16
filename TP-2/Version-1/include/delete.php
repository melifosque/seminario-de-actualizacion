<?php
include_once "database.php"; // Conexión a la base de datos
include_once "ContactManager.php"; // Clase ContactManager

$contactManager = new ContactManager($conn);

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['id'])) {
    $id = $_GET['id'];

    try {
        // Eliminar el contacto
        $contactManager->deleteContact($id);
        $response = [
            'status' => 'success',
            'message' => 'Contacto eliminado correctamente'
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