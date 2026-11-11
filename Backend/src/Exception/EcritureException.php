<?php

declare(strict_types=1);

namespace App\Exception;

use RuntimeException;

abstract class EcritureException extends RuntimeException
{
    protected function __construct(string $message, private int $statut)
    {
        parent::__construct($message);
    }

    public static function champInvalide(string $message): static
    {
        return new static($message, 400);
    }

    public function statut(): int
    {
        return $this->statut;
    }
}
