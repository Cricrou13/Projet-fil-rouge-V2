<?php

declare(strict_types=1);

namespace App\Entity;

/** Un rendez-vous tel que le client le lit : la fiche de l'artisan et les prix figés à la réservation. */
final class RendezVousClient
{
    /** @param array<int, array{id_prestation: int, libelle: string, prix_applique: string}> $prestations */
    public function __construct(
        private int $idRdv,
        private string $dateHeureDebut,
        private string $dateHeureFin,
        private int $dureeMin,
        private bool $estFutur,
        private string $statut,
        private int $idArtisan,
        private string $nomEtablissement,
        private string $metier,
        private string $adresseEtablissement,
        private string $codePostal,
        private string $ville,
        private ?string $telephone,
        private array $prestations,
        private ?string $montantTotal,
    ) {
    }

    /** @param array<int, array{id_prestation: int, libelle: string, prix_applique: string}> $prestations */
    public static function fromRow(array $row, array $prestations): self
    {
        return new self(
            idRdv: (int) $row['id_rdv'],
            dateHeureDebut: (string) $row['date_heure_debut'],
            dateHeureFin: (string) $row['date_heure_fin'],
            dureeMin: (int) $row['duree_min'],
            estFutur: (bool) $row['est_futur'],
            statut: (string) $row['statut'],
            idArtisan: (int) $row['id_artisan'],
            nomEtablissement: (string) $row['nom_etablissement'],
            metier: (string) $row['metier'],
            adresseEtablissement: (string) $row['adresse_etablissement'],
            codePostal: (string) $row['code_postal'],
            ville: (string) $row['ville'],
            telephone: $row['telephone'] === null ? null : (string) $row['telephone'],
            prestations: $prestations,
            montantTotal: $row['montant_total'] === null ? null : (string) $row['montant_total'],
        );
    }

    public function toArray(): array
    {
        return [
            'id_rdv' => $this->idRdv,
            'date_heure_debut' => $this->dateHeureDebut,
            'date_heure_fin' => $this->dateHeureFin,
            'duree_min' => $this->dureeMin,
            'est_futur' => $this->estFutur,
            'statut' => $this->statut,
            'id_artisan' => $this->idArtisan,
            'nom_etablissement' => $this->nomEtablissement,
            'metier' => $this->metier,
            'adresse_etablissement' => $this->adresseEtablissement,
            'code_postal' => $this->codePostal,
            'ville' => $this->ville,
            'telephone' => $this->telephone,
            'prestations' => $this->prestations,
            'montant_total' => $this->montantTotal,
        ];
    }
}
