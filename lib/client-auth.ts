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
      // Never trust a cached guest response. A successful OAuth redirect can
      // happen in another page lifecycle while sessionStorage survives, which
      // otherwise makes the freshly authenticated user look signed out.
      if (cached && cached.data?.connected === true && Date.now() - cached.at < TTL) {
        return cached.data;
      }
      if (cached && cached.data?.connected !== true) sessionStorage.removeItem(KEY);
    } catch {}
  }

  if (!pending || force) {
    pending = fetch('/api/auth/status', { cache: 'no-store', credentials: 'include' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || 'Could not load workspace status');
        return data;
      })
      .finally(() => { pending = null; });
  }

  const data = await pending;
  if (typeof window !== 'undefined') {
    try {
      // Only cache an authenticated response. Caching connected:false is the
      // source of the post-OAuth sign-in loop.
      if (data?.connected === true) {
        sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data }));
      } else {
        sessionStorage.removeItem(KEY);
      }
    } catch {}
  }
  return data;
}

export function clearAuthStatusCache() {
  try { sessionStorage.removeItem(KEY); } catch {}
}
