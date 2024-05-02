<?php
include_once "include/database.php"; // Asegúrate de la ruta correcta hacia tu archivo database.php

class ContactManager {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getContactsWithNumbers() {
        $sql = "SELECT contact.*, GROUP_CONCAT(number.number) AS numbers
                FROM contact 
                LEFT JOIN contact_number ON contact.id = contact_number.contact_id 
                LEFT JOIN number ON contact_number.number_id = number.id 
                GROUP BY contact.id";
        $result = $this->conn->query($sql);
        $contacts = array();
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $contacts[] = $row;
            }
        }
        return $contacts;
    }

    public function deleteContact($id) {
        $sqlDeleteNumbers = "DELETE FROM contact_number WHERE contact_id=?";
        $stmt = $this->conn->prepare($sqlDeleteNumbers);
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $sqlDeleteContact = "DELETE FROM contact WHERE id=?";
        $stmt = $this->conn->prepare($sqlDeleteContact);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al eliminar el contacto: " . $this->conn->error);
        }
    }

    public function updateContact($id, $name, $surname, $email) {
        $sql = "UPDATE contact SET name=?, surname=?, email=? WHERE id=?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssi", $name, $surname, $email, $id);
        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al actualizar el contacto: " . $this->conn->error);
        }
    }

    public function addNumberToContact($contact_id, $number) {
        $sqlInsertNumber = "INSERT INTO number (number) VALUES (?)";
        $stmt = $this->conn->prepare($sqlInsertNumber);
        $stmt->bind_param("s", $number);
        if ($stmt->execute()) {
            $number_id = $this->conn->insert_id;
            $sqlInsertRelation = "INSERT INTO contact_number (contact_id, number_id) VALUES (?, ?)";
            $stmt = $this->conn->prepare($sqlInsertRelation);
            $stmt->bind_param("ii", $contact_id, $number_id);
            if ($stmt->execute()) {
                return true;
            } else {
                throw new Exception("Error al insertar la relación: " . $this->conn->error);
            }
        } else {
            throw new Exception("Error al insertar el número: " . $this->conn->error);
        }
    }

    public function createContact($name, $surname, $email, $number) {
        $this->conn->begin_transaction();
        try {
            $sqlInsertContact = "INSERT INTO contact (name, surname, email) VALUES (?, ?, ?)";
            $stmt = $this->conn->prepare($sqlInsertContact);
            $stmt->bind_param("sss", $name, $surname, $email);
            if ($stmt->execute()) {
                $contact_id = $this->conn->insert_id;
                $this->addNumberToContact($contact_id, $number);
                $this->conn->commit();
                return $contact_id;
            } else {
                throw new Exception("Error al insertar el contacto: " . $this->conn->error);
            }
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    public function searchContactsByName($name) {
        $sql = "SELECT * FROM contact WHERE name LIKE ?";
        $stmt = $this->conn->prepare($sql);
        $name = "%{$name}%";
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $result = $stmt->get_result();
        $contacts = [];
        while ($row = $result->fetch_assoc()) {
            $contacts[] = $row;
        }
        return $contacts;
    }
}
?>