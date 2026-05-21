import { motion } from 'motion/react';
import { TiltCard } from '../components/TiltCard';
import { useEffect, useState } from 'react';

const PIPELINE_NODES = ['CSV Upload', 'UID Resolve', 'Channel Invite', 'Welcome DM', 'Audit Log'];

function ProvisionPipeline() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % PIPELINE_NODES.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: 32, position: 'relative' }}>
      <style>{`@keyframes pulse-node { 0%,100%{box-shadow:0 0 0 0 var(--accent)} 50%{box-shadow:0 0 0 6px rgba(0,0,0,0)} }`}</style>
      {PIPELINE_NODES.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i <= active ? 'var(--accent)' : 'var(--paper-2)',
              border: `2px solid ${i <= active ? 'var(--accent)' : 'var(--rule)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .4s, border-color .4s',
              animation: i === active ? 'pulse-node .9s ease-out' : 'none',
            }}>
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 600,
                color: i <= active ? 'var(--paper)' : 'var(--muted-2)',
                transition: 'color .4s',
              }}>{String(i + 1).padStart(2, '0')}</span>
            </div>
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: 8, fontWeight: 500,
              letterSpacing: '.14em', textTransform: 'uppercase', whiteSpace: 'nowrap',
              color: i <= active ? 'var(--accent)' : 'var(--muted-2)',
              transition: 'color .4s',
            }}>{label}</span>
          </div>
          {i < PIPELINE_NODES.length - 1 && (
            <div style={{
              width: 48, height: 2, marginBottom: 22,
              background: i < active ? 'var(--accent)' : 'var(--rule)',
              transition: 'background .4s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

const rt = (delay = 0) => ({ duration: 0.9, ease: [0.2, 0.7, 0.3, 1] as [number, number, number, number], delay });

const FEATURES = [
  { num: '01', title: 'Slack',     desc: 'Channels, groups, DMs, permissions. Provisioned on day one.' },
  { num: '02', title: 'Workspace', desc: 'Users, OUs, drives, calendar resources. Q3 2026.' },
  { num: '03', title: 'M365',      desc: 'Entra ID, Teams, SharePoint, Exchange. Q4 2026.' },
  { num: '04', title: 'Dry run',   desc: 'Preview every change. Safe to run repeatedly.' },
  { num: '05', title: 'Audit log', desc: 'Every API call logged with diffs. SOC 2 and ISO 27001.' },
  { num: '06', title: 'Rollback',  desc: 'Undo a run with one command.' },
];

const STEPS = [
  {
    num: '01', badge: 'CONFIGURE',
    title: 'Set up your .env',
    desc: 'Define your Slack bot token and map roles to channel IDs.',
    code: 'TENANT_ACME_SLACK_BOT_TOKEN=xoxb-...\nTENANT_ACME_CHANNELS_ENGINEER=C0ABC,C0DEF',
  },
  {
    num: '02', badge: 'PROVISION',
    title: 'Run the engine',
    desc: 'Pass a user record via CLI. The engine resolves the Slack UID, invites to channels, and sends a welcome DM.',
    code: 'python3 main.py --tenant ACME provision \\\n  --user-id emp-8492 \\\n  --email user@company.com \\\n  --role engineer',
  },
  {
    num: '03', badge: 'STATE',
    title: 'Idempotent by default',
    desc: 'Every run is recorded. Re-running the same user-id is a no-op.',
    code: 'rm data/state.json',
  },
];

const featureStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const featureItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function TypewriterCode({ code, stepDelay }: { code: string; stepDelay: number }) {
  const lines = code.split('\n');
  return (
    <pre style={{
      fontFamily: 'var(--f-mono)', fontSize: 11, lineHeight: 1.7,
      background: 'var(--paper-2)', border: '1px solid var(--rule)',
      borderRadius: 8, padding: '14px 16px', color: 'var(--ink-2)',
      overflowX: 'auto', whiteSpace: 'pre-wrap', marginTop: 8,
    }}>
      {lines.map((line, li) => (
        <motion.span
          key={li}
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            delay: stepDelay + li * 0.18,
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          style={{ display: 'block' }}
        >
          {line || ' '}
        </motion.span>
      ))}
    </pre>
  );
}

export function Home() {
  return (
    <div>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={rt(0)}
        style={{ padding: '200px 96px 80px', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}
      >
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 400, fontSize: 84, lineHeight: 1.04, letterSpacing: '-.025em', color: 'var(--ink)', margin: 0 }}>
          Onboarding,<br />
          <span className="hand">scripted</span>
        </h1>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36 }}>
          <a href="https://github.com/atakanturg/primitive-onboarding" target="_blank" rel="noopener noreferrer" className="btn btn-accent">
            View on GitHub <span className="arrow">→</span>
          </a>
          <a href="#how" className="btn btn-ghost">How it works</a>
        </div>
        <ProvisionPipeline />
      </motion.section>

      {/* Capabilities */}
      <section style={{ padding: '96px 96px 80px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32, paddingBottom: 12, borderBottom: '1px solid var(--accent)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            background: 'var(--accent-soft)', borderRadius: 999,
            fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 600,
            letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}>
            CAPABILITIES · 06
          </span>
        </div>
        <motion.div
          className="feature-grid"
          variants={featureStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {FEATURES.map(f => (
            <motion.article key={f.num} className="feature" variants={featureItem}>
              <span className="feature__num">{f.num}</span>
              <h3 className="feature__title">{f.title}</h3>
              <p className="feature__body">{f.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '32px 96px 96px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 56, paddingBottom: 12, borderBottom: '1px solid var(--accent)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            background: 'var(--accent-soft)', borderRadius: 999,
            fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 600,
            letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}>
            HOW IT WORKS · 03
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56 }}>
          {STEPS.map((step, i) => (
            <motion.article
              key={step.num}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.2, 0.7, 0.3, 1] as [number, number, number, number], delay: i * 0.12 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 500, letterSpacing: '.1em', color: 'var(--muted-2)' }}>{step.num}</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '.18em', color: 'var(--accent)' }}>{step.badge}</span>
              </div>
              <div style={{ background: 'var(--accent)', height: 2, width: 24 }} />
              <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 400, fontSize: 32, lineHeight: 1, letterSpacing: '-.01em', color: 'var(--ink)', margin: 0 }}>{step.title}</h3>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>{step.desc}</p>
              <TiltCard intensity={3}>
                <TypewriterCode code={step.code} stepDelay={i * 0.12 + 0.5} />
              </TiltCard>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="cta-band">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--f-display)', fontWeight: 400, fontSize: 56, lineHeight: 1, letterSpacing: '-.02em', color: 'var(--paper)' }}>
              One CSV. One run.
            </span>
            <a href="https://github.com/atakanturg/primitive-onboarding" target="_blank" rel="noopener noreferrer" className="btn btn-on-ink">
              View source <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>

      <div style={{ height: 120 }} />
    </div>
  );
}
