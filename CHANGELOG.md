## [1.5.3](https://github.com/fpouyez/AdrUtilities/compare/v1.5.2...v1.5.3) (2026-07-20)


### Bug Fixes

* **deps:** fix vscode version offset ([b4ae000](https://github.com/fpouyez/AdrUtilities/commit/b4ae0004f47277c076f97a9cc13e20a7865ff93a))

## [1.5.2](https://github.com/fpouyez/AdrUtilities/compare/v1.5.1...v1.5.2) (2026-07-20)


### Bug Fixes

* remove the whitespace character in codelens detection ([5096cea](https://github.com/fpouyez/AdrUtilities/commit/5096cead0620d3d0ddb265d7b286f136818827cc))

## [1.5.1](https://github.com/fpouyez/AdrUtilities/compare/v1.5.0...v1.5.1) (2025-08-07)


### Bug Fixes

* autoCreateFolder setting correction. ([d631ea6](https://github.com/fpouyez/AdrUtilities/commit/d631ea6b1f8537a58bbc103dab3532b3d8d2f1d7))

# [1.5.0](https://github.com/fpouyez/AdrUtilities/compare/v1.4.7...v1.5.0) (2025-08-06)


### Bug Fixes

* Correction de la compatibilité Windows pour la création d'ADR ([59a04a8](https://github.com/fpouyez/AdrUtilities/commit/59a04a81d1ca9d573ab160cc4c2debffe1f20e93))
* Correction de la normaization des chemins (windows) ([f224c19](https://github.com/fpouyez/AdrUtilities/commit/f224c19e9e7a94b592b6b66a9b2bc4b9290d6a2a))


### Features

* Add optional ADR directory management ([23f5f58](https://github.com/fpouyez/AdrUtilities/commit/23f5f58dfdccafc88e678f28f3bb40310d7391d9)), closes [#137](https://github.com/fpouyez/AdrUtilities/issues/137)

## [1.4.7](https://github.com/fpouyez/AdrUtilities/compare/v1.4.6...v1.4.7) (2025-08-04)


### Bug Fixes

* force new release version ([07f6e41](https://github.com/fpouyez/AdrUtilities/commit/07f6e41589fb3a662cdd9d0924a49c7533a51f75))

## [1.4.6](https://github.com/fpouyez/AdrUtilities/compare/v1.4.5...v1.4.6) (2025-08-04)


### Bug Fixes

* update @octokit/request to latest version to resolve deprecated API warning ([6609501](https://github.com/fpouyez/AdrUtilities/commit/66095015feaeae546bfa39798053f6dcee01df12))
* update engines.vscode to ^1.101.0 to match @types/vscode version ([37d2e1a](https://github.com/fpouyez/AdrUtilities/commit/37d2e1af5bd75ec956f662ecf2092062e7d47b62))

## [1.4.5](https://github.com/fpouyez/AdrUtilities/compare/v1.4.4...v1.4.5) (2025-08-04)


### Bug Fixes

* update TypeScript target to ES2022 for @types/node 24.1.0 compatibility ([0ca6914](https://github.com/fpouyez/AdrUtilities/commit/0ca69141f26c4663a3febbe570e859494b08ef7d))

## [1.4.4](https://github.com/fpouyez/AdrUtilities/compare/v1.4.3...v1.4.4) (2025-07-04)


### Bug Fixes

* enable codelens after init and simplify configuration ([1ccfb90](https://github.com/fpouyez/AdrUtilities/commit/1ccfb9053c8b03b5d08f0366ec3b2dc905b21d38))

## [1.4.3](https://github.com/fpouyez/AdrUtilities/compare/v1.4.2...v1.4.3) (2025-07-04)


### Bug Fixes

* Tempo dans le workflow CI pour synchro GIT ([71aa3e8](https://github.com/fpouyez/AdrUtilities/commit/71aa3e8c8f08e9a3f6c27d411fe6367b31543fde))

## [1.4.2](https://github.com/fpouyez/AdrUtilities/compare/v1.4.1...v1.4.2) (2025-07-04)


### Bug Fixes

* Essai pour supprimer le décalage de version dans le publish... ([1feceb1](https://github.com/fpouyez/AdrUtilities/commit/1feceb18091e44b260f99ee75781dd9d4c920ae6))

## [1.4.1](https://github.com/fpouyez/AdrUtilities/compare/v1.4.0...v1.4.1) (2025-07-04)


### Bug Fixes

* patch de la pipeline ([574eae8](https://github.com/fpouyez/AdrUtilities/commit/574eae8c94571bc4781488d47e0477e23bb936af))

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
