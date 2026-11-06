<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Prestation;
use App\Exception\PrestationException;
use App\Repository\ArtisanRepository;
use App\Repository\PrestationRepository;

/**
 * Regles d'ecriture du catalogue artisan. Toute la validation tombe avant la
 * premiere requete d'ecriture : une saisie fausse ne doit jamais laisser une ligne
 * a moitie creee, et ce n'est pas MySQL qui doit nous apprendre qu'un tarif vaut
 * -12 ou qu'une duree fait 300 heures.
 *
 * Pas de transaction, donc pas de PDO ici : chaque route ecrit une seule ligne.
 * L'inscription en ouvrait une parce qu'elle en ecrivait trois.
 *
 * L'identite n'entre jamais par le corps de la requete : `idUtilisateur` vient du
 * controleur, lui-meme lu dans la session. Un `id_artisan` passe dans le JSON
 * ouvrirait purement et simplement le catalogue du voisin.
 */
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

    /**
     * La fiche artisan existe-t-elle derriere ce compte ? Un client connecte qui
     * appellerait la route n'en a pas : c'est un 404, pas un 500, et certes pas une
     * insertion sur une cle etrangere inexistante.
     */
    private function idArtisan(int $idUtilisateur): int
    {
        $idArtisan = $this->artisans->idArtisanParIdUtilisateur($idUtilisateur);

        if ($idArtisan === null) {
            throw PrestationException::sansFicheArtisan();
        }

        return $idArtisan;
    }

    /**
     * @return Prestation la ligne sert a la fois de garde d'existence et de garde de
     * propriete : le repository filtre sur id_artisan, donc la prestation d'un
     * concurrent renvoie null et tombe sur le meme 404 qu'un identifiant inexistant.
     */
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

    /**
     * Le tarif arrive en texte et repart en texte : `decimal(15,2)` est une echelle
     * fixe, un float JSON ne la represente pas (0.1 n'existe pas en binaire) et un
     * nombre arondi par le serveur serait un prix facture a tort.
     */
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
