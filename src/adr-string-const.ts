export const adrChooseDirectoryBoxTitle = 'Parent directory';
export const adrNameInputBoxTitle = 'ADR Short title';
export const adrNameInputBoxPlaceHolder = 'MySuperADR';
export const defaultTemplateFrench = `# Titre de l'ADR

* **Statut** : [Brouillon/En attente/Accepte/Obsolete]
* **Décideurs** :  [Listes des personnes ayant construit et/ou validé l'ADR]
* **Date de la décision** :  JJ/MM/AAAA
* **Catégories** : [Liste des catégories séparées par des ;]

## Contexte et Problématique

*Une description concise du contexte et de la problèmatique à résoudre, en quelques lignes.*

## Décision Prise

*La solution retenue.*

## Avantages et impacts positifs

* *Avantage 1*
* *Avantage 2*

## Inconvénients et impacts négatifs

* *Inconvénient 1*
* *Inconvénient 2*

## Autres options envisagées

* Cette partie est **optionnelle**, dépendante du contexte. *

## Liens Utiles

* Analyse technique : ...
* OneNote de dossier : ...
* Références Web : ...
`;

export const defaultTemplateEnglish = `# Title of the ADR

* **Status** : [WorkInProgress/Pending/Accepted/Deprecated]
* **Decision Makers** :  [List of persons who have built and/or validated this ADR]
* **Decision Date** :  DD/MM/YYYY
* **Categories** : [List of categories separated by ;]

## Background and Issues

*A concise description of the context and problem to be solved, in a few lines.*

## Decision

*The chosen solution.*

## Advantages and Positive Impacts

* *Advantage 1*
* *Advantage 2*

## Disadvantages and Negative Impacts

* *Disadvantage 1*
* *Disadvantage 2*

## Other Options

* This is an **optionnal** part, dependent on context. *

## Useful Links

* Link 1 : ...
* Link 2 : ...
`;

export const madrTemplateEnglish = `---
title: "{Short title representing the problem solved and the solution found}"
status: proposed
date: YYYY-MM-DD
decision-makers: [List of people involved in the decision]
consulted: [List of people whose opinions are sought]
informed: [List of people kept informed of progress]
---

# {Short title representing the problem solved and the solution found}

## Context and Problem Statement

{Describe the context and the problem statement, for example in free form using two or three sentences or as an illustrative story. You may want to articulate the problem as a question and add links to collaboration boards or incident management systems.}

## Decision Drivers

* {decision driver 1, e.g., a force, a concern, ...}
* {decision driver 2, e.g., a force, a concern, ...}
* ... <!-- the number of drivers can vary -->

## Considered Options

* {option 1 title}
* {option 2 title}
* {option 3 title}
* ... <!-- the number of options can vary -->

## Decision Outcome

Chosen option: "{option 1 title}", because {justification, e.g., only option that meets the knockout decision driver | addresses the force {force} | ... | scores best (see below)}.

### Consequences

* Good, because {positive consequence, e.g., improves one or more desired qualities, ...}
* Bad, because {negative consequence, e.g., impairs one or more desired qualities, ...}
* ... <!-- the number of consequences can vary -->

## Pros and Cons of the Options

### {option 1 title}

* Good, because {argument a}
* Good, because {argument b}
* Neutral, because {argument c} <!-- use "neutral" if the given argument is neither positive nor negative -->
* Bad, because {argument d}

### {option 2 title}

* Good, because {argument a}
* Good, because {argument b}
* Neutral, because {argument c}
* Bad, because {argument d}

### {option 3 title}

* Good, because {argument a}
* Good, because {argument b}
* Neutral, because {argument c}
* Bad, because {argument d}
`;

export const madrTemplateFrench = `---
title: "{titre court représentatif du problème résolu et de la solution trouvée}"
status: proposed
date: YYYY-MM-DD
decision-makers: [Liste des personnes impliquées dans la décision]
consulted: [Liste des personnes dont les avis sont sollicités]
informed: [Liste des personnes tenues informées du progrès]
---

# {titre court représentatif du problème résolu et de la solution trouvée}

## Contexte et Problématique

{Décrivez le contexte et l'énoncé du problème, par exemple sous forme libre en utilisant deux à trois phrases ou sous forme d'une histoire illustrative. Vous pouvez vouloir articuler le problème sous forme de question et ajouter des liens vers des tableaux de collaboration ou des systèmes de gestion d'incidents.}

## Facteurs de Décision

* {facteur de décision 1, par exemple, une force, une préoccupation, ...}
* {facteur de décision 2, par exemple, une force, une préoccupation, ...}
* ... <!-- le nombre de facteurs peut varier -->

## Options Envisagées

* {titre de l'option 1}
* {titre de l'option 2}
* {titre de l'option 3}
* ... <!-- le nombre d'options peut varier -->

## Décision Prise

Option choisie : "{titre de l'option 1}", car {justification, par exemple, seule option qui répond au critère k.o. facteur de décision | qui résout la force {force} | ... | sort le mieux (voir ci-dessous)}.

### Conséquences

* Bon, car {conséquence positive, par exemple, amélioration d'une ou plusieurs qualités désirées, ...}
* Mauvais, car {conséquence négative, par exemple, compromission d'une ou plusieurs qualités désirées, ...}
* ... <!-- le nombre de conséquences peut varier -->

## Avantages et Inconvénients des Options

### {titre de l'option 1}

* Bon, car {argument a}
* Bon, car {argument b}
* Neutre, car {argument c} <!-- utilisez "neutre" si l'argument donné ne pèse ni pour le bien ni pour le mal -->
* Mauvais, car {argument d}

### {titre de l'option 2}

* Bon, car {argument a}
* Bon, car {argument b}
* Neutre, car {argument c}
* Mauvais, car {argument d}

### {titre de l'option 3}

* Bon, car {argument a}
* Bon, car {argument b}
* Neutre, car {argument c}
* Mauvais, car {argument d}
`;
