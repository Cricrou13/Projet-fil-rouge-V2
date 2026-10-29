<?php

declare(strict_types=1);

namespace App\Entity;

final class Prestation
{
    public function __construct(
        private int $idPrestation,
        private string $libelle,
        private string $description,
        private string $tarif,
        private int $dureeEstimee,
        // tinyint(1) NULL en base : null veut dire « statut inconnu », ce qui
        // n'est ni « en ligne » ni « masque ». Garde le trois valeurs.
        private ?bool $actif,
    ) {
    }

    public static function fromRow(array $row): self
    {
        $actif = $row['actif'] ?? null;

        return new self(
            idPrestation: (int) $row['id_prestation'],
            libelle: (string) $row['libelle'],
            description: (string) $row['description'],
            // decimal(15,2) : string, jamais float, pour ne pas introduire
            // d'erreur binaire sur un montant.
            tarif: (string) $row['tarif'],
            dureeEstimee: (int) $row['duree_estimee'],
            actif: $actif === null ? null : ((int) $actif) === 1,
        );
    }

    public function toArray(): array
    {
        return [
            'id_prestation' => $this->idPrestation,
            'libelle' => $this->libelle,
            'description' => $this->description,
            'tarif' => $this->tarif,
            'duree_estimee' => $this->dureeEstimee,
            'actif' => $this->actif,
        ];
    }
}
