import { useEffect, useState } from "react";
import { AlertCircle, Users } from "lucide-react";
import { getClientele } from "../../config/api";
import "./Clients.scss";

const ETATS = {
  chargement: {
    classe: "",
    titre: "Chargement de la clientèle…",
  },
  "aucun-compte": {
    classe: "is-error",
    titre:
      "Aucun compte pro identifié. Reconnecte-toi pour charger ta clientèle.",
  },
  "sans-fiche": {
    classe: "is-error",
    titre:
      "Ce compte n'a pas de fiche artisan en base : la clientèle est vide.",
  },
  erreur: {
    classe: "is-error",
    titre: "Clientèle inaccessible : le serveur n'a pas répondu.",
  },
  ok: {
    classe: "",
    titre:
      "Clientèle lue en base : une ligne dès qu'un client a un rendez-vous ou un devis chez toi.",
  },
};

const dateFr = (iso) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

export default function Clients() {
  // La session du serveur désigne la fiche
  const [clientele, setClientele] = useState(null);
  const [etat, setEtat] = useState("chargement");

  useEffect(() => {
    getClientele()
      .then((data) => {
        setClientele(data.clientele ?? []);
        setEtat("ok");
      })
      .catch((err) => {
        console.warn("⚠️ Clientèle pro inaccessible :", err.message);
        setClientele(null);
        // 404 = le compte connecté n'a pas de ligne dans `artisans`.
        if (err.message === "404") setEtat("sans-fiche");
        else if (err.message === "401") setEtat("aucun-compte");
        else setEtat("erreur");
      });
  }, []);

  const bandeau = ETATS[etat];
  const estEnErreur =
    etat === "erreur" || etat === "sans-fiche" || etat === "aucun-compte";
  const nombreClients = clientele?.length ?? 0;

  return (
    <div className="clientele-page">
      <div className={`clientele-bandeau ${bandeau.classe}`}>
        {estEnErreur ? <AlertCircle size={16} /> : <Users size={16} />}
        <span>{bandeau.titre}</span>
      </div>

      <header className="clientele-header">
        <div>
          <h1>Clientèle</h1>
          <p>
            {etat === "ok"
              ? `${nombreClients} client${nombreClients > 1 ? "s" : ""} rattaché${nombreClients > 1 ? "s" : ""} à cette fiche`
              : "Liste non chargée"}
          </p>
        </div>
      </header>

      <div className="clientele-table-container">
        <table className="clientele-table">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Ville</th>
              <th scope="col">Rendez-vous</th>
              <th scope="col">Devis</th>
              <th scope="col">Dernier contact</th>
            </tr>
          </thead>
          <tbody>
            {clientele?.map((client) => (
              <tr key={client.id_client}>
                <td className="clientele-nom">{client.nom}</td>
                <td>
                  {[client.code_postal, client.ville]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </td>
                <td>{client.rendez_vous}</td>
                <td>{client.devis}</td>
                <td>
                  {client.dernier_contact
                    ? dateFr(client.dernier_contact)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {etat === "ok" && nombreClients === 0 && (
          <p className="clientele-vide">
            Aucun client pour l'instant. Une personne apparaît ici dès qu'elle a
            pris un rendez-vous ou demandé un devis chez toi.
          </p>
        )}
      </div>

      <p className="clientele-mention">
        Cette lecture ne publie ni l'email ni le téléphone du client, et elle
        n'écrit rien : la page est en lecture seule.
      </p>
    </div>
  );
}
