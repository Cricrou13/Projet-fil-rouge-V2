<?php

require __DIR__ . '/../vendor/autoload.php';
 
$pdo = (new App\Config\Database())->connect();
$repo = new App\Repository\ArtisanRepository($pdo);