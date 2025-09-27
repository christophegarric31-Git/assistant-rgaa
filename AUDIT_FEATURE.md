# Fonctionnalité d'Audit Automatique RGAA

## Vue d'ensemble

Cette fonctionnalité ajoute un système d'audit automatique à l'extension Assistant RGAA, permettant de vérifier automatiquement la conformité des pages web selon le référentiel RGAA.

## Fonctionnalités

### 1. Bouton "Auditer"
- **Localisation** : Menu principal de l'extension (Header)
- **Fonction** : Lance un audit automatique de tous les critères RGAA
- **Comportement** : 
  - Désactivé pendant l'exécution d'un audit
  - Affiche une barre de progression
  - Traite les tests dans l'ordre croissant du RGAA

### 2. Affichage des résultats
- **Localisation** : Section "Instructions" de chaque test
- **Statuts** :
  - ✅ **OK** : Test conforme (vert)
  - ❌ **FAIL** : Test non conforme (rouge)  
  - ⚠️ **N/A** : Test non applicable (orange)
- **Détails** : Affichage des vérifications individuelles avec messages explicatifs

### 3. Bouton "Exporter"
- **Localisation** : Menu principal (visible uniquement après un audit)
- **Format** : CSV avec colonnes :
  - Thème
  - Code du critère RGAA
  - Libellé (title) du critère
  - Statut
- **Nom de fichier** : `audit-rgaa-YYYY-MM-DD.csv`

### 4. Mention "-- Contrôle IA"
- **Localisation** : Titre des critères contenant le mot "pertinent"
- **Style** : Texte orange italique
- **Objectif** : Indiquer les critères nécessitant une vérification humaine

## Architecture technique

### Composants principaux

1. **AuditEngine** (`src/audit/auditEngine.ts`)
   - Moteur d'audit principal
   - Exécute les vérifications automatiques
   - Gère les différents types de tests

2. **InstructionParser** (`src/audit/instructionParser.ts`)
   - Parse les instructions RGAA
   - Extrait les étapes automatisables
   - Identifie les sélecteurs et attributs à vérifier

3. **Slice d'audit** (`src/panel/slices/audit.ts`)
   - Gestion de l'état Redux
   - Stockage des résultats
   - Sélecteurs pour l'interface

4. **Actions d'audit** (`src/panel/slices/auditActions.ts`)
   - Actions asynchrones pour l'audit complet
   - Export des résultats en CSV

### Types de vérifications automatisables

1. **Présence d'éléments** (`presence`)
   - Vérifie l'existence d'éléments HTML spécifiques
   - Exemple : présence de `<h1>`, `<main>`, `<nav>`

2. **Attributs** (`attribute`)
   - Vérifie la présence et le contenu d'attributs
   - Exemple : `alt`, `aria-label`, `title`, `role`

3. **Contenu** (`content`)
   - Vérifie le contenu textuel des éléments
   - Exemple : contenu non vide, alternatives textuelles

4. **Structure** (`structure`)
   - Vérifie l'organisation hiérarchique
   - Exemple : hiérarchie des titres (h1 → h2 → h3)

5. **Manuel** (`manual`)
   - Étapes nécessitant une intervention humaine
   - Exemple : déterminer si une image est "porteuse d'information"

## Limitations

### Tests non automatisables
- Détermination du contexte sémantique ("porteuse d'information" vs "décorative")
- Évaluation qualitative des alternatives textuelles
- Tests fonctionnels (navigation clavier, comportements dynamiques)
- Vérifications nécessitant une interaction utilisateur

### Cas N/A (Non Applicable)
- Absence des balises HTML concernées par le test
- Instructions ne contenant que des étapes manuelles
- Erreurs lors de l'exécution des vérifications

## Utilisation

1. **Lancer un audit** : Cliquer sur le bouton "Auditer" dans le menu
2. **Suivre la progression** : Observer la barre de progression et le test en cours
3. **Consulter les résultats** : Ouvrir les instructions des tests pour voir les résultats détaillés
4. **Exporter** : Cliquer sur "Exporter" pour télécharger le rapport CSV

## Exemple de résultat

```
Test 1.1.1 - Images avec alternative textuelle
✅ Conforme
Détails des vérifications :
✅ 3 élément(s) trouvé(s) (Sélecteur: img:not(a img, button img))
✅ Tous les attributs sont présents
```

## Développement futur

- Amélioration du parsing des instructions
- Ajout de nouveaux types de vérifications
- Intégration avec des outils externes
- Rapports plus détaillés avec captures d'écran
- Sauvegarde des résultats dans le navigateur

