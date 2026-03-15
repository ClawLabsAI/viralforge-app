import { useState } from 'react'
import { useStore, PLAT_INFO, CONTENT_TYPES } from '../../store'
import { generateAnalyticsSummary } from '../../utils/api'
import PageHeader from '../shared/PageHeader'

const RANGES = [
  { value: '7d',  label: '7 días'  },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
]

export default function Analytics() {
  const queue   = useStore(s => s.queue)
  const library = useStore(s => s.library)
  const [range,    setRange]    = useState('30d')
  const [aiData,   setAiData]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const live    = queue.filter(i => i.status === 'live')
  const fmtN    = n => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n||0)
  const totalV  = live.reduce((a,b) => a+(b.views||0), 0)
  const totalL  = live.reduce((a,b) => a+(b.likes||0), 0)
  const totalC  = live.reduce((a,b) => a+(b.comments||0), 0)
  const avgEng  = totalV > 0 ? ((totalL+totalC)/totalV*100).toFixed(1) : '0.0'

  const byPlat  = { yt: live.filter(i=>i.plat==='yt'), tk: live.filter(i=>i.plat==='tk'), ig: live.filter(i=>i.plat==='ig') }
  const byType  = Object.keys(CONTENT_TYPES).map(type => ({
    type, label: CONTENT_TYPES[type],
    count: live.filter(i=>i.type===type).length,
    views: live.filter(i=>i.type===type).reduce((a,b)=>a+(b.views||0),0),
  })).filter(x => x.count > 0).sort((a,b) => b.views-a.views)

  const topVideo = [...live].sort((a,b) => (b.views||0)-(a.views||0))[0]

  async function getAiInsights() {
    setLoading(true); setError(''); setAiData(null)
    try {
      const res = await generateAnalyticsSummary({ queue, library, period: RANGES.find(r=>r.value===range)?.label })
      setAiData(res)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const STAT_CARDS = [
    { label: 'Vistas totales',    val: fmtN(totalV), color: '#6C3BFF', icon: '👁' },
    { label: 'Likes totales',     val: fmtN(totalL), color: '#FF5C8D', icon: '❤️' },
    { label: 'Comentarios',       val: fmtN(totalC), color: '#F59E0B', icon: '💬' },
    { label: 'Engagement rate',   val: avgEng+'%',   color: '#00D4AA', icon: '📈' },
    { label: 'Videos publicados', val: live.length,  color: '#6C3BFF', icon: '🎬' },
    { label: 'En biblioteca',     val: library.length, color: '#888',  icon: '📚' },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <PageHeader icon="📊" title="Analíticas" subtitle="Rendimiento de tu contenido" />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#0a0a10', borderRadius: 8, border: '0.5px solid #1a1a2a', overflow: 'hidden' }}>
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)} style={{ padding: '6px 14px', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: range===r.value ? 'var(--accent)' : 'transparent', color: range===r.value ? '#fff' : '#606080', transition: 'all .15s' }}>{r.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {STAT_CARDS.map(({ label, val, color, icon }) => (
          <div key={label} style={{ background: '#13131a', border: '0.5px solid #1e1e2e', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#606080', marginBottom: 6 }}>{icon} {label}</div>
            <div style={{ fontSize: 24, fontWeight: 500, color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {/* By platform */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#a0a0b8', marginBottom: 14 }}>Por plataforma</div>
          {Object.entries(byPlat).map(([key, items]) => {
            const views = items.reduce((a,b)=>a+(b.views||0),0)
            const pct   = totalV > 0 ? Math.round(views/totalV*100) : 0
            const pi    = PLAT_INFO[key]
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#a0a0b8' }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:pi.dot, display:'inline-block' }} />
                    {pi.name}
                    <span style={{ fontSize:10, color:'#606080' }}>({items.length} videos)</span>
                  </span>
                  <span style={{ fontSize:12, fontWeight:500, color:'#f0eeff' }}>{fmtN(views)}</span>
                </div>
                <div style={{ height: 4, background: '#1a1a2a', borderRadius: 2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:pi.dot, borderRadius:2, transition:'width .5s' }} />
                </div>
              </div>
            )
          })}
          {live.length === 0 && <div style={{ fontSize:12, color:'#606080', textAlign:'center', padding:'20px 0' }}>Sin datos aún</div>}
        </div>

        {/* By content type */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#a0a0b8', marginBottom: 14 }}>Por tipo de contenido</div>
          {byType.length === 0 && <div style={{ fontSize:12, color:'#606080', textAlign:'center', padding:'20px 0' }}>Sin datos aún</div>}
          {byType.map(({ type, label, count, views }) => {
            const TYPE_COLORS = { top10:'#6C3BFF', facts:'#00D4AA', motiv:'#FF5C8D', news:'#F59E0B', edu:'#10B981' }
            const color = TYPE_COLORS[type] || '#888'
            const pct   = totalV > 0 ? Math.round(views/totalV*100) : 0
            return (
              <div key={type} style={{ marginBottom: 12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:'#a0a0b8' }}>{label} <span style={{ color:'#606080', fontSize:10 }}>({count})</span></span>
                  <span style={{ fontSize:12, fontWeight:500, color:'#f0eeff' }}>{fmtN(views)}</span>
                </div>
                <div style={{ height:4, background:'#1a1a2a', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:2, transition:'width .5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top video */}
      {topVideo && (
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#a0a0b8', marginBottom: 12 }}>🏆 Video con más vistas</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width:72, height:42, borderRadius:6, background:'#0a0a15', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
              {topVideo.finalFrame ? <img src={topVideo.finalFrame} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🎬'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#f0eeff', marginBottom:4 }}>{topVideo.title}</div>
              <div style={{ display:'flex', gap:14 }}>
                {[['👁',topVideo.views],['❤️',topVideo.likes],['💬',topVideo.comments]].map(([icon,val]) => (
                  <span key={icon} style={{ fontSize:12, color:'#a0a0b8' }}>{icon} {fmtN(val)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: aiData ? 14 : 0 }}>
          <div style={{ fontSize:12, fontWeight:500, color:'#a0a0b8' }}>🤖 Recomendaciones con IA</div>
          <button className="btn btn-primary" onClick={getAiInsights} disabled={loading} style={{ fontSize:11, padding:'6px 14px' }}>
            {loading ? <><span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>↻</span> Analizando...</> : 'Analizar con IA'}
          </button>
        </div>

        {error && <div style={{ fontSize:12, color:'var(--accent2)', padding:'10px 0' }}>{error}</div>}

        {aiData && (
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:14 }}>
            {/* Summary */}
            <div style={{ background:'#6C3BFF10', border:'0.5px solid #6C3BFF30', borderRadius:9, padding:'12px 14px' }}>
              <div style={{ fontSize:11, color:'#9b7aff', fontWeight:500, marginBottom:4 }}>Resumen</div>
              <div style={{ fontSize:13, color:'#d0d0f0', lineHeight:1.6 }}>{aiData.summary}</div>
            </div>

            {/* Growth score */}
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:600, color: aiData.growth_score>=70?'#00D4AA':aiData.growth_score>=50?'#F59E0B':'#FF5C8D' }}>{aiData.growth_score}</div>
                <div style={{ fontSize:10, color:'#606080' }}>growth score</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ height:6, background:'#1a1a2a', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${aiData.growth_score}%`, background: aiData.growth_score>=70?'#00D4AA':aiData.growth_score>=50?'#F59E0B':'#FF5C8D', borderRadius:3, transition:'width .8s' }} />
                </div>
              </div>
            </div>

            {/* Top insight */}
            <div style={{ background:'#F59E0B10', border:'0.5px solid #F59E0B30', borderRadius:9, padding:'10px 14px', fontSize:12, color:'#fbbf24' }}>
              💡 {aiData.top_insight}
            </div>

            {/* Recommendations */}
            <div>
              <div style={{ fontSize:11, fontWeight:500, color:'#606080', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Recomendaciones accionables</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {(aiData.recommendations||[]).map((rec, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:12, color:'#a0a0b8', background:'#0d0d12', borderRadius:8, padding:'9px 12px' }}>
                    <span style={{ color:'var(--accent)', fontWeight:600, flexShrink:0 }}>{i+1}.</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {[
                { label:'Mejor plataforma', val:aiData.best_platform },
                { label:'Tipo recomendado', val:aiData.best_content_type },
                { label:'Frecuencia ideal',  val:aiData.posting_frequency },
              ].map(({ label, val }) => (
                <div key={label} style={{ background:'#0d0d12', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, color:'#606080', marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:12, fontWeight:500, color:'#e0e0f0' }}>{val || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!aiData && !loading && !error && (
          <div style={{ padding:'20px 0', textAlign:'center', fontSize:12, color:'#606080' }}>
            Pulsa "Analizar con IA" para obtener recomendaciones personalizadas basadas en tus datos
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
