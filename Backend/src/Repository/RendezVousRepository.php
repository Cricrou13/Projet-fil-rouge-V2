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

    /**
     * Heure de fin calculee par MySQL. C'est la meme raison que pour la fenetre de
     * semaine : les colonnes datetime sont horodatees a l'heure de Paris alors que
     * PHP tourne en UTC sur ce poste, et une addition faite par PHP traverserait
     * un fuseau qui n'est pas le bon au moment du changement d'heure.
     *
     * DATE_FORMAT n'est pas du gout : sans lui, `DATE_ADD('2027-03-04 09:00', ...)`
     * herite d'une echelle de six decimales et rend « 09:30:00.000000 », alors que
     * la colonne et l'agenda disent « 09:30:00 ». Le meme instant ne doit pas
     * s'ecrire de deux facons differentes dans la meme API.
     */
    public function finCalculee(string $debut, int $minutes): string
    {
        $stmt = $this->db->prepare(
            "SELECT DATE_FORMAT(DATE_ADD(?, INTERVAL ? MINUTE), '%Y-%m-%d %H:%i:%s')"
        );
        $stmt->execute([$debut, $minutes]);
        $fin = $stmt->fetchColumn();

        return $fin === false ? '' : (string) $fin;
    }

    /** Compare a NOW(), donc a l'horloge qui sert a ecrire la ligne. */
    public function creneauPasse(string $debut): bool
    {
        $stmt = $this->db->prepare('SELECT ? < NOW()');
        $stmt->execute([$debut]);

        return ((int) $stmt->fetchColumn()) === 1;
    }

    /**
     * Le premier rendez-vous qui chevauche le creneau demande. La comparaison est
     * celle des intervalles ouverts : deux rendez-vous qui se suivent (fin 11:00,
     * debut 11:00) ne se chevauchent pas.
     *
     * `statut <> 'refuse'` : un refus libere le creneau. Les trois valeurs today
     * en base (confirme, en_attente, termine) sont toutes comptees comme prenantes,
     * y compris « termine » -- effacer un creneau passe n'est pas le role de cette
     * requete.
     *
     * @return array{debut: string, fin: string}|null
     */
    public function premierConflit(int $idArtisan, string $debut, string $fin): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT date_heure_debut AS debut, date_heure_fin AS fin
             FROM rendez_vous
             WHERE id_artisan = ? AND statut <> 'refuse'
               AND date_heure_debut < ? AND date_heure_fin > ?
             ORDER BY date_heure_debut ASC
             LIMIT 1"
        );
        $stmt->execute([$idArtisan, $fin, $debut]);
        $row = $stmt->fetch();

        return $row === false ? null : ['debut' => (string) $row['debut'], 'fin' => (string) $row['fin']];
    }

    /**
     * La demande ne cree qu'une ligne ; les prestations sont liees dans une seconde
     * ecriture, et c'est l'assembleur qui tient les deux dans une transaction.
     * `remarque` est NOT NULL sans defaut : le service fournit '', jamais null.
     */
    public function creer(
        int $idArtisan,
        int $idClient,
        string $debut,
        string $fin,
        string $statut,
        string $remarque,
    ): int {
        $stmt = $this->db->prepare(
            'INSERT INTO rendez_vous (date_heure_debut, date_heure_fin, statut, remarque, id_artisan, id_client)'
            . ' VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$debut, $fin, $statut, $remarque, $idArtisan, $idClient]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * `prix_applique` est le tarif tel qu'il est dans `prestations` a l'instant de
     * la demande : une chaine decimal, pas le resultat d'une addition en PHP. Le
     * rendez-vous garde ainsi le prix auquel il a ete demande, meme si l'artisan
     * remonte son tarif le lendemain.
     */
    public function lierPrestation(int $idRdv, int $idPrestation, string $prixApplique): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO concerner (id_prestation, id_rdv, prix_applique) VALUES (?, ?, ?)'
        );
        $stmt->execute([$idPrestation, $idRdv, $prixApplique]);
    }
}
