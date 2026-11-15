import { FormEvent, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export function AuthGate({ children }: { children: (onSignOut: () => void) => React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) { setChecking(false); return }
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    const { error: authError } = await supabase!.auth.signInWithPassword({ email: email.trim(), password })
    if (authError) setError(authError.message)
    setBusy(false)
  }

  async function signOut() { await supabase?.auth.signOut() }

  const panel: React.CSSProperties = { width: 'min(100% - 32px, 440px)', margin: '12vh auto', padding: 28, border: '1px solid #334155', borderRadius: 16, background: '#17212b', color: '#f8fafc', boxShadow: '0 20px 60px #0005' }
  const input: React.CSSProperties = { width: '100%', padding: '12px 14px', marginTop: 7, borderRadius: 8, border: '1px solid #475569', background: '#0f1720', color: 'white' }
  if (checking) return <main style={panel}>Checking sign-in…</main>
  if (!isSupabaseConfigured) return <main style={panel}><h1>Database setup required</h1><p>Configure the Supabase project URL and public anon key in your GitHub Actions repository variables, then redeploy.</p><p>See <code>SUPABASE_SETUP.md</code> in the repository.</p></main>
  if (!session) return <main style={panel}>
    <p style={{ letterSpacing: 2, fontSize: 12, color: '#93c5fd' }}>86TH FAOCC · MOVEMENT REPORTS</p>
    <h1 style={{ fontSize: 26, margin: '12px 0' }}>Team sign in</h1>
    <p style={{ color: '#cbd5e1', lineHeight: 1.5 }}>Sign in with an account invited by your Supabase project administrator.</p>
    <form onSubmit={signIn} style={{ display: 'grid', gap: 14, marginTop: 22 }}>
      <label>Email<input style={input} type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input style={input} type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      {error && <p role="alert" style={{ color: '#fca5a5' }}>{error}</p>}
      <button className="btn primary" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <p style={{ marginTop: 18, color: '#94a3b8', fontSize: 12 }}>New accounts must be created or invited by an administrator. Public sign-up is not enabled by this application.</p>
  </main>
  return <>{children(signOut)}</>
}
