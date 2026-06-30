# My Portfolio

A live personal portfolio built with **Tailwind CSS**, **JavaScript**, and **Node.js/Express**.

Visitors can browse your work and submit star-rated feedback that is saved on the server and shown on the page.

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

Run the server with live CSS rebuilds:

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Build Tailwind CSS and start the server |
| `npm run dev` | Watch CSS + auto-restart server |
| `npm run build:css` | Compile Tailwind to `public/css/styles.css` |

## Feedback API

- `GET /api/feedback` — fetch recent public feedback
- `POST /api/feedback` — submit feedback (name, email, rating 1–5, message)

Feedback is stored in `data/feedback.json` (gitignored).

## Customize

Edit `public/index.html` to update your name, bio, projects, and links.
Replace `hello@example.com` with your real email.

## Deploy

Works on [Render](https://render.com), [Railway](https://railway.app), or any Node.js host. Set `PORT` if required.

```bash
npm start
```
