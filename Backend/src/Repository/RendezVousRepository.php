<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\RendezVous;

class RendezVousRepository extends AbstractRepository
{
    /**
     * Fenetre ISO (lundi 00:00 inclusive -> lundi suivant 00:00 exclusive) qui
     * contient `lundi`, ou la semaine courante quand `lundi` est null.
     *
     * Le calcul est fait par MySQL et non par PHP : les colonnes datetime de la
     * base sont horodatees a l'heure de Paris alors que PHP tourne en UTC sur ce
     * poste. Deux horloges differentes deplaceraient la limite de semaine d'une
     * heure, donc un rendez-vous de debut de semaine d'un jour entier.
     * WEEKDAY() vaut 0 le lundi : soustraire ce nombre de jours ramene au lundi.
     *
     * @return array{debut: string, fin: string, aujourdhui: string}
     */
    public function fenetreSemaine(?string $lundi): array
    {
        $sql = 'SELECT DATE_SUB(s.ref, INTERVAL WEEKDAY(s.ref) DAY) AS debut,
                       DATE_ADD(DATE_SUB(s.ref, INTERVAL WEEKDAY(s.ref) DAY), INTERVAL 7 DAY) AS fin,
                       CURDATE() AS aujourdhui
                FROM (SELECT COALESCE(?, CURDATE()) AS ref) s';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$lundi]);

        /** @var array{debut: string, fin: string, aujourdhui: string} $fenetre */
        $fenetre = $stmt->fetch();

        return $fenetre;
    }

    /**
     * Rendez-vous de l'artisan pour une fenetre donnee.
     *
     * Deux jointures sont obligatoires pour nommer le client : `rendez_vous` ne
     * stocke qu'un `id_client`, et `client` ne contient que l'adresse de
     * facturation. Ni le telephone ni l'email du client ne sont selects : la
     * route V2 n'a aucune authentification, ces donnees-la ne peuvent donc pas
     * etre publiees tant que c'est le cas.
     *
     * @return RendezVous[]
     */
    public function semainePourArtisan(int $idArtisan, string $debut, string $fin): array
    {
        $sql = 'SELECT r.id_rdv, r.date_heure_debut, r.date_heure_fin, r.statut, r.remarque,
                       u.prenom, u.nom
                FROM rendez_vous r
                JOIN client c ON c.id_client = r.id_client
                JOIN utilisateurs u ON u.Id_utilisateur = c.Id_utilisateur
                WHERE r.id_artisan = ?
                  AND r.date_heure_debut >= ?
                  AND r.date_heure_debut < ?
                ORDER BY r.date_heure_debut ASC, r.id_rdv ASC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$idArtisan, $debut, $fin]);

        return array_map(
            static fn (array $row): RendezVous => RendezVous::fromRow($row),
            $stmt->fetchAll()
        );
    }
}
