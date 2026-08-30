export type ClientAuth = {
  connected?: boolean;
  email?: string;
  plan?: any;
  role?: string;
  [key: string]: any;
};

const KEY = 'bulkmailer-auth-status-v1';
const TTL = 60_000;
let pending: Promise<ClientAuth> | null = null;

export async function getAuthStatus(force = false): Promise<ClientAuth> {
  if (typeof window !== 'undefined' && !force) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (cached && Date.now() - cached.at < TTL) return cached.data;
    } catch {}
  }
  if (!pending || force) {
    pending = fetch('/api/auth/status', { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || 'Could not load workspace status');
        return data;
      })
      .finally(() => { pending = null; });
  }
  const data = await pending;
  if (typeof window !== 'undefined') {
    try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data })); } catch {}
  }
  return data;
}

export function clearAuthStatusCache() {
  try { sessionStorage.removeItem(KEY); } catch {}
}
