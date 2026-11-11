create extension if not exists pgcrypto;
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.exams(
 id uuid primary key default gen_random_uuid(), title text not null, description text default '',
 published boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.questions(
 id uuid primary key default gen_random_uuid(), exam_id uuid not null references public.exams(id) on delete cascade,
 question_text text not null, question_type text not null check(question_type in ('multiple_choice','true_false')),
 options jsonb not null default '[]'::jsonb, correct_answer text not null, explanation text default '',
 source_page text default '', sort_order integer not null default 0
);
create table if not exists public.attempts(
 id uuid primary key default gen_random_uuid(), exam_id uuid not null references public.exams(id),
 student_name text not null, student_email text not null, score integer not null, total integer not null,
 percentage numeric(5,2) not null, submitted_at timestamptz not null default now()
);
create table if not exists public.attempt_answers(
 id uuid primary key default gen_random_uuid(), attempt_id uuid not null references public.attempts(id) on delete cascade,
 question_id uuid not null references public.questions(id), student_answer text not null, is_correct boolean not null
);
create or replace view public.student_questions as
 select q.id,q.exam_id,q.question_text,q.question_type,q.options,q.sort_order
 from public.questions q join public.exams e on e.id=q.exam_id where e.published=true;
alter table public.admin_users enable row level security;
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()) $$;
create policy "admin users read own" on public.admin_users for select to authenticated using(user_id=auth.uid());
create policy "public read published exams" on public.exams for select to anon,authenticated using(published=true or public.is_admin());
create policy "admin manage exams" on public.exams for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin manage questions" on public.questions for all to authenticated using(public.is_admin()) with check(public.is_admin());
grant select on public.student_questions to anon,authenticated;
grant select,insert,update,delete on public.exams,public.questions to authenticated;
create policy "admin read attempts" on public.attempts for select to authenticated using(public.is_admin());
create policy "admin read attempt answers" on public.attempt_answers for select to authenticated using(public.is_admin());
