# Portfolio - Florian Guerrin

Mon portfolio personnel, accessible sur **[florian-guerrin.fr](https://florian-guerrin.fr)**.

---

## Concept

L'idée de départ était de faire quelque chose de différent d'un portfolio classique avec des sections qui défilent. J'ai opté pour une scène interactive : un arbre généré procéduralement dont les branches portent des nœuds cliquables, chacun ouvrant une modale avec une section du portfolio (profil, expériences, diplômes, stack, projets, passions, contact).

La scène change en fonction de la météo réelle à mon domicile à Tressange (Moselle), récupérée via l'API Open-Meteo. En hiver, l'arbre perd ses feuilles et le sol se couvre de neige. Le ciel change de couleur selon l'heure de la journée, les étoiles apparaissent la nuit. Rien de révolutionnaire techniquement, mais ça donne un résultat vivant.

---

## Stack

- **Nuxt 3** en génération statique (SSG), déployé sur Vercel
- **Vue 3** avec Composition API et TypeScript strict partout
- **Pinia** pour la gestion d'état (météo, scène, modales, locale)
- **GSAP** pour les transitions de couleurs du ciel
- **Tailwind CSS** pour les modales
- **Canvas API** pour le rendu de l'arbre (pas de librairie, tout à la main)

---

## L'arbre

C'est la partie la plus intéressante techniquement. L'arbre est généré récursivement avec des courbes de Bézier, animé avec un système de physique simple (oscillations sinusoïdales par branche, influencées par la vitesse du vent). Les feuilles qui tombent ont leur propre simulation physique indépendante.

Les nœuds interactifs sont positionnés dynamiquement sur les courbes de Bézier via interpolation paramétrique, ils suivent les branches quand l'arbre bouge. La détection de clic se fait par hit-test distance euclidienne sur les coordonnées canvas.

---

## Structure

```
components/
  tree/          → arbre (rendu canvas + nœuds)
  scene/         → fond (ciel, sol, étoiles, soleil/lune)
  modals/        → 7 modales de contenu
  ui/            → composants partagés
stores/          → météo, scène, modales, locale
composables/     → logique réutilisable
public/
  cv.html        → CV bilingue FR/EN standalone (impression / PDF)
```

---

## CV

Le CV est un fichier HTML/CSS autonome dans `public/cv.html`, bilingue FR/EN, prévu pour l'impression et l'export PDF. Accessible directement sur `/cv.html` ou via l'icône sur le tronc de l'arbre.

---

## Lancer le projet

```bash
npm install
npm run dev        # développement
npm run generate   # build statique
npm run preview    # prévisualiser le build
```

---

## Déploiement

Déployé sur Vercel via le preset Nitro `vercel`. Chaque push sur `main` déclenche un déploiement automatique.
