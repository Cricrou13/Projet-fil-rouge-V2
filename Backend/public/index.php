<?php

declare(strict_types=1);

use App\Config\Database;
use App\Config\Session;
use App\Controller\AgendaController;
use App\Controller\ArtisanController;
use App\Controller\AuthController;
use App\Repository\ArtisanRepository;
use App\Repository\DevisRepository;
use App\Repository\RendezVousRepository;
use App\Repository\UtilisateurRepository;

require __DIR__ . '/../vendor/autoload.php';

/**
 * Tout le cablage du serveur, en une table. `verbe` = seule methode acceptee ;
 * `session` = la route lit ou ecrit une session, donc PHP la demarre si le
 * navigateur apporte un cookie. `connexion` est a false parce que ce n'est
 * qu'en cas de succes que Session::attacher() en ouvre une.
 *
 * Les en-tetes Access-Control-* de l'ancienne version sont partis avec elle :
 * un `Allow-Origin: *` est par construction incompatible avec un cookie de
 * session, et le front n'en a plus besoin maintenant qu'il passe par le proxy
 * Vite (meme origine). Servir le front ailleurs qu'en same-origin exigerait une
 * liste blanche d'origines explicite, pas un joker.
 */
const ROUTES = [
    'artisans' => ['verbe' => 'GET', 'session' => false],
    'artisan' => ['verbe' => 'GET', 'session' => false],
    'pro' => ['verbe' => 'GET', 'session' => true],
    'pro-agenda' => ['verbe' => 'GET', 'session' => true],
    'moi' => ['verbe' => 'GET', 'session' => true],
    'connexion' => ['verbe' => 'POST', 'session' => false],
    'deconnexion' => ['verbe' => 'POST', 'session' => true],
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

// 404 avant 405 : une route qui n'existe pas n'a pas de verbe a annoncer. Dans la
// version precedente le garde de methode tournait avant le switch, donc
// POST ?route=inexistante repondait 405 et faisait exister la route.
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

// Une seule zone de garde : toute erreur non traitee (base injoignable, colonne
// absente, dependance circulaire) meurt ici, dans le log serveur, et le client
// ne recoit qu'un statut. getMessage() ne sort plus jamais.
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
                // '!' : pas d'heure heritee de l'horloge courante. createFromFormat
                // tolere les debordements ('2026-02-30' devient '2026-03-02'), donc
                // seul un aller-retour identique prouve que la saisie etait reelle.
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
