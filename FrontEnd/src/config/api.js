// Inscription : la seule ecriture encore branchee sur l'ancienne API, parce que
// le routeur V2 ne sait toujours pas ecrire (aucun INSERT dans src/). La
// connexion, elle, est passee cote V2 : les deux touchent la meme base.
export const API_BASE_URL = 'http://localhost/infintime.api';

// Base du backend MVC V2, en chemin relatif donc same-origin. C'est une condition
// fonctionnelle, pas un style : le cookie de session PHP n'est accepte par le
// navigateur que si la requete part vers la meme origine que la page. Le proxy
// Vite (dev) et Apache (prod) se chargent de ce rapprochement.
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
