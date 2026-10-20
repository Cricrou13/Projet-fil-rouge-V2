<?php

// Connexion à la base de données via votre classe Database
require __DIR__ . '/../vendor/autoload.php';

// Récupération de la route demandée dans l'URL (par défaut, une chaîne vide)
$route = $_GET['route'] ?? '';

// Routage simple pour l'API
switch ($route) {
    case 'artisans':
        // On instancie le repository et le contrôleur pour les artisans
        $repo = new App\Repository\ArtisanRepository;
        $controller = new App\Controller\ArtisanController;
        $controller->index();
        break;

        // Pour ajouter d'autres routes ici plus tard (ex: catégories, réservations...)
    // case 'categories':
    //     ...
    //     break;

        default:
        // Si aucune route ne correspond, on renvoie une erreur 404 en JSON
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
        break;
}