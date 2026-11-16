import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowRightLeft, Clock3, Copy, FileText, Info, MapPin, Search, Shield, Sun, Users, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { getPersonnel } from '@/lib/personnel'

type Person = { id: string; unit: string; rank: string; name: string; platoon: number }
type Mode = 'single' | 'inclusion' | 'exclusion' | 'entire' | 'platoon1' | 'platoon2' | 'platoon1Except' | 'platoon2Except'
const locations = ['AI BUILDING', 'NON-MUSLIM COOKHOUSE', 'MUSLIM COOKHOUSE', 'KHATIB CAMP MAIN GATE', 'SOC GROUND', 'STADIUM', 'FCC', '24 SA TRAINING SHED']
const modes: { value: Mode; title: string; description: string }[] = [
  { value: 'inclusion', title: 'Selected Personnel', description: 'Only the personnel you select are moving' },
  { value: 'exclusion', title: 'Everyone Except', description: 'All personnel, excluding your selection' },
  { value: 'entire', title: 'Entire Unit', description: 'Report movement for the whole unit' },
  { value: 'single', title: 'Single Cadet', description: 'Report movement for one cadet' },
  { value: 'platoon1', title: 'Platoon 1', description: 'Report movement for Platoon 1' },
  { value: 'platoon2', title: 'Platoon 2', description: 'Report movement for Platoon 2' },
  { value: 'platoon1Except', title: 'Platoon 1 Except', description: 'Platoon 1 movement, excluding selected cadets' },
  { value: 'platoon2Except', title: 'Platoon 2 Except', description: 'Platoon 2 movement, excluding selected cadets' },
]
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
export default function Home() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [template, setTemplate] = useState('Morning')
  const [greeting, setGreeting] = useState('Good Morning Trainers,')
  const [time, setTime] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [mode, setMode] = useState<Mode>('inclusion')
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [activeTab, setActiveTab] = useState<'reports' | 'emart' | 'bookinout' | 'appointment' | 'reportsick'>('reports')
  const [sickType, setSickType] = useState<'RSI' | 'RSO'>('RSI')
  const [sickTemplate, setSickTemplate] = useState('Morning')
  const [sickGreeting, setSickGreeting] = useState('Good Morning Trainers,')
  const [sickSelected, setSickSelected] = useState('')
  const [sickSearch, setSickSearch] = useState('')
  const [sickNric, setSickNric] = useState('')
  const [sickSymptoms, setSickSymptoms] = useState('')
  const [sickSymptomDetails, setSickSymptomDetails] = useState('')
  const [sickAllergies, setSickAllergies] = useState('')
  const [emartTemplate, setEmartTemplate] = useState('Morning')
  const [emartGreeting, setEmartGreeting] = useState('Good Morning Trainers,')
  const [emartSelected, setEmartSelected] = useState<string[]>([])
  const [emartSearch, setEmartSearch] = useState('')
  const [bookType, setBookType] = useState<'in' | 'out'>('in')
  const [bookTemplate, setBookTemplate] = useState('Morning')
  const [bookGreeting, setBookGreeting] = useState('Good Morning Trainers,')
  const [bookSelectionMode, setBookSelectionMode] = useState<'single' | 'multiple'>('multiple')
  const [bookSelected, setBookSelected] = useState<string[]>([])
  const [bookSearch, setBookSearch] = useState('')
  const [bookLocation, setBookLocation] = useState('AI BUILDING')
  const [bookTime, setBookTime] = useState('')
  const [appointmentTemplate, setAppointmentTemplate] = useState('Morning')
  const [appointmentGreeting, setAppointmentGreeting] = useState('Good Morning Trainers,')
  const [appointmentSelected, setAppointmentSelected] = useState('')
  const [appointmentSearch, setAppointmentSearch] = useState('')
  const [appointmentReference, setAppointmentReference] = useState('')
  const [appointmentLocation, setAppointmentLocation] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  async function refresh() {
    setLoading(true); setLoadError(false)
    try { setPeople(await getPersonnel()) } catch { setLoadError(true) } finally { setLoading(false) }
  }
  useEffect(() => {
    void refresh()
    const now = new Date(); setDate(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    const period = now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'
    setTemplate(period); setGreeting(`Good ${period} Trainers,`)
    setSickTemplate(period); setSickGreeting(`Good ${period} Trainers,`)
    setEmartTemplate(period); setEmartGreeting(`Good ${period} Trainers,`)
  }, [])
  const filtered = people.filter(p => `${p.unit} ${p.rank} ${p.name}`.toLowerCase().includes(search.toLowerCase()))
  const needsSelection = mode === 'single' || mode === 'inclusion' || mode === 'exclusion' || mode === 'platoon1Except' || mode === 'platoon2Except'
  const selectedPeople = people.filter(p => selected.includes(p.id))
  const exceptPlatoon = mode === 'platoon1Except' ? 1 : mode === 'platoon2Except' ? 2 : null
  const platoonPeople = exceptPlatoon !== null ? people.filter(p => p.platoon === exceptPlatoon) : []
  const selectedExceptions = selectedPeople.filter(p => exceptPlatoon !== null && p.platoon === exceptPlatoon)
  const count = mode === 'entire' ? people.length : mode === 'exclusion' ? people.length - selectedPeople.length : exceptPlatoon !== null ? platoonPeople.length - selectedExceptions.length : mode.startsWith('platoon') ? people.filter(p => p.platoon === (mode === 'platoon1' ? 1 : 2)).length : selectedPeople.length
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); toast.success('Copied to clipboard') } catch { toast.error('Clipboard unavailable. Select the report text and copy it manually.') }
  }
  const sickPerson = people.find(p => p.id === sickSelected)
  const sickName = sickPerson ? `${sickPerson.unit} ${sickPerson.rank} ${sickPerson.name}` : '[SELECT CADET]'
  const sickPreview = sickType === 'RSO'
    ? `${sickGreeting.trim() || '[GREETING]'}\n\n${sickName} is requesting permission to report sick outside due to ${sickSymptoms.trim().toUpperCase() || '[SYMPTOMS]'}:\n\n1. ${sickName}\n\n2. ${sickNric.trim() || '[NRIC NUMBER]'}\n\n3. ${sickSymptomDetails.trim().toUpperCase() || '[FURTHER ELABORATION OF SYMPTOMS]'}\n\n4. ${sickAllergies.trim().toUpperCase() || '[ALLERGIES TO MEDICATION]'}\n\nThank you Trainers.`
    : `${sickGreeting.trim() || '[GREETING]'}\n\n${sickName} is requesting to report sick due to ${sickSymptoms.trim().toUpperCase() || '[SYMPTOMS]'}\n\nThank you Trainers.`
  const appointmentPerson = people.find(p => p.id === appointmentSelected)
  const appointmentName = appointmentPerson ? `${appointmentPerson.unit} ${appointmentPerson.rank} ${appointmentPerson.name}` : '[SELECT CADET]'
  const appointmentDatePreview = appointmentDate ? appointmentDate.slice(8,10)+appointmentDate.slice(5,7)+appointmentDate.slice(2,4) : '[DDMMYY]'
  const appointmentPreview = `${appointmentGreeting.trim() || '[GREETING]'}\n\n${appointmentName} is requesting approval for an appointment @ ${appointmentLocation.trim() || '[LOCATION]'} on ${appointmentDatePreview}, ${appointmentTime || '[TIME]'} HRS.\n\n1. ${appointmentName}\n2. ${appointmentReference.trim() || '[NRIC NUMBER]'}\n3. APPOINTMENT @ ${appointmentLocation.trim() || '[LOCATION]'}\n\nThank you Trainers.`
  const bookPeople = people.filter(p => bookSelected.includes(p.id))
  const bookNames = bookPeople.map(p => `${p.unit} ${p.rank} ${p.name}`).join('\n')
  const bookPersonName = bookPeople[0] ? `${bookPeople[0].unit} ${bookPeople[0].rank} ${bookPeople[0].name}` : '[SELECT CADET]'
  const bookLocationText = bookLocation.trim() || (bookType === 'in' ? '[REACHED LOCATION]' : '[DEPARTURE LOCATION]')
  const bookTimeText = bookTime || '[TIME]'
  const bookSentence = bookSelectionMode === 'single'
    ? bookType === 'in' ? `${bookPersonName} has booked into KHATIB CAMP and reached ${bookLocationText} as at ${bookTimeText}HRS.` : `${bookPersonName} has left ${bookLocationText} and booked out of KHATIB CAMP as at ${bookTimeText}HRS.`
    : bookType === 'in' ? `The following cadets have booked in to KHATIB CAMP and reached ${bookLocationText} as at ${bookTimeText}HRS.` : `The following cadets have booked out of KHATIB CAMP from ${bookLocationText} as at ${bookTimeText}HRS.`
  const bookPreview = `${bookGreeting.trim() || '[GREETING]'}\n\n${bookSentence}${bookSelectionMode === 'multiple' && bookNames ? `\n\n${bookNames}` : ''}\n\nThank you Trainers.`
  const movementFrom = origin.trim().toUpperCase() || '[ORIGIN]'
  const movementTo = destination.trim().toUpperCase() || '[DESTINATION]'
  const movementNames = exceptPlatoon !== null ? selectedExceptions.map(p => `${p.unit} ${p.rank} ${p.name}`).join('\n') : mode === 'entire' || mode === 'platoon1' || mode === 'platoon2' ? people.filter(p => mode === 'entire' || p.platoon === (mode === 'platoon1' ? 1 : 2)).map(p => `${p.unit} ${p.rank} ${p.name}`).join('\n') : selectedPeople.map(p => `${p.unit} ${p.rank} ${p.name}`).join('\n')
  const movementSubject = mode === 'single' && selectedPeople[0] ? `${selectedPeople[0].unit} ${selectedPeople[0].rank} ${selectedPeople[0].name}` : mode === 'entire' ? '86th FAOCC' : mode === 'platoon1' ? 'PLATOON 1' : mode === 'platoon2' ? 'PLATOON 2' : mode === 'platoon1Except' ? 'PLATOON 1 less the following cadets' : mode === 'platoon2Except' ? 'PLATOON 2 less the following cadets' : mode === 'exclusion' ? '86th FAOCC less the following cadets' : 'The following cadets'
  const movementVerb = mode === 'inclusion' || mode === 'platoon1Except' || mode === 'platoon2Except' ? 'have' : 'has'
  const movementPreview = `${greeting.trim() || '[GREETING]'}\n\n${movementSubject} ${movementVerb} left ${movementFrom} and reached ${movementTo} as at ${time || '[TIME]'}HRS.${needsSelection && mode !== 'single' && movementNames ? `\n\n${movementNames}` : ''}\n\nThank you Trainers.`
  return <div className="app-shell">
    <header className="app-header"><div className="header-inner"><a className="brand" href="/team-movement-reports/"><span className="brand-icon"><Shield size={23} strokeWidth={1.8}/></span><span>86th FAOCC<small>REPORT GENERATOR</small></span></a><div className="header-right"><span className="unit-chip"><span/>Unit workspace</span><div className="avatar">86</div></div></div></header>
    <main className="workspace">
      <div className="page-heading"><div><div className="eyebrow">PERSONNEL & OPERATIONS</div><h1>Report Generator<span>.</span></h1><p>Keep your team in step. Create clear, consistent movement reports.</p></div><div className="date-display"><Clock3 size={15}/><span>{date || 'Unit workspace'}</span></div></div>
      <div className="navigation"><div className="tabs"><button type="button" className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}><FileText size={17}/>Movement Report</button><button type="button" className={activeTab === "reportsick" ? "active" : ""} onClick={() => setActiveTab("reportsick")}><FileText size={17}/>Report Sick</button><button type="button" className={activeTab === "appointment" ? "active" : ""} onClick={() => setActiveTab("appointment")}><FileText size={17}/>Appointments</button><button type="button" className={activeTab === "bookinout" ? "active" : ""} onClick={() => setActiveTab("bookinout")}><Clock3 size={17}/>Bookin and out</button><button type="button" className={activeTab === "emart" ? "active" : ""} onClick={() => setActiveTab("emart")}><Users size={17}/>Emart</button></div><span className="workspace-note"><span className="status-dot"/>Ready for movement</span></div>
      {activeTab === "reportsick" ? <div className="report-grid">
        <section className="panel form-panel">
          <div className="panel-heading"><span className="section-icon"><FileText size={19}/></span><div><h2>Report Sick</h2><p>Prepare an RSI or RSO request for trainers.</p></div><span className="step-indicator">01 / 02</span></div>
          <div className="form-section">
            <div className="section-label"><span>01</span>Report details</div>
            <Field label="Report template"><div className="input-icon"><Sun size={16}/><select value={sickTemplate} onChange={e => { setSickTemplate(e.target.value); setSickGreeting(`Good ${e.target.value} Trainers,`) }}>{['Morning','Afternoon','Evening'].map(t => <option key={t} value={t}>{t} Report</option>)}</select></div></Field>
            <Field label="RSI / RSO"><select value={sickType} onChange={e => setSickType(e.target.value as 'RSI' | 'RSO')}><option value="RSI">RSI — Report Sick Inside</option><option value="RSO">RSO — Report Sick Outside</option></select></Field>
          </div>
          <div className="form-section">
            <div className="section-label"><span>02</span>Cadet details</div>
            <div className="personnel-picker">
              <div className="picker-label"><span>Cadet selection<b>{sickSelected ? '1 selected' : 'None selected'}</b></span><button type="button" onClick={() => setSickSelected('')}>Clear</button></div>
              <div className="search-input"><Search size={16}/><input aria-label="Search cadet for report sick" placeholder="Search by name, unit, or rank…" value={sickSearch} onChange={e => setSickSearch(e.target.value)}/></div>
              <div className="personnel-list">{loading ? <div className="loading-rows">{[1,2,3].map(i => <div key={i} className="skeleton-row"/>)}</div> : loadError ? <div className="list-message">Unable to load personnel. <button type="button" onClick={() => void refresh()}>Try again</button></div> : people.filter(p => (p.unit+" "+p.rank+" "+p.name).toLowerCase().includes(sickSearch.toLowerCase())).length ? people.filter(p => (p.unit+" "+p.rank+" "+p.name).toLowerCase().includes(sickSearch.toLowerCase())).map(p => <label className={"person-row "+(sickSelected === p.id ? "checked" : "")} key={p.id}><input type="radio" name="sick-cadet" checked={sickSelected === p.id} onChange={() => setSickSelected(p.id)}/><span className="unit-number">{p.unit}</span><span className="rank">{p.rank}</span><span className="person-name">{p.name}</span></label>) : <div className="list-message">{people.length ? 'No personnel match your search.' : 'No personnel found in the fixed roster.'}</div>}</div>
              <div className="picker-footer"><Users size={13}/>{loading ? 'Loading personnel…' : people.length+" personnel in your unit"}<span>{sickSelected ? '1 selected' : '0 selected'}</span></div>
            </div>
            <Field label="NRIC"><input value={sickNric} onChange={e => setSickNric(e.target.value.toUpperCase())} placeholder="e.g. T1234567A"/></Field>
            <Field label="Symptoms"><textarea rows={3} value={sickSymptoms} onChange={e => setSickSymptoms(e.target.value)} placeholder="Describe the symptoms"/></Field>
            <Field label="Further elaboration of symptoms"><textarea rows={3} value={sickSymptomDetails} onChange={e => setSickSymptomDetails(e.target.value)} placeholder="Provide additional details about the symptoms"/></Field>
            <Field label="Allergies to Medication"><input value={sickAllergies} onChange={e => setSickAllergies(e.target.value)} placeholder="Enter allergies or NIL"/></Field>
          </div>
        </section>
        <aside className="preview-column"><section className="panel preview-panel">
          <div className="preview-heading"><div><span className="eyebrow">YOUR MESSAGE</span><h2>Report sick preview</h2></div><span className="preview-status generated"><span/>Live preview</span></div>
          <pre className="generated-text">{sickPreview}</pre>
          <div className="report-actions"><button className="btn primary" onClick={() => void copy(sickPreview)}><Copy size={15}/>Copy report</button></div>
          <div className="preview-bottom"><Shield size={14}/>Consistent reporting. Every movement.</div>
        </section><div className="tip-card"><span className="tip-icon"><Info size={18}/></span><div><h3>A quick tip</h3><p>RSI is for reporting sick inside camp. RSO includes NRIC, symptoms, and medication allergy details.</p></div></div></aside>
      </div> : activeTab === "appointment" ? <div className="report-grid">
        <section className="panel form-panel">
          <div className="panel-heading"><span className="section-icon"><FileText size={19}/></span><div><h2>Requesting for Appointments</h2><p>Prepare an appointment approval request for trainers.</p></div><span className="step-indicator">01 / 02</span></div>
          <div className="form-section">
            <div className="section-label"><span>01</span>Appointment details</div>
            <Field label="Report template"><div className="input-icon"><Sun size={16}/><select value={appointmentTemplate} onChange={e => { setAppointmentTemplate(e.target.value); setAppointmentGreeting("Good " + e.target.value + " Trainers,") }}>{['Morning','Afternoon','Evening'].map(t => <option key={t} value={t}>{t} Report</option>)}</select></div></Field>
            <Field label="Greeting"><input value={appointmentGreeting} maxLength={200} onChange={e => setAppointmentGreeting(e.target.value)}/></Field>
            <div className="two-col"><Field label="Appointment date"><input type="date" value={appointmentDate} onChange={e => { const value=e.target.value; setAppointmentDate(value); const now=new Date(); const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`; if(value && value < today) toast.error("Appointment date has already passed. Please choose today or a future date.") }}/></Field><Field label="Appointment time"><div className="input-icon"><Clock3 size={16}/><input inputMode="numeric" maxLength={4} placeholder="e.g. 1430" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value.replace(/\D/g,''))}/><span className="input-suffix">HRS</span></div></Field></div>
            <Field label="Location of Appointment"><input value={appointmentLocation} onChange={e => setAppointmentLocation(e.target.value)} placeholder="Enter location of appointment"/></Field>
            <Field label="NRIC No. (T1234567A)"><input value={appointmentReference} onChange={e => setAppointmentReference(e.target.value)} placeholder="Enter NRIC number"/></Field>
          </div>
          <div className="form-section">
            <div className="section-label"><span>02</span>Cadet selection</div>
            <div className="personnel-picker">
              <div className="picker-label"><span>Cadet requesting appointment<b>{appointmentSelected ? '1 selected' : 'None selected'}</b></span><button type="button" onClick={() => setAppointmentSelected('')}>Clear</button></div>
              <div className="search-input"><Search size={16}/><input aria-label="Search cadet for appointment" placeholder="Search by name, unit, or rank…" value={appointmentSearch} onChange={e => setAppointmentSearch(e.target.value)}/></div>
              <div className="personnel-list">{loading ? <div className="loading-rows">{[1,2,3].map(i => <div key={i} className="skeleton-row"/>)}</div> : loadError ? <div className="list-message">Unable to load personnel. <button type="button" onClick={() => void refresh()}>Try again</button></div> : people.filter(p => (p.unit+" "+p.rank+" "+p.name).toLowerCase().includes(appointmentSearch.toLowerCase())).length ? people.filter(p => (p.unit+" "+p.rank+" "+p.name).toLowerCase().includes(appointmentSearch.toLowerCase())).map(p => <label className={"person-row "+(appointmentSelected === p.id ? "checked" : "")} key={p.id}><input type="radio" name="appointment-cadet" checked={appointmentSelected === p.id} onChange={() => setAppointmentSelected(p.id)}/><span className="unit-number">{p.unit}</span><span className="rank">{p.rank}</span><span className="person-name">{p.name}</span></label>) : <div className="list-message">{people.length ? 'No personnel match your search.' : 'No personnel found in the fixed roster.'}</div>}</div>
              <div className="picker-footer"><Users size={13}/>{loading ? 'Loading personnel…' : people.length+" personnel in your unit"}<span>{appointmentSelected ? '1 selected' : '0 selected'}</span></div>
            </div>
            
          </div>
        </section>
        <aside className="preview-column"><section className="panel preview-panel">
          <div className="preview-heading"><div><span className="eyebrow">YOUR MESSAGE</span><h2>Appointment preview</h2></div><span className="preview-status generated"><span/>Live preview</span></div>
          <><pre className="generated-text">{appointmentPreview}</pre><div className="report-actions"><button className="btn primary" onClick={() => void copy(appointmentPreview)}><Copy size={15}/>Copy appointment request</button></div></>
          <div className="preview-bottom"><Shield size={14}/>Consistent reporting. Every movement.</div>
        </section><div className="tip-card"><span className="tip-icon"><Info size={18}/></span><div><h3>A quick tip</h3><p>The cadet name is taken directly from the personnel namelist. Enter the reference number and appointment location in the two text fields.</p></div></div></aside>
      </div> : activeTab === "bookinout" ? <div className="report-grid">
        <section className="panel form-panel">
          <div className="panel-heading"><span className="section-icon"><Clock3 size={19}/></span><div><h2>Book in and out reports</h2><p>Generate camp booking status messages for trainers.</p></div><span className="step-indicator">01 / 02</span></div>
          <div className="form-section">
            <div className="section-label"><span>01</span>Report details</div>
            <Field label="Report type"><select value={bookType} onChange={e => { setBookType(e.target.value as 'in' | 'out'); setBookLocation(e.target.value === 'in' ? 'AI BUILDING' : 'KHATIB CAMP MAIN GATE') }}><option value="in">Book in report</option><option value="out">Book out report</option></select></Field>
            <div className="two-col">
              <Field label="Report template"><div className="input-icon"><Sun size={16}/><select value={bookTemplate} onChange={e => { setBookTemplate(e.target.value); setBookGreeting(`Good ${e.target.value} Trainers,`) }}>{['Morning','Afternoon','Evening'].map(t => <option key={t} value={t}>{t} Report</option>)}</select></div></Field>
              <Field label="Time"><div className="time-row"><div className="input-icon"><Clock3 size={16}/><input inputMode="numeric" maxLength={4} placeholder="e.g. 1843" value={bookTime} onChange={e => setBookTime(e.target.value.slice(0,4))}/><span className="input-suffix">HRS</span></div><button type="button" className="btn subtle" onClick={() => { const now = new Date(); setBookTime(now.toTimeString().slice(0,5).split(":").join(""));  }}>Use current time</button></div></Field>
            </div>
            <Field label="Greeting"><input value={bookGreeting} maxLength={200} onChange={e => setBookGreeting(e.target.value)}/></Field>
            <Field label={bookType === 'in' ? 'Reached location' : 'Departure location'}><input list="locations" value={bookLocation} onChange={e => setBookLocation(e.target.value.toUpperCase())} placeholder={bookType === 'in' ? 'e.g. AI BUILDING' : 'e.g. KHATIB CAMP MAIN GATE'}/></Field>
          </div>
          <div className="form-section">
            <div className="section-label"><span>02</span>Cadet selection</div>
            <div className="mode-grid">
              <label className={`mode-option ${bookSelectionMode === 'single' ? 'selected' : ''}`}><input type="radio" name="book-selection-mode" checked={bookSelectionMode === 'single'} onChange={() => { setBookSelectionMode('single'); setBookSelected(ids => ids.slice(0, 1)) }}/><span><strong>Single Cadet</strong><small>Generate a report for one cadet</small></span></label>
              <label className={`mode-option ${bookSelectionMode === 'multiple' ? 'selected' : ''}`}><input type="radio" name="book-selection-mode" checked={bookSelectionMode === 'multiple'} onChange={() => setBookSelectionMode('multiple')}/><span><strong>Multiple Cadets</strong><small>Generate a report for several cadets</small></span></label>
            </div>
            <div className="personnel-picker">
              <div className="picker-label"><span>{bookSelectionMode === 'single' ? 'Cadet' : 'Cadets'}<b>{`${bookSelected.length} selected`}</b></span><div>{bookSelectionMode === 'multiple' && <button type="button" onClick={() => setBookSelected(ids => Array.from(new Set([...ids, ...people.filter(p => `${p.unit} ${p.rank} ${p.name}`.toLowerCase().includes(bookSearch.toLowerCase())).map(p => p.id)])))}>Select all shown</button>}<button type="button" onClick={() => setBookSelected([])}>Clear</button></div></div>
              <div className="search-input"><Search size={16}/><input aria-label="Search cadet" placeholder="Search by name, unit, or rank…" value={bookSearch} onChange={e => setBookSearch(e.target.value)}/></div>
              <div className="personnel-list">{loading ? <div className="loading-rows">{[1,2,3].map(i => <div key={i} className="skeleton-row"/>)}</div> : loadError ? <div className="list-message">Unable to load personnel. <button type="button" onClick={() => void refresh()}>Try again</button></div> : people.filter(p => `${p.unit} ${p.rank} ${p.name}`.toLowerCase().includes(bookSearch.toLowerCase())).length ? people.filter(p => `${p.unit} ${p.rank} ${p.name}`.toLowerCase().includes(bookSearch.toLowerCase())).map(p => <label className={`person-row ${bookSelected.includes(p.id) ? 'checked' : ''}`} key={p.id}><input type={bookSelectionMode === 'single' ? 'radio' : 'checkbox'} name={bookSelectionMode === 'single' ? 'book-single-cadet' : undefined} checked={bookSelected.includes(p.id)} onChange={() => setBookSelected(ids => bookSelectionMode === 'single' ? [p.id] : ids.includes(p.id) ? ids.filter(id => id !== p.id) : [...ids, p.id])}/><span className="unit-number">{p.unit}</span><span className="rank">{p.rank}</span><span className="person-name">{p.name}</span></label>) : <div className="list-message">{people.length ? 'No personnel match your search.' : 'No personnel found in the fixed roster.'}</div>}</div>
              <div className="picker-footer"><Users size={13}/>{loading ? 'Loading personnel…' : `${people.length} personnel in your unit`}<span>{`${bookSelected.length} selected`}</span></div>
            </div>
            
          </div>
        </section>
        <aside className="preview-column"><section className="panel preview-panel">
          <div className="preview-heading"><div><span className="eyebrow">YOUR MESSAGE</span><h2>Report preview</h2></div><span className="preview-status generated"><span/>Live preview</span></div>
          <><pre className="generated-text">{bookPreview}</pre><div className="report-actions"><button className="btn primary" onClick={() => void copy(bookPreview)}><Copy size={15}/>Copy report</button></div></>
          <div className="preview-bottom"><Shield size={14}/>Consistent reporting. Every movement.</div>
        </section><div className="tip-card"><span className="tip-icon"><Info size={18}/></span><div><h3>A quick tip</h3><p>Book in reports record arrival at a location inside camp. Book out reports record departure from the camp gate.</p></div></div></aside>
      </div> : activeTab === "emart" ? <div className="report-grid">
        <section className="panel form-panel">
          <div className="panel-heading"><span className="section-icon"><Users size={19}/></span><div><h2>E-Mart Break message</h2><p>Select cadets from the unit namelist.</p></div><span className="step-indicator">01 / 02</span></div>
          <div className="form-section">
            <div className="section-label"><span>01</span>Report details</div>
            <Field label="Report template"><div className="input-icon"><Sun size={16}/><select value={emartTemplate} onChange={e => { const period=e.target.value === 'Afternoon' ? 'Afternoon' : 'Morning'; setEmartTemplate(period); setEmartGreeting(period === 'Afternoon' ? 'Good Afternoon Trainers,' : 'Good Morning Trainers,') }}>{['Morning','Afternoon'].map(t => <option key={t} value={t}>{t} Report</option>)}</select></div></Field>
            <Field label="Greeting"><input required maxLength={200} value={emartGreeting} onChange={e => setEmartGreeting(e.target.value)}/></Field>
          </div>
          <div className="form-section">
            <div className="section-label"><span>02</span>Personnel selection</div>
            <div className="personnel-picker">
              <div className="picker-label"><span>Cadets visiting E-Mart<b>{emartSelected.length} selected</b></span><div><button type="button" onClick={() => setEmartSelected([])}>Clear</button></div></div>
              <div className="search-input"><Search size={16}/><input aria-label="Search personnel for E-Mart" placeholder="Search by name, unit, or rank…" value={emartSearch} onChange={e => setEmartSearch(e.target.value)}/></div>
              <div className="personnel-list">{loading ? <div className="loading-rows">{[1,2,3].map(i => <div key={i} className="skeleton-row"/>)}</div> : loadError ? <div className="list-message">Unable to load personnel. <button type="button" onClick={() => void refresh()}>Try again</button></div> : people.filter(p => `${p.unit} ${p.rank} ${p.name}`.toLowerCase().includes(emartSearch.toLowerCase())).length ? people.filter(p => `${p.unit} ${p.rank} ${p.name}`.toLowerCase().includes(emartSearch.toLowerCase())).map(p => <label className={`person-row ${emartSelected.includes(p.id) ? 'checked' : ''}`} key={p.id}><input type="checkbox" checked={emartSelected.includes(p.id)} onChange={() => setEmartSelected(ids => ids.includes(p.id) ? ids.filter(id => id !== p.id) : [...ids,p.id])}/><span className="unit-number">{p.unit}</span><span className="rank">{p.rank}</span><span className="person-name">{p.name}</span></label>) : <div className="list-message">{people.length ? 'No personnel match your search.' : 'No personnel found in the fixed roster.'}</div>}</div>
              <div className="picker-footer"><Users size={13}/>{loading ? 'Loading personnel…' : `${people.length} personnel in your unit`}<span>{emartSelected.length} selected</span></div>
            </div>
          </div>
        </section>
        <aside className="preview-column"><section className="panel preview-panel">
          <div className="preview-heading"><div><span className="eyebrow">YOUR MESSAGE</span><h2>Message preview</h2></div><span className="preview-status generated"><span/>Live preview</span></div>
          <pre className="generated-text">{emartGreeting.trim()+"\n\nThe following cadets will be visiting E-Mart during Lunch:\n\n"+(emartSelected.length ? people.filter(p => emartSelected.includes(p.id)).map(p => `${p.unit} ${p.rank} ${p.name}`).join("\n") : "")+"\n\nThank you Trainers."}</pre>
          <div className="report-actions"><button className="btn primary" disabled={!emartGreeting.trim() || !emartSelected.length || loading || loadError} onClick={() => void copy(emartGreeting.trim()+"\n\nThe following cadets will be visiting E-Mart during Lunch:\n\n"+people.filter(p => emartSelected.includes(p.id)).map(p => `${p.unit} ${p.rank} ${p.name}`).join("\n")+"\n\nThank you Trainers.")}><Copy size={15}/>Copy WhatsApp message</button></div>
          <div className="preview-bottom"><Shield size={14}/>Consistent reporting. Every movement.</div>
        </section><div className="tip-card"><span className="tip-icon"><Info size={18}/></span><div><h3>A quick tip</h3><p>Select any number of cadets using the searchable unit namelist.</p></div></div></aside>
      </div> : <div className="report-grid">
        <section className="panel form-panel"><div className="panel-heading"><span className="section-icon"><FileText size={19}/></span><div><h2>Create movement report</h2><p>Fill in the details of your team’s movement.</p></div><span className="step-indicator">01 / 02</span></div>
          <div>
            <div className="form-section"><div className="section-label"><span>01</span>Report details</div><div className="two-col"><Field label="Report template"><div className="input-icon"><Sun size={16}/><select value={template} onChange={e => { setTemplate(e.target.value); setGreeting(`Good ${e.target.value} Trainers,`) }}>{['Morning','Afternoon','Evening'].map(t => <option key={t} value={t}>{t} Report</option>)}</select></div></Field>{mode !== 'single' && <Field label="Unit designation"><select value="86th FAOCC" disabled><option value="86th FAOCC">86th FAOCC</option></select></Field>}</div><Field label="Greeting"><input required maxLength={200} value={greeting} onChange={e => setGreeting(e.target.value)}/></Field></div>
            <div className="form-section"><div className="section-label"><span>02</span>Movement details</div><Field label="Time of movement"><div className="time-row"><div className="input-icon"><Clock3 size={16}/><input inputMode="numeric" placeholder="e.g. 0550" required maxLength={4} value={time} onChange={e => setTime(e.target.value.replace(/\D/g,''))}/><span className="input-suffix">HRS</span></div><button type="button" className="btn subtle" onClick={() => { const n = new Date(); setTime(`${String(n.getHours()).padStart(2,'0')}${String(n.getMinutes()).padStart(2,'0')}`);  }}>Use current time</button></div></Field><div className="location-row"><Field label="Origin"><div className="location-combo"><div className="input-icon"><MapPin size={16}/><input list="locations" required placeholder="Type or choose location" value={origin} onChange={e => setOrigin(e.target.value.toUpperCase())}/></div><select aria-label="Choose origin location" value={locations.includes(origin) ? origin : ""} onChange={e => setOrigin(e.target.value)}><option value="">Choose…</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select></div></Field><button type="button" className="swap-button" title="Swap origin and destination" aria-label="Swap origin and destination" onClick={() => { setOrigin(destination); setDestination(origin);  }}><ArrowRightLeft size={17}/><span>Swap</span></button><Field label="Destination"><div className="location-combo"><div className="input-icon"><MapPin size={16}/><input list="locations" required placeholder="Type or choose location" value={destination} onChange={e => setDestination(e.target.value.toUpperCase())}/></div><select aria-label="Choose destination location" value={locations.includes(destination) ? destination : ""} onChange={e => setDestination(e.target.value)}><option value="">Choose…</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select></div></Field></div><datalist id="locations">{locations.map(l => <option key={l} value={l}/>)}</datalist></div>
            <div className="form-section"><div className="section-label"><span>03</span>Personnel & report mode</div><div className="mode-grid">{modes.map(m => <label className={`mode-option ${mode === m.value ? 'selected' : ''}`} key={m.value}><input type="radio" name="mode" value={m.value} checked={mode === m.value} onChange={() => { setMode(m.value); if (m.value === 'single') setSelected(s => s.slice(0, 1)) }}/><span><strong>{m.title}</strong><small>{m.description}</small></span></label>)}</div>
            {needsSelection && <div className="personnel-picker"><div className="picker-label"><span>{mode === 'exclusion' || exceptPlatoon !== null ? 'Personnel to exclude' : 'Personnel moving'}<b>{(exceptPlatoon !== null ? selectedExceptions.length : selectedPeople.length)} selected</b></span><div>{mode !== 'single' && <><button type="button" onClick={() => { setSelected(s => Array.from(new Set([...s, ...filtered.filter(p => exceptPlatoon === null || p.platoon === exceptPlatoon).map(p => p.id)])));  }}>Select all shown</button><span> / </span></> }<button type="button" onClick={() => { setSelected([]);  }}>Clear</button></div></div><div className="search-input"><Search size={16}/><input aria-label="Search personnel" placeholder="Search by name, unit, or rank…" value={search} onChange={e => setSearch(e.target.value)}/></div><div className="personnel-list">{loading ? <div className="loading-rows">{[1,2,3].map(i => <div key={i} className="skeleton-row"/>)}</div> : loadError ? <div className="list-message">Unable to load personnel. <button type="button" onClick={() => void refresh()}>Try again</button></div> : filtered.filter(p => exceptPlatoon === null || p.platoon === exceptPlatoon).length ? filtered.filter(p => exceptPlatoon === null || p.platoon === exceptPlatoon).map(p => <label className={`person-row ${selected.includes(p.id) ? 'checked' : ''}`} key={p.id}><input type={mode === 'single' ? 'radio' : 'checkbox'} name={mode === 'single' ? 'single-cadet' : undefined} checked={selected.includes(p.id)} onChange={() => setSelected(s => mode === 'single' ? [p.id] : s.includes(p.id) ? s.filter(id => id !== p.id) : [...s,p.id])}/><span className="unit-number">{p.unit}</span><span className="rank">{p.rank}</span><span className="person-name">{p.name}</span></label>) : <div className="list-message">{people.length ? 'No personnel match your search.' : 'No personnel found in the fixed roster.'}</div>}</div><div className="picker-footer"><Users size={13}/>{loading ? 'Loading personnel…' : exceptPlatoon !== null ? 'Platoon ' + exceptPlatoon + ': ' + platoonPeople.length + ' personnel' : people.length + ' personnel in your unit'}<span>{count} moving</span></div></div>}
            </div>
          </div>
        </section>
        <aside className="preview-column"><section className="panel preview-panel"><div className="preview-heading"><div><span className="eyebrow">YOUR REPORT</span><h2>Report preview</h2></div><span className="preview-status generated"><span/>Live preview</span></div><><div className="route-summary"><span><MapPin size={14}/>{movementFrom}</span><ArrowRight size={18}/><span><MapPin size={14}/>{movementTo}</span></div><div className="report-meta"><span><Clock3 size={14}/>{time || '[TIME]'} HRS</span><span><Users size={14}/>{count} personnel moving</span></div><pre className="generated-text">{movementPreview}</pre><div className="report-actions"><button className="btn primary" onClick={() => void copy(movementPreview)}><Copy size={15}/>Copy report</button>{movementNames && <button className="names-button" onClick={() => void copy(movementNames)}><Users size={14}/>Copy names only</button>}</div></><div className="preview-bottom"><Shield size={14}/>Consistent reporting. Every movement.</div></section><div className="tip-card"><span className="tip-icon"><Info size={18}/></span><div><h3>A quick tip</h3><p>Moving as a full unit? Select <strong>Entire unit</strong> to create your report without selecting personnel individually.</p></div></div><div className="workflow-note"><CheckCheck size={16}/><span>Built for the way your team moves.</span></div></aside>
      </div>}
      <footer className="footer"><span><Shield size={14}/>86th FAOCC <span className="footer-divider">/</span> Report Generator</span></footer>
    </main>
  </div>
}
