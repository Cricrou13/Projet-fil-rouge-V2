<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Utilisateur;

class UtilisateurRepository extends AbstractRepository
{
    private const SELECT = 'SELECT u.Id_utilisateur, u.nom, u.prenom, u.email, u.role, u.mot_de_passe,'
        . ' a.metier FROM utilisateurs u'
        . ' LEFT JOIN artisans a ON a.Id_utilisateur = u.Id_utilisateur';

    public function parEmail(string $email): array
    {
        $stmt = $this->db->prepare(self::SELECT . ' WHERE u.email = ?');
        $stmt->execute([$email]);

        return array_map(
            static fn (array $row): Utilisateur => Utilisateur::fromRow($row),
            $stmt->fetchAll()
        );
    }

    public function parId(int $idUtilisateur): ?Utilisateur
    {
        $stmt = $this->db->prepare(self::SELECT . ' WHERE u.Id_utilisateur = ?');
        $stmt->execute([$idUtilisateur]);
        $row = $stmt->fetch();

        return $row === false ? null : Utilisateur::fromRow($row);
    }

    public function emailExiste(string $email): bool
    {
        $stmt = $this->db->prepare('SELECT 1 FROM utilisateurs WHERE email = ? FOR UPDATE');
        $stmt->execute([$email]);

        return $stmt->fetchColumn() !== false;
    }

    public function enregistrer(
        string $nom,
        string $prenom,
        string $email,
        string $motDePasseHash,
        ?string $telephone,
        string $role,
    ): int {
        $stmt = $this->db->prepare(
            'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, date_creation, role)'
            . ' VALUES (?, ?, ?, ?, ?, NOW(), ?)'
        );
        $stmt->execute([$nom, $prenom, $email, $motDePasseHash, $telephone, $role]);

        return (int) $this->db->lastInsertId();
    }
}
