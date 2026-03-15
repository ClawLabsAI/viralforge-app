import { useState } from 'react'
import { useStore, PLAT_INFO, CONTENT_TYPES } from '../../store'
import PageHeader from '../shared/PageHeader'

const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const TYPE_COLORS = { top10:'#6C3BFF', facts:'#00D4AA', motiv:'#FF5C8D', news:'#F59E0B', edu:'#10B981' }

export default function Calendar() {
  const calPosts    = useStore(s => s.calPosts)
  const addCalPost  = useStore(s => s.addCalPost)
  const removeCalPost = useStore(s => s.removeCalPost)

  const [cur,     setCur]     = useState(new Date(2026, 2, 1))
  const [view,    setView]    = useState('month')
  const [filter,  setFilter]  = useState('all')
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ title:'', plat:'yt', type:'top10', date:'', time:'18:00' })

  const year  = cur.getFullYear()
  const month = cur.getMonth()

  function postsFor(dateStr) {
    return calPosts.filter(p => p.date === dateStr && (filter === 'all' || p.plat === filter))
  }

  function navigate(dir) {
    const d = new Date(cur)
    view === 'month' ? d.setMonth(d.getMonth() + dir) : d.setDate(d.getDate() + dir * 7)
    setCur(d)
  }

  function savePost() {
    if (!form.title.trim() || !form.date) return
    addCalPost(form)
    setModal(false)
    setForm({ title:'', plat:'yt', type:'top10', date:'', time:'18:00' })
  }

  // Month grid
  function renderMonth() {
    const firstDay   = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    const cells = []

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month, 0).getDate() - i
      cells.push(<div key={`p${i}`} style={{ minHeight: 80, padding: 6, opacity: .3 }}><div style={{ fontSize: 11, color: '#606080' }}>{d}</div></div>)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const isToday = ds === todayStr
      const posts = postsFor(ds)
      cells.push(
        <div
          key={d}
          onClick={() => { setForm(f => ({ ...f, date: ds })); setModal(true) }}
          style={{
            minHeight: 80, padding: 6, cursor: 'pointer', transition: 'border-color .15s',
            border: isToday ? '0.5px solid var(--accent)' : '0.5px solid #1a1a2a',
            borderRadius: 8, background: '#13131a',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: isToday ? 600 : 400, color: isToday ? '#9b7aff' : '#606080', marginBottom: 4 }}>{d}</div>
          {posts.slice(0, 2).map((p, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); removeCalPost(p.id) }}
              style={{ borderRadius: 4, padding: '2px 5px', fontSize: 9, fontWeight: 500, marginBottom: 2, cursor: 'pointer',
                background: TYPE_COLORS[p.type] + '22', color: TYPE_COLORS[p.type],
                border: `0.5px solid ${TYPE_COLORS[p.type]}44`,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: PLAT_INFO[p.plat]?.dot, flexShrink: 0 }} />
              {p.title}
            </div>
          ))}
          {posts.length > 2 && <div style={{ fontSize: 9, color: '#606080' }}>+{posts.length - 2} más</div>}
        </div>
      )
    }

    const rem = (firstDay + daysInMonth) % 7
    if (rem > 0) for (let d = 1; d <= 7 - rem; d++) cells.push(
      <div key={`n${d}`} style={{ minHeight: 80, padding: 6, opacity: .3 }}><div style={{ fontSize: 11, color: '#606080' }}>{d}</div></div>
    )

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
          {DAYS_ES.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 500, color: '#404060', padding: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>{cells}</div>
      </div>
    )
  }

  // Month label
  const monthLabel = view === 'month'
    ? `${MONTHS_ES[month]} ${year}`
    : (() => {
        const base = new Date(cur)
        const dow = base.getDay()
        const start = new Date(base); start.setDate(base.getDate() + (dow === 0 ? -6 : 1 - dow))
        const end = new Date(start); end.setDate(start.getDate() + 6)
        return `${start.getDate()} – ${end.getDate()} ${MONTHS_ES[end.getMonth()]} ${end.getFullYear()}`
      })()

  const mPosts = calPosts.filter(p => { const [y,m] = p.date.split('-').map(Number); return y===year && m===month+1 })

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <PageHeader icon="📅" title="Calendario editorial" subtitle="Planifica tu contenido" />

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => navigate(-1)}>‹</button>
          <div style={{ padding: '6px 16px', fontSize: 12, fontWeight: 500, color: '#a0a0c0', background: '#13131a', border: '0.5px solid #1e1e2e', borderRadius: 8, minWidth: 160, textAlign: 'center' }}>{monthLabel}</div>
          <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => navigate(1)}>›</button>
        </div>

        <div style={{ display: 'flex', background: '#0a0a10', borderRadius: 8, border: '0.5px solid #1a1a2a', overflow: 'hidden' }}>
          {['month','week'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: view===v ? 'var(--accent)' : 'transparent', color: view===v ? '#fff' : '#606080', transition: 'all .15s' }}>
              {v === 'month' ? 'Mes' : 'Semana'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all','yt','tk','ig'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', border: filter===f ? `0.5px solid ${f==='all'?'var(--accent)':PLAT_INFO[f]?.dot+'88'}` : '0.5px solid #1e1e2e', background: filter===f ? (f==='all'?'#6C3BFF18':'#13131a') : '#0d0d12', color: filter===f ? (f==='all'?'#9b7aff':PLAT_INFO[f]?.dot) : '#606080' }}>
              {f==='all'?'Todos':PLAT_INFO[f]?.name}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#606080' }}>
          {mPosts.filter(p=>p.plat==='yt').length} YT · {mPosts.filter(p=>p.plat==='tk').length} TK · {mPosts.filter(p=>p.plat==='ig').length} IG este mes
        </div>

        <button className="btn btn-primary" style={{ fontSize: 11, padding: '6px 14px' }} onClick={() => setModal(true)}>+ Programar</button>
      </div>

      {renderMonth()}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={e => { if(e.target===e.currentTarget) setModal(false) }}>
          <div className="card" style={{ width: '100%', maxWidth: 380, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Programar publicación</span>
              <button className="btn" style={{ width: 28, height: 28, padding: 0, fontSize: 13 }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Título</label>
              <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Título del video" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Plataforma</label>
                <select value={form.plat} onChange={e => setForm(f=>({...f,plat:e.target.value}))}>
                  <option value="yt">YouTube</option><option value="tk">TikTok</option><option value="ig">Instagram</option>
                </select></div>
              <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Tipo</label>
                <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                  {Object.entries(CONTENT_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select></div>
              <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Fecha</label>
                <input value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} placeholder="2026-03-22" /></div>
              <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Hora</label>
                <select value={form.time} onChange={e => setForm(f=>({...f,time:e.target.value}))}>
                  {['08:00','10:00','12:00','15:00','17:00','18:00','19:00','20:00'].map(t=><option key={t}>{t}</option>)}
                </select></div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 10 }} onClick={savePost}>Guardar en calendario</button>
          </div>
        </div>
      )}
    </div>
  )
}
