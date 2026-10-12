# AGENTS.md

Instructions pour les agents (Hermes) chargés de générer et de faire évoluer ce site web.
Lis ce fichier en entier avant d'écrire du code et respecte-le strictement.

## 1. Objectif du projet

Site vitrine immersif nommé **Neguentropia**, à l'ambiance cosmique et rétro-futuriste :

- Fond presque noir rappelant le cosmos, typographie rétro-futuriste (section 19)
- Hero plein écran : séquence d'introduction en particules, du cercle noir qui respire jusqu'au mot « Neguentropia » qui attire la poussière cosmique (section 20)
- Sections qui se révèlent au scroll, défilement fluide, transitions soignées
- Rendu sombre, minimaliste, haut de gamme
- Performances élevées et accessibilité respectée

Ne copie ni le code, ni les textes, ni les images, ni le logo d'un autre site. Les sites de référence ne servent que d'inspiration pour le style et le type d'interactions. Tous les contenus doivent être originaux ou des placeholders clairement identifiés.

Cette version du fichier ne définit que le style global et le scénario d'introduction. Le contenu des sections situées sous le hero n'est pas encore défini : ne pas inventer de contenu éditorial, utiliser des placeholders neutres et poser la question si nécessaire.

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
| Gestionnaire de paquets | npm |
| Qualité | ESLint + Prettier + TypeScript |
| Tests | Vitest + Testing Library (jsdom) |
| Conteneurisation | Docker multi-stage + nginx |
| CI | GitHub Actions |

Alternative simple pour un fond de particules 2D sans 3D : `@tsparticles/react`. À n'utiliser que si le canvas R3F n'est pas justifié.

Ne pas ajouter d'autre bibliothèque d'animation, de composants ou de 3D sans demande explicite (pas de jQuery, anime.js, particles.js, Bootstrap, etc.).

## 3. Initialisation

```bash
npm create vite@latest . -- --template react-ts
npm install motion gsap lenis three @react-three/fiber @react-three/drei react-router-dom @fontsource/orbitron @fontsource-variable/inter
npm install -D tailwindcss @tailwindcss/vite @types/three eslint prettier vitest jsdom @testing-library/react @testing-library/jest-dom
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

## 8. Vidéo (optionnelle)

Le hero de ce projet est la scène de particules (section 20), pas une vidéo. N'utiliser une vidéo que si elle est explicitement demandée. Dans ce cas :

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

- Thème sombre uniquement, avec une couleur d'accent unique. Palette et typographie définies en section 19.
- Tokens de couleur, d'espacement et de typographie définis en variables CSS et exposés dans Tailwind.
- Auto-héberger les polices (paquets `@fontsource`).
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
npm run dev        # serveur de développement
npm run lint       # ESLint (script obligatoire)
npm test           # Vitest (script obligatoire)
npm run build      # build de production (script obligatoire)
npm run preview    # prévisualiser le build
npm run typecheck  # tsc --noEmit
```

Les scripts `lint`, `test` et `build` sont obligatoires dans `package.json`. Le script `build` doit inclure la vérification de types (par exemple `tsc -b && vite build`). Avant de considérer une tâche terminée, suivre la procédure de fin de tâche de la section 16.

## 14. Ordre de travail recommandé

1. Initialiser le projet, configurer Tailwind, l'alias `@/`, ESLint et Prettier.
2. Mettre en place le thème (tokens), le layout (Header, Footer) et le routing.
3. Intégrer Lenis + GSAP/ScrollTrigger dans `lib/`.
4. Construire le Hero : la séquence d'introduction en particules décrite en section 20.
5. Ajouter les sections de contenu (placeholders tant que le contenu n'est pas défini) avec animations d'apparition (Motion) et scroll (GSAP).
6. Ajouter les transitions de pages (et un curseur personnalisé uniquement s'il est demandé).
7. Optimiser (performance, accessibilité, SEO) et vérifier avec Lighthouse.

## 15. Ce qu'il ne faut pas faire

- Ne pas changer de stack ni ajouter de dépendances majeures sans demande explicite.
- Ne pas copier de ressources protégées (code, textes, images, logos) d'un autre site.
- Ne pas créer plusieurs canvas WebGL ni multiplier les boucles `requestAnimationFrame`.
- Ne pas ignorer `prefers-reduced-motion`.
- Ne pas laisser de code mort, de `console.log` ou de TODO non résolus.
- En cas de doute sur une décision structurante, poser la question avant d'implémenter.
- Ne jamais travailler directement sur `main` ni committer des secrets (voir sections 16 et 17).

## 16. Workflow Git et fin de tâche

- Toujours travailler sur une branche `hermes/<sujet>` (par exemple `hermes/hero-particules`), **jamais sur `main`**.
- Commits conventionnels : `feat:`, `fix:`, `chore:` (et `docs:`, `refactor:`, `test:` si pertinent). Message court, à l'impératif, un commit par changement logique.
- Terminer chaque tâche par :

```bash
npm run lint && npm test && npm run build
```

  puis ouvrir une Pull Request avec :

```bash
gh pr create
```

- Ne pas ouvrir la PR si l'une des trois commandes échoue : corriger d'abord.
- Ne jamais forcer un push sur `main` et ne jamais fusionner sa propre PR.

## 17. Sécurité

- Ne jamais committer de secrets (clés API, tokens, mots de passe) ni de fichier `.env`.
- `.env` et `.env.*` (sauf `.env.example`) doivent figurer dans `.gitignore` et `.dockerignore`.
- Les variables d'environnement exposées au client (préfixe `VITE_`) ne doivent contenir aucun secret.
- Si un secret est committé par erreur, le signaler immédiatement : ne pas se contenter de le supprimer dans un nouveau commit.

## 18. Livrables de déploiement

Livrer et maintenir à la racine du dépôt :

- **`Dockerfile` multi-stage** : une étape de build Node (`npm ci` puis `npm run build`), puis une étape finale `nginx` (image légère) qui sert uniquement le dossier `dist/`. Exécuter avec le moins de privilèges possible et n'embarquer ni `node_modules` ni sources dans l'image finale.
- **`nginx.conf`** avec **fallback SPA** (`try_files $uri $uri/ /index.html;`), compression gzip, cache long pour les assets versionnés (`/assets/`) et pas de cache pour `index.html`.
- **`.dockerignore`** : `node_modules`, `dist`, `.git`, `.env*`, logs et fichiers inutiles au build.
- **`.github/workflows/pipeline.yml`** : pipeline GitHub Actions déclenché sur les Pull Requests et les pushes sur `main`, avec `npm ci`, `npm run lint`, `npm test` et `npm run build`, puis la construction de l'image Docker. Utiliser le cache npm et une version de Node LTS fixée.

Vérifier que l'image se construit (`docker build .`) avant d'ouvrir la PR lorsque ces fichiers sont modifiés.

## 19. Direction artistique

### Ambiance
Cosmos, vide, poussière stellaire. Ton contemplatif, calme et mystérieux. Le mouvement est lent et fluide, sans rebond ni effet brusque (easings de type `easeInOut` et `expo.out`). Le nom du site évoque l'ordre qui émerge du chaos : la séquence d'introduction doit le traduire.

### Couleurs (valeurs de départ, à exposer en variables CSS et dans Tailwind)

```css
:root {
  --color-bg: #03040a;          /* presque noir, légère teinte bleu nuit */
  --color-bg-elevated: #070914;
  --color-text: #e6e8f2;
  --color-text-muted: #8a8fa8;
  --color-accent: #8fa8ff;      /* bleu-violet pâle, seule couleur d'accent */
}
```

- Le fond n'est jamais un noir pur uniforme : un dégradé radial très discret (opacité de 8 % maximum) peut suggérer une nébuleuse.
- Un champ d'étoiles statique très peu contrasté est autorisé, à condition qu'il ne concurrence jamais la poussière animée.
- Les particules sont majoritairement blanc cassé, avec de légères variations de teinte (froide ou chaude) dans une plage restreinte.
- Contraste de texte minimum WCAG AA.

### Typographie
- **Titres et mot d'intro : Orbitron** (graisses 700 à 900), importée via `@fontsource/orbitron`. Alternatives acceptables si Orbitron ne convient pas visuellement : Michroma, Audiowide, Syncopate.
- **Texte courant : Inter** (`@fontsource-variable/inter`) pour la lisibilité.
- Titres en majuscules avec un `letter-spacing` généreux.
- Ne pas mélanger plus de deux familles de polices.

### Particules
- Rendu en points ronds et doux (disque avec bord adouci dans le fragment shader via `gl_PointCoord`), jamais en carrés.
- `AdditiveBlending`, `depthWrite: false`, tailles variées par particule, léger scintillement.

## 20. Scénario d'introduction (séquence signature)

La page s'ouvre sur cette séquence. Elle est entièrement rendue dans le canvas R3F fixe décrit en section 7.

### Phases

| # | Phase | Durée visée | Description |
|---|---|---|---|
| 0 | Respiration | `INTRO_HOLD_MS` = 1000 ms | Un cercle noir est au centre de l'écran. Il tourne très lentement et grossit puis rapetisse de façon subtile, comme une respiration. |
| 1 | Explosion | ≈ 2500 ms | Le cercle explose en une multitude de particules évoquant la poussière cosmique. Expansion rapide au départ puis qui ralentit (`expo.out`). |
| 2 | Suspension | ≈ 400 ms | Fin de l'expansion, les particules flottent à leur étendue maximale. |
| 3 | Contraction | ≈ 3500 ms | Les particules sont attirées vers le centre et se rassemblent pour former le mot **Neguentropia**. Trajectoires légèrement spiralées, mouvement `easeInOut`, départs décalés par particule. |
| 4 | Veille | illimitée | Le mot est formé. Il attire la poussière du cosmos environnante : des particules dérivent lentement vers lui, puis s'estompent à son contact avant de réapparaître en périphérie. |

Durée totale de la séquence jusqu'au mot formé : environ 7 à 9 secondes. Toutes les durées, amplitudes et nombres de particules sont des constantes centralisées dans `src/config/intro.ts`, faciles à ajuster.

### Phase 0 : le cercle
- Un cercle noir parfaitement uni sur un fond presque noir est invisible, et sa rotation ne se voit pas. Il doit donc avoir une présence discrète : liseré lumineux très fin et asymétrique, halo léger, et/ou texture à peine perceptible qui rend la rotation lisible.
- Rotation d'environ 10 à 15 degrés par seconde.
- Respiration : variation d'échelle d'environ ±3 à 4 % sur une période de 4 à 6 secondes (sinusoïde ou `easeInOut`).
- Le cercle est déjà composé des particules du système principal (disque de particules sombres), afin que l'explosion soit une transition continue et non un remplacement d'objet.
- Pendant le chargement (scène WebGL et police), afficher le fond et un cercle CSS discret, pour éviter un écran vide.
- Le chronomètre de `INTRO_HOLD_MS` ne démarre qu'une fois la scène rendue et la police chargée, jamais pendant le chargement.

### Phase 1 : explosion
- Direction et vitesse aléatoires par particule, avec une légère turbulence (bruit de type curl) pour un aspect de poussière et non de feu d'artifice.
- Tailles, luminosités et profondeurs (axe z) variées.

### Phase 3 : formation du mot
- Le mot affiché est exactement `Neguentropia` (casse du DOM). L'affichage visuel peut être en majuscules via la mise en forme.
- Les positions cibles sont obtenues en dessinant le texte dans un canvas 2D hors écran (police Orbitron, graisse 800 ou 900), en lisant `getImageData`, puis en échantillonnant les pixels opaques sur une grille régulière (`src/lib/sampleText.ts`).
- **Attendre le chargement de la police** (`await document.fonts.load('800 100px Orbitron')`) avant l'échantillonnage.
- Chaque particule reçoit une cible choisie aléatoirement (pas dans l'ordre des lettres) pour une contraction organique. Ajouter un léger bruit en z pour donner de la profondeur.
- Taille du mot adaptative : environ 70 % de la largeur du viewport sur desktop, environ 88 % sur mobile (taille de police calculée avec `measureText`). Recalculer les cibles au redimensionnement (avec debounce).
- Le mot doit rester lisible : ajuster la densité de points en conséquence dans les limites de la section 7.

### Phase 4 : le mot attire la poussière
- Système de particules séparé (« poussière ambiante ») qui apparaît en fondu pendant la phase 3 ou 4.
- Chaque particule naît dans une large coquille autour du mot, dérive vers lui avec une accélération douce et une légère rotation en spirale, s'estompe à l'approche puis réapparaît en périphérie.
- Effet subtil : il doit suggérer l'attraction sans masquer le mot ni distraire du contenu.
- Le mot lui-même reste vivant : léger scintillement des points et très faible pulsation de luminosité.

### Architecture technique
- Système principal : un seul `THREE.Points` avec des attributs par particule (`aDisc`, `aBurst`, `aWord`, `aSeed`, `aSize`) et un `ShaderMaterial`. Les transitions entre phases sont calculées dans le vertex shader à partir d'uniforms (`uTime`, `uPhase`, `uProgress`). Pas de `setState` par frame.
- Poussière ambiante : un second `THREE.Points`, animé entièrement dans le shader à partir d'un temps et d'une phase aléatoire par particule.
- Budget de particules (dans les limites de la section 7) :
  - Desktop : système principal 30 000, poussière ambiante 4 000
  - Mobile : système principal 6 000, poussière ambiante 800
- La logique de chronologie est isolée dans des fonctions pures et testables (`src/lib/introTimeline.ts`, par exemple `getIntroState(elapsedMs)` qui retourne la phase et la progression), avec des tests Vitest. Les fonctions d'easing sont testées de la même façon.
- Horloge basée sur le temps cumulé avec un delta plafonné, pour que l'animation ne saute pas quand l'onglet revient au premier plan.
- Fichiers attendus :
  - `src/config/intro.ts`
  - `src/lib/introTimeline.ts`, `src/lib/sampleText.ts`
  - `src/components/three/IntroScene.tsx` (Canvas et orchestration)
  - `src/components/three/MainParticles.tsx`, `src/components/three/AmbientDust.tsx`
  - `src/components/three/shaders/` (vertex et fragment shaders)
  - `src/hooks/useReducedMotion.ts`

### Défilement et interaction
- Bloquer le défilement (`lenis.stop()`) pendant les phases 0 à 3, puis le réactiver à la phase 4.
- Permettre de passer l'introduction (clic, touche Échap ou Entrée, ou bouton discret) : l'animation passe directement à l'état final.

### Accessibilité, SEO et repli
- Le mot est présent dans le HTML sous la forme d'un vrai `<h1>Neguentropia</h1>`, visuellement masqué pendant l'animation avec une classe `sr-only` (jamais `display: none`) et affiché ou superposé à la fin. Le canvas est `aria-hidden="true"`. Le `h1` doit exister dans le HTML initial (voir section 12 pour le prérendu).
- Avec `prefers-reduced-motion` : aucune explosion ni contraction. Afficher directement l'état final (mot formé, sans mouvement, poussière statique ou absente).
- Sans WebGL : fond sombre et `h1` en Orbitron avec une simple apparition en fondu.
- Mettre en pause le rendu quand l'onglet est caché.
