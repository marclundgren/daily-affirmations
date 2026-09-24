# Daily Affirmations

A small, self-hosted, mobile-first app for reading your affirmations every day, together.

- **Today** shows what's due (daily, weekly on chosen weekdays, or monthly on chosen dates), your progress and your streak. Progress resets at local midnight.
- **Read aloud:** tap the mic and the words light up as you say them. When you reach the end, it's marked read and the next one opens.
- **Library** is where you write, schedule, pause and reorder affirmations. You can import one from a screenshot (needs an Anthropic API key).
- **People:** everyone shares the library, and each person has their own progress. There are no accounts; each device remembers who's reading.

## Writing affirmations

The text is a small markdown subset:

```markdown
Every morning, say:

> I give my spirit guides permission to help me today in every area of my life.

Open yourself to guidance, synchronicities, and **unexpected opportunities.**
```

- `> quote`: the words you say aloud. The mic follows these. Without a quote, it follows all of the text.
- `**highlight**`: glowing accent text.
- `- item`: a list.

Each affirmation's color comes from its place in the library, running from blue through violet and pink to peach.

## Running it

```sh
docker compose up -d --build        # http://127.0.0.1:4410, data in the "data" volume
sudo tailscale serve --bg 4410      # https://<machine>.<tailnet>.ts.net
```

Speech recognition only works over HTTPS, which Tailscale Serve provides. On iPhone, open the link in Safari and choose **Share → Add to Home Screen**.

To enable image import, put `ANTHROPIC_API_KEY=...` in `.env` (see `.env.example`) and run `docker compose up -d` again.

## Development

```sh
npm install
npm run dev        # API on :4410 (tsx watch), Vite on :5180 with /api proxied
npm test           # schedule, markdown and follow-along logic
npm run typecheck
```

| Path | What's there |
| --- | --- |
| `src/shared/` | Types and pure logic shared by client and server: scheduling, the markdown subset, speech matching |
| `src/server/` | Hono API on Node's built-in SQLite (`node:sqlite`). `defaults.ts` seeds an empty database |
| `src/client/` | React 19 + Tailwind 4. `lib/store.tsx` holds app state; `lib/useFollowAlong.ts` wraps the Web Speech API |
