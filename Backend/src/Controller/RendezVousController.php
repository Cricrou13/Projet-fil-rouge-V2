<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\RendezVousException;
use App\Service\RendezVousService;

/**
 * Entree unique du tunnel de reservation. Comme l'inscription, rien n'est
 * auto-connecte et le corps de la requete n'est pas une identite : le client qui
 * reserve est celui de la session, et le 201 ne vaut que si la transaction a fini.
 */
final class RendezVousController extends AbstractController
{
    public function __construct(private RendezVousService $rendezVousService)
    {
    }

    public function demander(): void
    {
        $idUtilisateur = $this->compteConnecte();

        try {
            $rendezVous = $this->rendezVousService->demander($idUtilisateur, $this->corpsJson());
        } catch (RendezVousException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], $e->statut());
        }

        $this->jsonResponse(['rendez_vous' => $rendezVous], 201);
    }
}
