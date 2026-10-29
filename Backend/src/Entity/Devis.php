<?php

declare(strict_types=1);

namespace App\Entity;

final class Devis
{
    public function __construct(
        private int $idDevis,
        // DATE simple ('2026-10-28'), sans heure : date_demande ne stocke pas d'heure.
        private string $dateDemande,
        private string $descriptionDemande,
        // decimal(15,2) : string, jamais float, pour ne pas introduire d'erreur
        // binaire sur un montant.
        private string $montantPropose,
        private string $statut,
        private string $nomClient,
    ) {
    }

    public static function fromRow(array $row): self
    {
        return new self(
            idDevis: (int) $row['id_devis'],
            dateDemande: (string) $row['date_demande'],
            descriptionDemande: (string) $row['description_demande'],
            montantPropose: (string) $row['montant_propose'],
            statut: (string) $row['statut'],
            nomClient: trim((string) $row['prenom'] . ' ' . (string) $row['nom']),
        );
    }

    public function toArray(): array
    {
        return [
            'id_devis' => $this->idDevis,
            'date_demande' => $this->dateDemande,
            'description_demande' => $this->descriptionDemande,
            'montant_propose' => $this->montantPropose,
            'statut' => $this->statut,
            'nom_client' => $this->nomClient,
        ];
    }
}
