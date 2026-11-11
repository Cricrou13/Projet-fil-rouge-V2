<?php

declare(strict_types=1);

namespace App\Exception;

use RuntimeException;

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
