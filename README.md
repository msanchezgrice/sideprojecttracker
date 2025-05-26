# Doodad.ai - Project Management Dashboard

A gamified project management platform that transforms team collaboration into an engaging, analytics-driven experience with intelligent project tracking and user-centric design.

## Features

- 🎮 Gamified project management with leaderboards
- 📊 Real-time analytics and progress tracking
- 🤖 AI-powered project insights
- 💰 Cost tracking and budget monitoring
- 🔗 Git integration and quick actions
- 📝 Notes and documentation

## Tech Stack

- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Supabase
- **Authentication**: Clerk
- **Deployment**: Self-hosted or cloud platforms

## Environment Variables

Create a `.env` file with:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_postgresql_connection_string
CLERK_SIGN_IN_URL=https://accounts.doodad.ai/sign-in
CLERK_SIGN_UP_URL=https://accounts.doodad.ai/sign-up
CLERK_AFTER_SIGN_IN_URL=/dashboard
CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## Development

```bash
npm install
npm run dev
```

## License

Built for developers, by developers.