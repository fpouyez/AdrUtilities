# Guide de référence rapide - Pipeline de Release

## 🚀 Comment déclencher une release

### Release automatique

1. **Pousser sur master** avec un commit conventionnel :

   ```bash
   git commit -m "feat: nouvelle fonctionnalité"
   git push origin master
   ```

2. **La pipeline se déclenche automatiquement** et :
   - Lance les tests sur 3 plateformes
   - Analyse les commits avec SemanticRelease
   - Crée un tag et une release GitHub
   - Publie l'extension VS Code

### Types de commits pour le versionnement

| Type | Exemple | Impact version |
|------|---------|----------------|
| `feat:` | `feat: ajout template MADR` | Minor (1.3.0 → 1.4.0) |
| `fix:` | `fix: correction bug preview` | Patch (1.3.0 → 1.3.1) |
| `BREAKING CHANGE:` | `feat!: API incompatible` | Major (1.3.0 → 2.0.0) |
| `docs(README):` | `docs(README): mise à jour` | Patch |
| `refactor:` | `refactor: optimisation code` | Patch |
| `style:` | `style: formatage code` | Patch |

## 🔍 Monitoring de la pipeline

### Où voir les logs

1. **GitHub Actions** → Onglet "Actions"
2. **Workflow "Release"** → Voir les jobs `test`, `release`, `publish`

### Points de vérification

- ✅ **Job test** : Tests passent sur toutes les plateformes
- ✅ **Job release** : SemanticRelease génère la version
- ✅ **Job publish** : vsce publie avec la bonne version

### Logs importants à surveiller

```
✅ Tag v1.4.3 is available
✅ Successfully checked out tag v1.4.3
"version": "1.4.3"
✅ Clean checkout completed
```

## 🛠️ Dépannage

### Problème : "version already exists"

**Cause** : Décalage entre SemanticRelease et vsce  
**Solution** : ✅ **Résolu** - Le workflow attend maintenant la synchronisation

### Problème : Tag non trouvé

**Cause** : Synchronisation Git  
**Solution** : ✅ **Résolu** - Attente automatique jusqu'à 30 secondes

### Problème : Tests échouent

**Actions** :

1. Vérifier les logs du job `test`
2. Corriger le code localement
3. Relancer les tests : `npm test`
4. Pousser les corrections

## 📋 Checklist avant release

### Avant de pousser sur master

- [ ] Tests locaux passent : `npm test`
- [ ] Lint OK : `npm run lint`
- [ ] Commit conventionnel : `type: description`
- [ ] Pas de secrets dans le code

### Après push

- [ ] Vérifier GitHub Actions
- [ ] Attendre la publication automatique
- [ ] Vérifier l'extension dans VS Code Marketplace

## 🔧 Configuration locale

### Prérequis

```bash
npm install
npm install -g vsce  # Pour tests locaux
```

### Test local de SemanticRelease

```bash
npx semantic-release --dry-run
```

### Test local de publication

```bash
vsce package  # Crée le .vsix
vsce publish --dry-run  # Test sans publier
```

## 📚 Ressources

- **Documentation complète** : `doc/build/pipeline-release.md`
- **Configuration SemanticRelease** : `.releaserc`
- **Workflows GitHub** : `.github/workflows/`
- **Tests de compatibilité** : `doc/build/compatibilite-tests.md`

## 🆘 Support

### En cas de problème

1. Vérifier les logs GitHub Actions
2. Consulter la documentation complète
3. Vérifier les secrets GitHub (SEM_RELEASE_PAT, PUBLISHER_TOKEN)
4. Contacter l'équipe de développement

---

**Dernière mise à jour** : 27 janvier 2025  
**Version** : 1.0
