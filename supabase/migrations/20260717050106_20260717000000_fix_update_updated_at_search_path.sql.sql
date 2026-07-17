-- Security fix: pin search_path on update_updated_at_column to prevent search_path hijacking.
-- Previously the function had a mutable search_path, which allows a malicious user to shadow
-- built-in functions (e.g. now()) with attacker-controlled objects in their own schema.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Re-bind triggers to the hardened function (fully-qualified name).
DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_loans_updated ON loans;
CREATE TRIGGER trg_loans_updated BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
