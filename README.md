# Random Key Admin Generator

A small static admin website for generating random passwords, keys, and codes.

## Run Locally

```bash
npm start
```

Open:

```text
http://127.0.0.1:8777
```

## Login

- Default admin password: `admin123`
- The admin password can be changed inside the panel.
- Password hash, settings, and history are stored in browser `localStorage`.

## Features

- Prefix, middle text, and suffix support
- Optional middle position for inserting fixed text into the random part
- Length presets: 3, 5, 7, 8, 10, 16
- Letters, numbers, symbols, arrows, and custom character pool
- Batch generation
- Futuristic corner-frame result cards
- Copy single code, copy all codes, and copy history batch

## Vercel Deploy

Do not put `npm start` in Vercel's Install Command. This project is static, so no server should run during build.

- Framework Preset: `Other`
- Install Command: empty
- Build Command: `echo No build needed`
- Output Directory: `.`

The included `vercel.json` sets these values for Vercel.

## Render Deploy

Static Site:

- Build Command: `echo No build needed`
- Publish Directory: `.`

Web Service:

- Build Command: `npm install`
- Start Command: `HOST=0.0.0.0 npm start`
