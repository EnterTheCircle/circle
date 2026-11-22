# Circle

**Warm intros through people you already trust — not cold DMs.**

Circle maps your real social graph (1st circle + through your circle), lets you discover who you need inside that radius, and ask a mutual for a warm introduction. Messaging opens their preferred app — WhatsApp, LinkedIn, iMessage, or email.

> Prototype / open-source client. No production backend yet — demo data powers the orbit, discover, and intro flows so you can experience the product.

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
- Local demo state (AsyncStorage) — backend coming later

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

## Web

The marketing entry on web is a full-screen **Enter the circle** moment, then the live orbit. Native keeps the phone signup flow.

## License

MIT — see [LICENSE](./LICENSE).

## Disclaimer

Circle is a product prototype. Any community token or culture layer is separate from this software and is **not** equity in the app.
