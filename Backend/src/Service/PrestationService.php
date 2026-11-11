<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Prestation;
use App\Exception\PrestationException;
use App\Repository\ArtisanRepository;
use App\Repository\PrestationRepository;

final class PrestationService
{
    private const LIBELLE_MAX = 100;
    private const DESCRIPTION_MAX = 255;
    private const DUREE_MIN = 5;
    private const DUREE_MAX = 1440;
    // decimal(15,2) : 13 chiffres avant la virgule, 2 apres, jamais de signe.
    private const TARIF = '/^\d{1,13}([.,]\d{1,2})?$/';

    public function __construct(
        private PrestationRepository $prestations,
        private ArtisanRepository $artisans,
    ) {
    }

    /** @param array<string, mixed> $corps @return int id_prestation creee */
    public function creer(int $idUtilisateur, array $corps): int
    {
        $idArtisan = $this->idArtisan($idUtilisateur);
        $libelle = $this->libelle($corps['libelle'] ?? null);
        $description = $this->description($corps['description'] ?? null);
        $tarif = $this->tarif($corps['tarif'] ?? null);
        $duree = $this->duree($corps['duree_estimee'] ?? null);

        return $this->prestations->creer($idArtisan, $libelle, $description, $tarif, $duree);
    }

    /** @param array<string, mixed> $corps */
    public function visibilite(int $idUtilisateur, array $corps): void
    {
        $idArtisan = $this->idArtisan($idUtilisateur);
        $idPrestation = $this->idPrestation($corps['id_prestation'] ?? null);
        $actif = $corps['actif'] ?? null;

        if (!is_bool($actif)) {
            throw PrestationException::champInvalide('Le champ actif doit être vrai ou faux.');
        }

        $this->verifierPropriete($idPrestation, $idArtisan);
        $this->prestations->changerVisibilite($idPrestation, $idArtisan, $actif);
    }

    /** @param array<string, mixed> $corps */
    public function supprimer(int $idUtilisateur, array $corps): void
    {
        $idArtisan = $this->idArtisan($idUtilisateur);
        $idPrestation = $this->idPrestation($corps['id_prestation'] ?? null);
        $prestation = $this->verifierPropriete($idPrestation, $idArtisan);

        if ($this->prestations->nombreDeRendezVousLie($idPrestation) > 0) {
            throw PrestationException::retenuParRendezVous($prestation->libelle());
        }

        $this->prestations->supprimer($idPrestation, $idArtisan);
    }

    private function idArtisan(int $idUtilisateur): int
    {
        $idArtisan = $this->artisans->idArtisanParIdUtilisateur($idUtilisateur);

        if ($idArtisan === null) {
            throw PrestationException::sansFicheArtisan();
        }

        return $idArtisan;
    }

    private function verifierPropriete(int $idPrestation, int $idArtisan): Prestation
    {
        $prestation = $this->prestations->trouver($idPrestation, $idArtisan);

        if ($prestation === null) {
            throw PrestationException::introuvable($idPrestation);
        }

        return $prestation;
    }

    private function idPrestation(mixed $valeur): int
    {
        $id = filter_var($valeur, FILTER_VALIDATE_INT);

        if ($id === false || $id < 1) {
            throw PrestationException::champInvalide('Identifiant de prestation invalide.');
        }

        return $id;
    }

    private function libelle(mixed $valeur): string
    {
        if (!is_string($valeur)) {
            throw PrestationException::champInvalide('Le libellé est obligatoire.');
        }

        $libelle = trim($valeur);

        if ($libelle === '') {
            throw PrestationException::champInvalide('Le libellé est obligatoire.');
        }

        if (mb_strlen($libelle) > self::LIBELLE_MAX) {
            throw PrestationException::champInvalide('Le libellé dépasse ' . self::LIBELLE_MAX . ' caractères.');
        }

        return $libelle;
    }

    private function description(mixed $valeur): string
    {
        if ($valeur === null) {
            return '';
        }

        if (!is_string($valeur)) {
            throw PrestationException::champInvalide('La description doit être du texte.');
        }

        $description = trim($valeur);

        if (mb_strlen($description) > self::DESCRIPTION_MAX) {
            throw PrestationException::champInvalide('La description dépasse ' . self::DESCRIPTION_MAX . ' caractères.');
        }

        return $description;
    }

    private function tarif(mixed $valeur): string
    {
        if (!is_string($valeur)) {
            throw PrestationException::champInvalide(
                'Le tarif doit être envoyé en texte, pas en nombre : un montant à virgule flottante perd des décimales.'
            );
        }

        $tarif = trim($valeur);

        if ($tarif === '' || !preg_match(self::TARIF, $tarif)) {
            throw PrestationException::champInvalide('Le tarif doit être un montant positif, au plus deux décimales.');
        }

        return str_replace(',', '.', $tarif);
    }

    /** Minutes entieres : la colonne est un `int`, et la carte client affiche « 45 min ». */
    private function duree(mixed $valeur): int
    {
        $duree = filter_var($valeur, FILTER_VALIDATE_INT);

        if ($duree === false || $duree < self::DUREE_MIN || $duree > self::DUREE_MAX) {
            throw PrestationException::champInvalide(
                'La durée doit être un nombre de minutes entre ' . self::DUREE_MIN . ' et ' . self::DUREE_MAX . '.'
            );
        }

        return $duree;
    }
}
