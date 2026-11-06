// "25.00" (string PHP) -> "25 €" ; null -> null, donc bloc masque cote appelant.
export const formatTarif = (tarif) =>
  tarif === null
    ? null
    : new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(tarif));
