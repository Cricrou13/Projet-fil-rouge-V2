<?php

declare(strict_types=1);

namespace App\Exception;

/**
 * Erreurs de la demande de rendez-vous. Le client envoie un `id_artisan` : c'est
 * la premiere route ou un identifiant de la requete est legitime, parce qu'il ne
 * designe pas QUI appelle (toujours la session) mais OU l'on va.
 */
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
            'L\'artisan a déjà un rendez-vous entre ' . $debut . ' et ' . $fin . '.',
            409
        );
    }
}
