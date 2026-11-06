<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Prestation;

/**
 * Ecritures du catalogue. Chaque requete porte la double cle
 * (id_prestation, id_artisan) : la seconde vient de la session serveur, donc une
 * ligne d'un autre etablissement ne peut etre ni modifiee ni supprimee, meme avec
 * un id_prestation devine dans l'URL.
 *
 * Aucune transaction ici : chaque methode ecrit une seule ligne, et MySQL valide
 * l'integrite de la cle etrangere vers `artisans` a chaque INSERT. Le service qui
 * les appelle n'en ouvre pas davantage, contrairement a l'inscription qui devait
 * ecrire trois tables d'un coup.
 */
class PrestationRepository extends AbstractRepository
{
    private const SELECT = 'SELECT id_prestation, libelle, description, tarif, duree_estimee, actif
                            FROM prestations
                            WHERE id_prestation = ? AND id_artisan = ?';

    /**
     * Garde de propriete et relecture en un seul endroit : le service s'en sert
     * pour savoir si la ligne existe bien pour CETTE fiche, et pour nommer la
     * prestation dans le message de conflit.
     */
    public function trouver(int $idPrestation, int $idArtisan): ?Prestation
    {
        $stmt = $this->db->prepare(self::SELECT);
        $stmt->execute([$idPrestation, $idArtisan]);
        $row = $stmt->fetch();

        return $row === false ? null : Prestation::fromRow($row);
    }

    /**
     * Les prestations demandees pour une fiche, Y COMPRIS les masquees : le service
     * doit pouvoir nommer celle qu'il refuse. La clause `id_artisan` reste la meme
     * garde qu'ailleurs, un identifiant appartenant a une autre fiche ne remonte
     * tout simplement pas.
     *
     * Les `?` de la liste IN sont produits par array_fill sur des entiers deja
     * valides, jamais par concatenation des valeurs : aucun texte d'utilisateur
     * n'entre dans le SQL.
     *
     * @param int[] $idPrestations
     * @return Prestation[]
     */
    public function choisir(int $idArtisan, array $idPrestations): array
    {
        if ($idPrestations === []) {
            return [];
        }

        $marqueurs = implode(', ', array_fill(0, count($idPrestations), '?'));
        $stmt = $this->db->prepare(
            'SELECT id_prestation, libelle, description, tarif, duree_estimee, actif'
            . ' FROM prestations WHERE id_artisan = ? AND id_prestation IN (' . $marqueurs . ')'
        );
        $stmt->execute(array_merge([$idArtisan], $idPrestations));

        return array_map(
            static fn (array $row): Prestation => Prestation::fromRow($row),
            $stmt->fetchAll()
        );
    }

    /**
     * Total et duree cumulee d'une selection, additionnes par MySQL : `decimal` est
     * une echelle fixe, une addition en PHP passerait par un float et le total affiche
     * pourrait ne plus correspondre a la somme des `prix_applique` enregistres dans
     * `concerner`.
     *
     * La clause `actif = 1` est la regle unique « une prestation compte », la meme que
     * TARIF_MIN plus haut : si elle divergeait, le montant annonce au client ne
     * serait plus la somme des lignes facturees a l'artisan.
     *
     * @param int[] $idPrestations
     * @return array{tarif: string, duree: int}
     */
    public function totalPour(int $idArtisan, array $idPrestations): array
    {
        $marqueurs = implode(', ', array_fill(0, count($idPrestations), '?'));
        $stmt = $this->db->prepare(
            'SELECT COALESCE(SUM(tarif), 0) AS tarif, COALESCE(SUM(duree_estimee), 0) AS duree'
            . ' FROM prestations WHERE id_artisan = ? AND actif = 1 AND id_prestation IN (' . $marqueurs . ')'
        );
        $stmt->execute(array_merge([$idArtisan], $idPrestations));
        $row = $stmt->fetch();

        return ['tarif' => (string) ($row['tarif'] ?? '0'), 'duree' => (int) ($row['duree'] ?? 0)];
    }

    /**
     * `actif` n'est pas un parametre : une creation donne toujours une prestation
     * visible. La colonne est NULLable en base, et NULL veut dire « statut inconnu
     * », ni visible ni masque ; l'ecrire explicitement evite d'en creer une de plus.
     *
     * @return int id_prestation cree
     */
    public function creer(
        int $idArtisan,
        string $libelle,
        string $description,
        string $tarif,
        int $dureeEstimee,
    ): int {
        $stmt = $this->db->prepare(
            'INSERT INTO prestations (libelle, description, tarif, duree_estimee, actif, id_artisan)'
            . ' VALUES (?, ?, ?, ?, 1, ?)'
        );
        $stmt->execute([$libelle, $description, $tarif, $dureeEstimee, $idArtisan]);

        return (int) $this->db->lastInsertId();
    }

    public function changerVisibilite(int $idPrestation, int $idArtisan, bool $actif): void
    {
        $stmt = $this->db->prepare(
            'UPDATE prestations SET actif = ? WHERE id_prestation = ? AND id_artisan = ?'
        );
        $stmt->execute([$actif ? 1 : 0, $idPrestation, $idArtisan]);
    }

    public function supprimer(int $idPrestation, int $idArtisan): void
    {
        $stmt = $this->db->prepare(
            'DELETE FROM prestations WHERE id_prestation = ? AND id_artisan = ?'
        );
        $stmt->execute([$idPrestation, $idArtisan]);
    }

    /**
     * Nombre de rendez-vous qui reference cette prestation. Le DELETE echouerait
     * sur la cle etrangere de `concerner` avec un message SQL ; poser la question
     * avant vaut un 409 comprehensible, et c'est le seul cas ou le serveur dit a
     * l'artisan quoi faire a la place de la supprimer.
     */
    public function nombreDeRendezVousLie(int $idPrestation): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM concerner WHERE id_prestation = ?');
        $stmt->execute([$idPrestation]);

        return (int) $stmt->fetchColumn();
    }
}
