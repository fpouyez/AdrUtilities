# Pipeline de Build et Release - État des lieux

## Vue d'ensemble

La pipeline de build et release d'AdrUtilities est basée sur **GitHub Actions** avec **SemanticRelease** pour la gestion automatique des versions et **vsce** pour la publication de l'extension VS Code.

## Architecture de la pipeline

### Workflows principaux

#### 1. `development.yml` - Tests et développement

- **Déclenchement** : Pull Requests et workflow_call
- **Plateformes** : macOS, Ubuntu, Windows
- **Actions** :
  - Tests unitaires et d'intégration
  - Linting du code
  - Vérifications de sécurité (harden-runner)

#### 2. `release.yml` - Release et publication

- **Déclenchement** : Push sur master, alpha, beta
- **Jobs** :
  - `test` : Réutilisation du workflow development
  - `release` : Génération de version avec SemanticRelease
  - `publish` : Publication de l'extension VS Code

## Configuration SemanticRelease

### Fichier `.releaserc`

```json
{
  "branches": ["master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator", 
    "@semantic-release/changelog",
    "@semantic-release/github",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
}
```

### Règles de versionnement

- **feat:** → Version mineure (1.3.0 → 1.4.0)
- **fix:** → Version patch (1.3.0 → 1.3.1)
- **BREAKING CHANGE:** → Version majeure (1.3.0 → 2.0.0)
- **docs(README):** → Version patch
- **refactor:** → Version patch
- **style:** → Version patch

## Problèmes résolus

### 1. Décalage de version entre SemanticRelease et vsce

**Problème initial :**

```
SemanticRelease: The next release version is 1.4.0
vsce: Publishing 'FredericPouyez.adrutilities v1.3.0'...
Error: v1.3.0 already exists.
```

**Cause :** Le job `publish` n'utilisait pas la version mise à jour par SemanticRelease.

**Solution implémentée :**

- Checkout explicite sur le tag généré par SemanticRelease
- Attente de la disponibilité du tag (jusqu'à 30 secondes)
- Vérification et checkout explicite si nécessaire
- Nettoyage forcé du workspace

### 2. Synchronisation des tags Git

**Problème :** Le job `publish` démarrait avant que le tag soit complètement synchronisé.

**Solution :**

```yaml
- name: Wait for tag to be available
  run: |
    for i in {1..10}; do
      if git rev-parse "v${{ needs.release.outputs.new_tag_version }}" >/dev/null 2>&1; then
        break
      fi
      sleep 3
    done
```

### 3. Vérification de cohérence

**Ajouts de sécurité :**

- Vérification du tag actuel vs tag attendu
- Affichage de la version du package.json
- Vérification du contenu du CHANGELOG.md
- Listing des fichiers dans le tag

## Workflow de release détaillé

### Job `release`

1. **Sécurisation** : harden-runner pour la sécurité
2. **Setup** : Checkout et installation des dépendances
3. **Vérification** : Dry-run pour confirmer qu'une release sera créée
4. **Exécution** : SemanticRelease avec génération automatique de :
   - Tag Git
   - Release GitHub
   - CHANGELOG.md mis à jour
   - package.json versionné

### Job `publish`

1. **Checkout** : Sur le tag généré par SemanticRelease
2. **Synchronisation** : Attente et fetch des tags
3. **Vérification** : Confirmation d'être sur le bon tag
4. **Nettoyage** : Reset hard et clean du workspace
5. **Validation** : Vérification des versions et fichiers
6. **Publication** : vsce publish avec le token d'éditeur

## Sécurité

### Mesures implémentées

- **harden-runner** : Sécurisation des runners GitHub Actions
- **Tokens séparés** :
  - `SEM_RELEASE_PAT` pour SemanticRelease
  - `PUBLISHER_TOKEN` pour vsce
- **Egress policy** : Audit des connexions sortantes

### Bonnes pratiques

- Pas de publication npm (extension privée)
- Vérifications multiples avant publication
- Logs détaillés pour audit

## Monitoring et debugging

### Logs de vérification

Le workflow affiche maintenant :

- Version du package.json
- Contenu du CHANGELOG.md
- Tag actuel vs tag attendu
- Liste des fichiers dans le tag
- Historique Git du tag

### Gestion d'erreurs

- Arrêt immédiat si le tag n'est pas trouvé
- Messages d'erreur explicites
- Tentatives multiples avec délais

## Historique des versions récentes

| Version | Date | Type | Description |
|---------|------|------|-------------|
| 1.4.3 | 2025-01-27 | Patch | Correction pipeline CI |
| 1.4.2 | 2025-01-27 | Patch | Amélioration synchronisation |
| 1.4.1 | 2025-01-27 | Patch | Correction décalage version |
| 1.4.0 | 2025-01-27 | Minor | Templates MADR + preview |

## Points d'amélioration futurs

### Optimisations possibles

1. **Cache npm** : Réduction du temps de build
2. **Parallélisation** : Tests et lint en parallèle
3. **Notifications** : Slack/Discord sur succès/échec
4. **Rollback** : Procédure de rollback automatique

### Monitoring avancé

1. **Métriques** : Temps de build, taux de succès
2. **Alertes** : Échecs répétés, dérives de performance
3. **Dashboard** : Vue d'ensemble des releases

## Conclusion

La pipeline est maintenant **robuste et fiable** avec :

- ✅ Gestion automatique des versions
- ✅ Synchronisation correcte entre SemanticRelease et vsce
- ✅ Vérifications multiples de sécurité
- ✅ Logs détaillés pour debugging
- ✅ Gestion d'erreurs robuste

Le problème de décalage de version est **complètement résolu** et la pipeline peut être utilisée en production avec confiance.

---

**Dernière mise à jour** : 4 juillet 2025  
**Version du document** : 1.0  
**Responsable** : Équipe de développement AdrUtilities
