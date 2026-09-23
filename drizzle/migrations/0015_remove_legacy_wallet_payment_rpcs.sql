-- Legacy UPI wallet submission flow cleanup.
-- The user-facing wallet module is being rebuilt from a clean baseline.
-- Keep the core wallet/account tables intact for gameplay; remove only the
-- broken payment-submission RPCs from the previous implementation.

DROP FUNCTION IF EXISTS public.submit_credit_payment_request(numeric, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_credit_payment_request_v2(numeric, text, text, text, text);

NOTIFY pgrst, 'reload schema';
