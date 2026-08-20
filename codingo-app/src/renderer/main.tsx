import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { isSupabaseConfigured, isValidPhone, supabase, type AuthSession } from './auth'
import { lessons, progressPercent, runPractice, unlockedLessonIds, type Lesson, type PracticeResult } from './learning'
import { loadProgress, markComplete, readLocal } from './progress'
import './styles.css'

function AuthScreen({ onSignedIn, initialMessage = '' }: { onSignedIn: (session: AuthSession) => void; initialMessage?: string }): ReactNode {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(initialMessage)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!supabase) return
    if (!isValidPhone(phone)) { setMessage('Use international format, for example +919876543210.'); return }
    if (password.length < 8) { setMessage('Use a password with at least 8 characters.'); return }
    setBusy(true); setMessage('')
    const response = mode === 'login'
      ? await supabase.auth.signInWithPassword({ phone, password })
      : await supabase.auth.signUp({ phone, password })
    setBusy(false)
    if (response.error) { setMessage(response.error.message); return }
    if (response.data.session) { onSignedIn(response.data.session); return }
    setMessage('Your account was created. You can now log in.')
  }

  if (!isSupabaseConfigured) return <main className="auth-page"><section className="auth-card setup-card"><div className="brand"><span className="brand-mark">C</span><span>Codingo</span></div><p className="eyebrow">AUTHENTICATION SETUP</p><h1>Connect your Supabase project.</h1><p>Add your project URL and publishable key to a local <code>.env</code> file, then restart the app.</p><pre>VITE_SUPABASE_URL=ΓÇª{`\n`}VITE_SUPABASE_PUBLISHABLE_KEY=ΓÇª</pre><small>Never add a service-role key to the desktop app.</small></section></main>

  return <main className="auth-page"><section className="auth-card"><div className="brand"><span className="brand-mark">C</span><span>Codingo</span></div><p className="eyebrow">YOUR LEARNING SPACE</p><h1>{mode === 'login' ? 'Welcome back.' : 'Start learning.'}</h1><p className="auth-copy">{mode === 'login' ? 'Sign in to continue your progress.' : 'Create an account to save your learning path.'}</p><form onSubmit={submit} noValidate><label htmlFor="phone">Mobile number</label><input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+919876543210" /><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /><button className="auth-submit" disabled={busy} type="submit">{busy ? 'Please waitΓÇª' : mode === 'login' ? 'Log in' : 'Create account'}</button></form>{message && <p className="auth-message" role="status">{message}</p>}<button className="auth-switch" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage('') }}>{mode === 'login' ? 'New to Codingo? Create an account' : 'Already have an account? Log in'}</button></section></main>
}

function LearningApp({ phone }: { phone: string | undefined }): ReactNode {
  const [completed, setCompleted] = useState<string[]>(readLocal)
  const [selectedId, setSelectedId] = useState('numbers')
  const [code, setCode] = useState(lessons[1].starter)
  const [result, setResult] = useState<PracticeResult | null>(null)
  const unlocked = useMemo(() => new Set(unlockedLessonIds(completed)), [completed])
  const selected = lessons.find((lesson) => lesson.id === selectedId) ?? lessons[1]
  const percent = progressPercent(completed)

  // On mount, merge local cache with Supabase remote progress.
  useEffect(() => { void loadProgress().then(setCompleted) }, [])

  function selectLesson(lesson: Lesson): void { if (!unlocked.has(lesson.id)) return; setSelectedId(lesson.id); setCode(lesson.starter); setResult(null) }
  const complete = useCallback(() => { void markComplete(completed, selected.id).then(setCompleted) }, [completed, selected.id])
  return <main className="app-shell bg-canvas text-ink"><aside className="sidebar"><div className="brand"><span className="brand-mark">C</span><span>Codingo</span></div><nav aria-label="Primary navigation"><a className="nav-item active" href="#learn">Learn</a><a className="nav-item muted" href="#coming-soon">Practice archive</a><a className="nav-item muted" href="#coming-soon">Profile</a></nav><div className="sidebar-foot"><span className="status-dot" /> Signed in<br /><small>{phone}</small><button className="sign-out" type="button" onClick={() => void supabase?.auth.signOut()}>Sign out</button></div></aside><section className="workspace"><header className="topbar"><div><p className="eyebrow">LEVEL 01 / FOUNDATIONS</p><h1>Syntax Sands</h1></div><button className="quiet-button" type="button">Python <span>v</span></button></header><section className="intro"><div><p className="kicker">YOUR NEXT SESSION</p><h2>Build the habit<br />one clear concept at a time.</h2><p>Short, guided exercises designed to make writing code feel natural.</p></div><div className="progress-card"><div className="progress-number">{percent}<small>%</small></div><div><strong>Level progress</strong><p>{completed.length} of {lessons.length} lessons complete</p><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div></div></section><div className="content-grid"><section className="map-panel" aria-labelledby="map-title"><div className="section-heading"><div><p className="eyebrow">LEARNING PATH</p><h3 id="map-title">Follow the signal</h3></div><span>{lessons.length} lessons</span></div><ol className="lesson-path">{lessons.map((lesson, index) => { const done = completed.includes(lesson.id); const available = unlocked.has(lesson.id); return <li key={lesson.id} className={`${done ? 'complete' : available ? 'available' : 'locked'} ${selected.id === lesson.id ? 'selected' : ''}`}><button type="button" disabled={!available} onClick={() => selectLesson(lesson)}><span className="node-number">{done ? 'Γ£ô' : index + 1}</span><span><strong>{lesson.title}</strong><small>{lesson.concept} ┬╖ {lesson.minutes} min</small></span><span className="node-state">{done ? 'Done' : available ? 'Start' : 'Locked'}</span></button></li> })}</ol></section><section className="practice-panel" aria-labelledby="lesson-title"><div className="lesson-meta"><span>Lesson {lessons.indexOf(selected) + 1}</span><span>{selected.minutes} min</span><span>Difficulty {selected.difficulty}/10</span></div><h3 id="lesson-title">{selected.title}</h3><p className="prompt">{selected.prompt}</p><label className="editor-label" htmlFor="code">YOUR CODE</label><textarea id="code" value={code} onChange={(event) => { setCode(event.target.value); setResult(null) }} spellCheck="false" aria-label="Python code editor" /><div className="editor-actions"><button className="run-button" type="button" onClick={() => setResult(runPractice(code, selected.expected, selected.validation))}>Run sample</button><span>Practice mode ┬╖ runs locally</span></div>{result && <div className={result.ok ? 'success' : 'result-error'}><div><strong>{result.ok ? 'Sample passed' : 'Keep going'}</strong><span>{result.ok ? `Output: ${result.output}` : result.message}</span>{!result.ok && result.output && <code>Output: {result.output}</code>}</div>{result.ok && <button type="button" onClick={complete}>{completed.includes(selected.id) ? 'Completed' : 'Mark complete'}</button>}</div>}</section></div></section></main>
}

function App(): ReactNode {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [restoreIssue, setRestoreIssue] = useState('')
  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let active = true
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { if (active) setSession(next) })
    const timeout = new Promise<never>((_resolve, reject) => window.setTimeout(() => reject(new Error('Secure session restore timed out.')), 4000))
    void Promise.race([supabase.auth.getSession(), timeout])
      .then(({ data: current }) => { if (active) setSession(current.session) })
      .catch(() => { if (active) setRestoreIssue('Your previous session could not be restored. Please log in again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])
  if (loading) return <main className="auth-page"><p className="loading-copy">Restoring your secure sessionΓÇª</p></main>
  return session ? <LearningApp phone={session.user.phone} /> : <AuthScreen onSignedIn={setSession} initialMessage={restoreIssue} />
}

createRoot(document.getElementById('root')!).render(<App />)
