<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config\Session;

abstract class AbstractController
{
    /**
     * Identite du compte connecte, lue dans la session uniquement. Un
     * `id_utilisateur` passe dans l'URL n'est jamais lu : il permettrait a
     * n'importe qui d'ouvrir le tableau de bord d'un autre etablissement en
     * changeant un nombre dans la barre d'adresse.
     */
    protected function compteConnecte(): int
    {
        $idUtilisateur = Session::idUtilisateur();

        if ($idUtilisateur === null) {
            $this->jsonResponse(['error' => 'Connexion requise'], 401);
        }

        return $idUtilisateur;
    }

    /**
     * Envoie des données au format JSON avec les bons en-têtes HTTP
     */
    protected function jsonResponse(mixed $data, int $statusCode = 200): void
    {
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code($statusCode);
        
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}