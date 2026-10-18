import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Récupération de la session existante dans le localStorage au chargement
  const [proUser, setProUser] = useState(() => {
    const saved = localStorage.getItem("proUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [clientUser, setClientUser] = useState(() => {
    const saved = localStorage.getItem("clientUser");
    return saved ? JSON.parse(saved) : null;
  });

  // Connexion d'un Pro / Artisan
  const loginPro = (userData) => {
    setProUser(userData);
    localStorage.setItem("proUser", JSON.stringify(userData));
  };

  // Déconnexion Pro
  const logoutPro = () => {
    setProUser(null);
    localStorage.removeItem("proUser");
  };

  // Connexion d'un Client
  const loginClient = (userData) => {
    setClientUser(userData);
    localStorage.setItem("clientUser", JSON.stringify(userData));
  };

  // Déconnexion Client
  const logoutClient = () => {
    setClientUser(null);
    localStorage.removeItem("clientUser");
  };

  // Utilisateur actuellement actif (pro ou client)
  const user = proUser || clientUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        proUser,
        clientUser,
        isProConnected: !!proUser,
        isClientConnected: !!clientUser,
        loginPro,
        logoutPro,
        loginClient,
        logoutClient,
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