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
                static fn (Artisan $artisan): array => $artisan->toArray(),
                $this->artisanRepository->findAll()
            );
            $status = 200;
        } catch (Throwable $e) {
            error_log('ArtisanController::topPros - ' . $e->getMessage());
            $payload = ['error' => 'Service temporairement indisponible'];
            $status = 500;
        }

        $this->jsonResponse($payload, $status);
    }
}
