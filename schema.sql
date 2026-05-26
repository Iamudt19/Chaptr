create table if not exists public.people (
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

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  category text check (category in ('positive_trait','negative_trait','trust_event','pattern','one_off')) default 'one_off',
  extracted_traits jsonb default '{"positive":[],"negative":[]}',
  created_at timestamptz default now()
);

create table if not exists public.patterns (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  pattern_text text not null,
  dismissed boolean default false,
  created_at timestamptz default now()
);

alter table public.people enable row level security;
alter table public.logs enable row level security;
alter table public.patterns enable row level security;

do $pol$ begin
  if not exists (select 1 from pg_policies where tablename='people' and policyname='Users see own people') then
    create policy "Users see own people" on public.people for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='logs' and policyname='Users see own logs') then
    create policy "Users see own logs" on public.logs for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='patterns' and policyname='Users see own patterns') then
    create policy "Users see own patterns" on public.patterns for all using (auth.uid() = user_id);
  end if;
end $pol$;

create or replace function update_updated_at()
returns trigger as $fn$ begin new.updated_at = now(); return new; end; $fn$ language plpgsql;

do $trg$ begin
  if not exists (select 1 from pg_trigger where tgname='people_updated_at') then
    create trigger people_updated_at before update on public.people for each row execute function update_updated_at();
  end if;
end $trg$;
