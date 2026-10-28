USE infintime;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `artisans`;

CREATE TABLE `artisans` (
  `id_artisan` int NOT NULL AUTO_INCREMENT,
  `nom_etablissement` varchar(100) NOT NULL,
  `metier` varchar(50) NOT NULL DEFAULT 'default',
  `siret` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `adresse_etablissement` varchar(255) NOT NULL,
  `code_postal` varchar(10) NOT NULL,
  `ville` varchar(100) NOT NULL,
  `Id_utilisateur` int NOT NULL,
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_artisan`),
  UNIQUE KEY `Id_utilisateur` (`Id_utilisateur`),
  CONSTRAINT `artisans_ibfk_1` FOREIGN KEY (`Id_utilisateur`) REFERENCES `utilisateurs` (`Id_utilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `client`


DROP TABLE IF EXISTS `client`;

CREATE TABLE `client` (
  `id_client` int NOT NULL AUTO_INCREMENT,
  `adresse_facturation` varchar(255) NOT NULL,
  `code_postal` varchar(10) NOT NULL,
  `ville` varchar(100) NOT NULL,
  `Id_utilisateur` int NOT NULL,
  PRIMARY KEY (`id_client`),
  UNIQUE KEY `Id_utilisateur` (`Id_utilisateur`),
  CONSTRAINT `client_ibfk_1` FOREIGN KEY (`Id_utilisateur`) REFERENCES `utilisateurs` (`Id_utilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



-- Table structure for table `devis`


DROP TABLE IF EXISTS `devis`;

CREATE TABLE `devis` (
  `id_devis` int NOT NULL AUTO_INCREMENT,
  `date_demande` date NOT NULL,
  `description_demande` varchar(255) NOT NULL,
  `montant_propose` decimal(15,2) NOT NULL,
  `statut` varchar(50) NOT NULL,
  `id_artisan` int NOT NULL,
  `id_client` int NOT NULL,
  PRIMARY KEY (`id_devis`),
  KEY `id_artisan` (`id_artisan`),
  KEY `id_client` (`id_client`),
  CONSTRAINT `devis_ibfk_1` FOREIGN KEY (`id_artisan`) REFERENCES `artisans` (`id_artisan`),
  CONSTRAINT `devis_ibfk_2` FOREIGN KEY (`id_client`) REFERENCES `client` (`id_client`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `prestations`


DROP TABLE IF EXISTS `prestations`;

CREATE TABLE `prestations` (
  `id_prestation` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `tarif` decimal(15,2) NOT NULL,
  `duree_estimee` int NOT NULL,
  `actif` tinyint(1) DEFAULT NULL,
  `id_artisan` int NOT NULL,
  PRIMARY KEY (`id_prestation`),
  KEY `id_artisan` (`id_artisan`),
  CONSTRAINT `prestations_ibfk_1` FOREIGN KEY (`id_artisan`) REFERENCES `artisans` (`id_artisan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `rendez_vous`


DROP TABLE IF EXISTS `rendez_vous`;

CREATE TABLE `rendez_vous` (
  `id_rdv` int NOT NULL AUTO_INCREMENT,
  `date_heure_debut` datetime NOT NULL,
  `date_heure_fin` datetime NOT NULL,
  `statut` varchar(50) NOT NULL,
  `remarque` varchar(255) NOT NULL,
  `id_artisan` int NOT NULL,
  `id_client` int NOT NULL,
  PRIMARY KEY (`id_rdv`),
  KEY `id_artisan` (`id_artisan`),
  KEY `id_client` (`id_client`),
  CONSTRAINT `rendez_vous_ibfk_1` FOREIGN KEY (`id_artisan`) REFERENCES `artisans` (`id_artisan`),
  CONSTRAINT `rendez_vous_ibfk_2` FOREIGN KEY (`id_client`) REFERENCES `client` (`id_client`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `utilisateurs`


DROP TABLE IF EXISTS `utilisateurs`;

CREATE TABLE `utilisateurs` (
  `Id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `telephone` varchar(15) DEFAULT NULL,
  `date_creation` datetime NOT NULL,
  `role` varchar(50) NOT NULL,
  PRIMARY KEY (`Id_utilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `prestations` (`libelle`, `description`, `tarif`, `duree_estimee`, `actif`, `id_artisan`)
VALUES 
('Coupe femme & brushing', 'Shampoing traitant, coupe personnalisée et brushing soigné.', 42.00, 45, 1, 2),
('Coloration complète', 'Couleur éclatante sans ammoniaque et soin nourrissant.', 65.00, 90, 1, 2),
('Coupe homme classique', 'Shampoing, coupe ciseaux/tondeuse et coiffage.', 25.00, 30, 1, 2);
-- Prestations pour Thomas (id_artisan = 3, Plomberie)
INSERT INTO `prestations` (`libelle`, `description`, `tarif`, `duree_estimee`, `actif`, `id_artisan`)
VALUES 
('Dépannage & Recherche de fuite', 'Diagnostic complet et réparation immédiate avec déplacement inclus.', 89.00, 60, 1, 3),
('Remplacement robinetterie', 'Démontage de l\'ancien équipement et pose d\'un mitigeur neuf.', 120.00, 60, 1, 3);
-- Prestations pour Alexandre (id_artisan = 4, Électricité)
INSERT INTO `prestations` (`libelle`, `description`, `tarif`, `duree_estimee`, `actif`, `id_artisan`)
VALUES 
('Diagnostic électrique & sécurité', 'Contrôle complet du tableau électrique et des prises.', 95.00, 60, 1, 4),
('Pose de tableau électrique aux normes', 'Remplacement complet d\'un ancien tableau par un modèle modulaire.', 450.00, 180, 1, 4);