export const mockDashboard = {
  coiffure: {
    stats: {
      rdvAVenir: 4,
      chiffreAffaires: "3 850 €",
      noteClients: "4.9 / 5",
    },
    appointments: [
      { id: 1, heure: "09:00", client: "Marc Dupont", telephone: "06 78 90 12 34", prestation: "Coupe classique + Barbe", prix: "35 €", statut: "termine", isNew: false },
      { id: 2, heure: "11:15", client: "Thomas Edouard", telephone: "06 12 34 56 78", prestation: "Taille de barbe sculptée", prix: "20 €", statut: "confirme", isNew: false },
      { id: 3, heure: "14:30", client: "Christophe Ramirez", telephone: "06 99 88 77 66", prestation: "Coupe homme + Soin cuir chevelu", prix: "28 €", statut: "confirme", isNew: true },
      { id: 4, heure: "16:45", client: "Julien Martin", telephone: "06 55 44 33 22", prestation: "Coupe ciseaux dégradé américain", prix: "30 €", statut: "en_attente", isNew: false },
    ],
    quotes: [
      { id: 101, client: "Valérie Bertrand", demande: "Prestation mariage & coiffure événementielle (4 personnes)", date: "Reçu il y a 2h", budget: "~ 180 €" },
    ],
    notes: ["Ne pas oublier de commander les cires coiffantes chez le fournisseur."],
  },
  electricite: {
    stats: {
      rdvAVenir: 3,
      chiffreAffaires: "5 200 €",
      noteClients: "4.7 / 5",
    },
    appointments: [
      { id: 1, heure: "08:30", client: "Mme Trent", telephone: "06 11 22 33 44", prestation: "Dépannage tableau électrique", prix: "80 €", statut: "confirme", isNew: false },
      { id: 2, heure: "11:00", client: "M. Edouard", telephone: "06 22 33 44 55", prestation: "Pose tableau électrique", prix: "250 €", statut: "en_attente", isNew: true },
    ],
    quotes: [
      { id: 201, client: "Fabien Garcia", demande: "Mise aux normes électriques appartement T3", date: "Reçu hier", budget: "~ 900 €" },
    ],
    notes: ["Rappeler M. Jacquot pour confirmation du métrage vendredi."],
  },
  terrassement: {
    stats: {
      rdvAVenir: 2,
      chiffreAffaires: "7 400 €",
      noteClients: "4.8 / 5",
    },
    appointments: [
      { id: 1, heure: "13:30", client: "M. Jacquot", telephone: "06 33 44 55 66", prestation: "Terrassement piscine", prix: "Sur devis", statut: "confirme", isNew: false },
    ],
    quotes: [],
    notes: [],
  },

  informatique: {
    stats: {
      rdvAVenir: 1,
      chiffreAffaires: "1 200 €",
      noteClients: "5.0 / 5",
    },
    appointments: [
      { id: 1, heure: "10:00", client: "Sophie Nguyen", telephone: "06 44 55 66 77", prestation: "Création site vitrine", prix: "300 €", statut: "confirme", isNew: true },
    ],
    quotes: [],
    notes: [],
  },

  default: {
    stats: { rdvAVenir: 0, chiffreAffaires: "0 €", noteClients: "—" },
    appointments: [],
    quotes: [],
    notes: [],
  },
};