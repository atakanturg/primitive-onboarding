import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, LogIn, LogOut, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROUTES = [
  { path: '/',          label: 'Overview', locked: false },
  { path: '/slack',     label: 'Slack',    locked: false },
  { path: '/workspace', label: 'Workspace',locked: true  },
  { path: '/m365',      label: 'M365',     locked: true  },
];

const ACCENT = 'var(--accent)';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { user, signInWithGoogle, signOut } = useAuth();

  const pillStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, padding: 8,
    background: 'rgba(250,250,247,.82)',
    backdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(10,10,10,.08)',
    borderRadius: 'var(--r-pill)',
    boxShadow: '0 12px 40px rgba(10,10,10,.04), 0 1px 0 rgba(255,255,255,.5) inset',
    pointerEvents: 'auto',
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
      <div style={pillStyle}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', color: 'var(--ink)', border: 'none', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(10,10,10,.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: 4, paddingRight: 4, alignItems: 'center' }}>
                {ROUTES.map(route => {
                  const isActive = location.pathname === route.path;
                  return (
                    <Link
                      key={route.path}
                      to={route.path}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '11px 18px',
                        background: isActive ? ACCENT : 'transparent',
                        color: isActive ? 'var(--paper)' : route.locked ? 'var(--muted-2)' : 'var(--muted)',
                        border: 'none', textDecoration: 'none', borderRadius: 'var(--r-pill)',
                        fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500,
                        letterSpacing: '.16em', textTransform: 'uppercase',
                        transition: 'background .2s, color .2s', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { if (!isActive && !route.locked) { (e.currentTarget as HTMLElement).style.background = 'rgba(10,10,10,.05)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; } }}
                      onMouseLeave={e => { if (!isActive && !route.locked) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; } }}
                    >
                      {route.locked
                        ? <Lock size={9} style={{ opacity: 0.5 }} />
                        : <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--paper)' : ACCENT, opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
                      }
                      {route.label}
                    </Link>
                  );
                })}

                {/* Auth button */}
                {user ? (
                  <button
                    onClick={signOut}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 18px', background: 'transparent', color: 'var(--muted)',
                      border: 'none', borderRadius: 'var(--r-pill)',
                      fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500,
                      letterSpacing: '.16em', textTransform: 'uppercase',
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(10,10,10,.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                ) : (
                  <button
                    onClick={signInWithGoogle}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 18px', background: ACCENT, color: 'var(--paper)',
                      border: 'none', borderRadius: 'var(--r-pill)',
                      fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500,
                      letterSpacing: '.16em', textTransform: 'uppercase',
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink)')}
                    onMouseLeave={e => (e.currentTarget.style.background = ACCENT)}
                  >
                    <LogIn size={12} />
                    Sign in
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
