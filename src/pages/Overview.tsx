import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const rt = (delay = 0) => ({ duration: 0.9, ease: [0.2, 0.7, 0.3, 1] as [number, number, number, number], delay });

const SYSTEMS = [
  { num: '01', id: 'slack',     name: 'Slack',             brief: 'Provision channels, groups, and welcome messages on day one.', status: 'LIVE',    href: '/slack'     },
  { num: '02', id: 'workspace', name: 'Google Workspace',  brief: 'Users, OUs, drives, and calendar resources. Q3 2026.',         status: 'SOON',    href: '/workspace' },
  { num: '03', id: 'm365',      name: 'Microsoft 365',     brief: 'Entra ID, Teams, SharePoint, Exchange. Q4 2026.',              status: 'SOON',    href: '/m365'      },
];

export function Overview() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(100px,15vw,180px) clamp(20px,8vw,96px) 140px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={rt(0)}
        style={{ maxWidth: 720, marginBottom: 96 }}
      >
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 400, fontSize: 'clamp(44px, 8vw, 80px)', lineHeight: 1.04, letterSpacing: '-.025em', margin: '0 0 32px' }}>
          Onboarding,<br /><span className="hand">scripted</span>
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 18, lineHeight: 1.65, color: 'var(--muted)', maxWidth: 560 }}>
          Connect your workspace tools once. Primitive Onboarding provisions every new hire automatically — channels, permissions, welcome messages — from a single form.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          {user ? (
            <button onClick={() => navigate('/slack')} className="btn btn-accent">
              Go to Slack <span className="arrow">→</span>
            </button>
          ) : (
            <button onClick={signInWithGoogle} className="btn btn-accent">
              Sign in to get started <span className="arrow">→</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Systems index */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={rt(0.18)}>
        <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--accent)', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            Integrations · 03
          </span>
        </div>

        {SYSTEMS.map((s, i) => {
          const isLive = s.status === 'LIVE';
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.28 + i * 0.08, ease: [0.2, 0.7, 0.3, 1] as [number, number, number, number] }}
            >
              <div
                onClick={() => isLive && navigate(s.href)}
                style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 88px',
                  alignItems: 'center', gap: 28,
                  padding: '28px 4px',
                  borderBottom: '1px solid var(--rule)',
                  cursor: isLive ? 'pointer' : 'default',
                  opacity: isLive ? 1 : 0.45,
                  transition: 'padding .3s var(--e-ease)',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (isLive) (e.currentTarget as HTMLElement).style.paddingLeft = '16px'; }}
                onMouseLeave={e => { if (isLive) (e.currentTarget as HTMLElement).style.paddingLeft = '4px'; }}
              >
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted-2)' }}>{s.num}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1, letterSpacing: '-.005em' }}>{s.name}</span>
                  <span style={{ fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s.brief}</span>
                </span>
                <span style={{
                  fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '.2em',
                  padding: '5px 12px', borderRadius: 999,
                  background: isLive ? 'var(--accent-soft)' : 'var(--paper-2)',
                  color: isLive ? 'var(--accent)' : 'var(--muted-2)',
                  border: `1px solid ${isLive ? 'var(--accent)' : 'var(--rule)'}`,
                  textTransform: 'uppercase', whiteSpace: 'nowrap', justifySelf: 'start',
                }}>
                  {s.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* How it works — short */}
      <motion.div
        initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={rt(0)}
        className="ob-how-grid"
        style={{ marginTop: 'clamp(60px,10vw,120px)' }}
      >
        {[
          { n: '01', t: 'Connect', d: 'Add the Primitive bot to your workspace once via OAuth.' },
          { n: '02', t: 'Map',     d: 'Define which roles belong in which channels. Saved forever.' },
          { n: '03', t: 'Onboard', d: 'Enter a new hire\'s email. The rest is automatic.' },
        ].map(s => (
          <div key={s.n} style={{ borderTop: '2px solid var(--accent)', paddingTop: 24 }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted-2)' }}>{s.n}</span>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 28, lineHeight: 1.1, margin: '10px 0 12px' }}>{s.t}</h3>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>{s.d}</p>
          </div>
        ))}
      </motion.div>

      <style>{`
        .ob-how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
        @media (max-width: 900px) { .ob-how-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .ob-how-grid { grid-template-columns: 1fr; gap: 32px; } }
      `}</style>
    </div>
  );
}
