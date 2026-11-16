# Utilisation d'une image officielle PHP avec Apache
FROM php:8.2-apache

# Installation des extensions nécessaires (ex: pdo_mysql pour la BDD)
RUN docker-php-ext-install pdo_mysql

# Copie des fichiers du projet dans le serveur web containerisé
COPY . /var/www/html/

# Activation de la réécriture d'URL si besoin (souvent utile en MVC)
RUN a2enmod rewrite