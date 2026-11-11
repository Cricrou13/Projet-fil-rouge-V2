<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\RendezVous;
use App\Entity\RendezVousClient;

class RendezVousRepository extends AbstractRepository
{
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

    public function listePourClient(int $idClient): array
    {
        $sql = 'SELECT r.id_rdv, r.date_heure_debut, r.date_heure_fin, r.statut,
                       TIMESTAMPDIFF(MINUTE, r.date_heure_debut, r.date_heure_fin) AS duree_min,
                       (r.date_heure_debut > NOW()) AS est_futur,
                       a.id_artisan, a.nom_etablissement, a.metier,
                       a.adresse_etablissement, a.code_postal, a.ville, u.telephone,
                       (SELECT SUM(ce.prix_applique) FROM concerner ce WHERE ce.id_rdv = r.id_rdv) AS montant_total
                FROM rendez_vous r
                JOIN artisans a ON a.id_artisan = r.id_artisan
                JOIN utilisateurs u ON u.Id_utilisateur = a.Id_utilisateur
                WHERE r.id_client = ?
                ORDER BY r.date_heure_debut DESC, r.id_rdv DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$idClient]);
        $lignes = $stmt->fetchAll();

        $prestations = $this->prestationsParRendezVous(array_column($lignes, 'id_rdv'));

        return array_map(
            static fn (array $row): RendezVousClient => RendezVousClient::fromRow(
                $row,
                $prestations[(int) $row['id_rdv']] ?? []
            ),
            $lignes
        );
    }

    /**
     * @param list<int> $idRendezVous
     * @return array<int, list<array{id_prestation: int, libelle: string, prix_applique: string}>>
     */
    private function prestationsParRendezVous(array $idRendezVous): array
    {
        if ($idRendezVous === []) {
            return [];
        }

        $sql = 'SELECT ce.id_rdv, p.id_prestation, p.libelle, ce.prix_applique
                FROM concerner ce
                JOIN prestations p ON p.id_prestation = ce.id_prestation
                WHERE ce.id_rdv IN (' . implode(', ', array_fill(0, count($idRendezVous), '?')) . ')
                ORDER BY ce.id_rdv, p.id_prestation';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($idRendezVous);

        $parRendezVous = [];

        foreach ($stmt->fetchAll() as $ligne) {
            $parRendezVous[(int) $ligne['id_rdv']][] = [
                'id_prestation' => (int) $ligne['id_prestation'],
                'libelle' => (string) $ligne['libelle'],
                'prix_applique' => (string) $ligne['prix_applique'],
            ];
        }

        return $parRendezVous;
    }

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

    public function lierPrestation(int $idRdv, int $idPrestation, string $prixApplique): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO concerner (id_prestation, id_rdv, prix_applique) VALUES (?, ?, ?)'
        );
        $stmt->execute([$idPrestation, $idRdv, $prixApplique]);
    }
}
