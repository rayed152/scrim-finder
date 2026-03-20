# Valorant Scrim Finder MVP

A full-stack web application designed for Valorant players to easily find and queue up for scrims against other teams of similar skill.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (Auth.js v5) - Credentials Provider
- **Realtime / Matchmaking**: Socket.IO integrated with a custom Node.js server
- **Styling**: Tailwind CSS

## 📋 Features

- **Authentication**: Sign up and login using Email & Password. Protected dashboard routes.
- **Team Management**: Create a team as Captain, or join an existing team via Team ID. Leave teams, and view the roster + ranks.
- **Matchmaking Engine**: Queue up your team. A background loop continuously runs on the server looking for matched teams.
- **Fair Matches**: Matchmaking compares Average Rank Scores and expands the search threshold the longer you wait.
- **Realtime UI**: Receive instantaneous updates when a match is found using Socket.IO without refreshing the page.

## 🛠️ Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure you have your `.env` file configured. Example provided in the repo.
   ```env
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   DATABASE_URL="postgresql://user:password@localhost:5432/scrim_finder?schema=public"
   ```

3. **Database Setup**
   Ensure your local PostgreSQL database is running. Then, push the schema to the database:
   ```bash
   npx prisma db push
   ```
   *(Optional) You can run `npx tsx prisma/seed.ts` to populate the DB with a dummy team and users.*

4. **Start the Development Server**
   Since the app uses a custom server for Socket.IO (`server.js`), use the dev script which runs the node server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🧠 How Matchmaking Works

The matchmaking system avoids relying on stateless Next.js serverless functions hitting execution limits. Instead, the application runs via a custom `server.js` Node instance.

1. **The Queue Action**: When a Captain clicks "Enter Queue", the `/api/queue` endpoint creates a `QueueEntry` record in Postgres with the team's average rank score and preferred server region.
2. **The Engine Loop**: `server.js` contains a `setInterval` loop that runs every 5 seconds. It fetches all `QueueEntry` records.
3. **Filtering**: Entries are grouped by their Server Region (e.g. US West).
4. **Skill Matching & Time Expansion**: For every team in the queue, it compares their `avgRankScore` to others. The default allowed rank difference threshold is `2` (e.g. Diamond 1 can match with Diamond 3). However, for every 30 seconds a team waits, the threshold expands by `1`.
5. **Real-time Dispatch**: When a match is found, the server deletes both queue entries, creates a `Match` record, and emits a `matchFound` event via `Socket.IO` directly to the `team_[teamId]` room so both captains instantly get the match notification on their screen.
