<?php

declare(strict_types=1);

namespace App\Exception;

final class PrestationException extends EcritureException
{
    /** @param int $idPrestation nomme dans le message, jamais la propriete reelle */
    public static function introuvable(int $idPrestation): self
    {
        return new self('Prestation ' . $idPrestation . ' introuvable pour cette fiche artisan.', 404);
    }

    public static function sansFicheArtisan(): self
    {
        return new self('Aucune fiche artisan derrière ce compte.', 404);
    }

    /** Supprimer couterait sur la cle etrangere de `concerner`. */
    public static function retenuParRendezVous(string $libelle): self
    {
        return new self(
            '« ' . $libelle . ' » est rattachée à des rendez-vous : masque-la au lieu de la supprimer.',
            409
        );
    }
}
