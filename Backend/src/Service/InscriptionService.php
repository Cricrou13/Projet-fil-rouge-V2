<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Utilisateur;
use App\Exception\InscriptionException;
use App\Repository\ArtisanRepository;
use App\Repository\ClientRepository;
use App\Repository\UtilisateurRepository;
use PDO;
use PDOException;
use RuntimeException;
use Throwable;

/**
 * Creation d'un compte.
 *
 * Le service existe parce qu'une inscription n'est pas une ecriture mais deux,
 * dans deux tables differentes : `utilisateurs` puis `artisans` OU `client`. Si la
 * seconde echoue, la premiere ne doit pas rester en base : sans ce bloc, le compte
 * reste sans fiche, et comme `artisans.Id_utilisateur` est UNIQUE, un rejet
 * posterieur rendrait ce compte impossible a reparer par un second essai. Un controller qui ouvrirait la
 * transaction ne serait plus un controller, et un repository qui l'ouvrirait ne
 * pourrait plus etre compose avec un autre.
 */
final class InscriptionService
{
    // Miroir serveur des 10 cles de FrontEnd/src/data/metiers.js (hors `default`,
    // qui n'est pas un metier mais la couleur de repli du menu pro).
    private const METIERS = [
        'coiffure',
        'electricite',
        'terrassement',
        'plomberie',
        'peinture',
        'espaces-verts',
        'nettoyage',
        'menuiserie',
        'informatique',
        'maconnerie',
    ];

    // L'ancien register.php ecrivait le role recu tel quel : 'pro', 'Admin' ou
    // n'importe quoi d'autre se retrouvait en base, et `role` devenait une valeur
    // sur laquelle personne ne pouvait s'appuyer. Deux valeurs, et rien d'autre.
    private const ROLES = ['client', 'artisan'];

    // 72 octets : bcrypt tronque la saisie au-dela sans rien dire. Deux comptes
    // distincts partageraient alors le meme hash, ce qui est une ouverture, pas
    // une anecdote. La limite est donc mesuree en octets, pas en caracteres.
    private const MOT_DE_PASSE_MAX = 72;

    private const MOT_DE_PASSE_MIN = 8;

    public function __construct(
        private PDO $db,
        private UtilisateurRepository $utilisateurs,
        private ArtisanRepository $artisans,
        private ClientRepository $clients,
    ) {
    }

    /**
     * @param array<string, mixed> $corps le JSON recu, tel quel
     * @throws InscriptionException uniquement des messages ecrits pour l'interface
     */
    public function enregistrer(array $corps): Utilisateur
    {
        $nom = $this->champ($corps, 'nom', 'Le nom', 50, true);
        $prenom = $this->champ($corps, 'prenom', 'Le prénom', 50, true);
        $email = $this->email($corps);
        $motDePasse = $this->motDePasse($corps);
        $role = $this->role($corps);
        $metier = $role === 'artisan' ? $this->metier($corps) : '';
        $telephone = $this->champ($corps, 'telephone', 'Le téléphone', 15, false);

        $adresseFacturation = $this->champ($corps, 'adresse_facturation', "L'adresse", 255, false);
        $codePostal = $this->champ($corps, 'code_postal', 'Le code postal', 10, false);
        $ville = $this->champ($corps, 'ville', 'La ville', 100, false);

        // Un artisan signe pour son etablissement : le formulaire ne propose pas
        // ces trois champs, mais la fiche, elle, est NOT NULL.
        $nomEtablissement = $this->champ($corps, 'nom_etablissement', "Le nom d'établissement", 100, false);
        if ($nomEtablissement === '') {
            $nomEtablissement = trim($prenom . ' ' . $nom);
        }
        $description = $this->champ($corps, 'description', 'La description', 255, false);
        $adresseEtablissement = $this->champ($corps, 'adresse_etablissement', "L'adresse de l'établissement", 255, false);
        if ($adresseEtablissement === '') {
            $adresseEtablissement = $adresseFacturation;
        }

        // Le formulaire d'inscription ne demande pas de SIRET. L'ancien code
        // inscrivait '00000000000000' : un numero qui a l'air vrai, affiche sur la
        // fiche publique, et impossible a distinguer d'un vrai a l'oeil. Une chaine
        // vide dit honestement « non renseigné ».
        $siret = $this->champ($corps, 'siret', 'Le SIRET', 50, false);

        // Tout ce qui peut echouer sans toucher la base est fini a cette ligne :
        // la transaction ne s'ouvre jamais pour un formulaire invalide.
        $hash = password_hash($motDePasse, PASSWORD_BCRYPT, ['cost' => 12]);

        $this->db->beginTransaction();

        try {
            if ($this->utilisateurs->emailExiste($email)) {
                throw InscriptionException::emailDejaPris();
            }

            $idUtilisateur = $this->utilisateurs->enregistrer(
                nom: $nom,
                prenom: $prenom,
                email: $email,
                motDePasseHash: $hash,
                telephone: $telephone === '' ? null : $telephone,
                role: $role,
            );

            if ($role === 'artisan') {
                $this->artisans->creerFiche(
                    idUtilisateur: $idUtilisateur,
                    nomEtablissement: $nomEtablissement,
                    metier: $metier,
                    siret: $siret,
                    description: $description,
                    adresseEtablissement: $adresseEtablissement,
                    codePostal: $codePostal,
                    ville: $ville,
                );
            } else {
                $this->clients->creer(
                    idUtilisateur: $idUtilisateur,
                    adresseFacturation: $adresseFacturation,
                    codePostal: $codePostal,
                    ville: $ville,
                );
            }

            $this->db->commit();
        } catch (Throwable $e) {
            // Le rollback est ici et pas ailleurs : si commit() echoue, la
            // transaction est encore ouverte et les deux lignes resteraient
            // suspendues jusqu'a la fermeture de la connexion.
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            if ($this->doublonEmail($e)) {
                throw InscriptionException::emailDejaPris();
            }

            throw $e;
        }

        $utilisateur = $this->utilisateurs->parId($idUtilisateur);

        if ($utilisateur === null) {
            // Commit reussi puis ligne introuvable : ne peut vouloir dire qu'une
            // chose, la table a ete touchee hors de nous. On ne ment pas au client.
            throw new RuntimeException('Compte créé mais illisible : ' . $idUtilisateur);
        }

        return $utilisateur;
    }

    private function doublonEmail(Throwable $e): bool
    {
        if (!$e instanceof PDOException || (int) ($e->errorInfo[1] ?? 0) !== 1062) {
            return false;
        }

        if (preg_match("/for key '([^']+)'/", $e->getMessage(), $cle) !== 1) {
            return false;
        }

        $segments = explode('.', $cle[1]);

        return strtolower(trim((string) end($segments), '`')) === 'email';
    }

    /**
     * Champs texte : trim, presence, puis longueur. La longueur n'est pas du
     * decor -- les colonnes ont une taille, et MySQL en mode strict repondrait
     * 1406, donc un 500 pour un champ trop long. `mb_strlen` parce qu'une colonne
     * varchar(50) compte des caracteres, pas des octets.
     *
     * @param array<string, mixed> $corps
     */
    private function champ(array $corps, string $cle, string $libelle, int $max, bool $obligatoire): string
    {
        $valeur = trim((string) ($corps[$cle] ?? ''));

        if ($valeur === '') {
            if ($obligatoire) {
                throw InscriptionException::champInvalide($libelle . ' est obligatoire.');
            }

            return '';
        }

        if (mb_strlen($valeur) > $max) {
            throw InscriptionException::champInvalide(
                $libelle . ' dépasse ' . $max . ' caractères.'
            );
        }

        return $valeur;
    }

    /** @param array<string, mixed> $corps */
    private function email(array $corps): string
    {
        $valeur = trim((string) ($corps['email'] ?? ''));

        if ($valeur === '') {
            throw InscriptionException::champInvalide('L’email est obligatoire.');
        }

        if (mb_strlen($valeur) > 150 || filter_var($valeur, FILTER_VALIDATE_EMAIL) === false) {
            throw InscriptionException::champInvalide('Adresse email invalide.');
        }

        return $valeur;
    }

    /** @param array<string, mixed> $corps */
    private function motDePasse(array $corps): string
    {
        // `mot_de_passe` : le meme vocabulaire que la route de connexion. C'est au
        // front de traduire le `password` de son formulaire, sinon le serveur
        // accepterait deux noms pour la meme chose et il faudrait les deux partout.
        $valeur = (string) ($corps['mot_de_passe'] ?? '');

        if ($valeur === '') {
            throw InscriptionException::champInvalide('Le mot de passe est obligatoire.');
        }

        if (strlen($valeur) < self::MOT_DE_PASSE_MIN) {
            throw InscriptionException::champInvalide(
                'Le mot de passe doit faire au moins ' . self::MOT_DE_PASSE_MIN . ' caractères.'
            );
        }

        if (strlen($valeur) > self::MOT_DE_PASSE_MAX) {
            throw InscriptionException::champInvalide(
                'Le mot de passe ne peut pas dépasser ' . self::MOT_DE_PASSE_MAX . ' caractères.'
            );
        }

        return $valeur;
    }

    /** @param array<string, mixed> $corps */
    private function role(array $corps): string
    {
        $valeur = trim((string) ($corps['role'] ?? 'client'));

        if (!in_array($valeur, self::ROLES, true)) {
            throw InscriptionException::champInvalide('Rôle non reconnu.');
        }

        return $valeur;
    }

    /** @param array<string, mixed> $corps */
    private function metier(array $corps): string
    {
        $valeur = trim((string) ($corps['metier'] ?? ''));

        if (!in_array($valeur, self::METIERS, true)) {
            throw InscriptionException::champInvalide('Veuillez sélectionner un métier valide.');
        }

        return $valeur;
    }
}
