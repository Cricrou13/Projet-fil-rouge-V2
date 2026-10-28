<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require __DIR__ . '/../vendor/autoload.php';
$route = $_GET['route'] ?? '';
switch ($route) {
    case 'artisans':
        try {
            $pdo = (new App\Config\Database())->connect();
            $controller = new App\Controller\ArtisanController(
                new App\Repository\ArtisanRepository($pdo)
            );
            $controller->topPros();
        } catch (\Throwable $e) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(500);
            echo json_encode([
                'error' => 'Erreur de connexion BDD : ' . $e->getMessage()
            ]);
        }
        break;
    default:
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
        break;
}