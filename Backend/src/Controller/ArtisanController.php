<?php
namespace App\Controller;

use App\Repository\ArtisanRepository;

class ArtisanController {
    private $artisanRepository;

    public function __construct(ArtisanRepository $artisanRepository) {
        $this->artisanRepository = $artisanRepository;
    }

    public function topPros() {
        try {
            // On utilise la méthode findAll() de votre ArtisanRepository
            $artisans = $this->artisanRepository->findAll(); 
            
            // En-tête pour indiquer que l'on renvoie du JSON
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code(200);
            
            echo json_encode($artisans);
            exit;
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur serveur : ' . $e->getMessage()]);
            exit;
        }
    }
}