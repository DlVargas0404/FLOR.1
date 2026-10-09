-- =====================================================================
-- Crear el PRIMER administrador (no existe registro público)
--
-- 1) En Supabase: Authentication -> Users -> "Add user" -> "Create new user".
--    Escribe email y contraseña y marca "Auto Confirm User".
-- 2) Cambia el correo de abajo por el mismo y ejecútalo en el SQL Editor.
--
-- Para agregar más administradores repite los pasos 1 y 2.
-- Para quitar acceso:  delete from public.admin_users where email = '...';
-- =====================================================================
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'CAMBIA-ESTE-CORREO@ejemplo.com'
on conflict (user_id) do nothing;

-- Verificación (debe devolver 1 fila):
select * from public.admin_users;
