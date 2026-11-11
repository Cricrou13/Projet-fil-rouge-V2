<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config\Session;
use App\Entity\Utilisateur;
use App\Repository\UtilisateurRepository;
use Throwable;

class AuthController extends AbstractController
{
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
    
                $this->rejet();
            }

            Session::attacher($utilisateur->idUtilisateur());
            $this->jsonResponse(['utilisateur' => $utilisateur->toSession()]);
        } catch (Throwable $e) {
            error_log(__METHOD__ . ' - ' . $e->getMessage());
            $this->jsonResponse(['error' => 'Service temporairement indisponible'], 500);
        }
    }

    /** Le front sait qui est connecté sans jamais garder le hash : il redemande. */
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

    public function deconnexion(): void
    {
        Session::detruire();
        $this->jsonResponse(['deconnecte' => true]);
    }

    private function rejet(): void
    {
        $this->jsonResponse(['error' => 'Identifiants incorrects'], 401);
    }

    private function attenteRebut(): void
    {
        password_verify('inftime-rebut', self::HASH_REBUT);
    }
}
