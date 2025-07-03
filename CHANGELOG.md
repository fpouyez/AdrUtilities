# [1.4.0](https://github.com/fpouyez/AdrUtilities/compare/v1.3.0...v1.4.0) (2025-07-03)


### Bug Fixes

* preview in a temporary window ([d907c23](https://github.com/fpouyez/AdrUtilities/commit/d907c23066f1889488fa7f23b3c9bc22f7860b98))


### Features

* add a template previewing ([b261fb4](https://github.com/fpouyez/AdrUtilities/commit/b261fb44d657c4122565f2f16b7e9fd4cbcad4c3))

# [1.3.0](https://github.com/fpouyez/AdrUtilities/compare/v1.2.1...v1.3.0) (2025-07-03)


### Features

* ajout du template MADR en anglais et en français, mise à jour de la doc et exemples ([2721333](https://github.com/fpouyez/AdrUtilities/commit/2721333b1c78ce25f73e08d3f48eb3e49224f103))
* message d'avertissement et fallback automatique lors de la sélection d'un template ADR inconnu ([edde67b](https://github.com/fpouyez/AdrUtilities/commit/edde67bb2cb3e5b6a8cafebb152cfb1838d3d785))
* support du template ADR personnalisé via la configuration customTemplatePath ([6bfa584](https://github.com/fpouyez/AdrUtilities/commit/6bfa584f7d947f49e2fdb9bdda36a7a02998b991))

## [1.2.1](https://github.com/fpouyez/AdrUtilities/compare/v1.2.0...v1.2.1) (2025-06-22)


### Bug Fixes

* ignored files cleaning and publication ([ffb6522](https://github.com/fpouyez/AdrUtilities/commit/ffb652223145529bd1e2f33a03fbd82269320300))

# [1.2.0](https://github.com/fpouyez/AdrUtilities/compare/v1.1.2...v1.2.0) (2025-06-22)


### Features

* enable or disable codelens for performance considerations + list correction. ([3e3d0ed](https://github.com/fpouyez/AdrUtilities/commit/3e3d0ed2c39a41badb24e95271a6962514afde3b))


### Performance Improvements

* optimisations majeures de performance avec activation lazy et cache intelligent ([7aba9cc](https://github.com/fpouyez/AdrUtilities/commit/7aba9cc0c270eeb52c9fa15e0d2572a0722cddf5))

## [1.1.2](https://github.com/fpouyez/AdrUtilities/compare/v1.1.1...v1.1.2) (2025-06-21)


### Bug Fixes

* get package number from last tag ([18da834](https://github.com/fpouyez/AdrUtilities/commit/18da83492aa120a2ee2390bf5c2409233f866adf))

## [1.1.1](https://github.com/fpouyez/AdrUtilities/compare/v1.1.0...v1.1.1) (2025-06-21)


### Bug Fixes

* extension packaging ([5d5a64c](https://github.com/fpouyez/AdrUtilities/commit/5d5a64c61b57c91ab8c704181bfdd08b674243e1))

# Change Log

## [1.1.0] - 2024-01-XX

### 🔒 Sécurité
- **Nouveau** : Module `SecurityValidator` pour centraliser toutes les validations de sécurité
- **Correction** : Protection contre les injections de chemin (Path Traversal)
- **Correction** : Protection contre les injections d'expressions régulières (Regex Injection)
- **Correction** : Validation stricte de toutes les entrées utilisateur
- **Correction** : Protection contre les attaques par déni de service (DoS)
- **Correction** : Gestion d'erreurs robuste avec try-catch sur toutes les opérations critiques

### 🧪 Tests
- **Nouveau** : Tests unitaires complets pour le module `SecurityValidator`
- **Nouveau** : Tests de sécurité pour les cas d'injection et de validation
- **Amélioration** : Tests existants adaptés aux nouvelles validations de sécurité
- **Nouveau** : Tests pour la gestion d'erreurs et les cas limites

### 📚 Documentation
- **Nouveau** : Fichier `SECURITY.md` détaillant toutes les mesures de sécurité
- **Amélioration** : README mis à jour avec section sécurité
- **Amélioration** : Documentation JSDoc sur toutes les fonctions publiques

### 🔧 Améliorations techniques
- **Amélioration** : Validation des chemins de fichiers avec vérification de l'espace de travail
- **Amélioration** : Échappement automatique des caractères spéciaux dans les regex
- **Amélioration** : Limitation du nombre de fichiers retournés (1000 max)
- **Amélioration** : Limitation du nombre de correspondances regex (1000 max)
- **Amélioration** : Messages d'erreur informatifs pour l'utilisateur
- **Amélioration** : Logging sécurisé sans informations sensibles

## [1.0.0]

* Initial release.

## [0.1.5]

Fix :

* Update dependencies.


## [0.1.4]

Fix :

* Update dependencies.

## [0.1.3]

Features :

* An english version of the ADR template is available, with a config entry to choose the used template.

Fix :

* Correct another filepath issue on Windows.

## [0.1.2]

Fix :

* Correct filepaths management using vscode.Uri only (remove node os package).

## [0.1.1]

Fix :

* Correct filepaths generations for Windows OS

## [0.1]

* Initial release

Features :

* Add a "Create ADR" function by right-click in Explorer or by Command Palette.
  * This function doesn't take the current workspace in account yet.
  * Created ADR is fullfilled with a french default template.
* Add a codelens research : each mention of ADR (which match the naming pattern) enable a codelens link to navigate to this ADR.
