import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Plus, Trash2, Copy, Check, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/* ── Types ──────────────────────────────────────────────── */
interface RoleMapping { role: string; channels: string }
interface OnboardRun   { name: string; email: string; role: string; message: string }

const SLACK_OAUTH_URL =
  'https://slack.com/oauth/v2/authorize?client_id=11045945671745.11044643727238&scope=channels:join,users:read,chat:write,users:read.email,channels:read,im:write&user_scope=';

/* ── Helpers ─────────────────────────────────────────────── */
function mono(s: string) {
  return { fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500 as const, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: s };
}

function StepShell({ num, title, locked, children }: { num: string; title: string; locked: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      borderTop: `2px solid ${locked ? 'var(--rule)' : 'var(--accent)'}`,
      paddingTop: 28, marginBottom: 48,
      opacity: locked ? 0.38 : 1,
      transition: 'opacity .4s',
      pointerEvents: locked ? 'none' : 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
        <span style={{ ...mono('var(--muted-2)'), fontSize: 11 }}>{num}</span>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 28, lineHeight: 1, margin: 0, letterSpacing: '-.01em' }}>{title}</h2>
        {locked && <span style={{ ...mono('var(--muted-2)'), fontSize: 9, padding: '4px 10px', background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 999 }}>COMPLETE PREVIOUS STEP</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export function Slack() {
  const { user, signInWithGoogle } = useAuth();

  /* step state — persisted in supabase */
  const [botConnected, setBotConnected]     = useState(false);
  const [mappingsSaved, setMappingsSaved]   = useState(false);
  const [mappingsOpen, setMappingsOpen]     = useState(true);
  const [mappings, setMappings]             = useState<RoleMapping[]>([{ role: '', channels: '' }]);
  const [savingMappings, setSavingMappings] = useState(false);
  const [copied, setCopied]                 = useState(false);

  /* onboarding form */
  const [form, setForm] = useState<OnboardRun>({ name: '', email: '', role: '', message: '' });
  const [running, setRunning]   = useState(false);
  const [runResult, setRunResult] = useState<{ ok: boolean; msg: string } | null>(null);

  /* Load saved state from supabase on mount */
  useEffect(() => {
    if (!user || !supabase) return;
    supabase
      .from('slack_setup')
      .select('bot_connected, mappings')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setBotConnected(!!data.bot_connected);
        if (data.mappings?.length) {
          setMappings(data.mappings);
          setMappingsSaved(true);
          setMappingsOpen(false);
        }
      });
  }, [user]);

  /* Check for Slack OAuth callback */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('slack_connected') === '1') {
      handleBotConnected();
      window.history.replaceState({}, '', '/slack');
    }
  }, []);

  async function handleBotConnected() {
    setBotConnected(true);
    if (!user || !supabase) return;
    await supabase.from('slack_setup').upsert({ user_id: user.id, bot_connected: true }, { onConflict: 'user_id' });
  }

  async function saveMappings() {
    if (!user || !supabase) return;
    const clean = mappings.filter(m => m.role.trim() && m.channels.trim());
    if (!clean.length) return;
    setSavingMappings(true);
    await supabase.from('slack_setup').upsert(
      { user_id: user.id, bot_connected: true, mappings: clean },
      { onConflict: 'user_id' }
    );
    setSavingMappings(false);
    setMappingsSaved(true);
    setMappingsOpen(false);
  }

  async function runOnboarding() {
    if (!form.email || !form.role) return;
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: user?.id }),
      });
      const data = await res.json();
      setRunResult({ ok: res.ok, msg: data.message || (res.ok ? 'Provisioning complete.' : 'Something went wrong.') });
      if (res.ok) setForm({ name: '', email: '', role: '', message: '' });
    } catch {
      setRunResult({ ok: false, msg: 'Network error. Check that the server is running.' });
    }
    setRunning(false);
  }

  function copyCmd() {
    navigator.clipboard.writeText('/invite @PrimitiveOnboarding');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const savedRoles = mappings.filter(m => m.role.trim()).map(m => m.role.trim());

  /* ── Auth gate ────────────────────────────────────────── */
  if (!user) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '180px 96px 140px' }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ maxWidth: 560 }}>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 56, lineHeight: 1.06, margin: '0 0 24px' }}>
            Sign in to continue
          </h1>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: 16, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 36 }}>
            Your workspace settings, role mappings, and onboarding history are saved to your account.
          </p>
          <button onClick={signInWithGoogle} className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <LogIn size={14} />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Main flow ────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '160px 96px 140px' }}>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        style={{ marginBottom: 64 }}>
        <span style={{ ...mono('var(--accent)'), fontSize: 9, display: 'block', marginBottom: 16 }}>Slack Integration</span>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 56, lineHeight: 1.04, letterSpacing: '-.02em', margin: 0 }}>
          Set up Slack
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 15, color: 'var(--muted)', marginTop: 16, lineHeight: 1.65 }}>
          Complete each step once. Your configuration is saved — come back anytime to onboard new hires.
        </p>
      </motion.div>

      {/* ── STEP 1 — Connect bot ───────────────────────── */}
      <StepShell num="01" title="Connect the bot" locked={false}>
        <AnimatePresence mode="wait">
          {!botConnected ? (
            <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 24, maxWidth: 520 }}>
                Add the Primitive bot to your Slack workspace. This grants the permissions needed to invite new hires to channels and send welcome messages.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <a
                  href={SLACK_OAUTH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <img
                    alt="Add to Slack"
                    height={40}
                    width={139}
                    src="https://platform.slack-edge.com/img/add_to_slack.png"
                    srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                    style={{ display: 'block' }}
                  />
                </a>
                <span style={{ fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--muted)' }}>Then click below once added:</span>
                <button
                  onClick={handleBotConnected}
                  className="btn btn-ghost"
                  style={{ fontSize: 10, padding: '10px 18px' }}
                >
                  Bot connected
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 999 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                <span style={{ ...mono('var(--accent)'), fontSize: 10 }}>Bot connected to workspace</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </StepShell>

      {/* ── STEP 2 — Role-channel mapping ─────────────── */}
      <StepShell num="02" title="Map roles to channels" locked={!botConnected}>
        {/* Collapsed summary */}
        {mappingsSaved && !mappingsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 999, marginBottom: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              <span style={{ ...mono('var(--accent)'), fontSize: 10 }}>{mappings.filter(m => m.role).length} role{mappings.filter(m => m.role).length !== 1 ? 's' : ''} saved</span>
            </div>
            <button onClick={() => setMappingsOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', ...mono('var(--muted)'), fontSize: 10 }}>
              <ChevronDown size={12} /> Edit mappings
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {mappingsOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.65, maxWidth: 520 }}>
                For each role, list the channel names (comma-separated) the new hire should be invited to. Channel names without <code style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>#</code> are fine.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 36px', gap: 10 }}>
                  <span style={{ ...mono('var(--muted-2)'), fontSize: 9 }}>Role</span>
                  <span style={{ ...mono('var(--muted-2)'), fontSize: 9 }}>Channels (comma-separated)</span>
                  <span />
                </div>
                {mappings.map((m, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 36px', gap: 10, alignItems: 'center' }}>
                    <input
                      value={m.role}
                      onChange={e => setMappings(prev => prev.map((x, j) => j === i ? { ...x, role: e.target.value } : x))}
                      placeholder="e.g. engineer"
                      style={inputStyle}
                    />
                    <input
                      value={m.channels}
                      onChange={e => setMappings(prev => prev.map((x, j) => j === i ? { ...x, channels: e.target.value } : x))}
                      placeholder="general, eng-onboarding, announcements"
                      style={inputStyle}
                    />
                    <button
                      onClick={() => setMappings(prev => prev.length === 1 ? prev : prev.filter((_, j) => j !== i))}
                      style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--rule)', borderRadius: 8, cursor: 'pointer', color: 'var(--muted-2)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  onClick={() => setMappings(prev => [...prev, { role: '', channels: '' }])}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', ...mono('var(--muted)'), fontSize: 10 }}
                >
                  <Plus size={12} /> Add role
                </button>
                <button onClick={saveMappings} className="btn btn-accent" style={{ fontSize: 10, padding: '10px 22px', display: 'inline-flex', alignItems: 'center', gap: 8 }} disabled={savingMappings}>
                  {savingMappings ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  Save mappings
                </button>
                {mappingsSaved && (
                  <button onClick={() => setMappingsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, ...mono('var(--muted)'), fontSize: 10 }}>
                    <ChevronUp size={12} /> Collapse
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </StepShell>

      {/* ── STEP 3 — Private channels ─────────────────── */}
      <StepShell num="03" title="Private channels" locked={!mappingsSaved}>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, maxWidth: 520, marginBottom: 20 }}>
          The bot can only join private channels you manually add it to. For each private channel, open it in Slack and run this command:
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 8, marginBottom: 12, width: 'fit-content' }}>
          <code style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink)' }}>/invite @PrimitiveOnboarding</code>
          <button onClick={copyCmd} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
            {copied ? <Check size={14} style={{ color: 'var(--accent)' }} /> : <Copy size={14} />}
          </button>
        </div>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.6 }}>
          Public channels are handled automatically. Only private channels need this step.
        </p>
      </StepShell>

      {/* ── STEP 4 — Onboard a hire ───────────────────── */}
      <StepShell num="04" title="Onboard a new hire" locked={!mappingsSaved}>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, maxWidth: 520, marginBottom: 28 }}>
          Enter the new hire's details. The bot will look them up by email, invite them to the right channels, and send a welcome message.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ ...mono('var(--muted-2)'), fontSize: 9, display: 'block', marginBottom: 6 }}>Full name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ada Lovelace" style={inputStyle} />
          </div>
          <div>
            <label style={{ ...mono('var(--muted-2)'), fontSize: 9, display: 'block', marginBottom: 6 }}>Work email <span style={{ color: 'var(--accent)' }}>*</span></label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ada@company.com" type="email" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ ...mono('var(--muted-2)'), fontSize: 9, display: 'block', marginBottom: 6 }}>Role <span style={{ color: 'var(--accent)' }}>*</span></label>
          {savedRoles.length > 0 ? (
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, appearance: 'none' as const }}>
              <option value="">Select role...</option>
              {savedRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          ) : (
            <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="engineer" style={inputStyle} />
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ ...mono('var(--muted-2)'), fontSize: 9, display: 'block', marginBottom: 6 }}>Welcome message (optional)</label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Hey! Welcome to the team. Looking forward to working with you."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={runOnboarding}
            disabled={!form.email || !form.role || running}
            className="btn btn-accent"
            style={{ fontSize: 10, padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: (!form.email || !form.role) ? 0.5 : 1 }}
          >
            {running ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {running ? 'Provisioning...' : 'Provision new hire'}
          </button>

          <AnimatePresence>
            {runResult && (
              <motion.span
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: runResult.ok ? 'var(--accent)' : 'oklch(0.52 0.14 28)' }}
              >
                {runResult.msg}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </StepShell>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        select option { font-family: var(--f-body); }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  fontFamily: 'var(--f-body)', fontSize: 14,
  background: 'var(--paper)', border: '1px solid var(--rule)',
  borderRadius: 8, color: 'var(--ink)', outline: 'none',
  transition: 'border-color .2s',
};
