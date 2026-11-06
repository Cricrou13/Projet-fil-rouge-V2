<?php

declare(strict_types=1);

namespace App\Exception;

use RuntimeException;

/**
 * Gabarit commun aux erreurs d'ecriture dont le texte est destine a etre montre.
 * Le constructeur est `protected` : une classe fille peut construire sa propre
 * erreur, le code global non. Aucun message technique (SQL, PDO, chemin) ne peut
 * donc entrer dans une reponse par cette hierarchie -- les echecs inattendus
 * continuent de remonter au routeur, qui ne rend qu'un statut.
 *
 * `champInvalide` est la seule usine commune : le 400 de saisie n'appartient a
 * aucun metier. Les autres usines restent dans chaque exception fille, parce que
 * « cet email est déjà utilisé » et « rattachée à des rendez-vous » ne doivent pas
 * se ressembler.
 */
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
