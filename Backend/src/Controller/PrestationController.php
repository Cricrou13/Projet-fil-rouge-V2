<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\PrestationException;
use App\Service\PrestationService;

final class PrestationController extends AbstractController
{
    public function __construct(private PrestationService $prestationService)
    {
    }

    public function creer(): void
    {
        $idUtilisateur = $this->compteConnecte();

        try {
            $idPrestation = $this->prestationService->creer($idUtilisateur, $this->corpsJson());
        } catch (PrestationException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], $e->statut());
        }

        $this->jsonResponse(['id_prestation' => $idPrestation], 201);
    }

    public function visibilite(): void
    {
        $this->ecrire(fn (int $idUtilisateur, array $corps) =>
            $this->prestationService->visibilite($idUtilisateur, $corps)
        );
    }

    public function supprimer(): void
    {
        $this->ecrire(fn (int $idUtilisateur, array $corps) =>
            $this->prestationService->supprimer($idUtilisateur, $corps)
        );
    }

    private function ecrire(callable $ecriture): void
    {
        $idUtilisateur = $this->compteConnecte();
        $corps = $this->corpsJson();

        try {
            $ecriture($idUtilisateur, $corps);
        } catch (PrestationException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], $e->statut());
        }

        $this->jsonResponse(['ok' => true]);
    }
}
