<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Devis;
use App\Entity\RendezVous;
use App\Repository\ArtisanRepository;
use App\Repository\DevisRepository;
use App\Repository\RendezVousRepository;
use Throwable;

class AgendaController extends AbstractController
{
    public function __construct(
        private ArtisanRepository $artisanRepository,
        private RendezVousRepository $rendezVousRepository,
        private DevisRepository $devisRepository,
    ) {
    }

    /**
     * Planning d'une semaine de l'artisan connecté.
     */
    public function semaine(?string $lundi): void
    {
        try {
            $idUtilisateur = $this->compteConnecte();
            $idArtisan = $this->artisanRepository->idArtisanParIdUtilisateur($idUtilisateur);

            if ($idArtisan === null) {
                $payload = ['error' => 'Aucune fiche artisan pour ce compte'];
                $status = 404;
            } else {
                $fenetre = $this->rendezVousRepository->fenetreSemaine($lundi);
                $rendezVous = $this->rendezVousRepository->semainePourArtisan(
                    $idArtisan,
                    $fenetre['debut'],
                    $fenetre['fin']
                );

                $payload = [
                    'id_artisan' => $idArtisan,
                    'semaine' => ['debut' => $fenetre['debut'], 'fin' => $fenetre['fin']],
                    'aujourdhui' => $fenetre['aujourdhui'],
                    'rendez_vous' => array_map(
                        static fn (RendezVous $rdv): array => $rdv->toArray(),
                        $rendezVous
                    ),
                    'devis' => array_map(
                        static fn (Devis $devis): array => $devis->toArray(),
                        $this->devisRepository->pourArtisan($idArtisan)
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
