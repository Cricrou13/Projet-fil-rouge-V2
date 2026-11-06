import { createContext, useContext, useState, useEffect } from "react";
import { connexionV2, deconnexionV2, moiV2 } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Une seule identité : celle que le serveur tient dans sa session. Le
  // localStorage est parti avec elle, parce qu'une copie dans le navigateur se
  // laisse éditer et que les pages s'en servaient pour décider de quel compte
  // elles parlaient.
  const [utilisateur, setUtilisateur] = useState(null);
  // Le probe est asynchrone, contrairement à la lecture du localStorage : sans ce
  // drapeau, un rafraîchissement sur /pro rendrait proUser null le temps de la
  // requête et éjecterait l'artisan connecté vers sa page de connexion.
  const [authCharge, setAuthCharge] = useState(false);

  useEffect(() => {
    moiV2()
      .then(setUtilisateur)
      .catch(() => setUtilisateur(null))
      .finally(() => setAuthCharge(true));
  }, []);

  // Un seul login : c'est le serveur qui dit si le compte a une fiche artisan,
  // pas le bouton sur lequel on a cliqué.
  const login = async (email, motDePasse) => {
    const connecte = await connexionV2(email, motDePasse);
    setUtilisateur(connecte);

    return connecte;
  };

  const logout = async () => {
    setUtilisateur(null);
    // Le POST rate (reseau coupe) ? Le front est deja deconnecte pour lui-meme et
    // la session serveur meurt toute seule a l'expirement du cookie.
    await deconnexionV2().catch(() => {});
  };

  const estArtisan = utilisateur?.role === "artisan";
  const proUser = estArtisan ? utilisateur : null;
  const clientUser = utilisateur && !estArtisan ? utilisateur : null;

  return (
    <AuthContext.Provider
      value={{
        user: utilisateur,
        proUser,
        clientUser,
        isProConnected: !!proUser,
        isClientConnected: !!clientUser,
        authCharge,
        login,
        logout,
        logoutPro: logout,
        logoutClient: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
