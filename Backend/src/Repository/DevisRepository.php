<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Devis;

class DevisRepository extends AbstractRepository
{
    /**
     * Toutes les demandes de devis recues par l'artisan, sans filtre sur `statut` :
     * la colonne est un varchar libre et la base est vide, donc aucun vocabulaire
     * « en attente / accepte / decline » n'existe encore. Filtrer sur une valeur
     * inventee masquerait des devis plutot que les trier.
     *
     * @return Devis[]
     */
    public function pourArtisan(int $idArtisan): array
    {
        $sql = 'SELECT d.id_devis, d.date_demande, d.description_demande, d.montant_propose, d.statut,
                       u.prenom, u.nom
                FROM devis d
                JOIN client c ON c.id_client = d.id_client
                JOIN utilisateurs u ON u.Id_utilisateur = c.Id_utilisateur
                WHERE d.id_artisan = ?
                ORDER BY d.date_demande DESC, d.id_devis DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$idArtisan]);

        return array_map(
            static fn (array $row): Devis => Devis::fromRow($row),
            $stmt->fetchAll()
        );
    }
}
