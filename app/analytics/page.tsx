'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import LoginRequired from '@/components/LoginRequired';
import { getAuthStatus } from '@/lib/client-auth';
import SelectMenu from '@/components/SelectMenu';

type Campaign = {
  id: string;
  subject: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: string;
  created_at: string;
  completed_at?: string;
};

const numberValue = (value: unknown) => Number(value || 0);

const percentage = (value: number, total: number) =>
  total ? Math.min(100, Math.round((value / total) * 100)) : 0;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function Analytics() {
  const [auth, setAuth] = useState<'loading' | 'guest' | 'ready'>('loading');
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<'all' | '30' | '7'>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const authStatus = await getAuthStatus();
        if (cancelled) return;

        if (!authStatus.connected) {
          setAuth('guest');
          setLoading(false);
          return;
        }

        setAuth('ready');
        const response = await fetch('/api/campaigns', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Could not load analytics');
        }

        if (!cancelled) {
          setItems(Array.isArray(data.campaigns) ? data.campaigns : []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load analytics');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const days = range === 'all' ? null : Number(range);
    const cutoff = days === null ? 0 : Date.now() - days * 86_400_000;

    return items.filter((campaign) => {
      const inRange = new Date(campaign.created_at).getTime() >= cutoff;
      const matchesStatus =
        statusFilter === 'all' || campaign.status === statusFilter;
      return inRange && matchesStatus;
    });
  }, [items, range, statusFilter]);

  const stats = useMemo(() => {
    const recipients = filtered.reduce(
      (sum, campaign) => sum + numberValue(campaign.total_recipients),
      0,
    );
    const sent = filtered.reduce(
      (sum, campaign) => sum + numberValue(campaign.sent_count),
      0,
    );
    const failed = filtered.reduce(
      (sum, campaign) => sum + numberValue(campaign.failed_count),
      0,
    );

    return {
      recipients,
      sent,
      failed,
      campaigns: filtered.length,
      delivery: percentage(sent, recipients),
    };
  }, [filtered]);

  const dailyVolume = useMemo(() => {
    const days = new Map<string, { date: Date; recipients: number; sent: number; campaigns: number }>();
    filtered.forEach((campaign) => {
      const date = new Date(campaign.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const current = days.get(key) || { date, recipients: 0, sent: 0, campaigns: 0 };
      current.recipients += numberValue(campaign.total_recipients);
      current.sent += numberValue(campaign.sent_count);
      current.campaigns += 1;
      days.set(key, current);
    });
    return [...days.values()].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-14);
  }, [filtered]);

  const maxDailyAudience = useMemo(
    () => Math.max(...dailyVolume.map((day) => day.recipients), 1),
    [dailyVolume],
  );

  if (auth === 'loading') return <LoadingScreen />;

  if (auth === 'guest') {
    return (
      <LoginRequired
        title="Your analytics are private"
        description="Sign in with Google to see campaign performance and delivery insights."
      />
    );
  }

  return (
    <>
      <header className="floating-page-head analytics-page-head">
        <div>
          <div className="eyebrow">ANALYTICS</div>
          <h1>Performance, without the noise.</h1>
          <p>
            Track sending volume, delivery health and campaign performance from
            the data already in your workspace.
          </p>
        </div>
        <div className="head-stack">
          <div className="filter-row analytics-filters">
            <div className="analytics-range" role="group" aria-label="Analytics time range">
              {(['all', '30', '7'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={range === value ? 'active' : ''}
                  onClick={() => setRange(value)}
                >
                  {value === 'all' ? 'All time' : `${value} days`}
                </button>
              ))}
            </div>
            <SelectMenu className="filter-select" value={statusFilter} onChange={setStatusFilter} options={[
              { value: 'all', label: 'All statuses' }, { value: 'completed', label: 'Completed' }, { value: 'completed_with_errors', label: 'Completed with errors' },
              { value: 'sending', label: 'Sending' }, { value: 'failed', label: 'Failed' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'draft', label: 'Drafts' }
            ]} aria-label="Analytics status" />
            <Link href="/dashboard" className="btn btn-primary">
              New campaign →
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="floating-alert" role="alert">
          <span>{error}</span>
          <Link href="/dashboard" className="alert-action">
            Back to workspace
          </Link>
        </div>
      )}

      <section className="analytics-kpis" aria-label="Analytics summary">
        <div className="analytics-kpi">
          <div>
            <span>Recipients processed</span>
            <small>Audience volume</small>
          </div>
          <strong>{loading ? '—' : stats.recipients.toLocaleString()}</strong>
        </div>
        <div className="analytics-kpi">
          <div>
            <span>Emails sent</span>
            <small>Successful sends</small>
          </div>
          <strong className="success-text">
            {loading ? '—' : stats.sent.toLocaleString()}
          </strong>
        </div>
        <div className="analytics-kpi">
          <div>
            <span>Delivery rate</span>
            <small>Sent ÷ recipients</small>
          </div>
          <strong>{loading ? '—' : `${stats.delivery}%`}</strong>
        </div>
        <div className="analytics-kpi">
          <div>
            <span>Failed</span>
            <small>Needs attention</small>
          </div>
          <strong className={stats.failed ? 'danger-text' : ''}>
            {loading ? '—' : stats.failed.toLocaleString()}
          </strong>
        </div>
      </section>

      {loading ? (
        <div className="analytics-skeleton-grid" aria-label="Loading analytics" role="status">
          <div className="analytics-card chart-skeleton">
            <div className="skeleton-line wide" />
            <div className="skeleton-chart" />
          </div>
          <div className="analytics-card chart-skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-ring" />
          </div>
        </div>
      ) : (
        <div className="analytics-grid analytics-grid-v2">
          <section className="analytics-card analytics-volume-card">
            <div className="analytics-head">
              <div>
                <div className="analytics-title">Campaign volume</div>
                <div className="analytics-sub">
                  Total audience processed each day.
                </div>
              </div>
              <span className="analytics-count">{stats.campaigns} campaigns</span>
            </div>

            {!dailyVolume.length ? (
              <div className="analytics-empty">
                <strong>No campaign data yet</strong>
                <span>Create a campaign to start building your performance history.</span>
                <Link href="/dashboard" className="btn btn-primary">
                  Create campaign →
                </Link>
              </div>
            ) : (
              <div className="analytics-bars-v2" aria-label="Daily audience sizes">
                {dailyVolume.map((day) => {
                  const height = Math.max(
                    6,
                    (day.recipients / maxDailyAudience) * 100,
                  );

                  return (
                    <div
                      key={day.date.toISOString()}
                      className="analytics-bar-wrap"
                      title={`Total campaigns: ${day.campaigns} · Total emails sent: ${day.sent.toLocaleString()}`}
                    >
                      <div className="analytics-bar-v2" style={{ height: `${height}%` }} />
                      <span className="analytics-bar-tooltip" role="tooltip">
                        <b>Total campaigns: {day.campaigns.toLocaleString()}</b>
                        <small>Total emails sent: {day.sent.toLocaleString()}</small>
                      </span>
                      <small>{formatDate(day.date.toISOString())}</small>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="analytics-card delivery-card">
            <div className="analytics-title">Delivery health</div>
            <div className="analytics-sub">Across the selected period.</div>
            <div
              className="delivery-ring"
              style={{
                background: `conic-gradient(var(--primary) 0 ${stats.delivery}%, var(--surface-2) ${stats.delivery}% 100%)`,
              }}
            >
              <div>
                <strong>{stats.delivery}%</strong>
                <span>delivered</span>
              </div>
            </div>
            <div className="delivery-legend">
              <div>
                <i className="legend-dot sent-dot" />
                <span>Sent</span>
                <b>{stats.sent.toLocaleString()}</b>
              </div>
              <div>
                <i className="legend-dot failed-dot" />
                <span>Failed</span>
                <b>{stats.failed.toLocaleString()}</b>
              </div>
            </div>
          </section>

          <section className="analytics-card wide analytics-performance-card">
            <div className="analytics-head">
              <div>
                <div className="analytics-title">Campaign performance</div>
                <div className="analytics-sub">
                  Open a campaign to inspect recipient-level activity and delivery details.
                </div>
              </div>
              <Link href="/campaigns" className="ghost-btn">
                All campaigns →
              </Link>
            </div>

            {!filtered.length ? (
              <div className="analytics-empty">
                <strong>No campaigns match this view</strong>
                <span>Try a wider time range or a different status filter.</span>
              </div>
            ) : (
              <div className="analytics-performance-table">
                <div className="analytics-performance-row header">
                  <span>Campaign</span>
                  <span>Audience</span>
                  <span>Sent</span>
                  <span>Failed</span>
                  <span>Delivery</span>
                  <span>Date</span>
                </div>
                {filtered.slice(0, 10).map((campaign) => {
                  const audience = numberValue(campaign.total_recipients);
                  const sent = numberValue(campaign.sent_count);
                  const failed = numberValue(campaign.failed_count);
                  const delivery = percentage(sent, audience);

                  return (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}`}
                      className="analytics-performance-row"
                    >
                      <span>
                        <b>{campaign.subject || 'Untitled campaign'}</b>
                        <small>{String(campaign.status || '').replaceAll('_', ' ')}</small>
                      </span>
                      <span>{audience.toLocaleString()}</span>
                      <span className="success-text">{sent.toLocaleString()}</span>
                      <span className={failed ? 'danger-text' : ''}>{failed.toLocaleString()}</span>
                      <span className="delivery-cell">
                        <b>{delivery}%</b>
                        <i className="mini-progress">
                          <em style={{ width: `${delivery}%` }} />
                        </i>
                      </span>
                      <span>{formatDate(campaign.created_at)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
