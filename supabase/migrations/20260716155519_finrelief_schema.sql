/*
# FinRelief AI - Core Schema

1. Purpose
- Multi-user fintech debt-relief platform with authenticated per-user data.
- Each user manages their own loans, financial profile, settlement predictions, AI history.

2. New Tables
- `profiles` — extended user profile data (full name, avatar, employment, dependents, assets).
- `financial_profiles` — monthly income, expenses, savings, debts snapshot per user.
- `loans` — loan records: type, outstanding, interest, EMI, overdue, due date, priority.
- `settlement_records` — AI settlement predictions stored per user/loan.
- `ai_history` — generated negotiation letters and recommendations history.

3. Security
- RLS enabled on every table.
- Owner-scoped CRUD: each authenticated user can only access rows where `user_id = auth.uid()`.
- Owner columns default to `auth.uid()` so inserts from the client succeed even when `user_id` is omitted.

4. Notes
- `auth.users` is the Supabase built-in auth table; we do NOT create a custom auth table.
- Email confirmation stays OFF.
- All child tables reference `auth.users(id)` with `ON DELETE CASCADE` so deleting a user cleans up.
*/

-- Profiles table (extended user info)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  phone text,
  employment_type text DEFAULT 'Salaried',
  dependents integer DEFAULT 0,
  assets numeric DEFAULT 0,
  monthly_income numeric DEFAULT 0,
  monthly_expenses numeric DEFAULT 0,
  savings numeric DEFAULT 0,
  existing_debts numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lender text NOT NULL DEFAULT '',
  loan_type text NOT NULL DEFAULT 'Personal Loan',
  outstanding_amount numeric NOT NULL DEFAULT 0,
  interest_rate numeric DEFAULT 0,
  emi numeric DEFAULT 0,
  overdue_months integer DEFAULT 0,
  due_date date,
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_loans" ON loans;
CREATE POLICY "select_own_loans" ON loans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_loans" ON loans;
CREATE POLICY "insert_own_loans" ON loans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_loans" ON loans;
CREATE POLICY "update_own_loans" ON loans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_loans" ON loans;
CREATE POLICY "delete_own_loans" ON loans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Settlement records (AI predictions)
CREATE TABLE IF NOT EXISTS settlement_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES loans(id) ON DELETE SET NULL,
  settlement_percentage numeric NOT NULL DEFAULT 0,
  recommended_amount numeric NOT NULL DEFAULT 0,
  priority text DEFAULT 'Medium',
  financial_health text DEFAULT 'Fair',
  risk_category text DEFAULT 'Medium',
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE settlement_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settlements" ON settlement_records;
CREATE POLICY "select_own_settlements" ON settlement_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_settlements" ON settlement_records;
CREATE POLICY "insert_own_settlements" ON settlement_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_settlements" ON settlement_records;
CREATE POLICY "update_own_settlements" ON settlement_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_settlements" ON settlement_records;
CREATE POLICY "delete_own_settlements" ON settlement_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- AI History (negotiation letters, predictions, recommendations)
CREATE TABLE IF NOT EXISTS ai_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'letter',
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_history" ON ai_history;
CREATE POLICY "select_own_ai_history" ON ai_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_history" ON ai_history;
CREATE POLICY "insert_own_ai_history" ON ai_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_history" ON ai_history;
CREATE POLICY "update_own_ai_history" ON ai_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_history" ON ai_history;
CREATE POLICY "delete_own_ai_history" ON ai_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_settlement_user_id ON settlement_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_created ON ai_history(created_at DESC);

-- Auto-update updated_at
-- Security: pin search_path to a trusted schema to prevent search_path hijacking.
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

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_loans_updated ON loans;
CREATE TRIGGER trg_loans_updated BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
