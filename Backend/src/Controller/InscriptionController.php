<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\InscriptionException;
use App\Service\InscriptionService;

/**
 * Route d'inscription.
 */
class InscriptionController extends AbstractController
{
    public function __construct(private InscriptionService $inscriptionService)
    {
    }

    public function creer(): void
    {
        try {
            $utilisateur = $this->inscriptionService->enregistrer($this->corpsJson());
        } catch (InscriptionException $e) {
            // Messages ecrits par nous : seuls ceux-la sortent vers le client.
            $this->jsonResponse(['error' => $e->getMessage()], $e->statut());
        }

        $this->jsonResponse(['utilisateur' => $utilisateur->toSession()], 201);
    }
}
