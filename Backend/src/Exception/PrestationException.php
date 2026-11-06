<?php

declare(strict_types=1);

namespace App\Exception;

/**
 * Erreurs d'ecriture du catalogue artisan. `champInvalide` (400) vient du gabarit.
 *
 * Les deux 404 sont volontairement confondus : « introuvable » couvre aussi bien
 * une prestation qui n'existe pas qu'une prestation d'un autre etablissement, parce
 * que le repository filtre sur id_artisan. Distinguer les deux permettrait a un
 * visiteur de deviner quels identifiants existent en base.
 */
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
