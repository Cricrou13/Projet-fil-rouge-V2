<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config\Session;

abstract class AbstractController
{
    protected function compteConnecte(): int
    {
        $idUtilisateur = Session::idUtilisateur();

        if ($idUtilisateur === null) {
            $this->jsonResponse(['error' => 'Connexion requise'], 401);
        }

        return $idUtilisateur;
    }

    protected function corpsJson(): array
    {
        $brut = file_get_contents('php://input');
        $corps = json_decode((string) $brut, true);

        if (!is_array($corps)) {
            $this->jsonResponse(['error' => 'Corps de requete JSON invalide'], 400);
        }

        return $corps;
    }

    protected function jsonResponse(mixed $data, int $statusCode = 200): void
    {
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code($statusCode);
        
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}