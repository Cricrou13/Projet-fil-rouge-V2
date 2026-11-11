// Base du backend MVC V2, en chemin relatif donc same-origin. C'est une condition
// fonctionnelle, pas un style : le cookie de session PHP n'est accepte par le
// navigateur que si la requete part vers la meme origine que la page. Le proxy
// Vite (dev) et Apache (prod) se chargent de ce rapprochement.
//
// L'URL de l'ancienne API (`http://localhost/infintime.api`) a disparu d'ici :
// l'inscription etait sa derniere utilisatrice, et ce chemin n'est pas une URL
// voisine, c'est un symlink Apache vers le dépôt d'origine. Le front V2 ne depend
// donc plus de ce dépôt.
export const V2_API_URL = '/index.php';

async function requeteV2(route, { method = 'GET', corps = null, params = {} } = {}) {
    const url = new URL(V2_API_URL, window.location.origin);
    url.searchParams.set('route', route);
    Object.entries(params).forEach(([cle, valeur]) => {
        if (valeur !== null && valeur !== undefined) {
            url.searchParams.set(cle, valeur);
        }
    });

    return fetch(url.toString(), {
        method,
        headers: corps === null ? undefined : { 'Content-Type': 'application/json' },
        body: corps === null ? undefined : JSON.stringify(corps),
    });
}

/**
 * @returns {Promise<object>} l'utilisateur connecte, tel que la session le garde
 * @throws {Error} message du serveur ('Identifiants incorrects', ...)
 */
export async function connexionV2(email, motDePasse) {
    const reponse = await requeteV2('connexion', {
        method: 'POST',
        corps: { email, mot_de_passe: motDePasse },
    });
    const corps = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
        throw new Error(corps.error || `Erreur HTTP : ${reponse.status}`);
    }

    return corps.utilisateur;
}

/**
 * Creation d'un compte. Le formulaire appelle sa cle `password` ; le serveur, lui,
 * ne connait que `mot_de_passe`, le meme nom que la route de connexion. La
 * traduction se fait ici pour que le mot de passe ne parte pas deux fois dans le
 * meme corps de requete sous deux cles differentes.
 *
 * @returns {Promise<object>} le compte cree, meme forme que connexionV2
 * @throws {Error} message du serveur ('Cet email est déjà utilisé.', ...)
 */
export async function inscriptionV2(formulaire) {
    const { password, ...champs } = formulaire;

    const reponse = await requeteV2('inscription', {
        method: 'POST',
        corps: { ...champs, mot_de_passe: password },
    });
    const corps = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
        throw new Error(corps.error || `Erreur HTTP : ${reponse.status}`);
    }

    return corps.utilisateur;
}

export async function deconnexionV2() {
    await requeteV2('deconnexion', { method: 'POST' });
}

/**
 * null = personne n'est connecte. Ce n'est pas une erreur mais l'etat normal d'un
 * visiteur, et la seule source sur laquelle le front doit decider qui il est.
 */
export async function moiV2() {
    const reponse = await requeteV2('moi');
    if (!reponse.ok) {
        return null;
    }

    return (await reponse.json()).utilisateur;
}

/** @returns {Promise<number>} 401 = session expiree, 404 = aucun compte derriere */
async function statutAttente(reponse) {
    if (reponse.status === 401) throw new Error('401');
    if (reponse.status === 404) throw new Error('404');
    if (!reponse.ok) throw new Error(`Erreur HTTP : ${reponse.status}`);

    return reponse.json();
}

// Annuaire public : aucun identifiant en entree, aucune session. Un echec ici veut
// donc dire « le serveur ne repond pas », jamais « vous n'etes pas autorise ».
export async function getArtisans() {
    return statutAttente(await requeteV2('artisans'));
}

// Fiche et prestations de l'artisan connecte. Aucun identifiant en entree : la
// session du serveur designe la fiche, une adresse ne peut pas en demander une autre.
export async function getPro() {
    return statutAttente(await requeteV2('pro'));
}

// Planning de l'espace pro : une seule fonction pour le tableau de bord ET l'agenda,
// pour que les deux pages partent du meme lundi et ne puissent pas se contredire
// sur un rendez-vous. `lundi` null = semaine courante, calculée par la base.
export async function getAgendaPro(lundi = null) {
    return statutAttente(await requeteV2('pro-agenda', { params: { lundi } }));
}

// Clientele de l'artisan connecte. Aucun identifiant en entree, comme pour les deux
// routes ci-dessus : la session designe la fiche, donc une URL ne peut pas demander
// les clients d'un autre etablissement.
export async function getClientele() {
    return statutAttente(await requeteV2('pro-clientele'));
}

// Mes rendez-vous, cote client. Meme règle : le seul moyen de savoir de qui lire la
// liste est le cookie de session. Un 404 dit ici « ce compte n'a pas de fiche
// client », ce qui est le cas normal d'un compte artisan.
export async function getMesRendezVous() {
    return statutAttente(await requeteV2('mes-rendez-vous'));
}

// Un 404 de lecture se traduisait en cle ('404' = pas de fiche artisan). Cote
// ecritures, le 404 dit autre chose (« cette prestation n'est pas a toi ») et le
// serveur l'accompagne d'une phrase : ici on montre la phrase, on ne la code pas.
async function ecritureV2(route, method, corps) {
    const reponse = await requeteV2(route, { method, corps });
    const resultat = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
        throw new Error(resultat.error || `Erreur HTTP : ${reponse.status}`);
    }

    return resultat;
}

// Corps attendu par la creation : { libelle, description, tarif, duree_estimee }.
// `tarif` part en CHAINE : le serveur refuse un nombre flottant, un prix comme
// 0.1 n'existe pas en binaire et il serait arrondi a tort.
export async function creerPrestation(prestation) {
    return ecritureV2('pro-prestation-creer', 'POST', prestation);
}

export async function changerVisibilitePrestation(idPrestation, actif) {
    return ecritureV2('pro-prestation-visibilite', 'PATCH', { id_prestation: idPrestation, actif });
}

export async function supprimerPrestation(idPrestation) {
    return ecritureV2('pro-prestation-supprimer', 'DELETE', { id_prestation: idPrestation });
}

/**
 * Demande de rendez-vous cote client. Corps : { id_artisan, date, heure,
 * prestations: [id...], remarque }.
 *
 * `id_artisan` est le premier identifiant que le front envoie et le seul que le
 * serveur accepte : il designe OU l'on reserve, pas QUI reserve. L'identite du
 * client vient de la session, comme partout ailleurs ; `date` est un AAAA-MM-JJ et
 * `heure` un HH:MM, les deux formats produits par le champ `type="date"` et par la
 * grille de creneaux.
 *
 * @returns {Promise<object>} { rendez_vous: { id_rdv, statut, montant_total, ... } }
 * @throws {Error} message du serveur (chevauchement, prestation retiree, date passee)
 */
export async function rdvDemander(corps) {
    return ecritureV2('rdv-demander', 'POST', corps);
}
