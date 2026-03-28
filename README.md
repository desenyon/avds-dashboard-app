# AVDS Dashboard App

Deployable Next.js presentation app for the AVDS event siting and operations optimizer.

## Local Development

```bash
cd dashboard-app
npm install
npm run dev
```

Open http://localhost:3000.

## Production Build

```bash
cd dashboard-app
npm run build
npm run start
```

## Deployment

### Vercel (recommended)

1. Push repository to GitHub.
2. Import the `dashboard-app` directory as a Vercel project.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Output: default Next.js output.

### Other Platforms

This app can be deployed on any platform that supports Node.js and Next.js server output.

## Structure

- `src/app/page.tsx`: Dashboard UI and data story.
- `src/app/globals.css`: Design system and responsive styles.
- `src/app/layout.tsx`: Metadata and typography.
