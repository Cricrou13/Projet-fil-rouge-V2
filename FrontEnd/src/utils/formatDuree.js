// duree_estimee est un int en minutes : 90 -> "1h30", 45 -> "45 min", 60 -> "1h".
export const formatDuree = (minutes) => {
  if (!minutes || minutes < 60) return `${minutes || 0} min`;
  const reste = minutes % 60;
  return reste === 0
    ? `${Math.floor(minutes / 60)}h`
    : `${Math.floor(minutes / 60)}h${String(reste).padStart(2, "0")}`;
};
