-- 0012: repair auth -> profile provisioning and backfill missing registered users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_ref_code text;
  v_referrer uuid;
BEGIN
  LOOP
    v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE referral_code = v_code
    );
  END LOOP;

  v_ref_code := NULLIF(NEW.raw_user_meta_data->>'referral_code', '');

  IF v_ref_code IS NOT NULL THEN
    SELECT id INTO v_referrer
    FROM public.profiles
    WHERE referral_code = v_ref_code;
  END IF;

  INSERT INTO public.profiles (id, phone, username, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      'Player_' || replace(substr(NEW.id::text, 1, 12), '-', '')
    ),
    v_code,
    v_referrer
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (user_id, bonus_cash)
  VALUES (NEW.id, 25)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.transactions (user_id, type, amount, note)
  SELECT NEW.id, 'bonus', 25, 'Welcome bonus'
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.transactions
    WHERE user_id = NEW.id
      AND type = 'bonus'
      AND note = 'Welcome bonus'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- Backfill profiles for users who exist in Auth but do not have a profile.
DO $$
DECLARE
  u record;
  v_code text;
BEGIN
  FOR u IN
    SELECT au.id, au.email, au.phone, au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.id IS NULL
  LOOP
    LOOP
      v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE referral_code = v_code
      );
    END LOOP;

    INSERT INTO public.profiles (
      id,
      phone,
      username,
      referral_code,
      created_at
    )
    VALUES (
      u.id,
      COALESCE(u.phone, ''),
      'Player_' || replace(substr(u.id::text, 1, 12), '-', ''),
      v_code,
      COALESCE(u.created_at, now())
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.wallets (user_id, bonus_cash)
    VALUES (u.id, 25)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (u.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
END;
$$;

NOTIFY pgrst, 'reload schema';

SELECT
  (SELECT count(*) FROM auth.users) AS registered_users,
  (SELECT count(*) FROM public.profiles) AS profiles,
  (SELECT count(*) FROM auth.users au LEFT JOIN public.profiles p ON p.id = au.id WHERE p.id IS NULL) AS missing_profiles;
