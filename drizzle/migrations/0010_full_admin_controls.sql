-- 0010_full_admin_controls.sql
-- Adds UPI management and an auditable admin action ledger.
-- Run after the existing FunBattle migrations.

CREATE TABLE IF NOT EXISTS public.admin_upi_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id text NOT NULL UNIQUE,
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_upi_ids_active_idx
  ON public.admin_upi_ids(is_active);

ALTER TABLE public.admin_upi_ids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_upi_admin_only" ON public.admin_upi_ids;
CREATE POLICY "admin_upi_admin_only"
ON public.admin_upi_ids
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.admin_action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_id uuid,
  amount numeric,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_action_log_created_idx
  ON public.admin_action_log(created_at DESC);

CREATE INDEX IF NOT EXISTS admin_action_log_target_user_idx
  ON public.admin_action_log(target_user_id);

ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_action_log_admin_read" ON public.admin_action_log;
CREATE POLICY "admin_action_log_admin_read"
ON public.admin_action_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.admin_add_upi(
  p_upi_id text,
  p_display_name text DEFAULT NULL
)
RETURNS public.admin_upi_ids
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_row public.admin_upi_ids;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  IF NULLIF(trim(p_upi_id),'') IS NULL THEN
    RAISE EXCEPTION 'UPI ID is required';
  END IF;

  INSERT INTO public.admin_upi_ids(upi_id, display_name, created_by)
  VALUES (lower(trim(p_upi_id)), NULLIF(trim(p_display_name),''), auth.uid())
  RETURNING * INTO v_row;

  INSERT INTO public.admin_action_log(admin_id,action,target_id,note)
  VALUES(auth.uid(),'ADD_UPI',v_row.id,'UPI ID added');

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_upi(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  DELETE FROM public.admin_upi_ids WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'UPI ID not found';
  END IF;

  INSERT INTO public.admin_action_log(admin_id,action,target_id,note)
  VALUES(auth.uid(),'DELETE_UPI',p_id,'UPI ID deleted');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_upi_active(
  p_id uuid,
  p_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  UPDATE public.admin_upi_ids
  SET is_active = p_active
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'UPI ID not found';
  END IF;

  INSERT INTO public.admin_action_log(admin_id,action,target_id,note)
  VALUES(auth.uid(),CASE WHEN p_active THEN 'ENABLE_UPI' ELSE 'DISABLE_UPI' END,p_id,NULL);
END;
$$;

GRANT SELECT ON public.admin_upi_ids TO authenticated;
GRANT SELECT ON public.admin_action_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_add_upi(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_upi(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_upi_active(uuid,boolean) TO authenticated;
