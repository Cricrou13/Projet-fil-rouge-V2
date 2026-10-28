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
        $rows = $this->db->query('SELECT * FROM artisans')->fetchAll();

        return array_map(
            static fn (array $row): Artisan => Artisan::fromRow($row),
            $rows
        );
    }
}
