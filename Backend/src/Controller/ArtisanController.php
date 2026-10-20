<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\ArtisanRepository;
use App\Controller\AbstractController;

class ArtisanController extends AbstractController
{
    public function index(): void
    {
        $artisanRepository = new ArtisanRepository();
        $artisans = $artisanRepository->findAll();

        // On renvoie les données en JSON pour que React puisse les lire
        $this->jsonResponse($artisans);
    }
}