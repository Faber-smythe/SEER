# NATURE DU PROJET :
### Projet personnel, construit avec Symfony 4 et React.js ; il s'agit d'une interface type "pinboard", initialement destinée aux maîtres de jeu, pour la gestion d'une partie de jeu de rôle sur table.
### Ce projet a fait l'objet d'une évaluation par mon école (IIM - Paris) dans le cadre de mon admission en A3 au terme d'une année de césure.

# Installation

## Prérequis
### Utiliser PHP  7.1
### Avoir installé Composer
### Avoir installé Node.js
## Etapes
### > Git clone
### > Configurer le .env
### > composer install puis npm install pour télécharger les dépendances
### > Lancer le serveur via 
```
$ php bin/console server:run
```
#### (Attention, certains anti-virus peuvent entrer en conflit avec le serveur local)
### > Dans une autre console, mettre en route la compilation automatique via : 
```
$ yarn run encore dev--watch
```
### > Ouvrir une page sur le port 8000
