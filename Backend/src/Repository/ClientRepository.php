<?php

declare(strict_types=1);

namespace App\Repository;

/**
 * Table fille des comptes clients. Pas d'entite ici : aucune route ne montre un
 * client. `rendez_vous.id_client` pointe sur cette table, et la reservation en a
 * maintenant un appelant -- mais seulement pour savoir QUELLE ligne est celle du
 * compte connecte.
 */
class ClientRepository extends AbstractRepository
{
    /**
     * Les trois champs texte sont NOT NULL sans defaut : la base refuserait un
     * NULL, donc l'appelant envoie '' quand le formulaire laisse le champ vide.
     */
    public function creer(int $idUtilisateur, string $adresseFacturation, string $codePostal, string $ville): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO client (adresse_facturation, code_postal, ville, Id_utilisateur)'
            . ' VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$adresseFacturation, $codePostal, $ville, $idUtilisateur]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Meme cle de correspondance que `artisans.Id_utilisateur`, meme origine : la
     * session. Un `id_client` passe dans le corps de la reservation serait un
     * rendez-vous pose au nom d'un autre.
     */
    public function idClientParIdUtilisateur(int $idUtilisateur): ?int
    {
        $stmt = $this->db->prepare('SELECT id_client FROM client WHERE Id_utilisateur = ?');
        $stmt->execute([$idUtilisateur]);
        $id = $stmt->fetchColumn();

        return $id === false ? null : (int) $id;
    }
}
