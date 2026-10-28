<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Artisan;

class ArtisanRepository extends AbstractRepository
{
    /**
     * @return Artisan[]
     */
    public function findAll(): array
    {
        $sql = 'SELECT a.*, (
                    SELECT MIN(p.tarif)
                    FROM prestations p
                    WHERE p.id_artisan = a.id_artisan
                      AND p.actif = 1
                ) AS tarif_min
                FROM artisans a';

        $rows = $this->db->query($sql)->fetchAll();

        return array_map(
            static fn (array $row): Artisan => Artisan::fromRow($row),
            $rows
        );
    }
}
