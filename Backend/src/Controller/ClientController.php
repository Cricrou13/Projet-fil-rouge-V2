<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Client;
use App\Repository\ArtisanRepository;
use App\Repository\ClientRepository;
use Throwable;

class ClientController extends AbstractController
{
    public function __construct(
        private ArtisanRepository $artisanRepository,
        private ClientRepository $clientRepository,
    ) {
    }

    public function clientele(): void
    {
        try {
            $idUtilisateur = $this->compteConnecte();
            $idArtisan = $this->artisanRepository->idArtisanParIdUtilisateur($idUtilisateur);

            if ($idArtisan === null) {
                $payload = ['error' => 'Aucune fiche artisan pour ce compte'];
                $status = 404;
            } else {
                $clientele = $this->clientRepository->clientelePourArtisan($idArtisan);

                $payload = [
                    'id_artisan' => $idArtisan,
                    'clientele' => array_map(
                        static fn (Client $client): array => $client->toArray(),
                        $clientele
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
}
