<?php

namespace App\Repository;
 
use PDO;
 
abstract class AbstractRepository
{
    public function __construct(protected PDO $db)
    {
        
    }
}