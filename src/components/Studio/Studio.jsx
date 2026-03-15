import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { generateScript, speakText, stopSpeech } from '../../utils/api'
import { renderVideoFrames, downloadDataUrl } from '../../utils/videoRenderer'
import { useStore, CONTENT_TYPES, VIDEO_STYLES } from '../../store'
import PageHeader from '../shared/PageHeader'

const STYLES   = Object.keys(VIDEO_STYLES)
const PLATS    = [{ value:'youtube',label:'YouTube (16:9)'},{value:'tiktok',label:'TikTok / Reels (9:16)'},{value:'both',label:'Ambos formatos'}]
const DURATIONS= [{value:30,label:'~30 seg'},{value:60,label:'~60 seg'},{value:180,label:'~3 min'}]

export default function Studio() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const addToQueue   = useStore(s => s.addToQueue)
  const addToLibrary = useStore(s => s.addToLibrary)

  // Pre-fill from Ideas or Templates navigation
  const prefill = location.state || {}

  const [topic,   setTopic]   = useState(prefill.topic   || '')
  const [type,    setType]    = useState(prefill.type     || 'top10')
  const [style,   setStyle]   = useState(prefill.style    || 'dark')
  const [plat,    setPlat]    = useState(prefill.plat     || 'youtube')
  const [dur,     setDur]     = useState(prefill.dur      || 60)
  const [lang,    setLang]    = useState(prefill.lang     || 'español')

  const [loading,   setLoading]   = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [progMsg,   setProgMsg]   = useState('')
  const [script,    setScript]    = useState(null)
  const [renders,   setRenders]   = useState([])
  const [error,     setError]     = useState('')
  const [speaking,  setSpeaking]  = useState(false)
  const [speakIdx,  setSpeakIdx]  = useState(-1)

  const progTimer = useRef(null)

  // If navigated from Ideas/Templates with topic pre-filled, auto-focus the input
  useEffect(() => {
    if (prefill.topic) {
      document.getElementById('topic-input')?.focus()
    }
    return () => stopSpeech()
  }, [])

  function startProgress(steps) {
    let pct = 0
    clearInterval(progTimer.current)
    progTimer.current = setInterval(() => {
      pct = Math.min(pct + 16, 88)
      setProgress(pct)
      setProgMsg(steps[Math.min(Math.floor(pct / 25), steps.length - 1)])
    }, 600)
  }

  async function handleGenerate() {
    if (!topic.trim()) { document.getElementById('topic-input')?.focus(); return }
    setError(''); setScript(null); setRenders([]); stopSpeech(); setSpeaking(false); setSpeakIdx(-1)
    setLoading(true); setProgress(0)
    startProgress(['Analizando tema...','Redactando guión...','Estructurando escenas...','Finalizando...'])
    try {
      const json = await generateScript({ topic, type, lang, dur, style, plat })
      clearInterval(progTimer.current); setProgress(100)
      setScript({ ...json, type, lang, topic, style, plat, dur })
    } catch (e) {
      setError(e.message)
    } finally {
      clearInterval(progTimer.current)
      setLoading(false)
    }
  }

  async function handleRender() {
    if (!script) return
    setLoading(true); setProgMsg('Renderizando frames...')
    const platKeys = plat === 'both' ? ['youtube','tiktok'] : [plat === 'tiktok' ? 'tiktok' : 'youtube']
    try {
      const results = await Promise.all(platKeys.map(k => renderVideoFrames(script, k)))
      setRenders(results)
      results.forEach(r => addToLibrary({ title:script.title, script, platKey:r.platKey, finalFrame:r.finalFrame, dataUrl:r.dataUrl }))
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function handleAddToQueue(platKey, mode) {
    const r = renders.find(x => x.platKey === platKey) || renders[0]
    const platMap = { youtube:'yt', tiktok:'tk' }
    addToQueue({ title:script.title, plat:platMap[platKey]||'yt', mode, date:new Date(Date.now()+86400000).toISOString().slice(0,10), time:'18:00', finalFrame:r?.finalFrame||null, dataUrl:r?.dataUrl||null, description:script.description||'', tags:script.tags||'' })
    navigate('/publish')
  }

  // TTS — reads scenes one by one
  function handleSpeak() {
    if (!script?.scenes?.length) return
    if (speaking) { stopSpeech(); setSpeaking(false); setSpeakIdx(-1); return }
    setSpeaking(true)
    let idx = 0
    function readNext() {
      if (idx >= script.scenes.length) { setSpeaking(false); setSpeakIdx(-1); return }
      setSpeakIdx(idx)
      speakText(script.scenes[idx].text, { rate: 0.95, onEnd: () => { idx++; setTimeout(readNext, 400) } })
    }
    readNext()
  }

  return (
    <div style={{ padding:24, maxWidth:900, margin:'0 auto' }}>
      <PageHeader icon="⚡" title="Studio" subtitle="Genera guiones y videos con IA" />

      {/* Config */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={{ fontSize:11, color:'#606080', display:'block', marginBottom:4, fontWeight:500 }}>Tema del video</label>
          <input id="topic-input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ej: Top 10 empresas de IA más valiosas en 2025" onKeyDown={e => e.key==='Enter' && handleGenerate()} />
        </div>
        <div>
          <label style={{ fontSize:11, color:'#606080', display:'block', marginBottom:4, fontWeight:500 }}>Tipo</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {Object.entries(CONTENT_TYPES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11, color:'#606080', display:'block', marginBottom:4, fontWeight:500 }}>Plataforma</label>
          <select value={plat} onChange={e => setPlat(e.target.value)}>
            {PLATS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11, color:'#606080', display:'block', marginBottom:4, fontWeight:500 }}>Duración</label>
          <select value={dur} onChange={e => setDur(Number(e.target.value))}>
            {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11, color:'#606080', display:'block', marginBottom:4, fontWeight:500 }}>Idioma</label>
          <select value={lang} onChange={e => setLang(e.target.value)}>
            <option value="español">Español</option>
            <option value="inglés">English</option>
            <option value="portugués">Português</option>
          </select>
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={{ fontSize:11, color:'#606080', display:'block', marginBottom:4, fontWeight:500 }}>Estilo visual</label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)} style={{ padding:'5px 12px', borderRadius:7, fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s', border:style===s?'0.5px solid var(--accent)':'0.5px solid #1e1e2e', background:style===s?'#6C3BFF18':'#13131a', color:style===s?'#9b7aff':'#606080', textTransform:'capitalize' }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading||!topic.trim()} style={{ flex:1, padding:12, fontSize:13 }}>
          {loading && !renders.length ? <><span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>↻</span> {progMsg||'Generando...'}</> : '⚡ Generar guión y video'}
        </button>
        <button className="btn" onClick={() => navigate('/ideas')} style={{ padding:'12px 16px', fontSize:12 }} title="Ver ideas virales">🔥 Ideas</button>
        <button className="btn" onClick={() => navigate('/templates')} style={{ padding:'12px 16px', fontSize:12 }} title="Usar plantilla">📋 Plantillas</button>
      </div>

      {/* Progress */}
      {loading && (
        <div className="card" style={{ padding:14, marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:12, color:'#606080' }}>{progMsg}</span>
            <span style={{ fontSize:11, color:'var(--accent)', fontWeight:500 }}>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:`${progress}%` }} /></div>
        </div>
      )}

      {error && <div style={{ background:'#FF5C8D12', border:'0.5px solid #FF5C8D44', borderRadius:8, padding:12, fontSize:12, color:'var(--accent2)', marginBottom:12 }}>{error}</div>}

      {/* Script */}
      {script && !loading && (
        <div className="card" style={{ padding:16, marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, gap:8, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:'#f0eeff', marginBottom:2 }}>{script.title}</div>
              <div style={{ fontSize:11, color:'#606080' }}>{script.scenes?.length} escenas · {dur}s · {lang}</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className={`btn${speaking?'':' btn-success'}`} onClick={handleSpeak} style={{ padding:'7px 14px', fontSize:11, background:speaking?'#FF5C8D18':undefined, borderColor:speaking?'#FF5C8D44':undefined, color:speaking?'var(--accent2)':undefined }}>
                {speaking ? '⏹ Parar' : '▶ Escuchar'}
              </button>
              <button className="btn btn-success" onClick={handleRender} disabled={loading} style={{ padding:'7px 14px', fontSize:11 }}>
                🎬 Crear video
              </button>
            </div>
          </div>

          <div style={{ background:'#0d0d12', borderRadius:8, padding:12, fontSize:12, lineHeight:1.9, color:'#808098', maxHeight:220, overflowY:'auto' }}>
            {(script.scenes||[]).map((s, i) => (
              <div key={i} style={{ marginBottom:6, padding:'4px 8px', borderRadius:6, background:speakIdx===i?'#6C3BFF18':'transparent', border:speakIdx===i?'0.5px solid #6C3BFF44':'0.5px solid transparent', transition:'all .2s' }}>
                <span style={{ color:'var(--accent)', fontWeight:500 }}>[{i+1}]</span> {s.text}
              </div>
            ))}
          </div>

          {script.hook && (
            <div style={{ marginTop:10, padding:'8px 12px', background:'#6C3BFF10', borderRadius:8, border:'0.5px solid #6C3BFF30', fontSize:12 }}>
              <span style={{ color:'#9b7aff', fontWeight:500 }}>Hook: </span>
              <span style={{ color:'#c0c0e0' }}>{script.hook}</span>
            </div>
          )}

          {/* Meta tabs */}
          {(script.tiktok_caption || script.thumbnail_idea) && (
            <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {script.tiktok_caption && (
                <div style={{ background:'#0d0d12', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:10, color:'#606080', marginBottom:3 }}>Caption TikTok</div>
                  <div style={{ fontSize:11, color:'#a0a0b8', lineHeight:1.5 }}>{script.tiktok_caption}</div>
                </div>
              )}
              {script.thumbnail_idea && (
                <div style={{ background:'#0d0d12', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:10, color:'#606080', marginBottom:3 }}>Idea miniatura</div>
                  <div style={{ fontSize:11, color:'#a0a0b8', lineHeight:1.5 }}>{script.thumbnail_idea}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Renders */}
      {renders.length > 0 && (
        <div>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:12 }}>
            {renders.map(r => (
              <div key={r.platKey} className="card" style={{ padding:12 }}>
                <div style={{ fontSize:11, fontWeight:500, color:'#606080', marginBottom:8, textTransform:'capitalize' }}>
                  {r.platKey==='youtube'?'YouTube 16:9':'TikTok 9:16'}
                </div>
                <img src={r.finalFrame} alt="preview" style={{ display:'block', borderRadius:8, width:r.platKey==='tiktok'?120:220, height:r.platKey==='tiktok'?214:124, objectFit:'cover' }} />
                <button className="btn btn-success" style={{ width:'100%', marginTop:8, padding:'6px 0', fontSize:11 }} onClick={() => downloadDataUrl(r.dataUrl, `viralforge-${r.platKey}-${Date.now()}.png`)}>
                  Descargar PNG
                </button>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {renders.map(r => (
              <div key={r.platKey} style={{ display:'flex', gap:6 }}>
                <button className="btn" style={{ fontSize:11, padding:'7px 12px', borderColor:'#FF5C8D44', color:'var(--accent2)' }} onClick={() => handleAddToQueue(r.platKey,'manual')}>
                  + Cola manual ({r.platKey==='youtube'?'YT':'TK'})
                </button>
                <button className="btn" style={{ fontSize:11, padding:'7px 12px', borderColor:'#6C3BFF44', color:'#9b7aff' }} onClick={() => handleAddToQueue(r.platKey,'auto')}>
                  + Cola auto ({r.platKey==='youtube'?'YT':'TK'})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
