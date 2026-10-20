<?php
 
declare(strict_types=1);
 
namespace App\Config;

use Dotenv\Dotenv;

require_once __DIR__ . '/../../vendor/autoload.php';

// fichier .env situé dans le dossier Backend
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();
 
use PDO;
use RuntimeException;
 
class Database
{
    private ?PDO $pdo = null;
 
    public function connect(): PDO
    {
        if ($this->pdo !== null) {
            return $this->pdo;
        }
 
        foreach (['DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_NAME', 'DATABASE_USERNAME'] as $cle) {
            if (empty($_ENV[$cle])) {
                throw new RuntimeException("Clé manquante dans le .env : {$cle}");
            }
        }
 
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            $_ENV['DATABASE_HOST'],
            $_ENV['DATABASE_PORT'],
            $_ENV['DATABASE_NAME']
        );
 
        $this->pdo = new PDO($dsn, $_ENV['DATABASE_USERNAME'], $_ENV['DATABASE_PASSWORD'] ?? '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
 
        return $this->pdo;
    }
}