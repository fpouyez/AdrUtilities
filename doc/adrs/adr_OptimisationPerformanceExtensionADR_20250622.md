# Optimisation des performances de l'extension ADR Utilities

* **Statut** : Accepte
* **Décideurs** : F. Pouyez
* **Date de la décision** : 22/06/2025
* **Catégories** : Performance; Architecture; Extension VS Code

## Contexte et Problématique

L'extension ADR Utilities utilisait initialement une activation globale (`"activationEvents": ["*"]`) qui chargeait l'extension au démarrage de VS Code et traitait tous les types de fichiers pour les CodeLens. Cette approche générait des problèmes de performance significatifs :

* Chargement inutile de l'extension au démarrage
* Calculs de CodeLens sur tous les types de fichiers (nécessaire pour transformer les commentaires en liens)
* Absence de cache pour éviter les recalculs
* Traitement de fichiers sans références ADR

## Décision Prise

Implémentation d'une stratégie d'optimisation multi-niveaux :

1. **Activation lazy** : Remplacement de `"*"` par des événements spécifiques

   * `onCommand:adrutilities.*` pour l'activation lors de l'exécution des commandes
   * Suppression de l'activation automatique sur tous les types de fichiers

2. **CodeLens sur tous les types de fichiers** : Maintien de l'enregistrement du provider sur `"*"` car les CodeLens doivent transformer les commentaires dans le code (TypeScript, JavaScript, etc.) en liens vers les fichiers ADR Markdown

3. **Système de cache intelligent** : Mise en cache des résultats CodeLens par document avec nettoyage automatique

4. **Configuration flexible** : Nouvelle option `enableCodeLensOnStartup` (désactivée par défaut) pour permettre l'activation manuelle

## Avantages et impacts positifs

* **Démarrage plus rapide** : L'extension ne se charge plus automatiquement au démarrage de VS Code
* **Cache efficace** : Évite les recalculs pour les documents inchangés
* **Contrôle utilisateur** : Possibilité de désactiver les CodeLens au démarrage pour de meilleures performances
* **Mémoire optimisée** : Nettoyage automatique du cache pour éviter les fuites mémoire
* **Expérience utilisateur améliorée** : Activation manuelle des CodeLens quand nécessaire
* **Fonctionnalité préservée** : Les CodeLens continuent de transformer les commentaires dans tous les types de fichiers en liens vers les ADR

## Inconvénients et impacts négatifs

* **Complexité accrue** : Gestion dynamique de l'enregistrement du CodeLensProvider
* **Configuration supplémentaire** : Nouvelle option à comprendre pour les utilisateurs
* **Activation manuelle** : Les utilisateurs doivent activer les CodeLens s'ils en ont besoin immédiatement
* **Cache à maintenir** : Logique de nettoyage du cache à surveiller

## Autres options envisagées

* **Activation sur workspace** : Activer uniquement quand un workspace contient des ADR (complexe à détecter)
* **Provider conditionnel** : Enregistrer/désenregistrer dynamiquement le provider (non supporté par VS Code)
* **Cache persistant** : Sauvegarder le cache entre les sessions (complexité et risque de corruption)

## Liens Utiles

* Analyse technique : Optimisation des performances des extensions VS Code
* Références Web : Documentation VS Code Extension API - Activation Events
* Implémentation : Code source dans `src/extension.ts` et `src/adr-codelens-navigation-provider.ts` 