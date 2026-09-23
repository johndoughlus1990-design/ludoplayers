-- Admin user management: list every registered auth user, including users whose profile row is missing.
CREATE OR REPLACE FUNCTION public.admin_list_registered_users()
RETURNS TABLE (
  id uuid,
  email text,
  username text,
  phone text,
  kyc_status text,
  battles_won integer,
  battles_lost integer,
  created_at timestamptz,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    p.username,
    p.phone,
    p.kyc_status,
    COALESCE(p.battles_won, 0),
    COALESCE(p.battles_lost, 0),
    u.created_at,
    COALESCE(p.is_active, true)
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_registered_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_registered_users() TO authenticated;

NOTIFY pgrst, 'reload schema';
