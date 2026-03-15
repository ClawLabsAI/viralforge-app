import { useState } from 'react'
import { useStore, CONTENT_TYPES, PLAT_INFO } from '../../store'
import PageHeader from '../shared/PageHeader'

const COLS = [
  { id: 'idea',      label: 'Idea',        color: '#606080' },
  { id: 'guion',     label: 'Guión',       color: '#6C3BFF' },
  { id: 'produccion',label: 'Producción',  color: '#F59E0B' },
  { id: 'revision',  label: 'Revisión',    color: '#FF5C8D' },
  { id: 'publicado', label: 'Publicado',   color: '#00D4AA' },
]
const TYPE_COLORS = { top10:'#6C3BFF', facts:'#00D4AA', motiv:'#FF5C8D', news:'#F59E0B', edu:'#10B981' }
const PRIO_ICONS  = { high: { icon: '●', color: '#FF5C8D' }, med: { icon: '●', color: '#F59E0B' }, low: { icon: '●', color: '#00D4AA' } }

export default function Projects() {
  const projects      = useStore(s => s.projects)
  const addProject    = useStore(s => s.addProject)
  const moveProject   = useStore(s => s.moveProject)
  const removeProject = useStore(s => s.removeProject)

  const [modal,   setModal]   = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ title:'', type:'top10', niche:'Tecnología', prio:'med', date:'', plats:['yt'], notes:'' })
  const [dragId, setDragId]   = useState(null)

  function saveProject() {
    if (!form.title.trim()) return
    addProject({ ...form, col: 'idea' })
    setModal(false)
    setForm({ title:'', type:'top10', niche:'Tecnología', prio:'med', date:'', plats:['yt'], notes:'' })
  }

  function togglePlat(p) {
    setForm(f => ({ ...f, plats: f.plats.includes(p) ? f.plats.filter(x=>x!==p) : [...f.plats, p] }))
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <PageHeader icon="🎬" title="Proyectos" subtitle="Kanban de producción de videos" />
        <button className="btn btn-primary" style={{ fontSize: 12, padding: '8px 16px', flexShrink: 0 }} onClick={() => setModal(true)}>+ Nuevo proyecto</button>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
        {COLS.map(col => {
          const colProjects = projects.filter(p => p.col === col.id)
          return (
            <div
              key={col.id}
              style={{ width: 230, flexShrink: 0 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (dragId) { moveProject(dragId, col.id); setDragId(null) } }}
            >
              {/* Col header */}
              <div className="card" style={{ padding: '8px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{col.label}</span>
                <span style={{ fontSize: 10, color: '#606080', background: '#0d0d12', padding: '1px 7px', borderRadius: 10 }}>{colProjects.length}</span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colProjects.map(proj => {
                  const tc = TYPE_COLORS[proj.type] || '#6C3BFF'
                  const pi = PRIO_ICONS[proj.prio] || PRIO_ICONS.med
                  return (
                    <div
                      key={proj.id}
                      className="card card-hover"
                      draggable
                      onDragStart={() => setDragId(proj.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => setSelected(proj)}
                      style={{ padding: 12, cursor: 'grab', opacity: dragId === proj.id ? .5 : 1 }}
                    >
                      <div style={{ display: 'flex', gap: 4, marginBottom: 7 }}>
                        {proj.plats.map(p => (
                          <span key={p} style={{ width: 16, height: 16, borderRadius: 4, background: PLAT_INFO[p]?.dot + '22', border: `0.5px solid ${PLAT_INFO[p]?.dot}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: PLAT_INFO[p]?.dot }}>
                            {p === 'yt' ? 'Y' : p === 'tk' ? 'T' : 'I'}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#e0e0f0', lineHeight: 1.4, marginBottom: 7 }}>{proj.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4, background: tc + '18', color: tc, border: `0.5px solid ${tc}33` }}>
                          {CONTENT_TYPES[proj.type] || proj.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '0.5px solid #1a1a2a' }}>
                        <span style={{ fontSize: 10, color: '#606080' }}>{proj.date || '—'}</span>
                        <span style={{ fontSize: 10, color: pi.color }}>{pi.icon} {proj.prio}</span>
                      </div>
                    </div>
                  )
                })}
                <button className="btn" style={{ width: '100%', padding: '8px 0', fontSize: 11, border: '0.5px dashed #1e1e2e' }} onClick={() => setModal(true)}>+ Añadir</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={e => { if(e.target===e.currentTarget) setSelected(null) }}>
          <div className="card" style={{ width: '100%', maxWidth: 380, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#f0eeff' }}>{selected.title}</span>
              <button className="btn" style={{ width: 28, height: 28, padding: 0, fontSize: 13 }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ fontSize: 11, color: '#606080' }}>
              {PLAT_INFO[selected.plats?.[0]]?.name} · {selected.niche} · {CONTENT_TYPES[selected.type]}
            </div>
            {selected.notes && <div style={{ fontSize: 12, color: '#808098', background: '#0d0d12', borderRadius: 8, padding: 10 }}>{selected.notes}</div>}
            <div>
              <div style={{ fontSize: 11, color: '#606080', marginBottom: 6 }}>Mover a</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {COLS.filter(c => c.id !== selected.col).map(col => (
                  <button key={col.id} className="btn" style={{ justifyContent: 'flex-start', gap: 8 }}
                    onClick={() => { moveProject(selected.id, col.id); setSelected(null) }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.color }} />
                    Mover a {col.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-danger" onClick={() => { removeProject(selected.id); setSelected(null) }}>Eliminar proyecto</button>
          </div>
        </div>
      )}

      {/* New project modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={e => { if(e.target===e.currentTarget) setModal(false) }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Nuevo proyecto</span>
              <button className="btn" style={{ width: 28, height: 28, padding: 0, fontSize: 13 }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Título</label>
              <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Tema del video" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Tipo</label>
                <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                  {Object.entries(CONTENT_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select></div>
              <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Prioridad</label>
                <select value={form.prio} onChange={e => setForm(f=>({...f,prio:e.target.value}))}>
                  <option value="high">Alta</option><option value="med">Media</option><option value="low">Baja</option>
                </select></div>
            </div>
            <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Plataformas</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['yt','tk','ig'].map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#a0a0b8', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.plats.includes(p)} onChange={() => togglePlat(p)} style={{ width: 'auto', margin: 0 }} />
                    {PLAT_INFO[p]?.name}
                  </label>
                ))}
              </div>
            </div>
            <div><label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4 }}>Fecha objetivo</label>
              <input value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} placeholder="Ej: 25 mar" /></div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 10 }} onClick={saveProject}>Crear proyecto</button>
          </div>
        </div>
      )}
    </div>
  )
}
