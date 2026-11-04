<?php

declare(strict_types=1);

namespace App\Entity;

use DateTimeImmutable;

final class Artisan
{
    public function __construct(
        private ?int $idArtisan,
        private string $nomEtablissement,
        private string $metier,
        private string $siret,
        private string $description,
        private string $adresseEtablissement,
        private string $codePostal,
        private string $ville,
        private int $idUtilisateur,
        private ?DateTimeImmutable $dateCreation,
        private ?string $tarifMin,
        /** @var Prestation[] */
        private array $prestations = [],
    ) {
    }

    /**
     * @param Prestation[] $prestations
     */
    public static function fromRow(array $row, array $prestations = []): self
    {
        $tarifMin = $row['tarif_min'] ?? null;

        return new self(
            idArtisan: $row['id_artisan'] === null ? null : (int) $row['id_artisan'],
            nomEtablissement: (string) $row['nom_etablissement'],
            metier: (string) $row['metier'],
            siret: (string) $row['siret'],
            description: (string) $row['description'],
            adresseEtablissement: (string) $row['adresse_etablissement'],
            codePostal: (string) $row['code_postal'],
            ville: (string) $row['ville'],
            idUtilisateur: (int) $row['Id_utilisateur'],
            dateCreation: $row['date_creation'] === null
                ? null
                : new DateTimeImmutable((string) $row['date_creation']),
            tarifMin: $tarifMin === null ? null : (string) $tarifMin,
            prestations: $prestations,
        );
    }

    public function toCarte(): array
    {
        return [
            'id_artisan' => $this->idArtisan,
            'nom_etablissement' => $this->nomEtablissement,
            'metier' => $this->metier,
            'ville' => $this->ville,
            'code_postal' => $this->codePostal,
            'tarif_min' => $this->tarifMin,
        ];
    }

    public function toDetail(): array
    {
        return [
            'id_artisan' => $this->idArtisan,
            'nom_etablissement' => $this->nomEtablissement,
            'metier' => $this->metier,
            'description' => $this->description,
            'adresse_etablissement' => $this->adresseEtablissement,
            'code_postal' => $this->codePostal,
            'ville' => $this->ville,
            'tarif_min' => $this->tarifMin,
            'prestations' => array_map(
                static fn (Prestation $prestation): array => $prestation->toArray(),
                $this->prestations
            ),
        ];
    }
}
