<?php
// 1. En-têtes CORS et JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Connexion directe à la base de données (pour éliminer tout souci de require)
$host = 'localhost';
$dbname = 'infintime';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Erreur de connexion BDD : " . $e->getMessage()
    ]);
    exit();
}

// 3. Récupération et validation de l'ID
$id = $_GET['id'] ?? null;

if (!$id || $id === 'undefined') {
    echo json_encode([
        "success" => false, 
        "message" => "ID d'artisan invalide ou manquant."
    ]);
    exit();
}

try {
    // 4. Récupération des informations combinées de l'artisan et de son compte utilisateur
    $stmt = $pdo->prepare("
        SELECT 
            a.id_artisan,
            a.id_artisan AS id,
            a.nom_etablissement,
            a.nom_etablissement AS nom_entreprise,
            a.metier,
            a.metier AS specialite,
            a.siret,
            a.description,
            a.adresse_etablissement,
            a.code_postal,
            a.ville,
            a.date_creation,
            u.Id_utilisateur,
            u.nom,
            u.prenom,
            u.email,
            u.telephone
        FROM Artisans a
        INNER JOIN Utilisateurs u ON a.Id_utilisateur = u.Id_utilisateur
        WHERE a.id_artisan = :id OR u.Id_utilisateur = :id
    ");
    $stmt->execute(['id' => $id]);
    $artisan = $stmt->fetch();

    if (!$artisan) {
        echo json_encode([
            "success" => false, 
            "message" => "Aucun artisan trouvé avec l'ID " . $id
        ]);
        exit();
    }

    // 5. Récupération des prestations associées à cet artisan
    $stmtPresta = $pdo->prepare("
        SELECT 
            id_prestation,
            id_prestation AS id,
            libelle,
            libelle AS nom,
            description,
            tarif,
            tarif AS prix,
            duree_estimee,
            duree_estimee AS duree,
            actif,
            id_artisan
        FROM Prestations 
        WHERE id_artisan = :id_artisan
    ");
    $stmtPresta->execute(['id_artisan' => $artisan['id_artisan']]);
    $artisan['prestations'] = $stmtPresta->fetchAll();

    // 6. Réponse JSON finale
    echo json_encode([
        "success" => true, 
        "artisan" => $artisan
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Erreur SQL : " . $e->getMessage()
    ]);
}
?>