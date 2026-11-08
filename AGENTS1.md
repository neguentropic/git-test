# Règles du projet
- Stack : React + Vite + TypeScript + Tailwind CSS + Motion + GSAP + ScrollTrigger + Lenis + React Three Fiber + drei + tsParticles + lottie-react + R3F + shader custom
- Scripts npm obligatoires : lint, test, build
- Toujours travailler sur une branche `hermes/<sujet>`, jamais sur main
- Commits conventionnels (feat:, fix:, chore:)
- Terminer chaque tâche par : npm run lint && npm test && npm run build, puis ouvrir une PR avec `gh pr create`
- Ne jamais committer de secrets ni de fichier .env
- Livrer : Dockerfile multi-stage, nginx.conf (fallback SPA), .dockerignore, .github/workflows/pipeline.yml