// Des dates de calendrier, pas des instants : tout est calculé en UTC pour que ni
// le fuseau du navigateur ni le passage heure d'été / heure d'hiver ne déplace un
// lundi de sept jours. La référence du « aujourd'hui » vient de l'API, jamais d'ici.
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const versDate = (iso) => new Date(`${iso}T00:00:00Z`);

export const decaleJours = (iso, jours) => {
  const date = versDate(iso);
  date.setUTCDate(date.getUTCDate() + jours);
  return date.toISOString().slice(0, 10);
};

// Les 7 ISO d'une semaine à partir de son lundi.
export const semaineDe = (lundiIso) =>
  Array.from({ length: 7 }, (_, rang) => decaleJours(lundiIso, rang));

export const labelJour = (iso) => {
  // getUTCDay() = 0 le dimanche : +6 % 7 remet la semaine à l'envers ISO (lundi d'abord).
  const rang = (versDate(iso).getUTCDay() + 6) % 7;
  return `${JOURS[rang]} ${Number(iso.slice(8, 10))}`;
};

// '2026-10-28 14:00:00' -> '14:00'. Découpe de chaîne volontaire : convertir en
// Date applique un fuseau, et les horaires stockés sont déjà l'heure locale de l'artisan.
export const heureSeule = (dateHeure) => dateHeure.slice(11, 16);

export const plageHoraires = (debut, fin) => `${heureSeule(debut)} – ${heureSeule(fin)}`;
