<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config\Session;
use App\Entity\Utilisateur;
use App\Repository\UtilisateurRepository;
use Throwable;

class AuthController extends AbstractController
{
    // Hash d'un mot de passe que personne ne connait, garde pour la comparaison
    // de timing : voir connexion().
    private const HASH_REBUT = '$2y$12$ryg/2LrkiJ8/inTXSWR/1.Ti5pNoeu4RRvrpcHOTHiZLIUAxYmKq6';

    public function __construct(private UtilisateurRepository $utilisateurRepository)
    {
    }

    public function connexion(): void
    {
        try {
            $corps = $this->corpsJson();
            $email = trim((string) ($corps['email'] ?? ''));
            $motDePasse = (string) ($corps['mot_de_passe'] ?? '');

            if ($email === '' || $motDePasse === '') {
                $this->jsonResponse(['error' => 'Email et mot de passe requis'], 400);
            }

            $lignes = $this->utilisateurRepository->parEmail($email);

            if (count($lignes) !== 1) {
                if (count($lignes) > 1) {
                    error_log(sprintf(
                        'connexion - %d comptes partagent cette adresse (Id_utilisateur %s)',
                        count($lignes),
                        implode(', ', array_map(
                            static fn (Utilisateur $u): string => (string) $u->idUtilisateur(),
                            $lignes
                        ))
                    ));
                }
                $this->attenteRebut();
                $this->rejet();
            }

            $utilisateur = $lignes[0];

            if (!$utilisateur->verifieMotDePasse($motDePasse)) {
                // Pas d'attenteRebut() ici : verifieMotDePasse() vient de payer le
                // cout d'un bcrypt. Ajouter le rebut rendrait l'adresse connue plus
                // lente que l'inconnue, soit exactement le signal qu'on supprime.
                $this->rejet();
            }

            Session::attacher($utilisateur->idUtilisateur());
            $this->jsonResponse(['utilisateur' => $utilisateur->toSession()]);
        } catch (Throwable $e) {
            error_log(__METHOD__ . ' - ' . $e->getMessage());
            $this->jsonResponse(['error' => 'Service temporairement indisponible'], 500);
        }
    }

    /** Le front sait qui est connecte sans jamais garder le hash : il redemande. */
    public function moi(): void
    {
        try {
            $idUtilisateur = $this->compteConnecte();
            $utilisateur = $this->utilisateurRepository->parId($idUtilisateur);

            if ($utilisateur === null) {
                // Session emise pour un compte qui n'existe plus : elle ne peut
                // pas continuer a ouvrir les routes de l'espace pro.
                Session::detruire();
                $this->jsonResponse(['error' => 'Connexion requise'], 401);
            }

            $this->jsonResponse(['utilisateur' => $utilisateur->toSession()]);
        } catch (Throwable $e) {
            error_log(__METHOD__ . ' - ' . $e->getMessage());
            $this->jsonResponse(['error' => 'Service temporairement indisponible'], 500);
        }
    }

    /**
     * Pas de garde de session : vider une session qui n'existe pas ne fait rien,
     * et la route doit rester idempotente pour que le bouton de deconnexion du
     * front reussisse meme apres un expirement du cookie.
     */
    public function deconnexion(): void
    {
        Session::detruire();
        $this->jsonResponse(['deconnecte' => true]);
    }

    /** @return array<string, mixed> */
    private function corpsJson(): array
    {
        $brut = file_get_contents('php://input');
        $corps = json_decode((string) $brut, true);

        if (!is_array($corps)) {
            $this->jsonResponse(['error' => 'Corps de requete JSON invalide'], 400);
        }

        return $corps;
    }

    /**
     * Reponse d'echec unique, identique que l'adresse soit inconnue ou le mot de
     * passe faux. Le corps ne doit rien dire de plus : c'est la seule chose qui
     * empeche la route de servir a enumerer les emails enregistres.
     */
    private function rejet(): void
    {
        $this->jsonResponse(['error' => 'Identifiants incorrects'], 401);
    }

    /**
     * Quand aucun compte ne repond a l'adresse, la reponse partirait sans avoir
     * coute le temps d'un `password_verify`. Ce hash de rebut, dont personne ne
     * connait l'entree, paie ce temps pour que les deux cas soient indiscernables.
     */
    private function attenteRebut(): void
    {
        password_verify('inftime-rebut', self::HASH_REBUT);
    }
}
