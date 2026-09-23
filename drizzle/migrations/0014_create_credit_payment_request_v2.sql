CREATE OR REPLACE FUNCTION public.create_credit_payment_request_v2(
  p_amount numeric,
  p_utr text,
  p_merchant_upi text,
  p_qr_reference text,
  p_payment_note text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_id uuid;
  v_utr text := btrim(coalesce(p_utr, ''));
  v_merchant_upi text := btrim(coalesce(p_merchant_upi, ''));
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Enter a valid payment amount.';
  END IF;
  IF length(v_utr) < 6 THEN
    RAISE EXCEPTION 'Please enter the UTR / transaction reference.';
  END IF;
  IF length(v_utr) > 100 THEN
    RAISE EXCEPTION 'UTR / transaction reference is too long.';
  END IF;
  IF v_merchant_upi = '' THEN
    RAISE EXCEPTION 'Merchant UPI is not configured.';
  END IF;

  INSERT INTO public.credit_payment_requests
    (user_id, amount, utr, merchant_upi, qr_reference, payment_note, status)
  VALUES
    (v_user_id, p_amount, v_utr, v_merchant_upi, p_qr_reference, p_payment_note, 'pending')
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_credit_payment_request_v2(
  numeric, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_credit_payment_request_v2(
  numeric, text, text, text, text
) TO authenticated;

NOTIFY pgrst, 'reload schema';
