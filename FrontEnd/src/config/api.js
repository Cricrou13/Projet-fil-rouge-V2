export const API_BASE_URL = 'http://localhost/infintime.api';

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