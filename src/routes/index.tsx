import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowDownToLine, ArrowRight, ArrowRightLeft, Check, ChevronRight, Clock3, Copy, FileText, Info, MapPin, Plus, Search, Shield, Sun, Trash2, Users, X, Pencil, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { getPersonnel, savePerson, deletePerson } from '@/lib/personnel.functions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export const Route = createFileRoute('/')({ component: Home })
type Person = { id: string; unit: string; rank: string; name: string; platoon: number }
type Mode = 'single' | 'inclusion' | 'exclusion' | 'entire' | 'platoon1' | 'platoon2'
const locations = ['AI BUILDING', 'NON-MUSLIM COOKHOUSE', 'MUSLIM COOKHOUSE', 'KHATIB CAMP MAIN GATE', 'SOC GROUND', 'STADIUM']
const modes: { value: Mode; title: string; description: string }[] = [
  { value: 'single', title: 'Single cadet', description: 'Report movement for one cadet' },
  { value: 'inclusion', title: 'Selected personnel', description: 'Only the personnel you select are moving' },
  { value: 'exclusion', title: 'Everyone except', description: 'All personnel, excluding your selection' },
  { value: 'entire', title: 'Entire unit', description: 'Report movement for the whole unit' },
  { value: 'platoon1', title: 'Platoon 1', description: 'Report movement for Platoon 1' },
  { value: 'platoon2', title: 'Platoon 2', description: 'Report movement for Platoon 2' },
]
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
function Home() {
  const [tab, setTab] = useState('report')
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [template, setTemplate] = useState('Morning')
  const [greeting, setGreeting] = useState('Good Morning Trainers,')
  const [unit, setUnit] = useState('86th FAOCC')
  const [time, setTime] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [mode, setMode] = useState<Mode>('inclusion')
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [format, setFormat] = useState('movement-list')
  const [closing, setClosing] = useState('Thank you Trainers.')
  const [report, setReport] = useState<{ text: string; names: string; count: number; origin: string; destination: string; time: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const [date, setDate] = useState('')
  const [editing, setEditing] = useState<Person | null>(null)
  const [removing, setRemoving] = useState<Person | null>(null)
  const [saving, setSaving] = useState(false)
  const [personError, setPersonError] = useState('')
  async function refresh() {
    setLoading(true); setLoadError(false)
    try { setPeople(await getPersonnel()) } catch { setLoadError(true) } finally { setLoading(false) }
  }
  useEffect(() => {
    void refresh()
    const now = new Date(); setDate(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    const period = now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'
    setTemplate(period); setGreeting(`Good ${period} Trainers,`)
  }, [])
  const filtered = people.filter(p => `${p.unit} ${p.rank} ${p.name}`.toLowerCase().includes(search.toLowerCase()))
  const needsSelection = mode === 'single' || mode === 'inclusion' || mode === 'exclusion'
  const selectedPeople = people.filter(p => selected.includes(p.id))
  const count = mode === 'entire' ? people.length : mode === 'exclusion' ? people.length - selectedPeople.length : mode.startsWith('platoon') ? people.filter(p => p.platoon === (mode === 'platoon1' ? 1 : 2)).length : selectedPeople.length
  function generate(e: FormEvent) {
    e.preventDefault(); setError('')
    if (!/^([01]\d|2[0-3])[0-5]\d$/.test(time)) { setError('Enter a valid 24-hour time, for example 0550 or 1430.'); return }
    if (!greeting.trim() || !closing.trim() || !origin.trim() || !destination.trim()) { setError('Complete the greeting, locations, and closing message.'); return }
    if (origin.trim().toUpperCase() === destination.trim().toUpperCase()) { setError('Choose different origin and destination locations.'); return }
    if (mode === 'single' && selectedPeople.length !== 1) { setError('Select exactly one cadet for this movement.'); return }
    if (mode === 'inclusion' && !selectedPeople.length) { setError('Select at least one person for this movement.'); return }
    if ((mode === 'exclusion' || mode === 'entire' || mode.startsWith('platoon')) && count === 0) { setError('At least one person must be moving.'); return }
    const from = origin.trim().toUpperCase(), to = destination.trim().toUpperCase()
    const names = selectedPeople.map(p => `${p.unit} ${p.rank} ${p.name}`).join('\n')
    const cadet = selectedPeople[0]
    const subject = mode === 'single' && cadet ? `${cadet.unit} ${cadet.rank} ${cadet.name}` : mode === 'entire' ? unit : mode === 'platoon1' ? 'PLATOON 1' : mode === 'platoon2' ? 'PLATOON 2' : mode === 'exclusion' ? `${unit} less the following cadets` : format === 'movement-including' ? `${unit} including the following cadets` : 'The following cadets'
    const verb = mode === 'inclusion' && format === 'movement-list' ? 'have' : 'has'
    const text = `${greeting.trim()}\n\n${subject} ${verb} left ${from} and reached ${to} as at ${time}HRS.${needsSelection && mode !== 'single' && names ? `\n\n${names}` : ''}\n\n${closing.trim()}`
    setReport({ text, names: needsSelection ? names : '', count, origin: from, destination: to, time }); setDirty(false)
    toast.success('Movement report generated')
  }
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); toast.success('Copied to clipboard') } catch { toast.error('Clipboard unavailable. Select the report text and copy it manually.') }
  }
  function download() {
    if (!report) return
    const url = URL.createObjectURL(new Blob([report.text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `movement-report-${new Date().toISOString().slice(0,10)}-${report.time}.txt`; a.click(); URL.revokeObjectURL(url); toast.success('Report exported')
  }
  async function submitPerson(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!editing) return; setSaving(true); setPersonError('')
    try { await savePerson({ data: editing }); await refresh(); setDirty(true); setEditing(null); toast.success('Personnel saved') } catch { setPersonError('Unable to save. Make sure the unit number is unique, then try again.') } finally { setSaving(false) }
  }
  async function removePerson() {
    if (!removing) return; setSaving(true); setPersonError('')
    try { await deletePerson({ data: { id: removing.id } }); setSelected(s => s.filter(id => id !== removing.id)); await refresh(); setDirty(true); setRemoving(null); toast.success('Personnel removed') } catch { setPersonError('Unable to remove personnel. Please try again.') } finally { setSaving(false) }
  }
  return <div className="app-shell">
    <header className="app-header"><div className="header-inner"><a className="brand" href="/"><span className="brand-icon"><Shield size={23} strokeWidth={1.8}/></span><span>86th FAOCC<small>MOVEMENT REPORTS</small></span></a><div className="header-right"><span className="unit-chip"><span/>Unit workspace</span><div className="avatar">86</div></div></div></header>
    <main className="workspace">
      <div className="breadcrumb">Workspace <ChevronRight size={13}/> <span>{tab === 'report' ? 'Movement reports' : 'Personnel'}</span></div>
      <div className="page-heading"><div><div className="eyebrow">PERSONNEL & OPERATIONS</div><h1>Movement reports<span>.</span></h1><p>Keep your team in step. Create clear, consistent movement reports.</p></div><div className="date-display"><Clock3 size={15}/><span>{date || 'Unit workspace'}</span></div></div>
      <div className="navigation"><div className="tabs" role="tablist" aria-label="Workspace"><button role="tab" aria-selected={tab === 'report'} className={tab === 'report' ? 'active' : ''} onClick={() => { setTab('report'); setSearch('') }}><FileText size={17}/>Create report</button><button role="tab" aria-selected={tab === 'personnel'} className={tab === 'personnel' ? 'active' : ''} onClick={() => { setTab('personnel'); setSearch('') }}><Users size={17}/>Manage personnel<span className="tab-count">{loading ? '—' : people.length}</span></button></div><span className="workspace-note"><span className="status-dot"/>Ready for movement</span></div>
      {tab === 'report' ? <div className="report-grid">
        <section className="panel form-panel"><div className="panel-heading"><span className="section-icon"><FileText size={19}/></span><div><h2>Create movement report</h2><p>Fill in the details of your team’s movement.</p></div><span className="step-indicator">01 / 02</span></div>
          <form onSubmit={generate} onChange={() => setDirty(true)}>
            <div className="form-section"><div className="section-label"><span>01</span>Report details</div><div className="two-col"><Field label="Report template"><div className="input-icon"><Sun size={16}/><select value={template} onChange={e => { setTemplate(e.target.value); setGreeting(`Good ${e.target.value} Trainers,`); setClosing('Thank you Trainers.') }}>{['Morning','Afternoon','Evening'].map(t => <option key={t} value={t}>{t} Report</option>)}</select></div></Field>{mode !== 'single' && <Field label="Unit designation"><select value={unit} onChange={e => setUnit(e.target.value)}>{['86th FAOCC','LSN','FA','FATA'].map(u => <option key={u}>{u}</option>)}</select></Field>}</div><Field label="Greeting"><input required maxLength={200} value={greeting} onChange={e => setGreeting(e.target.value)}/></Field></div>
            <div className="form-section"><div className="section-label"><span>02</span>Movement details</div><Field label="Time of movement"><div className="time-row"><div className="input-icon"><Clock3 size={16}/><input inputMode="numeric" placeholder="e.g. 0550" required maxLength={4} value={time} onChange={e => setTime(e.target.value.replace(/\D/g,''))}/><span className="input-suffix">HRS</span></div><button type="button" className="btn subtle" onClick={() => { const n = new Date(); setTime(`${String(n.getHours()).padStart(2,'0')}${String(n.getMinutes()).padStart(2,'0')}`); setDirty(true) }}>Use current time</button></div></Field><div className="location-row"><Field label="Origin"><div className="input-icon"><MapPin size={16}/><input list="locations" required placeholder="Select or type location" value={origin} onChange={e => setOrigin(e.target.value.toUpperCase())}/></div></Field><button type="button" className="swap-button" title="Swap origin and destination" aria-label="Swap origin and destination" onClick={() => { setOrigin(destination); setDestination(origin); setDirty(true) }}><ArrowRightLeft size={17}/></button><Field label="Destination"><div className="input-icon"><MapPin size={16}/><input list="locations" required placeholder="Select or type location" value={destination} onChange={e => setDestination(e.target.value.toUpperCase())}/></div></Field></div><datalist id="locations">{locations.map(l => <option key={l} value={l}/>)}</datalist></div>
            <div className="form-section"><div className="section-label"><span>03</span>Personnel & report mode</div><div className="mode-grid">{modes.map(m => <label className={`mode-option ${mode === m.value ? 'selected' : ''}`} key={m.value}><input type="radio" name="mode" value={m.value} checked={mode === m.value} onChange={() => { setMode(m.value); if (m.value === 'single') setSelected(s => s.slice(0, 1)) }}/><span><strong>{m.title}</strong><small>{m.description}</small></span></label>)}</div>
            {needsSelection && <div className="personnel-picker"><div className="picker-label"><span>{mode === 'exclusion' ? 'Personnel to exclude' : 'Personnel moving'}<b>{selectedPeople.length} selected</b></span><div>{mode !== 'single' && <><button type="button" onClick={() => { setSelected(people.map(p => p.id)); setDirty(true) }}>Select all</button><span> / </span></>}<button type="button" onClick={() => { setSelected([]); setDirty(true) }}>Clear</button></div></div><div className="search-input"><Search size={16}/><input aria-label="Search personnel" placeholder="Search by name, unit, or rank…" value={search} onChange={e => setSearch(e.target.value)}/></div><div className="personnel-list">{loading ? <div className="loading-rows">{[1,2,3].map(i => <div key={i} className="skeleton-row"/>)}</div> : loadError ? <div className="list-message">Unable to load personnel. <button type="button" onClick={() => void refresh()}>Try again</button></div> : filtered.length ? filtered.map(p => <label className={`person-row ${selected.includes(p.id) ? 'checked' : ''}`} key={p.id}><input type={mode === 'single' ? 'radio' : 'checkbox'} name={mode === 'single' ? 'single-cadet' : undefined} checked={selected.includes(p.id)} onChange={() => setSelected(s => mode === 'single' ? [p.id] : s.includes(p.id) ? s.filter(id => id !== p.id) : [...s,p.id])}/><span className="unit-number">{p.unit}</span><span className="rank">{p.rank}</span><span className="person-name">{p.name}</span></label>) : <div className="list-message">{people.length ? 'No personnel match your search.' : 'No personnel yet. Add your team in Manage personnel.'}</div>}</div><div className="picker-footer"><Users size={13}/>{loading ? 'Loading personnel…' : `${people.length} personnel in your unit`}<span>{count} moving</span></div></div>}
            </div>
            <div className="form-section final-section"><div className="two-col"><Field label="Report format"><select value={mode === 'single' ? 'single' : format} disabled={mode === 'single'} onChange={e => setFormat(e.target.value)}>{mode === 'single' && <option value="single">Single cadet</option>}<option value="movement-list">Movement list</option><option value="movement-including">Movement including</option></select></Field><Field label="Closing message"><input required maxLength={300} value={closing} onChange={e => setClosing(e.target.value)}/></Field></div>{error && <p className="error-message" role="alert">{error}</p>}<button className="btn primary generate" type="submit" disabled={loading || loadError}><FileText size={17}/>Generate report<ArrowRight size={17}/></button><p className="form-footnote">Review your movement details before generating.</p></div>
          </form>
        </section>
        <aside className="preview-column"><section className="panel preview-panel"><div className="preview-heading"><div><span className="eyebrow">YOUR REPORT</span><h2>Report preview</h2></div><span className={`preview-status ${report ? 'generated' : ''}`}><span/>{report ? dirty ? 'Changes pending' : 'Generated' : 'Awaiting details'}</span></div>{report ? <><div className="route-summary"><span><MapPin size={14}/>{report.origin}</span><ArrowRight size={18}/><span><MapPin size={14}/>{report.destination}</span></div><div className="report-meta"><span><Clock3 size={14}/>{report.time} HRS</span><span><Users size={14}/>{report.count} personnel moving</span></div><pre className="generated-text">{report.text}</pre>{dirty && <p className="pending-note">The details have changed. Generate again to update this report.</p>}<div className="report-actions"><button className="btn primary" onClick={() => void copy(report.text)}><Copy size={15}/>Copy report</button><button className="btn" onClick={download}><ArrowDownToLine size={15}/>Export .txt</button>{report.names && <button className="names-button" onClick={() => void copy(report.names)}><Users size={14}/>Copy names only</button>}</div></> : <div className="empty-preview"><div className="paper-illustration"><div className="paper-top"><Shield size={19}/><span/><span/></div><div className="paper-lines"><i/><i/><i/><i/></div><div className="paper-check"><Check size={17}/></div></div><h3>Your next movement, in writing.</h3><p>Complete the form and generate your report.<br/>It’ll appear here, ready to copy and share.</p><div className="preview-steps"><span><span>1</span>Fill in details</span><ChevronRight size={13}/><span><span>2</span>Generate</span><ChevronRight size={13}/><span><span>3</span>Share</span></div></div>}<div className="preview-bottom"><Shield size={14}/>Consistent reporting. Every movement.</div></section><div className="tip-card"><span className="tip-icon"><Info size={18}/></span><div><h3>A quick tip</h3><p>Moving as a full unit? Select <strong>Entire unit</strong> to create your report without selecting personnel individually.</p></div></div><div className="workflow-note"><CheckCheck size={16}/><span>Built for the way your team moves.</span></div></aside>
      </div> : <section className="panel management-panel"><div className="management-heading"><div><h2>Your personnel</h2><p>Keep your unit’s roster up to date. Changes are shared across your team.</p></div><button className="btn primary" onClick={() => { setPersonError(''); setEditing({ id: crypto.randomUUID(), unit:'', rank:'OCT', name:'', platoon:1 }) }}><Plus size={16}/>Add personnel</button></div><div className="management-search search-input"><Search size={17}/><input aria-label="Search roster" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, unit, or rank…"/></div>{loadError ? <div className="list-message">Unable to load your roster. <button onClick={() => void refresh()}>Try again</button></div> : <div className="table-scroll"><table><thead><tr><th>UNIT NO.</th><th>RANK</th><th>NAME</th><th>PLATOON</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{loading ? <tr><td colSpan={5}>Loading personnel…</td></tr> : filtered.map(p => <tr key={p.id}><td><span className="unit-number">{p.unit}</span></td><td>{p.rank}</td><td className="roster-name">{p.name}</td><td><span className="platoon-badge">Platoon {p.platoon}</span></td><td><div className="row-actions"><button aria-label={`Edit ${p.name}`} onClick={() => { setPersonError(''); setEditing({...p}) }}><Pencil size={15}/></button><button aria-label={`Remove ${p.name}`} onClick={() => { setPersonError(''); setRemoving(p) }}><Trash2 size={15}/></button></div></td></tr>)}{!loading && !filtered.length && <tr><td colSpan={5}>No personnel found. Add personnel or try another search.</td></tr>}</tbody></table></div>}<div className="table-footer">{filtered.length} of {people.length} personnel</div></section>}
      <footer className="footer"><span><Shield size={14}/>86th FAOCC <span className="footer-divider">/</span> Movement reports</span><span>For fixes or improvements, contact <strong>OCT KLIFF</strong>.</span></footer>
    </main>
    <Dialog open={!!editing} onOpenChange={open => { if (!open && !saving) setEditing(null) }}><DialogContent><DialogHeader><DialogTitle>{people.some(p => p.id === editing?.id) ? 'Edit personnel' : 'Add personnel'}</DialogTitle><DialogDescription>Update the shared unit roster.</DialogDescription></DialogHeader>{editing && <form className="person-form" onSubmit={submitPerson}><div className="two-col"><Field label="Unit number"><input required maxLength={30} value={editing.unit} onChange={e => setEditing({...editing,unit:e.target.value.toUpperCase()})} placeholder="e.g. S101"/></Field><Field label="Rank"><input required maxLength={30} value={editing.rank} onChange={e => setEditing({...editing,rank:e.target.value.toUpperCase()})}/></Field></div><Field label="Full name"><input required maxLength={150} value={editing.name} onChange={e => setEditing({...editing,name:e.target.value.toUpperCase()})}/></Field><Field label="Platoon"><select value={editing.platoon} onChange={e => setEditing({...editing,platoon:Number(e.target.value)})}><option value={1}>Platoon 1</option><option value={2}>Platoon 2</option></select></Field>{personError && <p role="alert" className="error-message">{personError}</p>}<button disabled={saving} className="btn primary" type="submit"><Check size={16}/>{saving ? 'Saving…' : 'Save personnel'}</button></form>}</DialogContent></Dialog>
    <Dialog open={!!removing} onOpenChange={open => { if (!open && !saving) setRemoving(null) }}><DialogContent><DialogHeader><DialogTitle>Remove personnel?</DialogTitle><DialogDescription>{removing?.unit} {removing?.name} will be removed from the shared roster.</DialogDescription></DialogHeader>{personError && <p className="error-message" role="alert">{personError}</p>}<div className="delete-actions"><button className="btn" disabled={saving} onClick={() => setRemoving(null)}><X size={15}/>Cancel</button><button className="btn danger" disabled={saving} onClick={() => void removePerson()}><Trash2 size={15}/>{saving ? 'Removing…' : 'Remove personnel'}</button></div></DialogContent></Dialog>
  </div>
}
