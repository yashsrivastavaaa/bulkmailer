import { query } from '@/lib/db';
import { seal } from '@/lib/session';

export async function upsertUser(email: string) {
  const normalized = email.trim().toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAILS || 'yashsrivns@gmail.com').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  const role = adminEmails.includes(normalized) ? 'admin' : 'user';
  const { rows } = await query<{id:string;email:string;role:string}>(
    `INSERT INTO users (email, role) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET role=CASE WHEN $2='admin' THEN 'admin' ELSE users.role END, updated_at=now()
     RETURNING id,email,role`, [normalized, role]
  );
  return rows[0];
}
export async function saveGoogleAccount(userId: string, email: string, refreshToken: string) {
  await query(`INSERT INTO google_accounts(user_id,email,refresh_token) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,refresh_token=excluded.refresh_token,updated_at=now()`,[userId,email.toLowerCase(),seal(refreshToken)]);
}
export async function getUserPlan(userId:string){
 const {rows}=await query<any>(`SELECT p.slug AS key,p.name,p.price_monthly_cents AS price_cents,p.monthly_send_limit,p.max_recipients_per_campaign AS campaign_recipient_limit,p.max_attachment_mb AS attachment_limit_mb,p.max_custom_columns,p.features,COALESCE(s.status,'active') status,COALESCE(s.current_period_start, date_trunc('month', now())) AS current_period_start,COALESCE(s.current_period_end, date_trunc('month', now()) + interval '1 month') AS current_period_end,u.role FROM users u LEFT JOIN user_subscriptions s ON s.user_id=u.id AND s.status='active' LEFT JOIN plans p ON p.id=s.plan_id WHERE u.id=$1`,[userId]);
 if(!rows[0])return null; if(!rows[0].key){const free=await query<any>(`SELECT slug AS key,name,price_monthly_cents AS price_cents,monthly_send_limit,max_recipients_per_campaign AS campaign_recipient_limit,max_attachment_mb AS attachment_limit_mb,max_custom_columns,features FROM plans WHERE slug='free' LIMIT 1`);if(free.rows[0]){await query(`INSERT INTO user_subscriptions(user_id,plan_id) VALUES($1,$2) ON CONFLICT(user_id) DO NOTHING`,[userId,free.rows[0].id]);return {...free.rows[0],status:'active',role:rows[0].role};}} return rows[0];
}
export async function getUserBySessionEmail(email:string){const {rows}=await query<any>(`SELECT id,email,role FROM users WHERE lower(email)=lower($1) LIMIT 1`,[email]);return rows[0]||null;}


export async function getUsage(userId: string) {
  const { rows } = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM campaign_recipients cr
     JOIN campaigns c ON c.id = cr.campaign_id
     WHERE c.user_id = $1
       AND cr.status = 'sent'
       AND c.created_at >= date_trunc('month', now())`,
    [userId]
  );
  return Number(rows[0]?.count ?? 0);
}
