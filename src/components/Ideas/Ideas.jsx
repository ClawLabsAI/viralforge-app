import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateViralIdeas } from '../../utils/api'
import { CONTENT_TYPES } from '../../store'
import PageHeader from '../shared/PageHeader'

const NICHES = ['Tecnología','Finanzas','Psicología','Historia','Ciencia','Salud','Entretenimiento','Deportes','Cultura','Negocios','IA / Machine Learning','Cripto / Web3']
const TYPE_COLORS = { top10:'#6C3BFF', facts:'#00D4AA', motiv:'#FF5C8D', news:'#F59E0B', edu:'#10B981' }
const PLAT_DOTS   = { yt:'#FF0000', tk:'#888', ig:'#E1306C' }

export default function Ideas() {
  const navigate = useNavigate()
  const [type,    setType]    = useState('top10')
  const [niche,   setNiche]   = useState('Tecnología')
  const [lang,    setLang]    = useState('español')
  const [loading, setLoading] = useState(false)
  const [ideas,   setIdeas]   = useState([])
  const [error,   setError]   = useState('')

  async function handleGenerate() {
    setLoading(true); setError(''); setIdeas([])
    try {
      const res = await generateViralIdeas({ type, niche, lang, count: 8 })
      setIdeas(res.ideas || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function useIdea(idea) {
    // Pass idea to Studio via URL state
    navigate('/', { state: { topic: idea.title, type } })
  }

  function scoreColor(score) {
    if (score >= 80) return '#00D4AA'
    if (score >= 60) return '#F59E0B'
    return '#FF5C8D'
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <PageHeader icon="🔥" title="Ideas virales" subtitle="Sugerencias basadas en tendencias reales" />

      {/* Config */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4, fontWeight: 500 }}>Tipo de contenido</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {Object.entries(CONTENT_TYPES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4, fontWeight: 500 }}>Nicho</label>
          <select value={niche} onChange={e => setNiche(e.target.value)}>
            {NICHES.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#606080', display: 'block', marginBottom: 4, fontWeight: 500 }}>Idioma</label>
          <select value={lang} onChange={e => setLang(e.target.value)}>
            <option value="español">Español</option>
            <option value="inglés">English</option>
            <option value="portugués">Português</option>
          </select>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={loading}
        style={{ width: '100%', padding: 12, fontSize: 13, marginBottom: 16 }}
      >
        {loading ? (
          <><span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>↻</span> Buscando tendencias virales...</>
        ) : '🔥 Generar ideas virales con IA'}
      </button>

      {error && (
        <div style={{ background:'#FF5C8D12', border:'0.5px solid #FF5C8D44', borderRadius:8, padding:12, fontSize:12, color:'var(--accent2)', marginBottom:16 }}>
          {error}
        </div>
      )}

      {/* Ideas grid */}
      {ideas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ideas.map((idea, i) => (
            <div key={i} className="card card-hover" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* Score */}
                <div style={{ flexShrink: 0, textAlign: 'center', width: 52 }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: scoreColor(idea.trending_score || 75), lineHeight: 1 }}>
                    {idea.trending_score || 75}
                  </div>
                  <div style={{ fontSize: 9, color: '#606080', marginTop: 2 }}>viral score</div>
                  <div style={{ height: 3, background: '#1a1a2a', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${idea.trending_score || 75}%`, background: scoreColor(idea.trending_score || 75), borderRadius: 2 }} />
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#f0eeff', marginBottom: 6, lineHeight: 1.3 }}>{idea.title}</div>

                  <div style={{ fontSize: 12, color: '#808098', marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: '#9b7aff' }}>Hook: </span>{idea.hook}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {/* Why viral */}
                    <span style={{ fontSize: 10, color: '#00D4AA', background: '#00D4AA12', padding: '2px 8px', borderRadius: 4, border: '0.5px solid #00D4AA33' }}>
                      {idea.why_viral}
                    </span>

                    {/* Estimated views */}
                    {idea.estimated_views && (
                      <span style={{ fontSize: 10, color: '#F59E0B', background: '#F59E0B12', padding: '2px 8px', borderRadius: 4, border: '0.5px solid #F59E0B33' }}>
                        ~{idea.estimated_views} vistas
                      </span>
                    )}

                    {/* Platforms */}
                    {(idea.platforms || []).map(p => (
                      <span key={p} style={{ width: 6, height: 6, borderRadius: '50%', background: PLAT_DOTS[p] || '#888', display: 'inline-block' }} title={p} />
                    ))}

                    {/* Keywords */}
                    {(idea.keywords || []).slice(0, 3).map(kw => (
                      <span key={kw} style={{ fontSize: 10, color: '#606080', background: '#1a1a2a', padding: '1px 6px', borderRadius: 3 }}>#{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <button
                  className="btn btn-primary"
                  style={{ flexShrink: 0, fontSize: 11, padding: '7px 14px' }}
                  onClick={() => useIdea(idea)}
                >
                  Usar idea ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && ideas.length === 0 && !error && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#a0a0b8', marginBottom: 6 }}>Descubre qué está viral ahora</div>
          <div style={{ fontSize: 12, color: '#606080' }}>La IA analiza tendencias reales de YouTube, TikTok e Instagram para sugerirte los temas con más potencial de views</div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
