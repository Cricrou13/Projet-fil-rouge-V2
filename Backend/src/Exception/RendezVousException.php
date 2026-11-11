<?php

declare(strict_types=1);

namespace App\Exception;

use DateTimeImmutable;

final class RendezVousException extends EcritureException
{
    public static function sansEspaceClient(): self
    {
        return new self('Aucun espace client derrière ce compte.', 404);
    }

    public static function artisanIntrouvable(int $idArtisan): self
    {
        return new self('Artisan ' . $idArtisan . ' introuvable.', 404);
    }

    /** @param string $liste libellés deja resolves, pour que l'artisan reconnaisse sa propre prestation */
    public static function prestationNonReservable(string $liste): self
    {
        return new self('Prestation non réservable chez cet artisan : ' . $liste . '.', 400);
    }

    /** L'horloge comparee est celle de MySQL, pas celle de PHP : les deux different d'une heure sur ce poste. */
    public static function datePassee(): self
    {
        return new self('Ce créneau est déjà passé.', 400);
    }

    public static function chevauchement(string $debut, string $fin): self
    {
        return new self(
            'L\'artisan a déjà un rendez-vous ' . self::horairesLisibles($debut, $fin)
                . '. Ta demande n\'a pas été enregistrée.',
            409
        );
    }

    private static function horairesLisibles(string $debut, string $fin): string
    {
        $debutDate = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $debut);
        $finDate = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $fin);

        if ($debutDate->format('Y-m-d') === $finDate->format('Y-m-d')) {
            return 'le ' . $debutDate->format('d/m/Y') . ' de ' . $debutDate->format('H:i')
                . ' à ' . $finDate->format('H:i');
        }

        return 'du ' . $debutDate->format('d/m/Y') . ' à ' . $debutDate->format('H:i')
            . ' au ' . $finDate->format('d/m/Y') . ' à ' . $finDate->format('H:i');
    }
}
