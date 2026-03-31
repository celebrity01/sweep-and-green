-- ============================================
-- Sweep & Green — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- ENUM types
CREATE TYPE user_role AS ENUM ('resident', 'crew', 'lga_admin', 'super_admin');
CREATE TYPE report_status AS ENUM ('pending', 'assigned', 'in_progress', 'resolved', 'rejected');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE redemption_status AS ENUM ('pending', 'processing', 'delivered', 'failed');

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         VARCHAR(15) UNIQUE NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  lga           VARCHAR(50) NOT NULL,
  ward          VARCHAR(100) NOT NULL,
  role          user_role NOT NULL DEFAULT 'resident',
  green_points  INTEGER NOT NULL DEFAULT 0 CHECK (green_points >= 0),
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "LGA admins can read their LGA users" ON users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('lga_admin','super_admin') AND u.lga = users.lga)
  );
CREATE POLICY "Super admin full access to users" ON users FOR ALL
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'super_admin'));

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id       UUID REFERENCES users(id) ON DELETE SET NULL,  -- nullable for anonymous
  photo_url         TEXT NOT NULL,
  waste_type        VARCHAR(50) NOT NULL,
  severity          severity_level NOT NULL DEFAULT 'medium',
  latitude          DECIMAL(10,8),
  longitude         DECIMAL(11,8),
  address_string    TEXT,
  lga               VARCHAR(50) NOT NULL,
  ward              VARCHAR(100) NOT NULL,
  description       TEXT CHECK (char_length(description) <= 300),
  status            report_status NOT NULL DEFAULT 'pending',
  assigned_crew_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at       TIMESTAMPTZ,
  after_photo_url   TEXT,
  is_anonymous      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reports_lga_idx ON reports(lga);
CREATE INDEX reports_status_idx ON reports(status);
CREATE INDEX reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX reports_reporter_idx ON reports(reporter_id);

-- RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- Anyone can read non-anonymous reports on the public map
CREATE POLICY "Public can read active reports" ON reports FOR SELECT USING (NOT is_anonymous OR reporter_id = auth.uid());
-- Residents can insert reports
CREATE POLICY "Authenticated users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- Residents can update their own reports (e.g. add description)
CREATE POLICY "Reporters can update own reports" ON reports FOR UPDATE USING (reporter_id = auth.uid());
-- LGA admins can update reports in their LGA
CREATE POLICY "LGA admins can update their LGA reports" ON reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('lga_admin','super_admin') AND u.lga = reports.lga));
-- LGA admins can select all reports in their LGA
CREATE POLICY "LGA admins can read their LGA reports" ON reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('lga_admin','super_admin') AND u.lga = reports.lga));

-- ============================================
-- POINTS TRANSACTIONS TABLE
-- ============================================
CREATE TABLE points_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points       INTEGER NOT NULL,  -- positive = earned, negative = redeemed
  reason       VARCHAR(100) NOT NULL,
  reference_id UUID,  -- FK to reports.id or redemptions.id
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX points_tx_user_idx ON points_transactions(user_id);

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON points_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role inserts transactions" ON points_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- REDEMPTIONS TABLE
-- ============================================
CREATE TABLE redemptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type   VARCHAR(50) NOT NULL,
  points_spent  INTEGER NOT NULL CHECK (points_spent > 0),
  status        redemption_status NOT NULL DEFAULT 'pending',
  phone_number  VARCHAR(15),
  bank_account  JSONB,  -- {bank_code: "058", account_number: "0123456789"}
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own redemptions" ON redemptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert redemptions" ON redemptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "LGA admins can read redemptions" ON redemptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('lga_admin','super_admin')));

-- ============================================
-- SUPABASE STORAGE
-- ============================================
-- Run this in Supabase Dashboard → Storage
-- Create bucket: report-photos (public: true)
-- Create bucket: after-photos (public: true)

-- ============================================
-- HELPER FUNCTION: increment points atomically
-- ============================================
CREATE OR REPLACE FUNCTION increment_points(user_id_param UUID, points_param INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users SET green_points = green_points + points_param WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RATE LIMITING: Prevent > 10 reports/user/hour
-- ============================================
CREATE OR REPLACE FUNCTION check_report_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM reports
  WHERE reporter_id = NEW.reporter_id
    AND created_at > NOW() - INTERVAL '1 hour';
  IF report_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 10 reports per hour';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_report_rate_limit
  BEFORE INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION check_report_rate_limit();

-- ============================================
-- AUTO AWARD POINTS ON REPORT RESOLVED
-- ============================================
CREATE OR REPLACE FUNCTION award_points_on_resolution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' AND NEW.reporter_id IS NOT NULL THEN
    INSERT INTO points_transactions (user_id, points, reason, reference_id)
    VALUES (NEW.reporter_id, 100, 'report_resolved', NEW.id);
    UPDATE users SET green_points = green_points + 100 WHERE id = NEW.reporter_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_award_resolution_points
  AFTER UPDATE OF status ON reports
  FOR EACH ROW EXECUTE FUNCTION award_points_on_resolution();
