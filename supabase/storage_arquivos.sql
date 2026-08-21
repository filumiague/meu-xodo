-- ===========================================================
-- Meu Xodó — Storage de arquivos (exames em qualquer formato +
-- foto de perfil do idoso). Rodar no SQL Editor do Supabase.
-- ===========================================================

-- 1) Criar o bucket (privado — arquivos de saúde não ficam públicos)
insert into storage.buckets (id, name, public, file_size_limit)
values ('arquivos', 'arquivos', false, 20971520) -- 20MB por arquivo
on conflict (id) do nothing;

-- 2) Foto de perfil do idoso (thumbnail ao lado do nome)
alter table perfis_idosos add column if not exists foto_url text;

-- 3) Políticas de acesso: só quem é membro daquele perfil de idoso
--    pode ver/enviar/trocar/apagar arquivos guardados na pasta dele.
--    Estrutura de pastas esperada: {perfil_idoso_id}/exames/arquivo.ext
--                                   {perfil_idoso_id}/perfil/foto.ext

drop policy if exists "membros veem arquivos do perfil" on storage.objects;
drop policy if exists "membros enviam arquivos do perfil" on storage.objects;
drop policy if exists "membros atualizam arquivos do perfil" on storage.objects;
drop policy if exists "membros apagam arquivos do perfil" on storage.objects;

create policy "membros veem arquivos do perfil" on storage.objects for select
  using (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1]::uuid in (
      select perfil_idoso_id from membros_familia where user_id = auth.uid()
    )
  );

create policy "membros enviam arquivos do perfil" on storage.objects for insert
  with check (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1]::uuid in (
      select perfil_idoso_id from membros_familia where user_id = auth.uid()
    )
  );

create policy "membros atualizam arquivos do perfil" on storage.objects for update
  using (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1]::uuid in (
      select perfil_idoso_id from membros_familia where user_id = auth.uid()
    )
  );

create policy "membros apagam arquivos do perfil" on storage.objects for delete
  using (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1]::uuid in (
      select perfil_idoso_id from membros_familia where user_id = auth.uid()
    )
  );
