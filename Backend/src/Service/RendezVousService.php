<?php

declare(strict_types=1);

namespace App\Service;

use App\Exception\RendezVousException;
use App\Repository\ArtisanRepository;
use App\Repository\ClientRepository;
use App\Repository\PrestationRepository;
use App\Repository\RendezVousRepository;
use DateTimeImmutable;
use PDO;
use Throwable;

final class RendezVousService
{
    private const STATUT_DEMANDE = 'en_attente';
    private const REMARQUE_MAX = 255;

    public function __construct(
        private PDO $db,
        private RendezVousRepository $rendezVous,
        private PrestationRepository $prestations,
        private ArtisanRepository $artisans,
        private ClientRepository $clients,
    ) {
    }

    /**
     * @param array<string, mixed> $corps
     * @return array<string, mixed> ce que le front affiche a la fin du tunnel
     */
    public function demander(int $idUtilisateur, array $corps): array
    {
        $idClient = $this->clients->idClientParIdUtilisateur($idUtilisateur);

        if ($idClient === null) {
            throw RendezVousException::sansEspaceClient();
        }

        $idArtisan = $this->idArtisan($corps['id_artisan'] ?? null);
        $artisan = $this->artisans->find($idArtisan);

        if ($artisan === null) {
            throw RendezVousException::artisanIntrouvable($idArtisan);
        }

        $debut = $this->creneauDebut($corps['date'] ?? null, $corps['heure'] ?? null);
        $selection = $this->selection($idArtisan, $corps['prestations'] ?? null);
        $ids = array_column($selection, 'id_prestation');
        $total = $this->prestations->totalPour($idArtisan, $ids);

        $fin = $this->rendezVous->finCalculee($debut, $total['duree']);

        // DATE_ADD sort du domaine de DATETIME au-dela du 31/12/9999 et rend NULL :
        // mieux vaut un 400 qu'un INSERT avorte sur une colonne NOT NULL.
        if ($fin === '') {
            throw RendezVousException::champInvalide(
                'Ce créneau dépasse la date maximale gérée par la base.'
            );
        }

        if ($this->rendezVous->creneauPasse($debut)) {
            throw RendezVousException::datePassee();
        }

        $conflit = $this->rendezVous->premierConflit($idArtisan, $debut, $fin);

        if ($conflit !== null) {
            throw RendezVousException::chevauchement($conflit['debut'], $conflit['fin']);
        }

        $remarque = $this->remarque($corps['remarque'] ?? null);

        $this->db->beginTransaction();

        try {
            $idRdv = $this->rendezVous->creer(
                $idArtisan,
                $idClient,
                $debut,
                $fin,
                self::STATUT_DEMANDE,
                $remarque
            );

            foreach ($selection as $prestation) {
                $this->rendezVous->lierPrestation(
                    $idRdv,
                    (int) $prestation['id_prestation'],
                    (string) $prestation['tarif']
                );
            }

            $this->db->commit();
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $e;
        }

        return [
            'id_rdv' => $idRdv,
            'date_heure_debut' => $debut,
            'date_heure_fin' => $fin,
            'statut' => self::STATUT_DEMANDE,
            'duree_estimee' => $total['duree'],
            'montant_total' => $total['tarif'],
            'remarque' => $remarque,
            'artisan' => $artisan->toCarte(),
            'prestations' => array_map(
                static fn (array $l): array => [
                    'id_prestation' => $l['id_prestation'],
                    'libelle' => $l['libelle'],
                    'tarif' => $l['tarif'],
                ],
                $selection
            ),
        ];
    }

    private function idArtisan(mixed $valeur): int
    {
        $id = filter_var($valeur, FILTER_VALIDATE_INT);

        if ($id === false || $id < 1) {
            throw RendezVousException::champInvalide('Identifiant artisan invalide.');
        }

        return $id;
    }

    private function creneauDebut(mixed $date, mixed $heure): string
    {
        if (!is_string($date) || !is_string($heure)) {
            throw RendezVousException::champInvalide('Date et heure attendues aux formats AAAA-MM-JJ et HH:MM.');
        }

        $date = trim($date);
        $heure = trim($heure);
        $journee = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        $minute = DateTimeImmutable::createFromFormat('!H:i', $heure);

        if ($journee === false || $journee->format('Y-m-d') !== $date) {
            throw RendezVousException::champInvalide('Date invalide, format attendu AAAA-MM-JJ.');
        }

        if ($minute === false || $minute->format('H:i') !== $heure) {
            throw RendezVousException::champInvalide('Heure invalide, format attendu HH:MM (24 h).');
        }

        // L'heure est verifiee en HH:MM : les secondes valent 00, et la forme a
        // secondes est celle que la colonne stocke et que l'agenda renvoie.
        return $date . ' ' . $heure . ':00';
    }

    /**
     * @return array<int, array<string, mixed>> les prestations retenues, dans l'ordre demande
     */
    private function selection(int $idArtisan, mixed $valeur): array
    {
        if (!is_array($valeur) || $valeur === []) {
            throw RendezVousException::champInvalide('Choisissez au moins une prestation.');
        }

        $demandees = [];

        foreach ($valeur as $id) {
            $idValide = filter_var($id, FILTER_VALIDATE_INT);

            if ($idValide === false || $idValide < 1) {
                throw RendezVousException::champInvalide('Identifiant de prestation invalide.');
            }

            $demandees[] = $idValide;
        }

        // Deux fois la meme prestation rempliraient deux fois la cle primaire de
        // `concerner` : la demande est ramenee a un jeu distinct avant d'aller plus loin.
        $demandees = array_values(array_unique($demandees));
        $trouvees = [];

        foreach ($this->prestations->choisir($idArtisan, $demandees) as $prestation) {
            $ligne = $prestation->toArray();
            $trouvees[$ligne['id_prestation']] = $ligne;
        }

        $refusees = [];

        foreach ($demandees as $id) {
            if (!array_key_exists($id, $trouvees)) {
                $refusees[] = 'id ' . $id;
            } elseif ($trouvees[$id]['actif'] !== true) {
                $refusees[] = '« ' . $trouvees[$id]['libelle'] . ' » (retirée de la vente)';
            }
        }

        if ($refusees !== []) {
            throw RendezVousException::prestationNonReservable(implode(', ', $refusees));
        }

        return array_map(static fn (int $id): array => $trouvees[$id], $demandees);
    }

    /** varchar(255) NOT NULL : la colonne compte des caracteres, pas des octets. */
    private function remarque(mixed $valeur): string
    {
        if ($valeur === null) {
            return '';
        }

        if (!is_string($valeur)) {
            throw RendezVousException::champInvalide('La remarque doit être du texte.');
        }

        $remarque = trim($valeur);

        if (mb_strlen($remarque) > self::REMARQUE_MAX) {
            throw RendezVousException::champInvalide('La remarque dépasse ' . self::REMARQUE_MAX . ' caractères.');
        }

        return $remarque;
    }
}
