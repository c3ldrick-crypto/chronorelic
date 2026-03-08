# ChronoRelic — Game Design Inspiration
## Idées directrices — Note de conception

---

## PRINCIPES FONDAMENTAUX

- **Risque / Récompense / Challenge / Frustration** — tout mécanisme doit s'inscrire dans ce triangle
- **WOW Factor** — chaque capture doit être un moment d'excitation
- **Progression progressive** — le jeu devient plus complexe tous les 5-10 niveaux
- **Déployable en ligne** — aucune mécanique ne doit bloquer le cloud deployment

---

## IDÉES REÇUES (vol. 1)

### 1. Unicité des Captures
- **Règle** : On ne peut pas capturer 2 fois la même minute (HH:MM)
- **Exceptions** : capacité de classe, talent spécifique, ou objet crafté le permettant
- **Collection permanente** : une fois capturée, la minute reste à vie dans la collection

### 2. Système de Ressources
- Les minutes capturées doivent rapporter des **ressources** en plus de l'XP
- Ces ressources alimentent une boucle de gameplay secondaire (quand le joueur ne capture pas activement)
- Exemples de ressources envisagées :
  - **Éclats Temporels** (drop standard, basé sur la rareté)
  - **Chronite** (matériau rare, drop sur Épique+)
  - **Essences Historiques** (drop sur minutes avec événement IA)
  - **Fragments d'Anomalie** (drop ultra-rare sur Mythique)

### 3. Mécanique Risque/Récompense sur la Capture
- Capturer une minute doit être un **challenge**, pas un simple clic
- Idées :
  - Fenêtre de temps limitée (ex: 30 secondes pour valider)
  - Mini-jeu de précision (cliquer au bon moment sur une barre)
  - Décision : capturer maintenant (safe) VS attendre (risque de perdre + bonus si réussi)
  - Système de "tension" — plus on attend, plus la récompense potentielle grimpe mais la minute peut "s'échapper"

### 4. Amplifier le WOW Factor
- Animation grandiose sur chaque relique révélée (progression rareté → effets visuels)
- Son + vibration sur mobile sur les captures Épique+
- Narration IA affichée progressivement (typo effect)
- Particules et effets lumineux sur Légendaire et Mythique
- "Rare find" notification qui interrompt l'UI momentanément

### 5. Gameplay Unique par Classe — Routines différentes

**Chronomancien**
- Peut "geler" une minute pour la capturer plus tard (jusqu'à 3 en réserve)
- Mini-jeu : manipulation d'une barre temporelle
- Routine : gérer son stock de minutes gelées, choisir le bon moment

**Archiviste**
- Voit des "indices" historiques avant de capturer (augmente les chances de tomber sur un événement)
- Routine : analyser les indices, décider quand capturer pour maximiser les événements historiques
- Bonus XP × 2 si la minute capturée a un événement IA

**Chasseur d'Instants**
- Capture en rafale : peut capturer 2-3 minutes en succession rapide (combo)
- Mini-jeu de timing : plus le combo est précis, plus la rareté est boostée
- Routine : construire et maintenir des combos

**Oracle Temporel**
- Peut "voir" la rareté future de la prochaine minute (50% du temps)
- Décision : utiliser cette info pour prendre des risques calculés
- Routine : pari sur les Légendaires/Mythiques, gestion de la chance

### 6. Voyage Temporel — Crafting pour capturer le passé
- Système de **fabrication d'objets** via les ressources récoltées
- Exemples d'objets craftés :
  - **Pierre de Résonance** : capture une minute écoulée dans l'heure passée
  - **Clé des Âges** : remonte jusqu'à 24h en arrière
  - **Artefact Chrono** : remonte jusqu'à 7 jours (très coûteux)
  - **Éclat du Passé** : capture une minute passée aléatoire (moins cher mais aléatoire)
- Équilibre : coût en ressources VS récompense potentielle
- Risque : le voyage peut "échouer" (perte de ressources), même la bonne décision peut mal tourner

### 7. Progression XP Multi-Sources
- Capture de minute (principal)
- Complétion de collection secrète (bonus unique)
- Streaks quotidiennes (bonus × jour consécutif)
- Craft et utilisation d'objets
- Événements historiques découverts (bonus Archiviste surtout)
- Classement (bonus hebdomadaire selon rang)

### 8. Courbe de Complexité Progressive (par palier)

**Niveaux 1-5** : Mécaniques de base. Capture simple, collection basique.
**Niveaux 5-10** : Système de ressources débloqué. Premier craft disponible.
**Niveaux 10-20** : Talents + classe gameplay pleinement débloqués.
**Niveaux 20-30** : Voyage temporel court (1h passée). Nouvelles recettes craft.
**Niveaux 30-50** : Voyage temporel étendu (24h). Collections secrètes avancées.
**Niveaux 50-75** : Voyage temporel long (7 jours). Artefacts légendaires craftables.
**Niveaux 75-100** : Contenu endgame. Chasses aux reliques historiques précises. Guildes.

---

## À IMPLÉMENTER EN PRIORITÉ

1. **Unicité capture** (bug fix) — priorité absolue
2. **Ressources par capture** (fondation de tout le reste)
3. **Refonte talents classe** (gameplay différencié)
4. **Mécanique risque/récompense** (WOW factor)
5. **Voyage Temporel / Crafting** (boucle long terme)

---

## NOTES DE DÉPLOIEMENT

- Toutes les mécaniques doivent fonctionner en serverless (Vercel Edge)
- Pas de WebSockets pour l'instant — polling acceptable pour les timers
- Redis pour les états temporaires (minutes gelées, boosters actifs)
- Toutes les transactions en DB doivent rester atomiques (Prisma $transaction)
