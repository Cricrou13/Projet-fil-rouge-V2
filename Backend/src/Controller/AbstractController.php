<?php

declare(strict_types=1);

namespace App\Controller;

abstract class AbstractController
{
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