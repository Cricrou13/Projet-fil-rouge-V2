<?php
 
declare(strict_types=1);
 
namespace App\Config;
use Dotenv\Dotenv;
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
        // Chargement du .env situé dans BackEnd
        if (file_exists(__DIR__ . '/../../.env')) {
            $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
            $dotenv->safeLoad();
        }
        // Récupère depuis $_ENV, $_SERVER ou getenv()
        $host = $_ENV['DATABASE_HOST'] ?? $_SERVER['DATABASE_HOST'] ?? '127.0.0.1';
        $port = $_ENV['DATABASE_PORT'] ?? $_SERVER['DATABASE_PORT'] ?? '3306';
        $dbname = $_ENV['DATABASE_NAME'] ?? $_SERVER['DATABASE_NAME'] ?? 'infintime';
        $user = $_ENV['DATABASE_USERNAME'] ?? $_SERVER['DATABASE_USERNAME'] ?? 'root';
        $password = $_ENV['DATABASE_PASSWORD'] ?? $_SERVER['DATABASE_PASSWORD'] ?? '';
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbname);
        $this->pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $this->pdo;
    }
}