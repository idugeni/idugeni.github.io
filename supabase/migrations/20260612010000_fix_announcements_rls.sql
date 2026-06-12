-- ============================================================
-- FIX: Multiple permissive SELECT policies on announcements
-- ============================================================
-- Problem: Two permissive SELECT policies for role 'authenticated':
--   1. "Anyone can read active scheduled announcements" (SELECT anon,authenticated)
--   2. "Admins can manage announcements" (ALL authenticated) — includes SELECT
-- This causes every SELECT query to evaluate both policies (performance hit).
--
-- Fix: Single SELECT policy handles both public + admin reads.
--       Admin mutation policies (INSERT/UPDATE/DELETE) are separate.
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read active scheduled announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;

-- Single SELECT policy: public reads active+scheduled, admins read everything
CREATE POLICY "announcements_select" ON public.announcements
  FOR SELECT TO anon, authenticated
  USING (
    (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()))
    OR (select private.is_admin())
  );

-- Admin-only mutation policies (separate from SELECT to avoid multiple permissive SELECTs)
CREATE POLICY "announcements_admin_insert" ON public.announcements
  FOR INSERT TO authenticated WITH CHECK ((select private.is_admin()));

CREATE POLICY "announcements_admin_update" ON public.announcements
  FOR UPDATE TO authenticated
  USING ((select private.is_admin()))
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "announcements_admin_delete" ON public.announcements
  FOR DELETE TO authenticated USING ((select private.is_admin()));
