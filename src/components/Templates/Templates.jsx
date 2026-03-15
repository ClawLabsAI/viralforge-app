import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, CONTENT_TYPES, VIDEO_STYLES } from '../../store'
import PageHeader from '../shared/PageHeader'

const STYLE_PREVIEW = { dark:'#0a0a0f', neon:'#050510', clean:'#f8f8f8', nature:'#1a1a12', retro:'#1a0a00' }
const TYPE_COLORS   = { top10:'#6C3BFF', facts:'#00D4AA', motiv:'#FF5C8D', news:'#F59E0B', edu:'#10B981' }

export default function Templates() {
  const navigate = useNavigate()
  const templates          = useStore(s => s.templates)
  const addTemplate        = useStore(s => s.addTemplate)
  const removeTemplate     = useStore(s => s.removeTemplate)
  const incrementTemplateUse = useStore(s => s.incrementTemplateUse)

  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ name:'', type:'top10', style:'dark', plat:'youtube', dur:60, lang:'español', niche:'Tecnología' })

  function useTemplate(tpl) {
    incrementTemplateUse(tpl.id)
    navigate('/', { state: { topic: '', type: tpl.type, style: tpl.style, plat: tpl.plat, dur: tpl.dur, lang: tpl.lang } })
  }

  function saveTemplate() {
    if (!form.name.trim()) return
    addTemplate(form)
    setModal(false)
    setForm({ name:'', type:'top10', style:'dark', plat:'youtube', dur:60, lang:'español', niche:'Tecnología' })
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <PageHeader icon="📋" title="Plantillas" subtitle="Configuraciones guardadas para reutilizar" />
        <button className="btn btn-primary" style={{ fontSize:12, padding:'8px 16px', flexShrink:0 }} onClick={() => setModal(true)}>+ Nueva plantilla</button>
      </div>

      {templates.length === 0 ? (
        <div className="card" style={{ padding:48, textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:14, fontWeight:500, color:'#a0a0b8', marginBottom:6 }}>Sin plantillas todavía</div>
          <div style={{ fontSize:12, color:'#606080' }}>Crea plantillas para reutilizar tu configuración favorita sin tener que configurarlo todo de nuevo</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
          {templates.map(tpl => {
            const tc   = TYPE_COLORS[tpl.type] || '#888'
            const sbg  = STYLE_PREVIEW[tpl.style] || '#0a0a0f'
            const st   = VIDEO_STYLES[tpl.style]  || VIDEO_STYLES.dark
            return (
              <div key={tpl.id} className="card card-hover" style={{ overflow:'hidden' }}>
                {/* Mini preview */}
                <div style={{ height:70, background:sbg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <span style={{ fontSize:13, fontWeight:500, color:st.text, opacity:.6, textAlign:'center', padding:'0 12px' }}>{tpl.name}</span>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:st.accent }} />
                </div>

                <div style={{ padding:'12px 14px' }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'#f0eeff', marginBottom:8 }}>{tpl.name}</div>

                  <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                    <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:tc+'18', color:tc, border:`0.5px solid ${tc}33` }}>
                      {CONTENT_TYPES[tpl.type] || tpl.type}
                    </span>
                    <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:'#1a1a2a', color:'#808098' }}>
                      {tpl.style}
                    </span>
                    <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:'#1a1a2a', color:'#808098', textTransform:'capitalize' }}>
                      {tpl.plat}
                    </span>
                    <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:'#1a1a2a', color:'#808098' }}>
                      {tpl.dur}s
                    </span>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:10, color:'#606080' }}>Usado {tpl.useCount || 0} {tpl.useCount === 1 ? 'vez' : 'veces'}</span>
                    <span style={{ fontSize:10, color:'#606080' }}>{tpl.lang}</span>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:6 }}>
                    <button className="btn btn-primary" style={{ fontSize:11, padding:'7px 0' }} onClick={() => useTemplate(tpl)}>
                      Usar plantilla ↗
                    </button>
                    <button className="btn btn-danger" style={{ fontSize:11, padding:'7px 10px' }} onClick={() => removeTemplate(tpl.id)}>✕</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }} onClick={e => { if(e.target===e.currentTarget) setModal(false) }}>
          <div className="card" style={{ width:'100%', maxWidth:400, padding:20, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:14, fontWeight:500 }}>Nueva plantilla</span>
              <button className="btn" style={{ width:28, height:28, padding:0, fontSize:13 }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div>
              <label style={{ fontSize:11, color:'#606080', display:'block', marginBottom:4, fontWeight:500 }}>Nombre de la plantilla</label>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Ej: Top 10 Tech YouTube" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'Tipo', key:'type', opts: Object.entries(CONTENT_TYPES).map(([k,v])=>({v:k,l:v})) },
                { label:'Estilo', key:'style', opts: Object.keys(VIDEO_STYLES).map(k=>({v:k,l:k})) },
                { label:'Plataforma', key:'plat', opts:[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'both',l:'Ambos'}] },
                { label:'Duración', key:'dur', opts:[{v:30,l:'30s'},{v:60,l:'60s'},{v:180,l:'3 min'}] },
                { label:'Idioma', key:'lang', opts:[{v:'español',l:'Español'},{v:'inglés',l:'English'},{v:'portugués',l:'Português'}] },
                { label:'Nicho', key:'niche', opts:['Tecnología','Finanzas','Psicología','Historia','Ciencia','Salud','IA / Machine Learning'].map(n=>({v:n,l:n})) },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label style={{ fontSize:11, color:'#606080', display:'block', marginBottom:4, fontWeight:500 }}>{label}</label>
                  <select value={form[key]} onChange={e => setForm(f=>({...f,[key]:key==='dur'?Number(e.target.value):e.target.value}))}>
                    {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width:'100%', padding:10 }} onClick={saveTemplate}>Guardar plantilla</button>
          </div>
        </div>
      )}
    </div>
  )
}
