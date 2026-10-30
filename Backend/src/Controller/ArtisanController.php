<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Artisan;
use App\Repository\ArtisanRepository;
use Throwable;

class ArtisanController extends AbstractController
{
    public function __construct(private ArtisanRepository $artisanRepository)
    {
    }

    public function topPros(): void
    {
        try {
            $payload = array_map(
                static fn (Artisan $artisan): array => $artisan->toCarte(),
                $this->artisanRepository->findAll()
            );
            $status = 200;
        } catch (Throwable $e) {
            $this->logError(__METHOD__, $e);
            $payload = ['error' => 'Service temporairement indisponible'];
            $status = 500;
        }

        $this->jsonResponse($payload, $status);
    }

    /** Fiche publique, adressée par id_artisan (la clé des cartes du front). */
    public function profil(int $idArtisan): void
    {
        $this->sendDetail(fn (): ?Artisan => $this->artisanRepository->find($idArtisan), __METHOD__);
    }

    /** Espace pro : l'identifiant vient de la session, jamais de la requete. */
    public function espacePro(): void
    {
        $this->sendDetail(
            fn (): ?Artisan => $this->artisanRepository->findByIdUtilisateur($this->compteConnecte()),
            __METHOD__
        );
    }

    /** @param string $methode nom de l'appelant, pour que le log nomme la route en echec */
    private function sendDetail(callable $lecture, string $methode): void
    {
        try {
            $artisan = $lecture();

            if ($artisan === null) {
                $payload = ['error' => 'Artisan non trouvé'];
                $status = 404;
            } else {
                $payload = $artisan->toDetail();
                $status = 200;
            }
        } catch (Throwable $e) {
            $this->logError($methode, $e);
            $payload = ['error' => 'Service temporairement indisponible'];
            $status = 500;
        }

        $this->jsonResponse($payload, $status);
    }

    private function logError(string $methode, Throwable $e): void
    {
        error_log($methode . ' - ' . $e->getMessage());
    }
}
