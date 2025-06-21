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
