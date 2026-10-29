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
            // varchar(10) : un (int) ferait perdre le zero initial d'un '07100'
            codePostal: (string) $row['code_postal'],
            ville: (string) $row['ville'],
            idUtilisateur: (int) $row['Id_utilisateur'],
            dateCreation: $row['date_creation'] === null
                ? null
                : new DateTimeImmutable((string) $row['date_creation']),
            // decimal(15,2) : PDO (EMULATE_PREPARES=false) renvoie un string
            // "25.00". Le caster en float pour de l'argent introduit une erreur
            // binaire ; on garde la representation exacte, le front formate.
            tarifMin: $tarifMin === null ? null : (string) $tarifMin,
            prestations: $prestations,
        );
    }

    public function toArray(): array
    {
        return [
            'id_artisan' => $this->idArtisan,
            'nom_etablissement' => $this->nomEtablissement,
            'metier' => $this->metier,
            'siret' => $this->siret,
            'description' => $this->description,
            'adresse_etablissement' => $this->adresseEtablissement,
            'code_postal' => $this->codePostal,
            'ville' => $this->ville,
            'Id_utilisateur' => $this->idUtilisateur,
            'date_creation' => $this->dateCreation?->format('Y-m-d H:i:s'),
            'tarif_min' => $this->tarifMin,
        ];
    }

    /**
     * Vue complete pour la fiche publique. Volontairement distincte de
     * toArray() : la liste publie encore siret, Id_utilisateur et date_creation
     * (contrat gele ce jour pour ne pas regresser les cartes), la fiche ne les
     * republie pas -- un Id_utilisateur dans le corps d'une page publique
     * annulerait le choix d'une URL en id_artisan.
     */
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
