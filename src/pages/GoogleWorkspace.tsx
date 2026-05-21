import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export function GoogleWorkspace() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '180px 96px 140px' }}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted-2)', display: 'block', marginBottom: 16 }}>
          Google Workspace Integration
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Lock size={20} style={{ color: 'var(--muted-2)' }} />
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 56, lineHeight: 1.04, letterSpacing: '-.02em', margin: 0, color: 'var(--muted)' }}>
            Google Workspace
          </h1>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 999, marginBottom: 32 }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>Q3 2026</span>
        </div>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 16, color: 'var(--muted)', lineHeight: 1.65, maxWidth: 520 }}>
          Users, OUs, shared drives, calendar resources. All provisioned from the same interface as Slack.
        </p>
      </motion.div>
    </div>
  );
}
