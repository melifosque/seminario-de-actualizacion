<?php
include 'db.php';

// Establecer el tipo de contenido en JSON
header('Content-Type: application/json');

$request_method = $_SERVER["REQUEST_METHOD"];

switch ($request_method) {
    case 'GET':
        if (!empty($_GET["id"])) {
            $id = intval($_GET["id"]);
            get_user($id);
        } elseif (!empty($_GET["action"])) {
            switch ($_GET["action"]) {
                case 'get_groups':
                    get_groups();
                    break;
                case 'get_actions':
                    get_actions();
                    break;
                case 'get_group_action':
                    get_group_action();
                    break;
                default:
                    get_users();
                    break;
            }
        } else {
            get_users();
        }
        break;
    case 'POST':
        if (!empty($_GET["action"])) {
            switch ($_GET["action"]) {
                case 'create_user':
                    create_user();
                    break;
                case 'create_group':
                    create_group();
                    break;
                case 'create_action':
                    create_action();
                    break;
                case 'assign_action_to_group':
                    assign_action_to_group();
                    break;
                case 'get_groups_with_actions_and_users':
                    get_groups_with_actions_and_users();
                default:
                    echo json_encode(array('status' => 0, 'message' => 'Acción no válida'));
                    break;
            }
        } else {
            echo json_encode(array('status' => 0, 'message' => 'No se especificó ninguna acción'));
        }
        break;
    default:
        echo json_encode(array('status' => 0, 'message' => 'Método HTTP no válido'));
        break;
}

function get_users() {
    global $conn;
    $query = "SELECT * FROM usuarios";
    $response = array();
    $result = $conn->query($query);
    while($row = $result->fetch_assoc()) {
        $response[] = $row;
    }
    echo json_encode($response);
}

function get_groups() {
    global $conn;
    $query = "SELECT * FROM grupos";
    $response = array();
    $result = $conn->query($query);
    while($row = $result->fetch_assoc()) {
        $response[] = $row;
    }
    echo json_encode($response);
}

function get_actions() {
    global $conn;
    $query = "SELECT * FROM acciones";
    $response = array();
    $result = $conn->query($query);
    while($row = $result->fetch_assoc()) {
        $response[] = $row;
    }
    echo json_encode($response);
}

function get_groups_with_actions_and_users() {
    global $conn;
    $query = "SELECT g.id AS grupo_id,
                     g.nombre AS nombre_grupo,
                     a.id AS accion_id,
                     a.nombre AS nombre_accion,
                     u.id AS usuario_id,
                     u.nombre AS nombre_usuario
              FROM grupo_acciones ga
              JOIN grupos g ON ga.grupo_id = g.id
              JOIN acciones a ON ga.accion_id = a.id
              JOIN usuarios u ON g.id = u.grupo_id";
    
    $response = array();
    $result = $conn->query($query);
    while($row = $result->fetch_assoc()) {
        $grupo_id = $row['grupo_id'];
        // Si el grupo aún no está en el array de respuesta, lo inicializamos
        if (!isset($response[$grupo_id])) {
            $response[$grupo_id] = array(
                'nombre_grupo' => $row['nombre_grupo'],
                'acciones' => array(),
                'usuarios' => array(),
            );
        }

        // Agregamos la acción al grupo
        if (!empty($row['accion_id'])) {
            $response[$grupo_id]['acciones'][] = array(
                'id' => $row['accion_id'],
                'nombre' => $row['nombre_accion']
            );
        }

        // Agregamos al usuario al grupo
        if (!empty($row['usuario_id'])) {
            $response[$grupo_id]['usuarios'][] = array(
                'id' => $row['usuario_id'],
                'nombre' => $row['nombre_usuario']
            );
        }
    }
    echo json_encode(array_values($response));
}




function create_user() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    $nombre = $data["nombre"];
    $grupo_id = $data["grupo_id"];
    $query = "INSERT INTO usuarios (nombre, grupo_id) VALUES ('$nombre', $grupo_id)";
    if ($conn->query($query)) {
        $response = array('status' => 1, 'status_message' =>'User created successfully.');
    } else {
        $response = array('status' => 0, 'status_message' =>'User creation failed.');
    }
    echo json_encode($response);
}

function create_group() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    $nombre = $data["nombre"];
    $query = "INSERT INTO grupos (nombre) VALUES ('$nombre')";
    if ($conn->query($query)) {
        $response = array('status' => 1, 'status_message' =>'Group created successfully.');
    } else {
        $response = array('status' => 0, 'status_message' =>'Group creation failed.');
    }
    echo json_encode($response);
}

function create_action() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    $nombre = $data["nombre"];
    $query = "INSERT INTO acciones (nombre) VALUES ('$nombre')";
    if ($conn->query($query)) {
        $response = array('status' => 1, 'status_message' =>'Action created successfully.');
    } else {
        $response = array('status' => 0, 'status_message' =>'Action creation failed.');
    }
    echo json_encode($response);
}

function assign_action_to_group() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    $grupo_id = $data["grupo_id"];
    $accion_id = $data["accion_id"];
    $query = "INSERT INTO grupo_acciones (grupo_id, accion_id) VALUES ($grupo_id, $accion_id)";
    if ($conn->query($query)) {
        $response = array('status' => 1, 'status_message' =>'Action assigned to group successfully.');
    } else {
        $response = array('status' => 0, 'status_message' =>'Action assignment failed.');
    }
    echo json_encode($response);
}

?>