-- The service_role client (server-only: webhooks, admin scripts) needs
-- table privileges; it bypasses RLS but not GRANTs. Newer Supabase CLI
-- versions no longer grant these by default.

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
