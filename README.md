# Chaptr — Setup

## 1. Clone and install
```bash
npm install
```

## 2. Set up Supabase
- Create project at [supabase.com](https://supabase.com)
- Run the SQL migrations in Supabase SQL editor (see `schema.sql`)
- Copy your URL and anon key to `.env.local`

## 3. Set up AI

**Option A — Ollama (fully local, recommended):**
```bash
# Install Ollama: https://ollama.com
ollama pull llama3
# Ollama runs automatically at http://localhost:11434
```

**Option B — Groq (no local setup needed):**
- Get free API key at [console.groq.com](https://console.groq.com)
- Add `GROQ_API_KEY` to `.env.local`

## 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama3-8b-8192
```

## 5. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Schema

Run this SQL in your Supabase SQL editor:

```sql
-- People table (each person = a chapter)
create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  relationship text check (relationship in ('friend','family','colleague','other')) default 'friend',
  avatar_color text not null,
  trust_level text check (trust_level in ('High','Medium','Low','Uncertain')) default 'Uncertain',
  trust_reason text,
  character_summary text,
  strengths text[],
  watchouts text[],
  positive_traits text[],
  negative_traits text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Logs table (each incident entry)
create table public.logs (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  category text check (category in ('positive_trait','negative_trait','trust_event','pattern','one_off')) default 'one_off',
  extracted_traits jsonb default '{"positive":[],"negative":[]}',
  created_at timestamptz default now()
);

-- Pattern alerts
create table public.patterns (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  pattern_text text not null,
  dismissed boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.people enable row level security;
alter table public.logs enable row level security;
alter table public.patterns enable row level security;

-- RLS Policies
create policy "Users see own people" on public.people for all using (auth.uid() = user_id);
create policy "Users see own logs" on public.logs for all using (auth.uid() = user_id);
create policy "Users see own patterns" on public.patterns for all using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger people_updated_at before update on public.people for each row execute function update_updated_at();
```
