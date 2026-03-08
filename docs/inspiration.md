# ChronoRelic — Design & Inspiration

## Philosophie de conception
"Easy to learn, hard to master" — la prise en main doit être immédiate (cliquer, capturer),
mais la maîtrise exige des semaines (sanctuaire optimisé, anomalies maîtrisées, classe exploitée à fond).

---

## Inspirations Roguelike

### Jeux de référence
- **Hades** (Supergiant): Modificateurs permanents (God Boons) + méta-progression (Mirror of Night).
  Chaque run est unique grâce aux modificateurs dynamiques. La mort a du sens — on revient plus fort.
- **Slay the Spire**: Choix de construction de deck, synergies entre cartes/reliques.
  Les décisions de build créent des runs radicalement différents.
- **Dead Cells**: Roguelite où la méta-progression (blueprints) récompense la persistance.
  Chaque mort enrichit les runs suivants.
- **FTL**: Gestion de ressources sous pression, décisions risquées à fort impact.
- **Risk of Rain 2**: Items qui se synergisent exponentiellement — la puissance s'accumule.

### Éléments roguelike intégrés dans ChronoRelic
1. **Anomalies Quotidiennes** (comme les "Seeds" de Slay the Spire)
   - 2 anomalies tirées chaque jour via RNG seedé (même seed pour tous les joueurs)
   - Chaque anomalie modifie fondamentalement la session du jour
   - Exemples: +XP mais plus d'échecs, chance mythique boostée, ressources doublées...
   - Force le joueur à adapter sa stratégie quotidiennement

2. **Variance et Risk/Reward** (comme FTL)
   - Mode Risqué: mise requise, échec possible, récompense doublée
   - Certaines anomalies rendent le Mode Risqué encore plus volatile
   - La composition d'anomalies + classe peut créer des sessions légendaires

3. **Méta-progression permanente** (comme Hades/Dead Cells)
   - Le Sanctuaire génère des ressources même hors connexion
   - Les talents sont permanents et s'accumulent
   - Chaque jour capture de nouvelles minutes uniques dans les 525 600

4. **Choix de build** (comme Slay the Spire)
   - 4 classes avec mécanique fondamentalement différentes
   - Arbre de talents avec synergies entre branches
   - 3 slots d'équipement créent des combinaisons de bonus passifs

---

## Inspirations OGame (base building)

### OGame — le jeu de référence
OGame (2002, Gameforge): MMO navigateur de construction de flottes spatiales.
- Mines de métal/cristal/deuterium génèrent des ressources à la minute
- Niveaux de bâtiments à coût exponentiel
- La progression hors-ligne est au cœur du gameplay
- Chaque amélioration amplifie les capacités de la prochaine

### Le Sanctuaire ChronoRelic (adaptation OGame)
8 modules upgradables (niveau 0 à 10), coûts exponentiels, génération passive.

**Modules de production** (génération hors-ligne):
- Extracteur Temporel → éclats/heure
- Générateur de Flux → chronite/heure
- Archives Vivantes → essences/heure + bonus XP

**Modules de puissance** (bonus passifs):
- Observatoire → +% chance légendaire/mythique
- Forge Chronique → réduction coûts de craft
- Chambre de Résonance → amplification bonus reliques équipées
- Laboratoire → réduction cooldown d'analyse
- Nexus Temporel → amplification globale de tous les modules

**Différences avec OGame:**
- On récolte manuellement (clic) — force la connexion quotidienne
- Plafonnement à 24h de stockage — incite à jouer régulièrement
- Les modules interagissent avec le système d'anomalies (certaines boostent la production)

---

## Design des Classes — Deep Differentiation

L'objectif: 4 façons radicalement différentes de jouer.

### CHRONOMANCER — "Le Manipulateur du Temps"
Classe de control et de probabilités. Le Chronomancien ne subit pas le hasard — il le plie.
- **Actif**: Relance Temporelle (1/jour) — rejoue la minute courante avec bonus de rareté
- **Passif**: Peut "geler" 3 minutes pour les capturer plus tard
- **Identité**: Patience et optimisation des moments
- **Profil joueur**: Planificateur, perfectionniste

### ARCHIVISTE — "Le Savant du Passé"
Classe de synergie et d'accumulation. L'Archiviste transforme le savoir en puissance.
- **Actif**: Synthèse des Savoirs (1/jour) — analyse instantanée de toutes les reliques prêtes
- **Passif**: Voit toujours les événements historiques (même sur COMMUNE)
- **Identité**: Maximisation de la valeur de chaque relique
- **Profil joueur**: Collectionneur, efficacité

### CHASSEUR — "Le Prédateur d'Instants"
Classe de volume et d'opportunisme. Le Chasseur capture plus, rate plus, mais ses succès comptent.
- **Actif**: Instinct de Chasse (3/jour) — prochaine capture garantie RARE+
- **Passif**: +25% production du Sanctuaire
- **Identité**: Quantité, vitesse, explosivité
- **Profil joueur**: Joueur actif, impatient

### ORACLE — "Le Prophète de l'Éternité"
Classe de rareté extrême. L'Oracle rate souvent le commun pour viser l'exceptionnel.
- **Actif**: Vision Prophétique (2/jour) — révèle les 5 minutes les plus puissantes du jour
- **Passif**: LEGENDAIRE+ comptent comme minutes bénies (bonus XP automatique)
- **Identité**: Chasse au trésor, tout ou rien
- **Profil joueur**: Gambler, chasseur de rares

---

## Équilibrage — Principes clés

### Courbe de progression
- Niveaux 1-10: Découverte mécanique (capturer, collecter, talents basiques)
- Niveaux 10-20: Sanctuaire se développe, premières synergies de classe
- Niveaux 20-40: Méta-jeu profond (optimisation Sanctuaire, combo talents)
- Niveaux 40+: Contenu de prestige (reliques ancestrales, Hall of Fame)

### Équilibrage des classes
Chaque classe doit avoir le même potentiel mais via un chemin différent:
- CHRONOMANCER: Session courte + haute qualité (moins de captures, mais optimisées)
- ARCHIVISTE: Long terme + accumulation (lent mais puissant après 2 semaines)
- CHASSEUR: Session longue + volume (beaucoup de captures, ressources ++, rares moins fréquents)
- ORACLE: Haute variance (longues périodes de COMMUNE puis coup de chance légendaire)

### Anti-pay-to-win
- Premium donne des captures illimitées — avantage non nul mais pas décisif
- Les éclats temporels (monnaie premium) ne peuvent PAS acheter directement des reliques rares
- L'avantage compétitif vient du skill de build et de la régularité de jeu

### Anomalies — équilibrage
- 2 anomalies par jour: 1 positive, 1 neutre/risquée
- Les anomalies ne stackent jamais leurs malus (pour éviter les jours "injouables")
- Certaines anomalies sont exclusivement bénéfiques

---

## Mécaniques "Prenant" — Retention Loops

### Court terme (chaque session)
- La capture est immédiate et satisfaisante
- L'animation de rareté crée l'attente
- Mode Risqué = frisson émotionnel

### Moyen terme (quotidien)
- 2 anomalies nouvelles chaque jour
- Sanctuaire à récolter (ressources accumulées)
- Streak de connexion (combo)
- 525 600 minutes à compléter (heatmap qui se remplie)

### Long terme (semaines/mois)
- Collection complète 365j × 1440min
- Talents max (nombreux talent points requis)
- Sanctuaire niveau 10 (progression lente mais visible)
- Hall of Fame + classement mondial

---

## Notes techniques pour l'implémentation

### Anomalies — seed RNG
```
seed = hash(YYYY-MM-DD)
anomaly1 = seededRandom(seed, 0) % anomalieCount
anomaly2 = seededRandom(seed, 1) % anomalieCount (≠ anomaly1)
```

### Sanctuaire — génération hors-ligne
```
elapsed = now - lastHarvestedAt (cap à 24h)
generated = sum(modules) × (elapsed / 3600000)
```

### Ability tracking Redis
```
key: chronorelic:ability:{userId}:{class}:{YYYY-MM-DD}
value: uses remaining
ttl: until midnight
```
