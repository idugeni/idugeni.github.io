-- ============================================================
-- DATABASE INDEXES FOR VERCEL FREE PLAN OPTIMIZATION
-- Run in Supabase SQL Editor (one query at a time)
-- ============================================================

-- page_views: critical for analytics performance
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_halaman ON page_views (halaman);

-- blog_artikel: critical for public listing and admin queries
CREATE INDEX IF NOT EXISTS idx_blog_artikel_slug ON blog_artikel (slug);
CREATE INDEX IF NOT EXISTS idx_blog_artikel_status_created ON blog_artikel (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_artikel_kategori ON blog_artikel (kategori_id) WHERE kategori_id IS NOT NULL;

-- blog_like: needed for toggle dedup + unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_like_unique ON blog_like (artikel_id, ip_address);

-- shortlinks: critical for public redirect performance
CREATE INDEX IF NOT EXISTS idx_shortlinks_code ON shortlinks (code);
CREATE INDEX IF NOT EXISTS idx_shortlinks_deleted ON shortlinks (deleted_at) WHERE deleted_at IS NOT NULL;

-- shortlink_clicks: critical for analytics and anomaly detection
CREATE INDEX IF NOT EXISTS idx_shortlink_clicks_shortlink_id ON shortlink_clicks (shortlink_id);
CREATE INDEX IF NOT EXISTS idx_shortlink_clicks_clicked_at ON shortlink_clicks (clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_shortlink_clicks_ip ON shortlink_clicks (ip_address) WHERE ip_address IS NOT NULL;

-- contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_unread ON contact_messages (dibaca) WHERE dibaca = false;

-- newsletter_subscribers
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON newsletter_subscribers (token_unsubscribe);
