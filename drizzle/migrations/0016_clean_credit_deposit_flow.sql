ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert own deposits" ON public.deposit_requests;
CREATE POLICY "insert own deposits" ON public.deposit_requests
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin deposits" ON public.deposit_requests;
CREATE POLICY "admin deposits" ON public.deposit_requests
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE ON public.deposit_requests TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_approve_deposit_request(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.deposit_requests%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  SELECT * INTO r FROM public.deposit_requests WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Deposit request not found'; END IF;
  IF r.status <> 'pending' THEN RAISE EXCEPTION 'Deposit request is already processed'; END IF;
  PERFORM public.wallet_credit(r.user_id, r.amount, 'deposit');
  INSERT INTO public.transactions (user_id, type, amount, status, note, meta)
  VALUES (r.user_id, 'deposit', r.amount, 'completed', 'UPI deposit approved by admin',
          jsonb_build_object('deposit_request_id', r.id, 'utr', r.utr, 'upi_id', '9636277797-7@ybl'));
  UPDATE public.deposit_requests SET status = 'approved', processed_at = now() WHERE id = r.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_deposit_request(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  UPDATE public.deposit_requests SET status = 'rejected', processed_at = now()
  WHERE id = p_id AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Deposit request not found or already processed'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_approve_deposit_request(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_reject_deposit_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_approve_deposit_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_deposit_request(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
