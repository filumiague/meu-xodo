-- ===========================================================
-- Meu Xodó — Login multiusuário (idosa + cuidadores/familiares)
-- Rodar no SQL Editor do Supabase, no projeto já existente.
-- Não apaga nada: cria tabelas novas e ajusta a tabela `eventos`.
-- ===========================================================

-- 1) Perfil do idoso (por enquanto só 1 linha: sua mãe; já pensado
--    para o futuro caber múltiplos idosos)
create table if not exists perfis_idosos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

insert into perfis_idosos (nome)
select 'Dona Maria' -- troque pelo nome real da sua mãe antes de rodar, se quiser
where not exists (select 1 from perfis_idosos);

-- 2) Lista de e-mails autorizados a se cadastrar e ganhar acesso
--    automático ao perfil da sua mãe (você + seus 4 irmãos + ela mesma,
--    se ela for logar também). Edite os e-mails abaixo antes de rodar.
create table if not exists convite_email (
  email text primary key,
  papel text not null check (papel in ('idoso', 'cuidador', 'familiar')),
  nome text
);

insert into convite_email (email, papel, nome) values
  ('felipefilu@gmail.com', 'cuidador', 'Felipe')
  -- , ('email-irmao-1@exemplo.com', 'familiar', 'Nome do irmão 1')
  -- , ('email-irmao-2@exemplo.com', 'familiar', 'Nome do irmão 2')
  -- , ('email-irmao-3@exemplo.com', 'familiar', 'Nome do irmão 3')
  -- , ('email-irmao-4@exemplo.com', 'familiar', 'Nome do irmão 4')
  -- , ('email-da-mae@exemplo.com', 'idoso', 'Nome da mãe')
on conflict (email) do nothing;

-- 3) Vínculo entre usuário autenticado (auth.users) e o perfil do idoso
create table if not exists membros_familia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  perfil_idoso_id uuid not null references perfis_idosos(id) on delete cascade,
  papel text not null check (papel in ('idoso', 'cuidador', 'familiar')),
  nome text,
  criado_em timestamptz not null default now(),
  unique (user_id, perfil_idoso_id)
);

-- 4) Trigger: quando alguém se cadastra (auth.users), se o e-mail estiver
--    na lista de convidados, vincula automaticamente ao perfil da mãe.
--    Se o e-mail NÃO estiver convidado, a conta é criada mas fica sem
--    acesso a nenhum dado (RLS bloqueia tudo) — não é aberto ao público.
create or replace function vincular_convidado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  convite record;
  perfil_id uuid;
begin
  select * into convite from convite_email where email = new.email;
  if convite is null then
    return new;
  end if;

  select id into perfil_id from perfis_idosos limit 1;

  insert into membros_familia (user_id, perfil_idoso_id, papel, nome)
  values (new.id, perfil_id, convite.papel, coalesce(convite.nome, new.email))
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function vincular_convidado();

-- 5) Ajustar tabela `eventos` pra pertencer a um perfil de idoso
alter table eventos add column if not exists perfil_idoso_id uuid references perfis_idosos(id);

update eventos set perfil_idoso_id = (select id from perfis_idosos limit 1)
where perfil_idoso_id is null;

alter table eventos alter column perfil_idoso_id set not null;

-- 6) Travar a segurança: derrubar a política pública antiga (se existir)
--    e só permitir acesso a quem está vinculado ao perfil via membros_familia.
alter table perfis_idosos enable row level security;
alter table membros_familia enable row level security;
alter table eventos enable row level security;

drop policy if exists "leitura publica eventos" on eventos;
drop policy if exists "escrita publica eventos" on eventos;
drop policy if exists "public read eventos" on eventos;
drop policy if exists "public write eventos" on eventos;

create policy "membros veem eventos do perfil" on eventos for select
  using (perfil_idoso_id in (select perfil_idoso_id from membros_familia where user_id = auth.uid()));

create policy "membros criam eventos do perfil" on eventos for insert
  with check (perfil_idoso_id in (select perfil_idoso_id from membros_familia where user_id = auth.uid()));

create policy "membros atualizam eventos do perfil" on eventos for update
  using (perfil_idoso_id in (select perfil_idoso_id from membros_familia where user_id = auth.uid()));

create policy "membros apagam eventos do perfil" on eventos for delete
  using (perfil_idoso_id in (select perfil_idoso_id from membros_familia where user_id = auth.uid()));

create policy "membros veem seu proprio vinculo" on membros_familia for select
  using (user_id = auth.uid());

create policy "membros veem o perfil vinculado" on perfis_idosos for select
  using (id in (select perfil_idoso_id from membros_familia where user_id = auth.uid()));

-- ===========================================================
-- DEPOIS DE RODAR:
-- 1) Edite a tabela convite_email (item 2 acima) com os e-mails reais
--    dos seus 4 irmãos e da sua mãe, se ela for logar também.
--    Pode rodar de novo: insert ... on conflict do nothing; é seguro.
-- 2) Cada pessoa convidada cria a própria conta na tela de login do
--    app (e-mail + senha) — o Supabase manda um e-mail de confirmação.
-- 3) Depois de confirmar o e-mail, ao entrar no app ela já vê os
--    dados da mãe automaticamente (vínculo criado pelo trigger).
-- ===========================================================
