<?php

declare(strict_types=1);

use App\Config\Database;
use App\Config\Session;
use App\Controller\AgendaController;
use App\Controller\ArtisanController;
use App\Controller\AuthController;
use App\Controller\ClientController;
use App\Controller\InscriptionController;
use App\Controller\PrestationController;
use App\Controller\RendezVousController;
use App\Repository\ArtisanRepository;
use App\Repository\ClientRepository;
use App\Repository\DevisRepository;
use App\Repository\PrestationRepository;
use App\Repository\RendezVousRepository;
use App\Repository\UtilisateurRepository;
use App\Service\InscriptionService;
use App\Service\PrestationService;
use App\Service\RendezVousService;

require __DIR__ . '/../vendor/autoload.php';

/**
 * Tout le cablage du serveur, en une table. `verbe` = seule methode acceptee ;
 * `session` = la route lit ou ecrit une session, donc PHP la demarre si le
 * navigateur apporte un cookie. `connexion` est a false parce que ce n'est
 * qu'en cas de succes que Session::attacher() en ouvre une. `inscription` est a
 * false pour la meme raison : creer un compte ne connecte personne, le visiteur
 * passe ensuite par `connexion` comme n'importe qui d'autre.
 */
const ROUTES = [
    'artisans' => ['verbe' => 'GET', 'session' => false],
    'artisan' => ['verbe' => 'GET', 'session' => false],
    'pro' => ['verbe' => 'GET', 'session' => true],
    'pro-agenda' => ['verbe' => 'GET', 'session' => true],
    'pro-clientele' => ['verbe' => 'GET', 'session' => true],
    'moi' => ['verbe' => 'GET', 'session' => true],
    'inscription' => ['verbe' => 'POST', 'session' => false],
    'connexion' => ['verbe' => 'POST', 'session' => false],
    'deconnexion' => ['verbe' => 'POST', 'session' => true],
    // Les trois ecritures du catalogue.
    'pro-prestation-creer' => ['verbe' => 'POST', 'session' => true],
    'pro-prestation-visibilite' => ['verbe' => 'PATCH', 'session' => true],
    'pro-prestation-supprimer' => ['verbe' => 'DELETE', 'session' => true],
    // Gestion des rendez-vous côté client et pro.
    'rdv-demander' => ['verbe' => 'POST', 'session' => true],
    'rdv-annuler' => ['verbe' => 'PATCH', 'session' => true],
    'pro-rdv-statut' => ['verbe' => 'PATCH', 'session' => true],
    'mes-rendez-vous' => ['verbe' => 'GET', 'session' => true],
];

/** Reponse emitted par le routeur lui-même, avant qu'un controller existe. */
function reponseJson(mixed $corps, int $statut): void
{
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code($statut);
    echo json_encode($corps, JSON_UNESCAPED_UNICODE);
    exit;
}

$route = $_GET['route'] ?? '';
$requete = ROUTES[$route] ?? null;

if ($requete === null) {
    reponseJson(['error' => 'Route non trouvée'], 404);
}

if ($_SERVER['REQUEST_METHOD'] !== $requete['verbe']) {
    header('Allow: ' . $requete['verbe']);
    reponseJson(['error' => 'Méthode non autorisée'], 405);
}

if ($requete['session']) {
    Session::demarrerSiCookie();
}

try {
    $pdo = (new Database())->connect();

    switch ($route) {
        case 'artisans':
            (new ArtisanController(new ArtisanRepository($pdo)))->topPros();
            break;

        case 'artisan':
            $idArtisan = filter_var($_GET['id'] ?? '', FILTER_VALIDATE_INT);
            if ($idArtisan === false || $idArtisan < 1) {
                reponseJson(['error' => 'Identifiant artisan invalide'], 400);
            }
            (new ArtisanController(new ArtisanRepository($pdo)))->profil($idArtisan);
            break;

        case 'pro':
            (new ArtisanController(new ArtisanRepository($pdo)))->espacePro();
            break;

        case 'pro-agenda':
            $lundiBrut = trim((string) ($_GET['lundi'] ?? ''));
            $lundi = null;
            if ($lundiBrut !== '') {
                $lundiValide = DateTimeImmutable::createFromFormat('!Y-m-d', $lundiBrut);
                if ($lundiValide === false || $lundiValide->format('Y-m-d') !== $lundiBrut) {
                    reponseJson(['error' => 'Date de semaine invalide, format attendu AAAA-MM-JJ'], 400);
                }
                $lundi = $lundiBrut;
            }
            (new AgendaController(
                new ArtisanRepository($pdo),
                new RendezVousRepository($pdo),
                new DevisRepository($pdo)
            ))->semaine($lundi);
            break;

        case 'pro-clientele':
            (new ClientController(
                new ArtisanRepository($pdo),
                new ClientRepository($pdo)
            ))->clientele();
            break;

        case 'inscription':
            (new InscriptionController(new InscriptionService(
                $pdo,
                new UtilisateurRepository($pdo),
                new ArtisanRepository($pdo),
                new ClientRepository($pdo)
            )))->creer();
            break;

        case 'pro-prestation-creer':
        case 'pro-prestation-visibilite':
        case 'pro-prestation-supprimer':
            $controller = new PrestationController(new PrestationService(
                new PrestationRepository($pdo),
                new ArtisanRepository($pdo)
            ));

            if ($route === 'pro-prestation-creer') {
                $controller->creer();
            } elseif ($route === 'pro-prestation-visibilite') {
                $controller->visibilite();
            } else {
                $controller->supprimer();
            }
            break;

        case 'rdv-demander':
        case 'mes-rendez-vous':
        case 'rdv-annuler':
        case 'pro-rdv-statut':
            $controller = new RendezVousController(
                new RendezVousService(
                    $pdo,
                    new RendezVousRepository($pdo),
                    new PrestationRepository($pdo),
                    new ArtisanRepository($pdo),
                    new ClientRepository($pdo)
                ),
                new ClientRepository($pdo),
                new RendezVousRepository($pdo)
            );

            if ($route === 'rdv-demander') {
                $controller->demander();
            } elseif ($route === 'mes-rendez-vous') {
                $controller->mesRendezVous();
            } elseif ($route === 'rdv-annuler') {
                $controller->annuler();
            } else {
                $controller->changerStatut();
            }
            break;

        case 'connexion':
        case 'moi':
        case 'deconnexion':
            $auth = new AuthController(new UtilisateurRepository($pdo));
            if ($route === 'connexion') {
                $auth->connexion();
            } elseif ($route === 'moi') {
                $auth->moi();
            } else {
                $auth->deconnexion();
            }
            break;
    }
} catch (Throwable $e) {
    error_log('route ' . $route . ' - ' . $e->getMessage());
    reponseJson(['error' => 'Service temporairement indisponible'], 500);
}
