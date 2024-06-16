<?php
include_once "database.php";
include_once "ContactManager.php";

$response = [];

if (isset($_GET['name'])) {
    $name = $_GET['name'];
    $contactManager = new ContactManager($conn);
    $contacts = $contactManager->searchContactsByName($name);

    foreach ($contacts as &$contact) {
        $contact_id = $contact['id'];
        $sql = "SELECT GROUP_CONCAT(number.number) AS numbers
                FROM contact_number 
                JOIN number ON contact_number.number_id = number.id 
                WHERE contact_number.contact_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $contact_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $contact['numbers'] = $row['numbers'];
    }

    $response = $contacts;
    
}

echo json_encode($response);
?>
