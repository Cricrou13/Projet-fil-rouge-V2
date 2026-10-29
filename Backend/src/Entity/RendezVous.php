<?php

declare(strict_types=1);

namespace App\Entity;

final class RendezVous
{
    public function __construct(
        private int $idRdv,
        // Datetime recu en string ('2026-10-26 09:00:00'), comme les DECIMAL : la
        // valeur est lue et affichee telle quelle, un cast en objet Date lui
        // appliquerait le fuseau de PHP (UTC sur ce poste) et la deplacerait.
        private string $dateHeureDebut,
        private string $dateHeureFin,
        // varchar(50) sans contrainte CHECK et zero ligne en base : le vocabulaire
        // des statuts n'est defini nulle part, donc on le transmet brut plutot que
        // de deviner une valeur par defaut.
        private string $statut,
        private string $remarque,
        private string $nomClient,
    ) {
    }

    public static function fromRow(array $row): self
    {
        return new self(
            idRdv: (int) $row['id_rdv'],
            dateHeureDebut: (string) $row['date_heure_debut'],
            dateHeureFin: (string) $row['date_heure_fin'],
            statut: (string) $row['statut'],
            remarque: (string) $row['remarque'],
            // Le nom vient de `utilisateurs` : la table `client` ne contient
            // qu'une adresse de facturation.
            nomClient: trim((string) $row['prenom'] . ' ' . (string) $row['nom']),
        );
    }

    public function jour(): string
    {
        return substr($this->dateHeureDebut, 0, 10);
    }

    public function toArray(): array
    {
        return [
            'id_rdv' => $this->idRdv,
            'date_heure_debut' => $this->dateHeureDebut,
            'date_heure_fin' => $this->dateHeureFin,
            'jour' => $this->jour(),
            'statut' => $this->statut,
            'remarque' => $this->remarque,
            'nom_client' => $this->nomClient,
        ];
    }
}
