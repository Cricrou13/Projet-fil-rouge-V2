export const METIERS = {
  coiffure: { label: 'Coiffure', color: '#991A53', bgLight: '#FCE7F3' },      // Rose vibrant
  electricite: { label: 'Électricité', color: '#7F3006', bgLight: '#FFEDD5' }, // Orange énergie
  terrassement: { label: 'Terrassement', color: '#683903', bgLight: '#FEF3C7' }, // Ambre / Ocre chantier
  plomberie: { label: 'Plomberie', color: '#024A6F', bgLight: '#E0F2FE' },     // Bleu ciel / Cyan
  peinture: { label: 'Peinture', color: '#7C3AED', bgLight: '#F3E8FF' },       // Violet
  "espaces-verts": { label: 'Jardinage', color: '#16A34A', bgLight: '#DCFCE7' },     // Vert nature
  nettoyage: { label: 'Nettoyage', color: '#0D9488', bgLight: '#CCFBF1' },     // Sarcelle / Teal
  menuiserie: { label: 'Menuiserie', color: '#B45309', bgLight: '#FEF3C7' },   // Bois chaud
  informatique: { label: 'Développeur Web', color: '#2563EB', bgLight: '#DBEAFE' }, // Bleu tech
  maconnerie: { label: 'Maçonnerie générale', color: '#585a58', bgLight: '#DBEAFE' },
  default: { label: 'Autre', color: '#4F46E5', bgLight: '#EEF2FF' },          // Indigo standard
};

// Options du sélecteur de métier (inscription artisan).
// Ces valeurs sont les clés attendues par l'API et par les données de démo.
export const METIERS_SELECT = Object.entries(METIERS)
  .filter(([key]) => key !== 'default')
  .map(([value, config]) => ({ value, label: config.label }));

export const getMetierConfig = (key) => {
  if (!key) return METIERS.default;

  const cleanKey = String(key)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  // 1. Correspondance exacte
  if (METIERS[cleanKey]) return METIERS[cleanKey];
  // 2. Correspondance par inclusion 
  const foundKey = Object.keys(METIERS).find(
    (k) => k !== 'default' && cleanKey.includes(k)
  );
  return foundKey ? METIERS[foundKey] : METIERS.default;
};