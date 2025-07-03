# Support du format MADR dans l'extension ADR Utilities

* **Statut** : Accepté
* **Décideurs** :  [F. Pouyez]
* **Date de la décision** :  27/01/2025
* **Catégories** : [Standardisation ; Compatibilité ; Documentation]

## Contexte et Problématique

L'extension ADR Utilities permettait initialement de créer des ADR via deux templates internes personnalisés (français et anglais). Cependant, le format MADR (Markdown Architecture Decision Records) est devenu un standard largement adopté pour la documentation des décisions architecturales, facilitant l'automatisation et l'intégration avec d'autres outils grâce à ses métadonnées YAML et sa structure standardisée.

## Décision Prise

Ajouter le support du format MADR comme troisième template optionnel dans l'extension ADR Utilities, tout en conservant les templates existants pour la compatibilité. Le template MADR respecte la spécification MADR 4.0.0 et est disponible en anglais et en français.

## Avantages et impacts positifs

* Standardisation : Alignement avec les standards de l'industrie pour une meilleure adoption
* Interopérabilité : Compatibilité avec les outils qui supportent le format MADR
* Automatisation : Possibilité d'utiliser des outils de parsing YAML pour extraire les métadonnées
* Flexibilité : Les utilisateurs peuvent choisir entre les templates personnalisés et le standard MADR
* Évolutivité : Base solide pour ajouter d'autres formats standards à l'avenir

## Inconvénients et impacts négatifs

* Complexité accrue : Trois templates à maintenir au lieu de deux
* Courbe d'apprentissage : Les utilisateurs doivent comprendre les différences entre les formats
* Validation : Nécessité de valider la syntaxe YAML dans le template MADR

## Autres options envisagées

* Remplacement complet : Remplacer les templates existants par MADR uniquement. Rejeté car cela casserait la compatibilité avec les projets existants.
* Template hybride : Créer un template qui combine les avantages des deux formats. Rejeté car cela créerait un format non-standard.
* Plugin externe : Créer une extension séparée pour le support MADR. Rejeté car cela fragmenterait l'écosystème.

## Liens Utiles

* [Spécification MADR](https://adr.github.io/madr/)
* [Guide des ADR](https://adr.github.io/)
* [Documentation VS Code Extension API](https://code.visualstudio.com/api) 