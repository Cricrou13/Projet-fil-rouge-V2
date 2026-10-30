<?php

declare(strict_types=1);

namespace App\Entity;

final class Utilisateur
{
    public function __construct(
        private int $idUtilisateur,
        private string $nom,
        private string $prenom,
        private string $email,
        private string $role,
        private ?string $metier,
        private string $motDePasseHash,
    ) {
    }

    public static function fromRow(array $row): self
    {
        return new self(
            idUtilisateur: (int) $row['Id_utilisateur'],
            nom: (string) $row['nom'],
            prenom: (string) $row['prenom'],
            email: (string) $row['email'],
            role: (string) $row['role'],
            // null pour un client : la colonne vient de la jointure avec artisans,
            // et le menu pro s'en sert pour sa couleur d'accent.
            metier: $row['metier'] === null ? null : (string) $row['metier'],
            motDePasseHash: (string) $row['mot_de_passe'],
        );
    }

    public function idUtilisateur(): int
    {
        return $this->idUtilisateur;
    }

    public function verifieMotDePasse(string $motDePasse): bool
    {
        return password_verify($motDePasse, $this->motDePasseHash);
    }

    /**
     * Ce que le client a le droit de savoir sur le compte connecte. Le hash ne
     * sort jamais de l'entite : le renvoyer, c'est donner matiere a une attaque
     * hors ligne sur les mots de passe.
     */
    public function toSession(): array
    {
        return [
            'id_utilisateur' => $this->idUtilisateur,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'email' => $this->email,
            'role' => $this->role,
            'metier' => $this->metier,
        ];
    }
}
