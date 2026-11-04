<?php

declare(strict_types=1);

namespace App\Entity;

final class RendezVous
{
    public function __construct(
        private int $idRdv,
        private string $dateHeureDebut,
        private string $dateHeureFin,
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
