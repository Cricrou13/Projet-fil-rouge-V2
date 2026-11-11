import { formatTarif } from "./formatTarif";

// Une ligne de la route `artisans` -> les props de ProCard. `rating`, `nextSlot` et
// `prestations` restent vides faute de source : aucune table d'avis, et la table
// `disponibilites` n'est exploitee par aucune route. La carte masque ces blocs.
export const versCarteArtisan = (artisan) => {
  const nom = artisan.nom_etablissement ?? "";

  return {
    id: artisan.id_artisan,
    name: nom,
    nom_etablissement: nom,
    metier: artisan.metier,
    ville: artisan.ville,
    codePostal: artisan.code_postal,
    initials: nom.slice(0, 2).toUpperCase(),
    rating: null,
    startingPrice: formatTarif(artisan.tarif_min ?? null),
    nextSlot: null,
    prestations: [],
  };
};
