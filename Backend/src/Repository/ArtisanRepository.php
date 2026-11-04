<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Artisan;
use App\Entity\Prestation;

class ArtisanRepository extends AbstractRepository
{

    private const TARIF_MIN = '(SELECT MIN(p.tarif) FROM prestations p'
        . ' WHERE p.id_artisan = a.id_artisan AND p.actif = 1)';

    private const SELECT_ARTISAN = 'SELECT a.*, ' . self::TARIF_MIN . ' AS tarif_min FROM artisans a';

    public function findAll(): array
    {
        $rows = $this->db->query(self::SELECT_ARTISAN)->fetchAll();

        return array_map(
            static fn (array $row): Artisan => Artisan::fromRow($row),
            $rows
        );
    }

    public function find(int $idArtisan): ?Artisan
    {
        return $this->hydrated(self::SELECT_ARTISAN . ' WHERE a.id_artisan = ?', $idArtisan, false);
    }

    public function findByIdUtilisateur(int $idUtilisateur): ?Artisan
    {
        return $this->hydrated(
            self::SELECT_ARTISAN . ' WHERE a.Id_utilisateur = ?',
            $idUtilisateur,
            true
        );
    }

    public function idArtisanParIdUtilisateur(int $idUtilisateur): ?int
    {
        $stmt = $this->db->prepare('SELECT id_artisan FROM artisans WHERE Id_utilisateur = ?');
        $stmt->execute([$idUtilisateur]);
        $id = $stmt->fetchColumn();

        return $id === false ? null : (int) $id;
    }

    public function creerFiche(
        int $idUtilisateur,
        string $nomEtablissement,
        string $metier,
        string $siret,
        string $description,
        string $adresseEtablissement,
        string $codePostal,
        string $ville,
    ): int {
        $stmt = $this->db->prepare(
            'INSERT INTO artisans (nom_etablissement, metier, siret, description,'
            . ' adresse_etablissement, code_postal, ville, Id_utilisateur)'
            . ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $nomEtablissement,
            $metier,
            $siret,
            $description,
            $adresseEtablissement,
            $codePostal,
            $ville,
            $idUtilisateur,
        ]);

        return (int) $this->db->lastInsertId();
    }

    private function hydrated(string $sql, int $id, bool $avecPrestationsMasquees): ?Artisan
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if ($row === false) {
            return null;
        }

        return Artisan::fromRow($row, $this->prestations((int) $row['id_artisan'], $avecPrestationsMasquees));
    }

    private function prestations(int $idArtisan, bool $avecPrestationsMasquees): array
    {
        $sql = 'SELECT id_prestation, libelle, description, tarif, duree_estimee, actif
                FROM prestations
                WHERE id_artisan = ?'
            . ($avecPrestationsMasquees ? '' : ' AND actif = 1')
            . ' ORDER BY tarif ASC, id_prestation ASC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$idArtisan]);

        return array_map(
            static fn (array $prestationRow): Prestation => Prestation::fromRow($prestationRow),
            $stmt->fetchAll()
        );
    }
}
