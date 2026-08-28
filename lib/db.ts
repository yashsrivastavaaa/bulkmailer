import { Pool, type PoolClient } from 'pg';

const globalForDb = globalThis as unknown as { bulkmailerPool?: Pool; bulkmailerSchemaReady?: Promise<void> };

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing.');
  if (!globalForDb.bulkmailerPool) {
    globalForDb.bulkmailerPool = new Pool({
      // pg-connection-string v3 will change `require` semantics. Keep
      // certificate verification explicit for production connections.
      connectionString: process.env.DATABASE_URL.replace(/([?&])sslmode=require(?=(&|$))/i, '$1sslmode=verify-full'),
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    });
  }
  return globalForDb.bulkmailerPool;
}

const schema = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  description TEXT, price_monthly_cents INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'USD',
  monthly_send_limit INTEGER NOT NULL DEFAULT 100, max_attachment_mb INTEGER NOT NULL DEFAULT 4,
  max_recipients_per_campaign INTEGER NOT NULL DEFAULT 100, max_custom_columns INTEGER NOT NULL DEFAULT 10,
  features JSONB NOT NULL DEFAULT '{}'::jsonb, is_active BOOLEAN NOT NULL DEFAULT true, sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id), status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(), ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month',now()),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month',now()) + interval '1 month'),
  overrides JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS google_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, refresh_token TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL, source_name TEXT, attachment_name TEXT, total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0, failed_count INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL, name TEXT, selected BOOLEAN NOT NULL DEFAULT true, status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT, error TEXT, sent_at TIMESTAMPTZ, data JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS campaign_recipients_campaign_idx ON campaign_recipients(campaign_id);
CREATE TABLE IF NOT EXISTS feature_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT UNIQUE NOT NULL, label TEXT NOT NULL,
  description TEXT, value_type TEXT NOT NULL DEFAULT 'boolean', enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

async function migrate(client: PoolClient) {
  // Users/admin
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`);

  // Canonical plan columns. Existing deployments may have the older names; keep them only as migration sources.
  const planMigrations = [
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS key TEXT`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS slug TEXT`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS description TEXT`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_monthly_cents INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD'`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS monthly_send_limit INTEGER NOT NULL DEFAULT 100`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_attachment_mb INTEGER NOT NULL DEFAULT 4`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_recipients_per_campaign INTEGER NOT NULL DEFAULT 100`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_custom_columns INTEGER NOT NULL DEFAULT 10`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '{}'::jsonb`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  ];
  for (const sql of planMigrations) await client.query(sql);

  // Copy values from legacy columns only when they exist.
  await client.query(`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='key') THEN
      UPDATE plans SET slug=COALESCE(NULLIF(btrim(slug),''), NULLIF(lower(btrim(key)),''), 'legacy-'||id::text)
      WHERE slug IS NULL OR btrim(slug)='';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='price_cents') THEN
      UPDATE plans SET price_monthly_cents=price_cents WHERE price_monthly_cents=0 AND price_cents IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='campaign_recipient_limit') THEN
      UPDATE plans SET max_recipients_per_campaign=campaign_recipient_limit WHERE max_recipients_per_campaign=100 AND campaign_recipient_limit IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='attachment_limit_mb') THEN
      UPDATE plans SET max_attachment_mb=attachment_limit_mb WHERE max_attachment_mb=4 AND attachment_limit_mb IS NOT NULL;
    END IF;
  END $$`);
  // Reconcile legacy/current plan identifiers before enforcing constraints.
  // Some deployed databases contain a NOT NULL `key` column while the canonical
  // schema uses `slug`; keep both populated so old and new code can coexist.
  await client.query(`UPDATE plans
    SET slug=COALESCE(NULLIF(lower(btrim(slug)),''),NULLIF(lower(btrim(key)),''),'legacy-'||id::text)
    WHERE slug IS NULL OR btrim(slug)=''`);
  await client.query(`UPDATE plans
    SET key=COALESCE(NULLIF(lower(btrim(key)),''),NULLIF(lower(btrim(slug)),''),'legacy-'||id::text)
    WHERE key IS NULL OR btrim(key)=''`);
  await client.query(`DELETE FROM plans a USING plans b
    WHERE a.id<>b.id AND lower(a.slug)=lower(b.slug) AND a.id>b.id`);
  await client.query(`DELETE FROM plans a USING plans b
    WHERE a.id<>b.id AND lower(a.key)=lower(b.key) AND a.id>b.id`);
  await client.query(`ALTER TABLE plans ALTER COLUMN key SET NOT NULL`);
  await client.query(`ALTER TABLE plans ALTER COLUMN slug SET NOT NULL`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS plans_key_unique ON plans(key)`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS plans_slug_unique ON plans(slug)`);

  // Subscription billing-period columns. Existing databases may predate these fields.
  await client.query(`ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ`);
  await client.query(`ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ`);
  await client.query(`UPDATE user_subscriptions SET current_period_start=COALESCE(current_period_start, date_trunc('month', now())), current_period_end=COALESCE(current_period_end, date_trunc('month', now()) + interval '1 month') WHERE current_period_start IS NULL OR current_period_end IS NULL`);
  await client.query(`ALTER TABLE user_subscriptions ALTER COLUMN current_period_start SET DEFAULT date_trunc('month', now())`);
  await client.query(`ALTER TABLE user_subscriptions ALTER COLUMN current_period_end SET DEFAULT (date_trunc('month', now()) + interval '1 month')`);
  await client.query(`ALTER TABLE user_subscriptions ALTER COLUMN current_period_start SET NOT NULL`);
  await client.query(`ALTER TABLE user_subscriptions ALTER COLUMN current_period_end SET NOT NULL`);

  // Features: existing schema uses key/label; older builds also used name.
  await client.query(`ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS label TEXT`);
  await client.query(`ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS description TEXT`);
  await client.query(`ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS value_type TEXT NOT NULL DEFAULT 'boolean'`);
  await client.query(`ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true`);
  await client.query(`ALTER TABLE feature_definitions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`);
  await client.query(`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feature_definitions' AND column_name='name') THEN
      UPDATE feature_definitions SET label=COALESCE(NULLIF(btrim(label),''), NULLIF(btrim(name),''), key);
    ELSE
      UPDATE feature_definitions SET label=COALESCE(NULLIF(btrim(label),''), key);
    END IF;
  END $$`);
  await client.query(`UPDATE feature_definitions SET label=COALESCE(NULLIF(btrim(label),''),key), description=COALESCE(description,''), value_type=COALESCE(NULLIF(value_type,''),'boolean')`);
  await client.query(`ALTER TABLE feature_definitions ALTER COLUMN label SET NOT NULL`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS feature_definitions_key_unique ON feature_definitions(key)`);

  // Dynamic row data for spreadsheet columns.
  await client.query(`ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb`);

  // Seed/update feature catalog using canonical columns.
  await client.query(`INSERT INTO feature_definitions(key,label,description,value_type,enabled) VALUES
    ('excel_import','Excel / CSV import','Import structured recipient lists and spreadsheet fields.','boolean',true),
    ('paste_recipients','Paste recipients','Paste multiple email addresses directly.','boolean',true),
    ('personalization','Dynamic personalization','Use spreadsheet columns as merge fields.','boolean',true),
    ('attachments','Attachments','Attach files to campaign messages.','boolean',true),
    ('templates','Saved templates','Save and reuse message templates.','boolean',true),
    ('scheduled_campaigns','Scheduled campaigns','Schedule campaigns for later delivery.','boolean',true),
    ('analytics','Campaign analytics','View delivery and campaign performance.','boolean',true),
    ('segments','Recipient segments','Save and reuse recipient segments.','boolean',true),
    ('team_workspaces','Team workspaces','Collaborate with teammates in shared workspaces.','boolean',true),
    ('api_access','API access','Connect Bulkmailer to external workflows.','boolean',true)
    ON CONFLICT(key) DO UPDATE SET label=excluded.label,description=excluded.description,value_type=excluded.value_type,updated_at=now()`);

  await client.query(`INSERT INTO plans(key,slug,name,description,price_monthly_cents,currency,monthly_send_limit,max_attachment_mb,max_recipients_per_campaign,max_custom_columns,features,is_active,sort_order) VALUES
    ('free','free','Free','Essential email sending for individuals.',0,'USD',100,4,100,10,'{"excel":true,"paste_emails":true,"personalization":true,"attachments":true,"templates":false,"scheduled":false,"analytics":false}',true,1),
    ('starter','starter','Starter','For growing outreach and recurring campaigns.',900,'USD',1000,10,1000,30,'{"excel":true,"paste_emails":true,"personalization":true,"attachments":true,"templates":true,"scheduled":false,"analytics":true}',true,2),
    ('pro','pro','Pro','Advanced automation and analytics.',1900,'USD',5000,20,5000,100,'{"excel":true,"paste_emails":true,"personalization":true,"attachments":true,"templates":true,"scheduled":true,"analytics":true,"segments":true,"priority_support":true}',true,3),
    ('business','business','Business','High-volume sending and team workflows.',4900,'USD',25000,25,25000,500,'{"excel":true,"paste_emails":true,"personalization":true,"attachments":true,"templates":true,"scheduled":true,"analytics":true,"segments":true,"priority_support":true,"team_workspaces":true,"api_access":true}',true,4)
    ON CONFLICT(slug) DO UPDATE SET key=excluded.key,name=excluded.name,description=excluded.description,price_monthly_cents=excluded.price_monthly_cents,currency=excluded.currency,monthly_send_limit=excluded.monthly_send_limit,max_attachment_mb=excluded.max_attachment_mb,max_recipients_per_campaign=excluded.max_recipients_per_campaign,max_custom_columns=excluded.max_custom_columns,features=excluded.features,is_active=excluded.is_active,sort_order=excluded.sort_order,updated_at=now()`);

  // Ensure the configured administrator is an admin without granting admin to anyone else.
  const adminEmails = (process.env.ADMIN_EMAILS || 'yashsrivns@gmail.com').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  for (const email of adminEmails) await client.query(`UPDATE users SET role='admin',updated_at=now() WHERE lower(email)=lower($1)`, [email]);
}

export async function ensureSchema() {
  if (!globalForDb.bulkmailerSchemaReady) {
    globalForDb.bulkmailerSchemaReady = (async () => {
      const client = await getPool().connect();
      try { await client.query('BEGIN'); await client.query(schema); await migrate(client); await client.query('COMMIT'); }
      catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
    })();
  }
  await globalForDb.bulkmailerSchemaReady;
}

export async function query<T extends import('pg').QueryResultRow = any>(
  text: string,
  values: any[] = []
) {
  await ensureSchema();
  return getPool().query<T>(text, values);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  await ensureSchema();
  const client = await getPool().connect();
  try { await client.query('BEGIN'); const result = await fn(client); await client.query('COMMIT'); return result; }
  catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
}
