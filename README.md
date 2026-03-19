# HYROX Daily

A Next.js + Supabase web application for daily HYROX workout programming.

## Features

- **Admin Panel**: Add workout programs by date with title, format, and exercise lists
- **Public Page**: Display today's workout prominently with archive below
- **Mobile Optimized**: Vertical scrolling design optimized for mobile devices
- **Dark Theme**: Professional dark UI with yellow accents (#E5FE3D)
- **Typography**: Bebas Neue font for titles with automatic number highlighting

## Tech Stack

- **Framework**: Next.js 15.1 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main public page
├── components/       # React components (will add admin panel)
├── lib/
│   └── supabase.ts   # Supabase client
├── types/
│   └── index.ts      # TypeScript types
└── styles/
    └── globals.css   # Global styles
```

## Setup

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create `.env.local` from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Then add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

Create a `workouts` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| date | date | Workout date (must be unique) |
| title | text | Workout title (optional) |
| format | text | Workout format like "For Time", "AMRAP" (optional) |
| exercises | text[] | Array of exercise lines |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**SQL to create the table:**

```sql
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  title TEXT,
  format TEXT,
  exercises TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_workouts_date ON workouts(date DESC);
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Build

```bash
npm run build
npm start
```

## Workout Data Format

The `exercises` field is an array of strings where:
- Each string is one exercise line
- Empty lines (empty strings) separate exercise groups
- Numbers in exercises are automatically highlighted in yellow (#E5FE3D)

Example:

```json
{
  "exercises": [
    "5 Rounds for Time",
    "10 Thrusters (95/65 lb)",
    "15 Pull-ups",
    "",
    "Rest 2:00",
    "",
    "10 Min AMRAP",
    "5 Burpee Box Jump Overs (24/20 in)"
  ]
}
```

## Next Steps

- [ ] Add admin panel for creating/editing workouts
- [ ] Add authentication for admin access
- [ ] Add social media sharing
- [ ] Add PWA support
- [ ] Implement caching strategy

## License

MIT
