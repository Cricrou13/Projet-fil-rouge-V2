<?php

declare(strict_types=1);

namespace App\Repository;

use App\Config\Database;
use PDO;

class ArtisanRepository
{
    private PDO $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->connect();
    }

    /* Récupérer tous les artisans depuis Laragon */
    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM artisans");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}