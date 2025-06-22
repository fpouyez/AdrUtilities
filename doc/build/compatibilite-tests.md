# Compatibilité des tests unitaires et d'intégration

## Plateformes visées

- **Windows**
- **MacOS**
- **Linux**

## Points de compatibilité assurée

- **Chemins de fichiers** :
  - Les tests utilisent des URI de type `file:///...` pour simuler les documents VS Code.
  - Aucun test n'utilise de séparateur système (`/` ou `\`) dans les chemins de fichiers réels.
  - Les contenus de fichiers simulés (ex : `// adr_test_20241220.md`) sont agnostiques du système.
- **API VS Code** :
  - Les mocks de document respectent l'interface attendue par VS Code (`getText`, `lineAt`, `positionAt`, etc.).
  - Les chemins sont toujours passés sous forme d'URI, ce qui garantit la compatibilité multiplateforme.
- **Pas d'accès disque** :
  - Les tests n'écrivent ni ne lisent de fichiers réels sur le disque, évitant ainsi les problèmes de permission ou de format de chemin.

## Bonnes pratiques à respecter pour la compatibilité

- Toujours utiliser des URI (`file:///...`) pour simuler les chemins de fichiers dans les tests.
- Si un test doit manipuler le système de fichiers réel, utiliser `path.join` et `path.sep` pour composer les chemins.
- Ne jamais supposer un format de chemin spécifique à un OS dans les assertions.
- Vérifier que les mocks de document respectent bien l'API VS Code attendue.

## À surveiller lors de futures évolutions

- Si des tests manipulent des fichiers réels, ajouter des cas pour Windows (`C:\...`), MacOS (`/Users/...`) et Linux (`/home/...`).
- Tester les chemins relatifs et absolus sur chaque OS si besoin.
- Documenter toute dépendance à un format de chemin dans ce fichier.

---

**Résumé** :
Les tests actuels sont compatibles Windows, MacOS et Linux grâce à l'utilisation systématique d'URI et de mocks VS Code. Pour toute évolution, se référer à ce document pour garantir la portabilité des tests. 