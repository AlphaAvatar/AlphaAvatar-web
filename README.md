# AlphaAvatar Web

Web frontend and realtime demo for **AlphaAvatar**.

AlphaAvatar Web provides the landing page, LiveKit-powered demo UI, and browser session integration for the AlphaAvatar personal assistant runtime.

## Features

- Realtime voice interaction
- Text chat and session timeline
- Camera-based visual context
- LiveKit room/session integration
- Browser timezone and locale metadata
- Landing page for AlphaAvatar

## Live Links

- Website: https://www.alphaavatar.ai
- Docs: https://docs.alphaavatar.io
- GitHub: https://github.com/AlphaAvatar/AlphaAvatar

## Getting Started

Install dependencies:

```bash
pnpm install
````

Start the dev server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Create `.env.local`:

```bash
# Web public env
NEXT_PUBLIC_AVATAR_NAME="AlphaAvatar"
NEXT_PUBLIC_LIVEKIT_URL=

# LiveKit
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

## Key Files

```text
app/page.tsx                       Landing page
app/demo/page.tsx                  Demo session page
app/api/demo-session/route.ts      LiveKit token endpoint
components/livekit/demo-client.tsx Realtime demo UI
components/home/                   Homepage components
app/config/                        Homepage configuration
```

## Build

```bash
pnpm build
```

## About AlphaAvatar

AlphaAvatar is a self-hostable realtime AI assistant framework for memory, vision, planning, tools, and personal context.

It is designed to evolve from a realtime avatar demo into a persistent personal assistant runtime.

## License

Apache-2.0
