USE infintime;

-- Jeu de demonstration, optionnel : bdd.sql n'a pas besoin de ce fichier.
-- Aucun id_artisan en dur, chaque prestation est rattachee au compte artisan
-- qui exerce ce metier ; si personne n'exerce ce metier la ligne est ignoree,
-- et si la prestation existe deja elle n'est pas dupliquee.

INSERT INTO `prestations` (`libelle`, `description`, `tarif`, `duree_estimee`, `actif`, `id_artisan`)
SELECT `d`.`libelle`, `d`.`description`, `d`.`tarif`, `d`.`duree_estimee`, `d`.`actif`, `a`.`id_artisan`
FROM (
  SELECT 'Coupe femme & brushing' AS `libelle`,
         'Shampoing traitant, coupe personnalisée et brushing soigné.' AS `description`,
         42.00 AS `tarif`, 45 AS `duree_estimee`, 1 AS `actif`,
         'coiffure' AS `metier`
  UNION ALL SELECT 'Coloration complète',
         'Couleur éclatante sans ammoniaque et soin nourrissant.',
         65.00, 90, 1, 'coiffure'
  UNION ALL SELECT 'Coupe homme classique',
         'Shampoing, coupe ciseaux/tondeuse et coiffage.',
         25.00, 30, 1, 'coiffure'
  UNION ALL SELECT 'Dépannage & Recherche de fuite',
         'Diagnostic complet et réparation immédiate avec déplacement inclus.',
         89.00, 60, 1, 'plomberie'
  UNION ALL SELECT 'Remplacement robinetterie',
         'Démontage de l''ancien équipement et pose d''un mitigeur neuf.',
         120.00, 60, 1, 'plomberie'
  UNION ALL SELECT 'Diagnostic électrique & sécurité',
         'Contrôle complet du tableau électrique et des prises.',
         95.00, 60, 1, 'electricite'
  UNION ALL SELECT 'Pose de tableau électrique aux normes',
         'Remplacement complet d''un ancien tableau par un modèle modulaire.',
         450.00, 180, 1, 'electricite'
) AS `d`
JOIN (
  SELECT MIN(`id_artisan`) AS `id_artisan`, `metier`
  FROM `artisans`
  GROUP BY `metier`
) AS `a` ON `a`.`metier` = `d`.`metier`
WHERE NOT EXISTS (
  SELECT 1 FROM `prestations` AS `p`
  WHERE `p`.`id_artisan` = `a`.`id_artisan` AND `p`.`libelle` = `d`.`libelle`
);
