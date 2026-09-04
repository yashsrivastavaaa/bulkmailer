import pg from 'pg';
const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const connectionString = process.env.DATABASE_URL.replace(/([?&])sslmode=require(?=(&|$))/i, '$1sslmode=verify-full');
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await client.query(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, role TEXT NOT NULL DEFAULT 'user', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await client.query(`CREATE TABLE IF NOT EXISTS plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT, price_monthly_cents INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'USD', monthly_send_limit INTEGER NOT NULL DEFAULT 100, max_attachment_mb INTEGER NOT NULL DEFAULT 4, max_recipients_per_campaign INTEGER NOT NULL DEFAULT 100, max_custom_columns INTEGER NOT NULL DEFAULT 10, features JSONB NOT NULL DEFAULT '{}'::jsonb, is_active BOOLEAN NOT NULL DEFAULT true, sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await client.query(`CREATE TABLE IF NOT EXISTS user_subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, plan_id UUID NOT NULL REFERENCES plans(id), status TEXT NOT NULL DEFAULT 'active', starts_at TIMESTAMPTZ NOT NULL DEFAULT now(), ends_at TIMESTAMPTZ, current_period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month',now()), current_period_end TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month',now()) + interval '1 month'), overrides JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await client.query(`CREATE TABLE IF NOT EXISTS google_accounts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, email TEXT NOT NULL, refresh_token TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await client.query(`CREATE TABLE IF NOT EXISTS campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, subject TEXT NOT NULL, source_name TEXT, attachment_name TEXT, total_recipients INTEGER NOT NULL DEFAULT 0, sent_count INTEGER NOT NULL DEFAULT 0, failed_count INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ)`);
  await client.query(`CREATE TABLE IF NOT EXISTS campaign_recipients (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE, email TEXT NOT NULL, name TEXT, selected BOOLEAN NOT NULL DEFAULT true, status TEXT NOT NULL DEFAULT 'pending', provider_message_id TEXT, error TEXT, sent_at TIMESTAMPTZ, data JSONB NOT NULL DEFAULT '{}'::jsonb)`);
  await client.query(`CREATE INDEX IF NOT EXISTS campaign_recipients_campaign_idx ON campaign_recipients(campaign_id)`);
  await client.query(`CREATE TABLE IF NOT EXISTS contacts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, email TEXT NOT NULL, name TEXT, total_sent INTEGER NOT NULL DEFAULT 0, total_failed INTEGER NOT NULL DEFAULT 0, first_contacted_at TIMESTAMPTZ, last_contacted_at TIMESTAMPTZ, last_subject TEXT, last_status TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id,email))`);
  await client.query(`CREATE INDEX IF NOT EXISTS contacts_user_updated_idx ON contacts(user_id,updated_at DESC)`);
  await client.query(`CREATE INDEX IF NOT EXISTS contacts_user_email_idx ON contacts(user_id,email)`);
  await client.query(`CREATE TABLE IF NOT EXISTS feature_definitions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT UNIQUE NOT NULL, label TEXT NOT NULL, description TEXT, value_type TEXT NOT NULL DEFAULT 'boolean', enabled BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await client.query(`CREATE TABLE IF NOT EXISTS templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);

  await client.query(`ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ`);
  await client.query(`ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ`);
  await client.query(`UPDATE user_subscriptions SET current_period_start=COALESCE(current_period_start,date_trunc('month',now())), current_period_end=COALESCE(current_period_end,date_trunc('month',now())+interval '1 month') WHERE current_period_start IS NULL OR current_period_end IS NULL`);
  await client.query(`ALTER TABLE user_subscriptions ALTER COLUMN current_period_start SET DEFAULT date_trunc('month',now())`);
  await client.query(`ALTER TABLE user_subscriptions ALTER COLUMN current_period_end SET DEFAULT (date_trunc('month',now())+interval '1 month')`);
  await client.query(`ALTER TABLE user_subscriptions ALTER COLUMN current_period_start SET NOT NULL`);
  await client.query(`ALTER TABLE user_subscriptions ALTER COLUMN current_period_end SET NOT NULL`);

  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS key TEXT`, `ALTER TABLE plans ADD COLUMN IF NOT EXISTS slug TEXT`, `ALTER TABLE plans ADD COLUMN IF NOT EXISTS description TEXT`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_monthly_cents INTEGER NOT NULL DEFAULT 0`, `ALTER TABLE plans ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD'`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS monthly_send_limit INTEGER NOT NULL DEFAULT 100`, `ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_attachment_mb INTEGER NOT NULL DEFAULT 4`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_recipients_per_campaign INTEGER NOT NULL DEFAULT 100`, `ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_custom_columns INTEGER NOT NULL DEFAULT 10`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '{}'::jsonb`, `ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`, `ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
    `ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS label TEXT`, `ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS description TEXT`,
    `ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS value_type TEXT NOT NULL DEFAULT 'boolean'`, `ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true`, `ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
    `ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb`
  ];
  for (const sql of migrations) await client.query(sql);

  await client.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='key') THEN UPDATE plans SET key=COALESCE(NULLIF(btrim(key),''),NULLIF(lower(btrim(slug)),''),'legacy-'||id::text) WHERE key IS NULL OR btrim(key)=''; END IF; END $$`);
  await client.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='key') THEN UPDATE plans SET slug=COALESCE(NULLIF(btrim(slug),''),NULLIF(lower(btrim(key)),''),'legacy-'||id::text) WHERE slug IS NULL OR btrim(slug)=''; END IF; IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='price_cents') THEN UPDATE plans SET price_monthly_cents=price_cents WHERE price_monthly_cents=0 AND price_cents IS NOT NULL; END IF; IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='campaign_recipient_limit') THEN UPDATE plans SET max_recipients_per_campaign=campaign_recipient_limit WHERE max_recipients_per_campaign=100 AND campaign_recipient_limit IS NOT NULL; END IF; IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='attachment_limit_mb') THEN UPDATE plans SET max_attachment_mb=attachment_limit_mb WHERE max_attachment_mb=4 AND attachment_limit_mb IS NOT NULL; END IF; END $$`);
  await client.query(`UPDATE plans SET slug=COALESCE(NULLIF(lower(btrim(slug)),''),'legacy-'||id::text)`);
  await client.query(`DELETE FROM plans a USING plans b WHERE a.id<>b.id AND lower(a.slug)=lower(b.slug) AND a.id>b.id`);
  await client.query(`UPDATE plans SET key=COALESCE(NULLIF(lower(btrim(key)),''),NULLIF(lower(btrim(slug)),''),'legacy-'||id::text)`);
  await client.query(`DELETE FROM plans a USING plans b WHERE a.id<>b.id AND lower(a.key)=lower(b.key) AND a.id>b.id`);
  await client.query(`ALTER TABLE plans ALTER COLUMN key SET NOT NULL`);
  await client.query(`ALTER TABLE plans ALTER COLUMN slug SET NOT NULL`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS plans_key_unique ON plans(key)`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS plans_slug_unique ON plans(slug)`);
  await client.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feature_definitions' AND column_name='name') THEN UPDATE feature_definitions SET label=COALESCE(NULLIF(btrim(label),''),NULLIF(btrim(name),''),key); ELSE UPDATE feature_definitions SET label=COALESCE(NULLIF(btrim(label),''),key); END IF; END $$`);
  await client.query(`UPDATE feature_definitions SET label=COALESCE(NULLIF(btrim(label),''),key),description=COALESCE(description,''),value_type=COALESCE(NULLIF(value_type,''),'boolean')`);
  await client.query(`ALTER TABLE feature_definitions ALTER COLUMN label SET NOT NULL`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS feature_definitions_key_unique ON feature_definitions(key)`);

  await client.query(`INSERT INTO feature_definitions(key,label,description,value_type,enabled) VALUES ('excel_import','Excel / CSV import','Import structured recipient lists and spreadsheet fields.','boolean',true),('paste_recipients','Paste recipients','Paste multiple email addresses directly.','boolean',true),('personalization','Dynamic personalization','Use spreadsheet columns as merge fields.','boolean',true),('attachments','Attachments','Attach files to campaign messages.','boolean',true),('templates','Saved templates','Save and reuse message templates.','boolean',true),('scheduled_campaigns','Scheduled campaigns','Schedule campaigns for later delivery.','boolean',true),('analytics','Campaign analytics','View delivery and campaign performance.','boolean',true),('segments','Recipient segments','Save and reuse recipient segments.','boolean',true),('team_workspaces','Team workspaces','Collaborate with teammates in shared workspaces.','boolean',true),('api_access','API access','Connect Bulkmailer to external workflows.','boolean',true) ON CONFLICT(key) DO UPDATE SET label=excluded.label,description=excluded.description,value_type=excluded.value_type,updated_at=now()`);
  await client.query(`INSERT INTO plans(key,slug,name,description,price_monthly_cents,currency,monthly_send_limit,max_attachment_mb,max_recipients_per_campaign,max_custom_columns,features,is_active,sort_order) VALUES ('free','free','Free','Essential email sending for individuals.',0,'USD',100,4,100,10,'{"excel":true,"paste_emails":true,"personalization":true,"attachments":true,"templates":false,"scheduled":false,"analytics":false}',true,1),('starter','starter','Starter','For growing outreach and recurring campaigns.',900,'USD',1000,10,1000,30,'{"excel":true,"paste_emails":true,"personalization":true,"attachments":true,"templates":true,"scheduled":false,"analytics":true}',true,2),('pro','pro','Pro','Advanced automation and analytics.',1900,'USD',5000,20,5000,100,'{"excel":true,"paste_emails":true,"personalization":true,"attachments":true,"templates":true,"scheduled":true,"analytics":true,"segments":true,"priority_support":true}',true,3),('business','business','Business','High-volume sending and team workflows.',4900,'USD',25000,25,25000,500,'{"excel":true,"paste_emails":true,"personalization":true,"attachments":true,"templates":true,"scheduled":true,"analytics":true,"segments":true,"priority_support":true,"team_workspaces":true,"api_access":true}',true,4) ON CONFLICT(slug) DO UPDATE SET key=excluded.key, name=excluded.name,description=excluded.description,price_monthly_cents=excluded.price_monthly_cents,currency=excluded.currency,monthly_send_limit=excluded.monthly_send_limit,max_attachment_mb=excluded.max_attachment_mb,max_recipients_per_campaign=excluded.max_recipients_per_campaign,max_custom_columns=excluded.max_custom_columns,features=excluded.features,is_active=excluded.is_active,sort_order=excluded.sort_order,updated_at=now()`);

  // Repair legacy/incomplete subscription rows after the canonical plans have been seeded.
  await client.query(`
    INSERT INTO user_subscriptions(user_id,plan_id,status,current_period_start,current_period_end)
    SELECT u.id,p.id,'active',date_trunc('month',now()),date_trunc('month',now()) + interval '1 month'
    FROM users u
    CROSS JOIN plans p
    WHERE p.slug='free'
      AND NOT EXISTS (SELECT 1 FROM user_subscriptions s WHERE s.user_id=u.id AND s.plan_id IS NOT NULL)
    ON CONFLICT(user_id) DO UPDATE SET
      plan_id=EXCLUDED.plan_id,
      status='active',
      current_period_start=COALESCE(user_subscriptions.current_period_start, EXCLUDED.current_period_start),
      current_period_end=COALESCE(user_subscriptions.current_period_end, EXCLUDED.current_period_end),
      updated_at=now()
  `);

  const admins=(process.env.ADMIN_EMAILS||'yashsrivns@gmail.com').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  for(const email of admins) await client.query(`UPDATE users SET role='admin',updated_at=now() WHERE lower(email)=lower($1)`,[email]);
  await client.query('COMMIT');
  console.log('Bulkmailer database schema and migrations are ready.');
} catch (error) { await client.query('ROLLBACK'); console.error(error); process.exitCode=1; } finally { client.release(); await pool.end(); }
