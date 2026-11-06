<?php

declare(strict_types=1);

namespace App\Config;

final class Session
{
    private const NOM = 'inftime_session';

    public static function demarrer(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        // Sans ce mode, un identifiant envoye par le client est cree sechement
        // par PHP : l'attaquant positionne une session vide, la fait remplir par
        // la victime, puis la rejoue.
        ini_set('session.use_strict_mode', '1');
        session_name(self::NOM);
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            // Le vhost local n'a pas de certificat : secure = true rendrait le
            // cookie inerte et toute connexion impossible. Repasser a true le
            // jour ou le site est servi en HTTPS.
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        session_start();
    }

    /**
     * Demarre seulement si le navigateur apporte un identifiant. Sans cookie il
     * n'y a rien a lire, et demarrer quand meme ecrirait un fichier de session
     * vide cote serveur pour chaque sonde anonyme.
     */
    public static function demarrerSiCookie(): void
    {
        if (!empty($_COOKIE[self::NOM])) {
            self::demarrer();
        }
    }

    public static function idUtilisateur(): ?int
    {
        $id = $_SESSION['id_utilisateur'] ?? null;

        return $id === null ? null : (int) $id;
    }

    public static function attacher(int $idUtilisateur): void
    {
        // Demarre ici et pas dans le routeur : une connexion qui echoue ne doit
        // pas laisser de session vide, donc pas de fichier sur le disque ni de
        // cookie dans le navigateur pour un compte non connecte.
        self::demarrer();
        // Nouvel identifiant au moment ou la session devient sensible : celle qui
        // existait avant la connexion ne peut pas resservir une fois connectee.
        session_regenerate_id(true);
        $_SESSION['id_utilisateur'] = $idUtilisateur;
    }

    public static function detruire(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            // Le navigateur n'a pas apporte de cookie : il n'y a rien a detruire,
            // et la route doit quand meme repondre succes (elle est idempotente).
            return;
        }

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $parametres = session_get_cookie_params();
            setcookie(self::NOM, '', [
                'expires' => time() - 42000,
                'path' => $parametres['path'],
                'domain' => $parametres['domain'],
                'secure' => $parametres['secure'],
                'httponly' => $parametres['httponly'],
                'samesite' => $parametres['samesite'],
            ]);
        }

        session_destroy();
    }
}
