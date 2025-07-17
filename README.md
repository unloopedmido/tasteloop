# TasteLoop 🍜

A Discord bot for managing your anime watchlist with AniList integration. _Work in progress._

## Features

### Current

- `/search` - Search anime using AniList API
- `/top` - View trending anime
- `/list` - Browse & manage your anime watchlist [WIP]
- Interactive pagination and detailed anime information

### Coming Soon

- 🔐 AniList OAuth integration
- ✏️ Add/edit/remove anime from your AniList
- 🤖 AI-powered anime recommendations
- 📊 Enhanced watchlist management

## Quick Start

```bash
# Install dependencies
bun install

# Setup database
bun run db:push

# Run in development
bun run dev

# Run in production
bun run start
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: Discord.js v14
- **Database**: Prisma + MySQL
- **API**: AniList GraphQL API
- **Language**: TypeScript

## Environment Variables

Rename the [example env](.env.example) file to `.env` and fill it with your environment variables accordingly.

---

_Built with ❤️ using [Bun](https://bun.sh)_
