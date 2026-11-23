# Circle

**Warm intros through people you already trust — not cold DMs.**

Circle maps your real social graph (1st circle + through your circle), lets you discover who you need inside that radius, and ask a mutual for a warm introduction. Messaging opens their preferred app — WhatsApp, LinkedIn, iMessage, or email.

> Prototype / open-source client. No production backend yet — demo data powers the orbit, discover, and intro flows so you can experience the product.

**Live web:** [enterthecircle.github.io/circle](https://enterthecircle.github.io/circle/)  
**Source:** [github.com/EnterTheCircle/circle](https://github.com/EnterTheCircle/circle)

## Product

| Surface | What it does |
| --- | --- |
| **Orbit** | Visual network — your connections as atoms on rings |
| **Discover** | Search 1st & 2nd circle for roles (lawyer, founder, stylist…) |
| **Intros** | Ask a mutual to vouch; they accept or decline |
| **Ghost mode** | Friends-of-friends can see you as Confidential |
| **Connect** | Real-world connect via tap / short-lived code |

## Stack

- [Expo](https://expo.dev) SDK 58 · React Native · Expo Router
- Web + iOS + Android from one codebase
- Auth API + Postgres on [Render](https://render.com) (`server/` + `render.yaml`)
- Without `EXPO_PUBLIC_API_URL`, the client falls back to local AsyncStorage

## Quick start

```bash
npm install
npx expo start
```

- Press `w` for web  
- Scan the QR with Expo Go for phone  

```bash
npx expo export -p web   # production web bundle → dist/
```

## Deploy backend (Render)

Blueprint file: [`render.yaml`](./render.yaml) — creates **circle-db** (Postgres), **circle-api** (Node), and **circle-web** (static).

1. Push this repo to GitHub (already done if you use EnterTheCircle/circle).
2. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the **EnterTheCircle/circle** repo (or your fork).
4. Confirm it finds `render.yaml` → **Apply** / **Deploy Blueprint**.
5. Wait until **circle-api** shows Live and `/health` returns `{"ok":true}`.
6. Open **circle-api** → copy the public URL (e.g. `https://circle-api-xxxx.onrender.com`).
7. For local testing: copy `.env.example` → `.env.local` and set `EXPO_PUBLIC_API_URL` to that URL.
8. Sign up in the app — accounts land in Postgres. Create the Founder account yourself (username `Founder`); do not put passwords in git.

Free Postgres expires after 30 days — upgrade before then if you want to keep data.

## Web

The marketing entry on web is a full-screen **Enter the circle** moment, then the live orbit. Native keeps the phone signup flow.

GitHub Pages stays available at [enterthecircle.github.io/circle](https://enterthecircle.github.io/circle/). After Render is live, prefer the **circle-web** URL from the Blueprint (it bakes in the API URL at build time).

## License

MIT — see [LICENSE](./LICENSE).

## Disclaimer

Circle is a product prototype. Any community token or culture layer is separate from this software and is **not** equity in the app.
