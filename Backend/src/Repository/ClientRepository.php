<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Client;

class ClientRepository extends AbstractRepository
{
    public function creer(int $idUtilisateur, string $adresseFacturation, string $codePostal, string $ville): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO client (adresse_facturation, code_postal, ville, Id_utilisateur)'
            . ' VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$adresseFacturation, $codePostal, $ville, $idUtilisateur]);

        return (int) $this->db->lastInsertId();
    }

    public function idClientParIdUtilisateur(int $idUtilisateur): ?int
    {
        $stmt = $this->db->prepare('SELECT id_client FROM client WHERE Id_utilisateur = ?');
        $stmt->execute([$idUtilisateur]);
        $id = $stmt->fetchColumn();

        return $id === false ? null : (int) $id;
    }

    public function clientelePourArtisan(int $idArtisan): array
    {
        $sql = 'SELECT c.id_client, u.prenom, u.nom, c.ville, c.code_postal,
                       COUNT(DISTINCT r.id_rdv) AS rendez_vous,
                       COUNT(DISTINCT d.id_devis) AS devis,
                       COALESCE(
                           GREATEST(DATE(MAX(r.date_heure_debut)), MAX(d.date_demande)),
                           DATE(MAX(r.date_heure_debut)),
                           MAX(d.date_demande)
                       ) AS dernier_contact
                FROM client c
                JOIN utilisateurs u ON u.Id_utilisateur = c.Id_utilisateur
                LEFT JOIN rendez_vous r ON r.id_client = c.id_client AND r.id_artisan = ?
                LEFT JOIN devis d ON d.id_client = c.id_client AND d.id_artisan = ?
                WHERE r.id_rdv IS NOT NULL OR d.id_devis IS NOT NULL
                GROUP BY c.id_client, u.prenom, u.nom, c.ville, c.code_postal
                ORDER BY dernier_contact DESC, u.nom ASC, u.prenom ASC, c.id_client ASC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$idArtisan, $idArtisan]);

        return array_map(
            static fn (array $row): Client => Client::fromRow($row),
            $stmt->fetchAll()
        );
    }
}
