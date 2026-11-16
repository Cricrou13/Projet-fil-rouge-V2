<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\RendezVousClient;
use App\Exception\RendezVousException;
use App\Repository\ClientRepository;
use App\Repository\RendezVousRepository;
use App\Service\RendezVousService;
use Throwable;

/**
 * Entree unique du tunnel de reservation. Comme l'inscription, rien n'est
 * auto-connecte et le corps de la requete n'est pas une identite : le client qui
 * reserve est celui de la session, et le 201 ne vaut que si la transaction a fini.
 */
final class RendezVousController extends AbstractController
{
    public function __construct(
        private RendezVousService $rendezVousService,
        private ClientRepository $clients,
        private RendezVousRepository $rendezVous,
    ) {
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

    public function mesRendezVous(): void
    {
        try {
            $idClient = $this->clients->idClientParIdUtilisateur($this->compteConnecte());

            if ($idClient === null) {
                $payload = ['error' => 'Aucun espace client derrière ce compte'];
                $status = 404;
            } else {
                $payload = [
                    'id_client' => $idClient,
                    'rendez_vous' => array_map(
                        static fn (RendezVousClient $rdv): array => $rdv->toArray(),
                        $this->rendezVous->listePourClient($idClient)
                    ),
                ];
                $status = 200;
            }
        } catch (Throwable $e) {
            error_log(__METHOD__ . ' - ' . $e->getMessage());
            $payload = ['error' => 'Service temporairement indisponible'];
            $status = 500;
        }

        $this->jsonResponse($payload, $status);
    }

    public function annuler(): void
    {
        $idUtilisateur = $this->compteConnecte();
        $corps = $this->corpsJson();
        $idRdv = filter_var($corps['id_rdv'] ?? null, FILTER_VALIDATE_INT);

        if ($idRdv === false || $idRdv < 1) {
            $this->jsonResponse(['error' => 'Identifiant rendez-vous invalide'], 400);
        }

        try {
            $this->rendezVousService->annulerParClient($idUtilisateur, $idRdv);
        } catch (RendezVousException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], $e->statut());
        }

        $this->jsonResponse(['ok' => true]);
    }

    public function changerStatut(): void
    {
        $idUtilisateur = $this->compteConnecte();
        $corps = $this->corpsJson();
        $idRdv = filter_var($corps['id_rdv'] ?? null, FILTER_VALIDATE_INT);
        $statut = trim((string) ($corps['statut'] ?? ''));

        if ($idRdv === false || $idRdv < 1 || $statut === '') {
            $this->jsonResponse(['error' => 'Paramètres invalides'], 400);
        }

        try {
            $this->rendezVousService->changerStatutParArtisan($idUtilisateur, $idRdv, $statut);
        } catch (RendezVousException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], $e->statut());
        }

        $this->jsonResponse(['ok' => true]);
    }
}
