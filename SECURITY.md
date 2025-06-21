# Documentation de Sécurité - ADR Utilities

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans l'extension ADR Utilities pour VS Code.

## Vulnérabilités corrigées

### 1. Injection de chemin (Path Traversal)

**Problème** : Les entrées utilisateur n'étaient pas validées, permettant des attaques de traversée de répertoire.

**Solution** :

- Validation stricte des chemins de fichiers avec `SecurityValidator.validateFilePath()`
- Vérification que tous les chemins sont dans l'espace de travail
- Rejet des chemins contenant des séquences malveillantes (`../../../`, etc.)

**Code** :

```typescript
if (!SecurityValidator.validateFilePath(uri.fsPath)) {
    throw new Error('Chemin de répertoire invalide ou en dehors de l\'espace de travail');
}
```

### 2. Injection d'expressions régulières (Regex Injection)

**Problème** : Les préfixes de configuration n'étaient pas échappés dans les expressions régulières.

**Solution** :

- Échappement automatique des caractères spéciaux avec `SecurityValidator.escapeRegex()`
- Validation des préfixes avant utilisation
- Fallback vers un préfixe sécurisé par défaut

**Code** :

```typescript
const escapedPrefix = SecurityValidator.escapeRegex(prefix);
return new RegExp(".?" + escapedPrefix + ".+.md", "g");
```

### 3. Validation des entrées utilisateur

**Problème** : Les titres d'ADR n'étaient pas validés, permettant des injections de code.

**Solution** :

- Validation stricte des titres avec `SecurityValidator.validateAdrTitle()`
- Nettoyage automatique des entrées avec `SecurityValidator.sanitizeAdrTitle()`
- Limitation de la longueur des entrées (1-100 caractères)
- Rejet des caractères spéciaux dangereux

**Code** :

```typescript
const safePattern = /^[a-zA-Z0-9\s_-]+$/;
return safePattern.test(title) && title.length >= 1 && title.length <= 100;
```

### 4. Attaques par déni de service (DoS)

**Problème** : Pas de limitation sur le nombre de fichiers ou de correspondances regex.

**Solution** :

- Limitation du nombre de fichiers retournés (1000 max)
- Limitation du nombre de correspondances regex (1000 max)
- Limitation de la longueur des textes extraits (200 caractères max)

**Code** :

```typescript
const maxMatches = 1000;
let matchCount = 0;
while ((matches = regex.exec(text)) !== null && matchCount < maxMatches) {
    // ...
    matchCount++;
}
```

### 5. Gestion d'erreurs robuste

**Problème** : Les erreurs n'étaient pas gérées, pouvant causer des plantages.

**Solution** :

- Try-catch sur toutes les opérations critiques
- Messages d'erreur informatifs pour l'utilisateur
- Logging des erreurs pour le débogage
- Fallbacks sécurisés en cas d'erreur

## Nouvelles fonctionnalités de sécurité

### Module SecurityValidator

Le module `SecurityValidator` centralise toutes les validations de sécurité :

- `validateAdrTitle()` : Validation des titres d'ADR
- `sanitizeAdrTitle()` : Nettoyage des titres
- `escapeRegex()` : Échappement des expressions régulières
- `validateFilePath()` : Validation des chemins de fichiers
- `validateAdrPrefix()` : Validation des préfixes
- `validateAdrDirectoryName()` : Validation des noms de répertoires
- `generateSecureFileName()` : Génération sécurisée de noms de fichiers

### Tests de sécurité

Des tests unitaires complets couvrent tous les cas de sécurité :

- Tests d'injection (XSS, path traversal, regex injection)
- Tests de validation des entrées
- Tests de gestion d'erreurs
- Tests de limites (DoS protection)
- Tests d'intégration

## Bonnes pratiques implémentées

1. **Principe de moindre privilège** : L'extension ne peut accéder qu'aux fichiers de l'espace de travail
2. **Validation des entrées** : Toutes les entrées utilisateur sont validées et nettoyées
3. **Échappement des sorties** : Les données sont échappées avant utilisation dans des contextes sensibles
4. **Gestion d'erreurs** : Toutes les erreurs sont gérées de manière sécurisée
5. **Logging sécurisé** : Les logs ne contiennent pas d'informations sensibles
6. **Limites de ressources** : Protection contre les attaques par déni de service

## Configuration de sécurité

L'extension utilise des valeurs par défaut sécurisées :

- Préfixe ADR : `adr_` (validé)
- Nom de répertoire : `adr` (validé)
- Limites de longueur : 1-100 caractères pour les titres
- Limites de fichiers : 1000 fichiers maximum

## Tests de sécurité (Exécution)

Pour exécuter les tests de sécurité :

```bash
npm test
```

Les tests couvrent :

- Validation des entrées malveillantes
- Protection contre les injections
- Gestion des erreurs
- Limites de ressources

## Reporting de vulnérabilités

Si vous découvrez une vulnérabilité de sécurité, veuillez :

1. Ne pas la divulguer publiquement
2. Créer une issue privée sur GitHub
3. Fournir des détails sur la vulnérabilité
4. Inclure un exemple de reproduction si possible

## Mise à jour de sécurité

Les mises à jour de sécurité seront publiées avec :

- Un numéro de version patch (ex: 1.0.1)
- Une description des vulnérabilités corrigées
- Des instructions de mise à jour

## Contact

Pour toute question concernant la sécurité de cette extension, contactez l'équipe de développement via GitHub.
