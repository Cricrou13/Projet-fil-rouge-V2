<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Utilisateur;

class UtilisateurRepository extends AbstractRepository
{
    // pas de `SELECT *` : la liste des colonnes est ce qui prouve qu'aucun champ
    // de compte non demande ne remonte jusqu'a l'hydratation.
    // `a.metier` est joint ici parce que la connexion doit le donner : sans lui le
    // front rappelle route=pro juste pour la couleur de son menu pro.
    private const SELECT = 'SELECT u.Id_utilisateur, u.nom, u.prenom, u.email, u.role, u.mot_de_passe,'
        . ' a.metier FROM utilisateurs u'
        . ' LEFT JOIN artisans a ON a.Id_utilisateur = u.Id_utilisateur';

    /**
     * Une liste, pas une ligne. `email` n'a aucune contrainte UNIQUE dans la
     * table, et sa collation est insensible a la casse : deux comptes peuvent
     * repondre a la meme adresse. L'appelant doit refuser de choisir a la place
     * du client, sinon la connexion devient une loterie entre deux identites.
     *
     * @return Utilisateur[]
     */
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
}
