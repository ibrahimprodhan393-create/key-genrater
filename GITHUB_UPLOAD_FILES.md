# GitHub Upload Guide

Upload these files to a new GitHub repository:

- `index.html`
- `styles.css`
- `app.js`
- `server.js`
- `package.json`
- `vercel.json`
- `README.md`
- `.gitignore`
- `GITHUB_UPLOAD_FILES.md`

## Run Locally

```bash
npm start
```

Open:

```text
http://127.0.0.1:8777
```

## GitHub Pages

This is a static site, so GitHub Pages can run it directly from `index.html`.

1. Create a new repository.
2. Upload the files above.
3. Go to Settings > Pages.
4. Select branch `main` and folder `/root`.
5. Save and wait for GitHub to publish the URL.

Default admin password:

```text
admin123
```

## Latest Features

- English-only interface text
- Demo-style output such as `WEB-7DAY-37RX3`
- Random day options: `1DAY-`, `5DAY-`, `7DAY-`, `10DAY-`, `30DAY-`
- Prefix, day/middle segment, suffix, and random end code fields
- Futuristic dark UI

## Vercel

Do not put `npm start` in Vercel's Install Command.

- Framework Preset: `Other`
- Install Command: empty
- Build Command: `echo No build needed`
- Output Directory: `.`

The included `vercel.json` already sets these values.

## Render

Static Site:

- Build Command: `echo No build needed`
- Publish Directory: `.`

Web Service:

- Build Command: `npm install`
- Start Command: `HOST=0.0.0.0 npm start`
