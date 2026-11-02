<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\InscriptionException;
use App\Service\InscriptionService;

/**
 * Route d'inscription. Elle ne fait que traduire du HTTP en appel de service et
 * l'inverse : la regle metier est dans InscriptionService, sinon elle serait
 * reecrire pour chaque facon d'arriver sur le formulaire.
 */
class InscriptionController extends AbstractController
{
    public function __construct(private InscriptionService $inscriptionService)
    {
    }

    /**
     * Pas d'auto-connexion : la reponse decrit le compte cree, elle n'attache pas
     * de session. Le front renvoie vers /connexion, donc l'identite du visiteur
     * reste toujours etablie par le meme chemin que pour n'importe qui d'autre --
     * `Session::attacher()` n'est appele que par connexion().
     *
     * Le 409 est volontairement explicite. C'est la seule fuite d'enumeration
     * acceptee : un formulaire d'inscription qui ne dit pas « email deja pris »
     * oblige le visiteur a appeler la connexion pour comprendre, ce qui est pire.
     * Elle ne vaut que pour l'adresse, jamais pour le mot de passe.
     */
    public function creer(): void
    {
        try {
            $utilisateur = $this->inscriptionService->enregistrer($this->corpsJson());
        } catch (InscriptionException $e) {
            // Messages ecrits par nous : seuls ceux-la sortent vers le client.
            $this->jsonResponse(['error' => $e->getMessage()], $e->statut());
        }

        // Un echec inattendu (base, colonnes, verrou) remonte au try/catch du
        // routeur, qui log et repond 500 sans rien detailler.
        $this->jsonResponse(['utilisateur' => $utilisateur->toSession()], 201);
    }
}
