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
    case 'artisan':
        $idArtisan = filter_var($_GET['id'] ?? '', FILTER_VALIDATE_INT);
        if ($idArtisan === false || $idArtisan < 1) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(400);
            echo json_encode(['error' => 'Identifiant artisan invalide']);
            break;
        }
        try {
            $pdo = (new App\Config\Database())->connect();
            $controller = new App\Controller\ArtisanController(
                new App\Repository\ArtisanRepository($pdo)
            );
            $controller->profil($idArtisan);
        } catch (\Throwable $e) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(500);
            echo json_encode(['error' => 'Service temporairement indisponible']);
        }
        break;
    case 'pro':
        $idUtilisateur = filter_var($_GET['id_utilisateur'] ?? '', FILTER_VALIDATE_INT);
        if ($idUtilisateur === false || $idUtilisateur < 1) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(400);
            echo json_encode(['error' => 'Identifiant utilisateur invalide']);
            break;
        }
        try {
            $pdo = (new App\Config\Database())->connect();
            $controller = new App\Controller\ArtisanController(
                new App\Repository\ArtisanRepository($pdo)
            );
            $controller->espacePro($idUtilisateur);
        } catch (\Throwable $e) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(500);
            echo json_encode(['error' => 'Service temporairement indisponible']);
        }
        break;
    case 'pro-agenda':
        $idUtilisateur = filter_var($_GET['id_utilisateur'] ?? '', FILTER_VALIDATE_INT);
        if ($idUtilisateur === false || $idUtilisateur < 1) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(400);
            echo json_encode(['error' => 'Identifiant utilisateur invalide']);
            break;
        }
        $lundiBrut = trim((string) ($_GET['lundi'] ?? ''));
        $lundi = null;
        if ($lundiBrut !== '') {
            // '!' : pas d'heure heritee de l'horloge courante. createFromFormat
            // tolere les debordements ('2026-02-30' devient '2026-03-02'), donc
            // seul un aller-retour identique prouve que la saisie etait reelle.
            $lundiValide = DateTimeImmutable::createFromFormat('!Y-m-d', $lundiBrut);
            if ($lundiValide === false || $lundiValide->format('Y-m-d') !== $lundiBrut) {
                header('Content-Type: application/json; charset=UTF-8');
                http_response_code(400);
                echo json_encode(['error' => 'Date de semaine invalide, format attendu AAAA-MM-JJ']);
                break;
            }
            $lundi = $lundiBrut;
        }
        try {
            $pdo = (new App\Config\Database())->connect();
            $controller = new App\Controller\AgendaController(
                new App\Repository\ArtisanRepository($pdo),
                new App\Repository\RendezVousRepository($pdo),
                new App\Repository\DevisRepository($pdo)
            );
            $controller->semaine($idUtilisateur, $lundi);
        } catch (\Throwable $e) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(500);
            echo json_encode(['error' => 'Service temporairement indisponible']);
        }
        break;
    default:
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
        break;
}