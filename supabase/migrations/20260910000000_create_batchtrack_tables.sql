create table if not exists public.retailers (
  id text primary key,
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consumers (
  id text primary key,
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.machines (like public.consumers);
create table if not exists public.inventory (like public.consumers);
create table if not exists public.transactions (like public.consumers);
create table if not exists public.documents (like public.consumers);
create table if not exists public.credit_notes (like public.consumers);
create table if not exists public.support_tickets (like public.consumers);
create table if not exists public.sessions (like public.consumers);

create table if not exists public.survey_responses (
  id uuid primary key,
  response jsonb not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace function public.set_batchtrack_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'retailers', 'consumers', 'machines', 'inventory', 'transactions',
    'documents', 'credit_notes', 'support_tickets', 'sessions'
  ] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_batchtrack_updated_at()', table_name, table_name);
  end loop;
end;
$$;

create index if not exists inventory_retailer_id_idx on public.inventory ((record->>'retailerId'));
create index if not exists transactions_retailer_id_idx on public.transactions ((record->>'retailerId'));
create index if not exists transactions_consumer_phone_idx on public.transactions ((record->>'consumerPhone'));
create index if not exists documents_retailer_id_idx on public.documents ((record->>'retailerId'));
create index if not exists documents_customer_phone_idx on public.documents ((record->>'customerPhone'));
create index if not exists credit_notes_retailer_phone_idx on public.credit_notes ((record->>'retailerId'), (record->>'consumerPhone'));
create index if not exists support_tickets_retailer_id_idx on public.support_tickets ((record->>'retailerId'));
create index if not exists support_tickets_wadn_idx on public.support_tickets ((record->>'wadn'));
create index if not exists survey_responses_submitted_at_idx on public.survey_responses (submitted_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'retailers', 'consumers', 'machines', 'inventory', 'transactions',
    'documents', 'credit_notes', 'support_tickets', 'sessions'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists batchtrack_anon_read on public.%I', table_name);
    execute format('drop policy if exists batchtrack_anon_write on public.%I', table_name);
    execute format('create policy batchtrack_anon_read on public.%I for select to anon, authenticated using (true)', table_name);
    execute format('create policy batchtrack_anon_write on public.%I for all to anon, authenticated using (true) with check (true)', table_name);
  end loop;
end;
$$;

alter table public.survey_responses enable row level security;
drop policy if exists survey_responses_anon_insert on public.survey_responses;
create policy survey_responses_anon_insert on public.survey_responses
  for insert to anon, authenticated
  with check (true);

comment on schema public is 'BatchTrack prototype storage. Replace anonymous policies with auth.uid()-scoped policies before production use.';