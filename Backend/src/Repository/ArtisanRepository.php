<?php
 
declare(strict_types=1);
 
namespace App\Repository;
 
class ArtisanRepository extends AbstractRepository
{
    /* Récupère tous les artisans. La connexion $db vient d'AbstractRepository. */
    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM artisans");
 
        return $stmt->fetchAll();
    }
}