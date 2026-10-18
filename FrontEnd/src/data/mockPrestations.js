export const mockPrestations = {
  coiffure: {
    categories: ["Coupes", "Barbe", "Forfaits", "Soins"],
    prestations: [
      { id: 1, nom: "Coupe classique homme", categorie: "Coupes", duree: "30 min", prix: 25, description: "Shampoing, coupe et coiffage.", enLigne: true },
      { id: 2, nom: "Coupe + Taille de barbe", categorie: "Forfaits", duree: "45 min", prix: 35, description: "Coupe, rituel barbe et serviette chaude.", enLigne: true },
    ],
  },
  electricite: {
    categories: ["Installation", "Dépannage", "Mise aux normes", "Devis"],
    prestations: [
      { id: 1, nom: "Dépannage électrique", categorie: "Dépannage", duree: "1h", prix: 60, description: "Intervention rapide sur panne électrique.", enLigne: true },
      { id: 2, nom: "Devis installation complète", categorie: "Devis", duree: "Sur devis", prix: 0, description: "Visite technique et devis gratuit.", enLigne: true },
    ],
  },
  terrassement: {
    categories: ["Terrassement", "Devis", "Aménagement"],
    prestations: [
      { id: 1, nom: "Devis terrassement", categorie: "Devis", duree: "1h", prix: 0, description: "Visite de chantier et estimation.", enLigne: true },
    ],
  },

  informatique: {
    categories: ["Site vitrine","Application", "Maintenance", "Devis"],
    prestations: [
      { id: 1, nom: "Création site vitrine", categorie: "Site vitrine", duree: "Sur devis", prix: 300, description: "Site one-page responsive avec formulaire de contact", enLigne: true },
    ],
  },

  default: {
    categories: [],
    prestations: [],
  },
};