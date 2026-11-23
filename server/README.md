# Circle API (Render)

Node + Postgres auth API for Circle. Deployed via the root `render.yaml` Blueprint.

## Local

```bash
cd server
npm install
DATABASE_URL=postgres://… npm start
```

Requires a Postgres URL (local Docker or Render External Database URL).

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | Liveness |
| POST | `/auth/signup` | Create user + profile |
| POST | `/auth/signin` | Session token |
| POST | `/auth/signout` | Revoke token |
| GET | `/me` | Current user + profile |
| PUT | `/me/profile` | Update profile |
| POST | `/auth/forgot` | Reset token (email later) |
| POST | `/auth/reset` | Set new password |
