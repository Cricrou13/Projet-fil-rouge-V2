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

    /**
     * Le controle d'unicite, parce que la colonne n'a pas d'index UNIQUE (mesure :
     * SHOW INDEX ne renvoie que PRIMARY). Deux consequences, et les deux comptent :
     *
     * 1. `FOR UPDATE` ne sert a rien hors transaction, donc cet appel ne peut etre
     *    fait que depuis InscriptionService, qui possede la transaction.
     * 2. Sans index sur `email`, MySQL balaye la table et pose un verrou sur chaque
     *    ligne lue : deux inscriptions simultanees sur la meme adresse ne peuvent
     *    plus toutes les deux franchir le controle. A quatre lignes le cout est nul.
     *
     * La comparaison est insensible a la casse (collation utf8mb4_0900_ai_ci), donc
     * `Marc@x.com` et `marc@x.com` se heurtent ici sans qu'on normalise la saisie.
     */
    public function emailExiste(string $email): bool
    {
        $stmt = $this->db->prepare('SELECT 1 FROM utilisateurs WHERE email = ? FOR UPDATE');
        $stmt->execute([$email]);

        return $stmt->fetchColumn() !== false;
    }

    /**
     * Le hash est recu deja calcule : la politique de mot de passe regarde le
     * service, pas la couche qui parle a MySQL.
     *
     * `NOW()` et non `date('Y-m-d H:i:s')` : la colonne est NOT NULL sans defaut,
     * et PHP tourne en UTC pendant que MySQL est a l'heure de Paris (1 h d'ecart
     * mesuree en hiver, 2 h en ete). Laisser la base horodater met date_creation
     * dans le meme referentiel qu'`artisans.date_creation`, deja CURRENT_TIMESTAMP.
     */
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
