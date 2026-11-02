<?php

declare(strict_types=1);

namespace App\Exception;

use RuntimeException;

/**
 * Erreur d'inscription dont le texte est ecrit pour etre montre au client : seul
 * cas ou une phrase du serveur sort de la reponse. Le constructeur est prive et
 * les deux usines ci-dessous sont les seules portes d'entree, donc aucun message
 * technique (SQL, PDO, chemin) ne peut voyager jusqu'a l'interface par cette
 * classe. Les echecs inattendus passent par le routeur et ne donnent qu'un statut.
 */
final class InscriptionException extends RuntimeException
{
    private function __construct(string $message, private int $statut)
    {
        parent::__construct($message);
    }

    public static function champInvalide(string $message): self
    {
        return new self($message, 400);
    }

    public static function emailDejaPris(): self
    {
        return new self('Cet email est déjà utilisé.', 409);
    }

    public function statut(): int
    {
        return $this->statut;
    }
}
