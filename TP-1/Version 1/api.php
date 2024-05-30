<?php
require_once 'funciones.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['accion'])) {
        $accion = $data['accion'];

        switch ($accion) {
            case 'crear_usuario':
                crearUsuario($data['nombre'], $data['grupo_id']);
                echo json_encode(['status' => 'success']);
                break;
            case 'editar_usuario':
                editarUsuario($data['id'], $data['nombre'], $data['grupo_id']);
                echo json_encode(['status' => 'success']);
                break;
            case 'eliminar_usuario':
                eliminarUsuario($data['id']);
                echo json_encode(['status' => 'success']);
                break;
            case 'crear_grupo':
                crearGrupo($data['nombre']);
                echo json_encode(['status' => 'success']);
                break;
            case 'editar_grupo':
                editarGrupo($data['id'], $data['nombre']);
                echo json_encode(['status' => 'success']);
                break;
            case 'eliminar_grupo':
                eliminarGrupo($data['id']);
                echo json_encode(['status' => 'success']);
                break;
            case 'crear_accion':
                crearAccion($data['nombre']);
                echo json_encode(['status' => 'success']);
                break;
            case 'editar_accion':
                editarAccion($data['id'], $data['nombre']);
                echo json_encode(['status' => 'success']);
                break;
            case 'eliminar_accion':
                eliminarAccion($data['id']);
                echo json_encode(['status' => 'success']);
                break;
            case 'asignar_grupo_usuario':
                asignarGrupoAUsuario($data['id_usuario'], $data['grupo_id']);
                echo json_encode(['status' => 'success']);
                break;
            case 'asociar_accion_grupo':
                asociarAccionAGrupo($data['accion_id'], $data['grupo_id']);
                echo json_encode(['status' => 'success']);
                break;
            case 'obtener_usuarios':
                $usuarios = obtenerUsuarios();
                echo json_encode($usuarios);
                break;
            case 'obtener_grupos':
                $grupos = obtenerGrupos();
                echo json_encode($grupos);
                break;
            case 'obtener_acciones':
                $acciones = obtenerAcciones();
                echo json_encode($acciones);
                break;
            case 'obtener_acciones_por_grupo':
                if (isset($data['grupo_id'])) {
                    $acciones = obtenerAccionesPorGrupo($data['grupo_id']);
                    echo json_encode($acciones);
                } else {
                    echo json_encode(['error' => 'Se requiere el ID del grupo']);
                }
                break;
            default:
                echo json_encode(['error' => 'Acción no válida']);
                break;
        }
    } else {
        echo json_encode(['error' => 'Acción no especificada']);
    }
} else {
    echo json_encode(['error' => 'Método no permitido']);
}
