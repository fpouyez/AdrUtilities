# Gestion optionnelle des répertoires ADR dans l'extension ADR Utilities

* **Statut** : Accepté
* **Décideurs** : F. Pouyez
* **Date de la décision** : 05/08/2025
* **Catégories** : Flexibilité ; Configuration ; Expérience utilisateur

## Contexte et Problématique

L'extension ADR Utilities créait systématiquement un sous-répertoire ADR (par défaut `adr/`) lors de la création de nouveaux documents ADR. Cette approche, bien qu'organisée, ne convenait pas à tous les utilisateurs et projets :

* Certains projets préfèrent organiser leurs ADR directement dans le répertoire courant
* Des projets existants n'utilisent pas de sous-répertoire ADR dédié
* Les utilisateurs souhaitent plus de flexibilité dans l'organisation de leurs documents
* Le comportement actuel est trop rigide et ne s'adapte pas aux différentes pratiques de documentation

## Décision Prise

Ajouter une nouvelle option de configuration `adr.autoCreateFolder` pour contrôler la création automatique du sous-répertoire ADR :

```json
{
  "adr.autoCreateFolder": {
    "type": "boolean",
    "default": true,
    "description": "Automatically create an 'adr' folder when creating new ADR documents"
  }
}
```

**Comportements selon la configuration :**

* `autoCreateFolder: true` (défaut) : Création dans le sous-répertoire ADR (comportement actuel)
* `autoCreateFolder: false` : Création directe dans le répertoire courant
* `autoCreateFolder: undefined` : Comportement par défaut (création directe)

**Logique de placement :**

1. Si `autoCreateFolder: false` → Création directe dans le répertoire courant
2. Si `autoCreateFolder: true` et répertoire courant = répertoire ADR → Création dans le répertoire courant
3. Si `autoCreateFolder: true` et répertoire courant ≠ répertoire ADR → Création dans le sous-répertoire ADR

## Avantages et impacts positifs

* **Flexibilité maximale** : Les utilisateurs peuvent choisir leur organisation préférée
* **Rétrocompatibilité** : Le comportement par défaut (`true`) préserve l'expérience actuelle
* **Adaptabilité** : Support des projets existants qui n'utilisent pas de sous-répertoire ADR
* **Simplicité** : Option booléenne simple à comprendre et configurer
* **Validation maintenue** : Tous les contrôles de sécurité sont préservés
* **Compatibilité multiplateforme** : Fonctionne sur Windows, Linux et MacOS
* **Support des répertoires personnalisés** : Compatible avec `adrDirectoryName` personnalisé

## Inconvénients et impacts négatifs

* **Complexité de configuration** : Nouvelle option à comprendre pour les utilisateurs
* **Logique conditionnelle** : Code plus complexe pour gérer les différents cas
* **Tests étendus** : Nécessité de tester tous les scénarios de configuration
* **Documentation** : Mise à jour de la documentation utilisateur requise
* **Support** : Questions potentielles des utilisateurs sur la configuration

## Autres options envisagées

* **Configuration par projet** : Fichier de configuration local dans chaque projet. Rejeté car cela ajouterait de la complexité pour les utilisateurs.
* **Détection automatique** : Détecter automatiquement si un répertoire ADR existe. Rejeté car cela pourrait créer des comportements inattendus.
* **Interface utilisateur** : Choix lors de la création de chaque ADR. Rejeté car cela ralentirait le processus de création.
* **Suppression complète** : Supprimer la création automatique de sous-répertoires. Rejeté car cela casserait la compatibilité avec les projets existants.

## Implémentation technique

### Modifications requises

1. **Configuration** : Ajout de l'option `adr.autoCreateFolder` dans `package.json`
2. **Logique de création** : Modification de `src/command-create.ts` pour gérer la nouvelle option
3. **Validation** : Maintien des validations de sécurité dans `src/security-validator.ts`
4. **Tests** : Batterie complète de tests dans `src/test/suite/command-create.test.ts`

### Scénarios de test couverts

* `autoCreateFolder: true` → Création dans le sous-répertoire ADR
* `autoCreateFolder: false` → Création directe dans le répertoire courant
* `autoCreateFolder: undefined` → Comportement par défaut
* Compatibilité Windows/Linux avec les deux modes
* Validation des noms de répertoires personnalisés
* Gestion des répertoires ADR existants

### Validation de sécurité

* Maintien de tous les contrôles de sécurité existants
* Validation des chemins de fichiers
* Protection contre les traversées de répertoire
* Limitation de longueur des chemins
* Validation des noms de répertoires

## Liens Utiles

* [Documentation VS Code Extension Configuration](https://code.visualstudio.com/api/references/contribution-points#Configuration)
* [Tests de la fonctionnalité](../src/test/suite/command-create.test.ts)
* [Configuration de l'extension](../package.json) 