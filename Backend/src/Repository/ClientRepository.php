<?php

declare(strict_types=1);

namespace App\Repository;

/**
 * Table fille des comptes clients. Pas d'entite ni de methode de lecture ici :
 * aucune route ne montre un client pour l'instant, et `devis.id_client` comme
 * `rendez_vous.id_client` pointent sur cette table sans qu'un ecran les lise.
 * L'ajouter quand /reservation aura besoin d'un client serait du code sans
 * appelant.
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
}
