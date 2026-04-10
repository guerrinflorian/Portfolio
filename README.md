# Portfolio - Florian Guerrin

Mon portfolio personnel, accessible sur **[florian-guerrin.fr](https://florian-guerrin.fr)**.

---

## Concept

L'idée de départ était de faire quelque chose de différent d'un portfolio classique avec des sections qui défilent. J'ai opté pour une scène interactive : un arbre généré procéduralement dont les branches portent des nœuds cliquables, chacun ouvrant une modale avec une section du portfolio (profil, expériences, diplômes, stack, projets, passions, contact).

La scène change en fonction de la météo réelle à mon domicile à Tressange (Moselle), récupérée via l'API Open-Meteo. En hiver, l'arbre perd ses feuilles et le sol se couvre de neige. Le ciel change de couleur selon l'heure de la journée, les étoiles apparaissent la nuit. De vrais avions survolant la Moselle s'affichent en temps réel via l'API airplanes.live, avec leur altitude, vitesse, cap et compagnie au survol.

---

## Stack

- **Nuxt 3** avec server routes (SSR hybride), déployé sur Vercel
- **Vue 3** avec Composition API et TypeScript strict partout
- **Pinia** pour la gestion d'état (météo, scène, modales, locale)
- **GSAP** pour les transitions de couleurs du ciel
- **Tailwind CSS** pour les modales
- **Canvas API** pour le rendu de l'arbre (pas de librairie, tout à la main)
- **Leaflet** pour la carte de localisation dans le profil
- **flag-icons** pour les drapeaux des avions

---

## L'arbre

C'est la partie la plus intéressante techniquement. L'arbre est généré récursivement avec des courbes de Bézier, animé avec un système de physique simple (oscillations sinusoïdales par branche, influencées par la vitesse du vent). Les feuilles qui tombent ont leur propre simulation physique indépendante.

Les nœuds interactifs sont positionnés dynamiquement sur les courbes de Bézier via interpolation paramétrique, ils suivent les branches quand l'arbre bouge. La détection de clic se fait par hit-test distance euclidienne sur les coordonnées canvas.

---

## Fonctionnalités notables

- **Météo temps réel** : température, vent, précipitations, prévisions horaires et journalières via Open-Meteo
- **Avions temps réel** : les vrais avions qui passent au-dessus de la Moselle s'affichent sur la scène, avec un tooltip au survol (compagnie, altitude, vitesse, cap)
- **Ciel dynamique** : lever/coucher du soleil selon le mois, phase de lune, étoiles la nuit
- **Terminal scan visiteur** : au chargement, un terminal affiche quelques infos sur le visiteur (OS, navigateur, IP, localisation...) — PC uniquement, disparaît après quelques secondes
- **Bilingue FR/EN** : toute l'interface bascule en temps réel
- **Lighthouse 96/100 Performance · 100 Accessibility · 100 Best Practices · 100 SEO**
- **JSON-LD** pour le référencement IA / AEO
- **CV standalone** : `public/cv.html`, bilingue, prévu pour impression/PDF

---

## Structure

```
components/
  tree/          → arbre (rendu canvas + nœuds)
  scene/         → fond (ciel, sol, étoiles, soleil/lune, avions)
  modals/        → 7 modales de contenu
  ui/            → composants partagés (terminal, badge Lighthouse, hints...)
  weather/       → couche météo visuelle
stores/          → météo, scène, modales, locale
composables/     → logique réutilisable (avions, météo, scène, locale)
server/api/
  weather.ts     → proxy Open-Meteo (évite CORS)
  visitor.ts     → proxy ip-api.com (infos visiteur)
public/
  cv.html        → CV bilingue FR/EN standalone
```

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
