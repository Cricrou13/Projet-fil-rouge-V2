# InfinTime

Plateforme de mise en relation entre particuliers et artisans du bâtiment et des services : l'artisan pilote son agenda, son catalogue de prestations et sa clientèle depuis un espace professionnel, le client cherche un artisan, demande un devis et prend rendez-vous.

Projet fil rouge de formation développeur web. **Le produit fonctionne en local, il n'est hébergé nulle part.**

## Stack

| Couche | Choix |
| --- | --- |
| Front | React 19 + Vite 8, SCSS, React Router 7, lint `oxlint` |
| Back | PHP 8.1+ sans framework, MVC maison (`App\` → `Backend/src/`, PSR-4 via Composer) |
| Base | MySQL 8, `utf8mb4_0900_ai_ci`, accès PDO |
| Dépendances PHP | `vlucas/phpdotenv` uniquement |

Le backend n'est **pas** un serveur Node : c'est un unique point d'entrée, `Backend/public/index.php`, servi par Apache.

## Structure

```
Backend/
├── public/index.php      routeur : table ROUTES -> Controller
├── src/
│   ├── Config/           connexion PDO (lit Backend/.env)
│   ├── Controller/       HTTP : lit la session, choisit le code de réponse
│   ├── Service/          écritures uniquement, transactions
│   ├── Repository/       SQL, requêtes préparées
│   ├── Entity/           mise en forme des lignes pour le JSON
│   └── Exception/       erreurs métier -> code HTTP
├── bdd.sql               schéma, index, triggers — s'importe sans erreur
├── seed-demo.sql         données de démonstration, optionnel
└── .env                  credentials locaux (hors dépôt)

FrontEnd/
├── src/pages/public/     accueil, recherche, réservation, devis, compte
├── src/pages/pro/        tableau de bord, agenda, prestations, clientèle, connexion
├── src/components/       dont les tableaux et le layout pro
├── src/layouts/          ProLayout (garde de session)
├── src/config/api.js     un appel fetch par route
└── vite.config.js        proxy /index.php vers le vhost Apache
```

## Installation locale

Prérequis : Laragon (ou tout Apache + PHP 8.1+ avec `pdo_mysql` + MySQL 8), Node (le poste de développement est en v24.11.1), Composer.

1. **Cloner dans le dossier web** de Laragon (`C:\laragon\www\`). Laragon crée automatiquement le vhost `http://<nom-du-dossier>.test`.

2. **Pointer le vhost sur le backend.** Le `DocumentRoot` doit être `Backend/public`, pas la racine du dépôt. Sans cela, `/` répond 404 et l'API est injoignable. Si ton dossier ne s'appelle pas `Projet-fil-rouge-V2`, le nom du vhost change : mets à jour la cible du proxy dans `FrontEnd/vite.config.js` en conséquence, sinon le cookie de session est refusé (requête cross-origin).

3. **Créer `Backend/.env`** (il n'est pas dans le dépôt, et ne doit pas y entrer) :

   ```
   DATABASE_HOST=127.0.0.1
   DATABASE_PORT=3306
   DATABASE_NAME=infintime
   DATABASE_USERNAME=<ton utilisateur>
   DATABASE_PASSWORD=<ton mot de passe>
   ```

4. **Dépendances PHP** : `cd Backend && composer install`.

5. **Base de données** : créer la base `infintime`, importer `Backend/bdd.sql`. Le fichier crée les huit tables, l'index `UNIQUE` sur `utilisateurs.email` et les quatre triggers ; il ne contient **aucune donnée**, donc l'import va à son terme. Attention, il commence par `DROP TABLE IF EXISTS` sur ses huit tables : le relancer **vide la base**. Il ne crée aucun compte utilisateur — passe par le formulaire d'inscription pour avoir un accès.

   `Backend/seed-demo.sql` est **optionnel** : il recharge les sept prestations de démonstration. Elles ne sont rattachées à aucun `id_artisan` en dur, mais au compte artisan qui **exerce ce métier** (`metier`, le même vocabulaire que `InscriptionService::METIERS`), et une ligne dont personne n'exerce le métier est ignorée. En cas de deux artisans du même métier, c'est le `id_artisan` le plus petit qui reçoit les prestations. Le rejouer ne duplique rien : une prestation déjà présente pour le même artisan est sautée. Sur une base toute neuve, sans compte artisan, il n'insère donc **rien** — c'est le formulaire d'inscription qui crée les comptes, jamais ce fichier.

6. **Front** : `cd FrontEnd && npm install`, puis `npm run dev`. L'interface est sur `http://localhost:5173`, l'API sur le vhost ; le proxy fait correspondre les deux.

`npm run build` produit `FrontEnd/dist`, `npm run lint` lance `oxlint`, `npm run preview` sert le build. Rien de tout cela n'est branché sur Apache : à ce stade le front ne vit que sur le serveur de développement.

## Le point d'entrée API

Toutes les requêtes passent par `/index.php?route=<nom>`. La table `ROUTES` dans `Backend/public/index.php` déclare le verbe autorisé et si la session est requise ; une route inconnue répond `404`, un verbe incorrect `405` (dans cet ordre), et `session => true` sans cookie valide répond `401`.

| Lecture | Écriture |
| --- | --- |
| `artisans`, `artisan` (publics) | `inscription`, `connexion`, `deconnexion` |
| `pro`, `pro-agenda`, `pro-clientele`, `moi` (session) | `rdv-demander` (POST, session) |
| | `pro-prestation-creer` / `-visibilite` / `-supprimer` |

## Règles de code

- **L'identité vient de la session PHP, jamais de la requête.** Un contrôleur qui a besoin de `Id_utilisateur` ou `Id_artisan` le lit via `AbstractController::compteConnecte()` ; accepter ces valeurs en paramètre rouvrirait la lecture des données d'un concurrent.
- Un `Repository` fait du SQL, un `Service` écrit et manage la transaction, un `Controller` traduit en HTTP. Les lectures peuvent aller du contrôleur directement au repository.
- Le SQL passe par des requêtes préparées, `PDO::ATTR_EMULATE_PREPARES` est désactivé.
- Le front affiche l'état de chargement avant de décider d'une redirection : une page qui filtre sur un rôle doit attendre que la session soit vérifiée par le serveur, sinon elle éjecte l'utilisateur connecté au premier rendu.

## Contraintes portées par la base

Le schéma ne peut pas exprimer qu'un compte est **soit** artisan **soit** client (l'invariant traverse deux tables) : quatre triggers le font (`artisans_exclusivite_insert|update`, `client_exclusivite_insert|update`). Ils lèvent une erreur `SQLSTATE 45000` si une fiche existe déjà dans l'autre table. Ils sont écrits **avant** toute donnée dans `bdd.sql` : un import qui s'arrêterait plus tard les a déjà installés. Comme tout trigger, un `DROP TABLE` les emporte, mais le réimport de `bdd.sql` les recrée. Le bloc utilise `DELIMITER`, commande côté client — à exécuter avec la CLI MySQL ou Adminer, pas via un driver.

## Ce qui reste à faire

- La table `disponibilites` est vide et aucune route ne l'exploite : les créneaux de l'agenda se déduisent des rendez-vous existants.
- `MyAppointments.jsx` (espace client) affiche encore des données de maquette.
- Les notes liées à un rendez-vous, la page Paramètres et l'espace client complet restent à écrire.
- Aucun test automatisé, aucune intégration continue : `composer.json` n'a pas de `require-dev`, `package.json` pas de script `test`. Les vérifications disponibles sont `php -l`, `npm run lint`, `npm run build` et la matrice de codes HTTP à la main.

## Sécurité : ce qui est couvert, ce qui ne l'est pas

Couvert : mots de passe hachés en bcrypt, requêtes préparées partout, identité serveur, aucune donnée personnelle exposée par les routes de lecture (ni email ni téléphone du client sur la clientèle), `Backend/.env` hors dépôt.

Non couvert, **à ne pas publier en l'état** : l'application n'est ni déployée ni exposée, et elle ne l'a jamais été testée hors de `localhost`. Avant une mise en ligne, il faudra au minimum un HTTPS, une base qui n'est pas celle du poste de développement, un utilisateur MySQL distinct de `root`, et une politique de session (durée, renouvellement).
