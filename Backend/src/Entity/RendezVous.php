<?php

declare(strict_types=1);

namespace App\Entity;

final class RendezVous
{
    /**
     * @param array<int, array{id_prestation: int, libelle: string, prix_applique: string}> $prestations
     */
    public function __construct(
        private int $idRdv,
        private string $dateHeureDebut,
        private string $dateHeureFin,
        private string $statut,
        private string $remarque,
        private string $nomClient,
        private ?string $telephone = null,
        private array $prestations = [],
    ) {
    }

    /**
     * @param array<string, mixed> $row
     * @param array<int, array{id_prestation: int, libelle: string, prix_applique: string}> $prestations
     */
    public static function fromRow(array $row, array $prestations = []): self
    {
        return new self(
            idRdv: (int) $row['id_rdv'],
            dateHeureDebut: (string) $row['date_heure_debut'],
            dateHeureFin: (string) $row['date_heure_fin'],
            statut: (string) $row['statut'],
            remarque: (string) ($row['remarque'] ?? ''),
            // Le nom vient de `utilisateurs` : la table `client` ne contient
            // qu'une adresse de facturation.
            nomClient: trim((string) ($row['prenom'] ?? '') . ' ' . (string) ($row['nom'] ?? '')),
            telephone: isset($row['telephone']) && $row['telephone'] !== '' ? (string) $row['telephone'] : null,
            prestations: $prestations,
        );
    }

    public function jour(): string
    {
        return substr($this->dateHeureDebut, 0, 10);
    }

    public function toArray(): array
    {
        $montantTotal = 0;
        foreach ($this->prestations as $prestation) {
            $montantTotal += (float) ($prestation['prix_applique'] ?? 0);
        }

        return [
            'id_rdv' => $this->idRdv,
            'date_heure_debut' => $this->dateHeureDebut,
            'date_heure_fin' => $this->dateHeureFin,
            'jour' => $this->jour(),
            'statut' => $this->statut,
            'remarque' => $this->remarque,
            'nom_client' => $this->nomClient,
            'telephone' => $this->telephone,
            'prestations' => $this->prestations,
            'montant_total' => $montantTotal > 0 ? (string) $montantTotal : null,
        ];
    }
}
