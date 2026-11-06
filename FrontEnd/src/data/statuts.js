// Libellés des statuts de rendez-vous et de devis.
// `rendez_vous.statut` et `devis.statut` sont des varchar(50) libres, sans CHECK :
// la base peut donc rendre "En attente", "CONFIRME" ou "accepte ". La normalisation
// (minuscule, sans accent, espace/tiret -> underscore) est ce qui fait retomber ces
// variantes sur la bonne clé, et surtout ce qui garde l'affichage d'accord avec les
// conditions d'affichage des boutons (qui comparent la clé, pas le libellé).
export const STATUTS = {
  en_attente: "En attente",
  confirme: "Confirmé",
  termine: "Terminé",
  passe: "Passé",
  accepte: "Accepté",
  annule: "Annulé",
  // Le bouton « Décliner » du tableau de bord existe déjà : sans cette clé, le jour
  // où l'écriture est branchée, un devis refusé afficherait « Statut inconnu ».
  refuse: "Refusé",
  default: "Statut inconnu",
};

// Les libellés ci-dessus = point de vue du PRO. `MyAppointments.jsx` (côté client) a
// sa propre formulation : "En attente de l'artisan", "Effectué". Ce ne sont pas des
// synonymes à unifier ici, mais deux lectures du même `statut`. A noter aussi :
// `termine` (espace pro) et `passe` (espace client) désignent le même état sous deux
// clés — à trancher avant de brancher la moindre écriture.

// Clé du dictionnaire pour une valeur brute, 'default' si elle n'existe pas.
export const cleStatut = (statut) => {
  if (statut === null || statut === undefined) return "default";

  const cle = String(statut)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

  return Object.prototype.hasOwnProperty.call(STATUTS, cle) ? cle : "default";
};

export const libelleStatut = (statut) => STATUTS[cleStatut(statut)];
