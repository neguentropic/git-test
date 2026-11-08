# AGENTS.md

Instructions pour les agents (Hermes) chargés de générer et de faire évoluer ce site web.
Lis ce fichier en entier avant d'écrire du code et respecte-le strictement.

## 1. Objectif du projet

Site vitrine moderne et immersif, inspiré de l'esthétique de https://antigravity.google/ :

- Hero plein écran avec vidéo ou fond de particules 3D interactives
- Sections qui se révèlent au scroll (texte, images, cartes)
- Défilement fluide, transitions soignées, curseur personnalisé (desktop)
- Rendu sombre, minimaliste, haut de gamme
- Performances élevées et accessibilité respectée

Ne copie ni le code, ni les textes, ni les images, ni le logo du site de référence. Il sert uniquement d'inspiration pour le style et le type d'interactions. Tous les contenus doivent être originaux ou des placeholders clairement identifiés.

## 2. Stack technique (imposée)

| Domaine | Choix |
|---|---|
| Build / dev server | Vite |
| Framework UI | React 19 + TypeScript (mode `strict`) |
| Routing | React Router (si plusieurs pages) |
| Styles | Tailwind CSS (+ variables CSS pour le thème) |
| Animations d'interface | `motion` (ex-Framer Motion) |
| Animations liées au scroll | GSAP + ScrollTrigger |
| Défilement fluide | Lenis |
| Particules / 3D | three + @react-three/fiber + @react-three/drei |
| Post-traitement (optionnel) | @react-three/postprocessing |
| Micro-animations vectorielles (optionnel) | lottie-react |
| Gestionnaire de paquets | pnpm |
| Qualité | ESLint + Prettier + TypeScript |

Alternative simple pour un fond de particules 2D sans 3D : `@tsparticles/react`. À n'utiliser que si le canvas R3F n'est pas justifié.

Ne pas ajouter d'autre bibliothèque d'animation, de composants ou de 3D sans demande explicite (pas de jQuery, anime.js, particles.js, Bootstrap, etc.).

## 3. Initialisation

```bash
pnpm create vite@latest . --template react-ts
pnpm add motion gsap lenis three @react-three/fiber @react-three/drei react-router-dom
pnpm add -D tailwindcss @tailwindcss/vite @types/three eslint prettier
```

Configurer Tailwind via le plugin Vite (`@tailwindcss/vite`) et importer `tailwindcss` dans le CSS global.

## 4. Structure du projet

```
src/
  main.tsx
  App.tsx
  components/
    layout/        # Header, Footer, Nav
    sections/      # Hero, Features, UseCases, CTA...
    ui/            # Button, Card, Cursor...
    three/         # Scène R3F, particules, shaders
  hooks/           # useReducedMotion, useScrollProgress, useIsMobile...
  lib/             # gsap.ts (registerPlugin), lenis.ts, utils
  styles/          # index.css, tokens
  assets/          # images, vidéos, polices
public/
  video/           # hero.mp4 / hero.webm + poster
```

Un composant par fichier, nommé en PascalCase. Les hooks commencent par `use`.

## 5. Conventions de code

- TypeScript strict : pas de `any`, pas de `// @ts-ignore` sans justification.
- Composants fonctionnels et hooks uniquement, pas de classes.
- Props typées avec des `type` ou `interface` explicites.
- Imports absolus via l'alias `@/` (configuré dans `vite.config.ts` et `tsconfig.json`).
- Pas de styles inline sauf valeurs dynamiques. Utiliser Tailwind.
- Pas de `console.log` dans le code final.
- Commentaires uniquement pour expliquer le « pourquoi ».

## 6. Règles d'animation

### Motion
- Pour les apparitions (`initial` / `whileInView`), les hovers, les transitions de pages (`AnimatePresence`) et le curseur personnalisé.
- Utiliser `viewport={{ once: true }}` pour les révélations simples.

### GSAP + ScrollTrigger
- Pour les sections épinglées, le parallaxe et les timelines pilotées par le scroll.
- Enregistrer les plugins une seule fois dans `src/lib/gsap.ts`.
- Dans React, utiliser `useGSAP` (`@gsap/react`) ou `gsap.context()` avec un nettoyage systématique (`ctx.revert()`) au démontage.

### Lenis
- Une seule instance globale, synchronisée avec ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` et pilotage via `gsap.ticker`).
- Désactiver Lenis si `prefers-reduced-motion` est activé.

### Règles générales
- Animer uniquement `transform` et `opacity` quand c'est possible.
- Ne pas animer `width`, `height`, `top` ou `left`.
- Ne pas mélanger Motion et GSAP sur le même élément.
- Durées et courbes d'easing définies dans des constantes partagées pour garder une identité cohérente.

## 7. Particules et scène 3D (React Three Fiber)

- **Un seul `<Canvas>` fixe en arrière-plan** (`position: fixed; inset: 0; z-index: -1`), partagé par tout le site. Ne pas créer un canvas par section.
- Particules via `THREE.Points` avec `BufferGeometry` et `Float32Array`, ou `ShaderMaterial` personnalisé pour un contrôle fin.
- Aucune allocation d'objets dans `useFrame`. Réutiliser les vecteurs et tableaux typés.
- Réaction à la souris et au scroll via des valeurs partagées (refs ou store léger), pas via des re-renders React.
- Pas de `setState` dans `useFrame`.
- `dpr={[1, 2]}` sur le Canvas, et `frameloop="demand"` si la scène peut être statique.
- Nombre de particules adaptatif :
  - Desktop : 20 000 à 50 000 maximum
  - Mobile : 3 000 à 8 000 maximum
- Charger la scène avec `React.lazy` + `Suspense` pour ne pas bloquer le premier affichage.
- Prévoir un repli (dégradé CSS ou image) si WebGL n'est pas disponible.

## 8. Hero vidéo

```html
<video autoPlay muted loop playsInline preload="metadata" poster="/video/hero-poster.jpg">
  <source src="/video/hero.webm" type="video/webm" />
  <source src="/video/hero.mp4" type="video/mp4" />
</video>
```

- Toujours `muted` + `playsInline` pour l'autoplay mobile.
- Fournir un `poster`.
- Vidéo compressée (idéalement moins de 5 Mo), sans piste audio.

## 9. Design

- Thème sombre par défaut, avec une couleur d'accent unique.
- Tokens de couleur, d'espacement et de typographie définis en variables CSS et exposés dans Tailwind.
- Typographie : une police sans-serif moderne pour le texte (par exemple Inter) et éventuellement une police d'affichage pour les titres. Auto-héberger les polices.
- Grandes marges, hiérarchie typographique forte, contrastes élevés.
- Mobile first : tester à 375 px, 768 px, 1280 px et 1920 px.

## 10. Performance

- Score Lighthouse visé : 90+ en performance, accessibilité, bonnes pratiques et SEO.
- Code splitting par route et chargement différé de Three.js.
- Images en WebP ou AVIF, avec `width` / `height` et `loading="lazy"` (sauf image du hero).
- Mettre en pause les animations lourdes quand l'onglet est caché (`document.visibilityState`) ou que l'élément est hors écran (`IntersectionObserver`).
- Éviter les layout shifts : réserver l'espace des médias.

## 11. Accessibilité

- Respecter `prefers-reduced-motion` : désactiver Lenis, les particules animées et le parallaxe, et passer à des transitions simples ou nulles.
- HTML sémantique (`header`, `main`, `section`, `nav`, `footer`) et hiérarchie de titres cohérente.
- Navigation clavier complète avec focus visible.
- Le curseur personnalisé ne s'active que sur les appareils avec pointeur fin (`@media (pointer: fine)`) et ne remplace jamais le focus clavier.
- Texte alternatif pertinent sur les images. Le canvas décoratif porte `aria-hidden="true"`.
- Contraste minimum WCAG AA.

## 12. SEO

- Balises `title`, `meta description`, Open Graph et Twitter Card renseignées.
- Un seul `h1` par page.
- Fichiers `robots.txt` et `sitemap.xml`.

## 13. Commandes

```bash
pnpm dev        # serveur de développement
pnpm build      # build de production
pnpm preview    # prévisualiser le build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
```

Avant de considérer une tâche terminée, exécuter `pnpm lint`, `pnpm typecheck` et `pnpm build`, et corriger toutes les erreurs.

## 14. Ordre de travail recommandé

1. Initialiser le projet, configurer Tailwind, l'alias `@/`, ESLint et Prettier.
2. Mettre en place le thème (tokens), le layout (Header, Footer) et le routing.
3. Intégrer Lenis + GSAP/ScrollTrigger dans `lib/`.
4. Construire le Hero (vidéo et/ou scène de particules R3F).
5. Ajouter les sections de contenu avec animations d'apparition (Motion) et scroll (GSAP).
6. Ajouter le curseur personnalisé et les transitions de pages.
7. Optimiser (performance, accessibilité, SEO) et vérifier avec Lighthouse.

## 15. Ce qu'il ne faut pas faire

- Ne pas changer de stack ni ajouter de dépendances majeures sans demande explicite.
- Ne pas copier de ressources protégées (code, textes, images, logos) d'un autre site.
- Ne pas créer plusieurs canvas WebGL ni multiplier les boucles `requestAnimationFrame`.
- Ne pas ignorer `prefers-reduced-motion`.
- Ne pas laisser de code mort, de `console.log` ou de TODO non résolus.
- En cas de doute sur une décision structurante, poser la question avant d'implémenter.
