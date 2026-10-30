<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Artisan;
use App\Entity\Prestation;

class ArtisanRepository extends AbstractRepository
{
    // Une seule definition de « prestation comptant pour un tarif ». Si la
    // regle actif = 1 divergeait entre la liste et la fiche, le « Dès … € »
    // d'une carte ne correspondrait plus au detail de la meme prestation.
    private const TARIF_MIN = '(SELECT MIN(p.tarif) FROM prestations p'
        . ' WHERE p.id_artisan = a.id_artisan AND p.actif = 1)';

    private const SELECT_ARTISAN = 'SELECT a.*, ' . self::TARIF_MIN . ' AS tarif_min FROM artisans a';

    /**
     * @return Artisan[]
     */
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

    /**
     * Fiche vue par l'artisan lui-même : la jointure se fait sur la clé du
     * compte, et cette clé sort de la session serveur. Les prestations masquées
     * sont incluses, sinon l'artisan ne verrait plus celles qu'il a lui-même
     * retirées de la vente.
     */
    public function findByIdUtilisateur(int $idUtilisateur): ?Artisan
    {
        return $this->hydrated(
            self::SELECT_ARTISAN . ' WHERE a.Id_utilisateur = ?',
            $idUtilisateur,
            true
        );
    }

    /**
     * Simple clé de correspondance, sans hydratation : les routes de l'espace pro
     * ont besoin du `id_artisan` pour filtrer, mais pas des champs ni des
     * prestations de l'artisan.
     */
    public function idArtisanParIdUtilisateur(int $idUtilisateur): ?int
    {
        $stmt = $this->db->prepare('SELECT id_artisan FROM artisans WHERE Id_utilisateur = ?');
        $stmt->execute([$idUtilisateur]);
        $id = $stmt->fetchColumn();

        return $id === false ? null : (int) $id;
    }

    /** @param string $sql fragment construit en interne, jamais depuis l'entrée HTTP */
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

    /**
     * @return Prestation[]
     */
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
