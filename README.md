# Priyanshu Sangale · Developer Playground

A static React and TypeScript portfolio with a procedural Three.js hero, Rapier physics, project previews, a skills galaxy, and an interactive terminal.

## Run locally

```sh
npm ci
npm run dev
```

## Verify and build

```sh
npm run check
npm run lint
npm run build
npm run preview
```

## Deploy

Build with `npm ci && npm run build`. Deploy the contents of `dist/` to a static host. For example, from the project directory with a Vercel account:

```sh
npm ci
npm run build
npx vercel --prod
```

The Vercel preset is Vite and the output directory is `dist`. The included Sites manifest also maps this directory to the private Sites deployment.

## Update content

Shared profile details are in `src/data/portfolio.ts`. Project, experience, and skill copy lives with its respective section. The project previews use labeled illustrative data. Place the actual résumé at `public/resume.pdf` and rebuild to enable the download button.
