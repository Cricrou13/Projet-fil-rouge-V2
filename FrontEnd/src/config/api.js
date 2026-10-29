export const API_BASE_URL = 'http://localhost/infintime.api';

// Base du backend MVC V2. Centralisee ici pour que la bascule eventuelle sur un
// proxy Vite ('/api') ne coute qu'une ligne, au lieu d'une par page.
export const V2_API_URL = 'http://projet-fil-rouge-v2.test/index.php';

export async function getArtisans() {
    try {
        const response = await fetch(`${API_BASE_URL}/index.php?route=artisans`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const data = await response.json();

        // Clés adaptées de la BDD pour qu'elles correspondent à mon ancien mock
        return data.map(artisan => ({
            id: artisan.id_artisan,
            name: artisan.nom_etablissement,
            initials: artisan.nom_etablissement ? artisan.nom_etablissement.substring(0, 2).toUpperCase() : "PRO",
            metier: artisan.metier,
            ville: artisan.ville,
            codePostal: artisan.code_postal,
            badge: "💻",
            rating: 5.0,
            reviewsCount: 10,
            startingPrice: "Sur devis",
            nextSlot: "Réponse sous 24h",
            prestations: [] // Pour les prestations plus tard
        }));
    } catch (error) {
        console.error("Impossible de récupérer les artisans :", error);
        return [];
    }
}

// Planning de l'espace pro : une seule fonction pour le tableau de bord ET l'agenda,
// pour que les deux pages partent du meme lundi et ne puissent pas se contredire
// sur un rendez-vous. `lundi` null = semaine courante, calculée par la base.
export async function getAgendaPro(idUtilisateur, lundi = null) {
    const url = new URL(V2_API_URL);
    url.searchParams.set('route', 'pro-agenda');
    url.searchParams.set('id_utilisateur', String(idUtilisateur));
    if (lundi !== null) {
        url.searchParams.set('lundi', lundi);
    }

    const response = await fetch(url.toString());
    // 404 = le compte est connecté mais n'a pas de ligne dans `artisans` :
    // connexion.php ne filtre pas le rôle, donc un client arrive ici.
    if (response.status === 404) {
        throw new Error('404');
    }
    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return response.json();
}