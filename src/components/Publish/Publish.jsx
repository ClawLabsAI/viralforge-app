import { useState } from 'react'
import { useStore, PLAT_INFO } from '../../store'
import PageHeader from '../shared/PageHeader'

export default function Publish() {
  const [mode, setMode] = useState('manual')
  const queue          = useStore(s => s.queue)
  const removeFromQueue = useStore(s => s.removeFromQueue)
  const markAsLive      = useStore(s => s.markAsLive)
  const connections     = useStore(s => s.connections)
  const setConnection   = useStore(s => s.setConnection)

  const fmtN = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

  function downloadItem(item) {
    if (!item.dataUrl) return alert('Este item no tiene video descargable — genera el video en Studio primero.')
    const a = document.createElement('a')
    a.href = item.dataUrl
    a.download = `viralforge-${item.plat}-${item.id}.png`
    a.click()
  }

  function pubNow(id) {
    setTimeout(() => markAsLive(id), 1800)
    useStore.getState().updateQueueItem(id, { status: 'publishing' })
  }

  function StatusBadge({ status }) {
    const map = {
      draft:      { cls: 'badge-draft',  label: 'Borrador'   },
      scheduled:  { cls: 'badge-sched',  label: 'Programado' },
      publishing: { cls: 'badge-sched',  label: 'Publicando...', pulse: true },
      live:       { cls: 'badge-live',   label: 'Publicado'  },
      failed:     { cls: 'badge-failed', label: 'Error'      },
    }
    const s = map[status] || map.draft
    return (
      <span className={`badge ${s.cls}`}>
        <span className={`${s.pulse ? 'pulse' : ''}`} style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
        {s.label}
      </span>
    )
  }

  function QueueItem({ item }) {
    const pi = PLAT_INFO[item.plat] || PLAT_INFO.yt
    return (
      <div className="card card-hover" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 64, height: 38, borderRadius: 6, background: '#0a0a15', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {item.finalFrame ? <img src={item.finalFrame} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎬'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#f0eeff', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: '#a0a0b8' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: pi.dot, display: 'inline-block' }} />
              {pi.name}
            </span>
            <span style={{ fontSize: 11, color: '#606080' }}>{item.date} · {item.time}</span>
            <StatusBadge status={item.status} />
            <span className={`badge ${item.mode === 'auto' ? 'badge-auto' : 'badge-manual'}`}>{item.mode === 'auto' ? 'Auto' : 'Manual'}</span>
          </div>
          {item.status === 'live' && (
            <div style={{ display: 'flex', gap: 12 }}>
              {[['vistas', item.views], ['likes', item.likes], ['comentarios', item.comments]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#f0eeff' }}>{fmtN(v || 0)}</div>
                  <div style={{ fontSize: 9, color: '#606080' }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
          {item.dataUrl && <button className="btn" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => downloadItem(item)}>Descargar</button>}
          {item.mode === 'auto' && item.status === 'scheduled' && (
            <button className="btn btn-primary" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => pubNow(item.id)}>Publicar ya</button>
          )}
          {item.status === 'live' && item.plat === 'yt' && connections.yt && (
            <a href={`https://studio.youtube.com`} target="_blank" rel="noreferrer" className="btn" style={{ fontSize: 11, padding: '5px 10px', textDecoration: 'none' }}>Ver en YT ↗</a>
          )}
          <button className="btn btn-danger" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => removeFromQueue(item.id)}>✕</button>
        </div>
      </div>
    )
  }

  function ManualPlatCard({ platKey, name, uploadUrl, steps }) {
    return (
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '11px 16px', borderBottom: '0.5px solid #1a1a2a', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: PLAT_INFO[platKey]?.dot + '22', border: `0.5px solid ${PLAT_INFO[platKey]?.dot}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: PLAT_INFO[platKey]?.dot }}>
            {platKey === 'yt' ? '▶' : platKey === 'tk' ? '♪' : '◉'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{name}</span>
          <span style={{ fontSize: 10, color: '#606080' }}>{uploadUrl.replace('https://', '')}</span>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#808098' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#00D4AA22', border: '0.5px solid #00D4AA44', color: 'var(--accent3)', fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
          <a href={uploadUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: '0.5px solid #1e1e2e', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#a0a0c0', textDecoration: 'none', background: '#0d0d12', transition: 'border-color .15s' }}>
            <span>Abrir {name}</span>
            <span style={{ fontSize: 11, color: '#606080' }}>↗</span>
          </a>
        </div>
      </div>
    )
  }

  const manualItems = queue
  const autoItems   = queue.filter(i => i.mode === 'auto')

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      <PageHeader icon="🚀" title="Publicar" subtitle="Gestiona y publica tu contenido" />

      {/* Mode switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, padding: 4, background: '#0a0a10', borderRadius: 10, border: '0.5px solid #1a1a2a', width: 'fit-content' }}>
        {[
          { key: 'manual', label: 'Manual', color: 'var(--accent2)', desc: 'Descarga y sube tú mismo' },
          { key: 'auto',   label: 'Automático', color: 'var(--accent)', desc: 'Publica vía API' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            style={{
              padding: '8px 20px', borderRadius: 7, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              border: mode === key ? `0.5px solid ${color}44` : '0.5px solid transparent',
              background: mode === key ? `${color}18` : 'transparent',
              color: mode === key ? color : '#606080',
            }}
          >{label}</button>
        ))}
      </div>

      {/* ── MANUAL MODE ── */}
      {mode === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#404060', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
              Cola de videos ({manualItems.length})
            </div>
            {manualItems.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: 'center', fontSize: 12, color: '#606080' }}>
                Genera videos en Studio y añádelos a la cola
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {manualItems.map(item => <QueueItem key={item.id} item={item} />)}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: '#1a1a2a' }} />

          <div style={{ fontSize: 11, fontWeight: 500, color: '#404060', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Guías de subida manual</div>

          <ManualPlatCard platKey="yt" name="YouTube Studio" uploadUrl="https://studio.youtube.com"
            steps={['Descarga el video desde la cola de arriba','Abre YouTube Studio → Crear → Subir video','Pega el título y descripción generados','Programa la fecha/hora o publica al instante']} />
          <ManualPlatCard platKey="tk" name="TikTok" uploadUrl="https://www.tiktok.com/upload"
            steps={['Descarga el video en formato 9:16','Ve a tiktok.com/upload o usa la app móvil','Pega el caption generado con los hashtags']} />
          <ManualPlatCard platKey="ig" name="Instagram" uploadUrl="https://www.instagram.com"
            steps={['Descarga el video en formato 9:16','Abre Instagram → + → Crear Reel','Pega el caption con emojis y hashtags generados']} />
        </div>
      )}

      {/* ── AUTO MODE ── */}
      {mode === 'auto' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Connections */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#a0a0b8', marginBottom: 12 }}>Cuentas conectadas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { key: 'yt', label: 'YouTube',   note: 'Backend Node.js requerido' },
                { key: 'tk', label: 'TikTok',    note: 'Requiere aprobación de API (1-4 semanas)' },
                { key: 'ig', label: 'Instagram', note: 'Requiere App Review de Meta' },
              ].map(({ key, label, note }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#0d0d12', borderRadius: 9, border: '0.5px solid #1e1e2e' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLAT_INFO[key]?.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#f0eeff' }}>{label}</div>
                    <div style={{ fontSize: 10, color: connections[key] ? 'var(--accent3)' : '#606080' }}>
                      {connections[key] ? 'Conectado — listo para publicar' : note}
                    </div>
                  </div>
                  <button
                    onClick={() => setConnection(key, !connections[key])}
                    className={`btn${connections[key] ? ' btn-success' : ''}`}
                    style={{ fontSize: 11, padding: '5px 12px' }}
                  >
                    {connections[key] ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Auto queue */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#404060', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
              Cola automática ({autoItems.length})
            </div>
            {autoItems.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: 'center', fontSize: 12, color: '#606080' }}>
                Cuando generes un video en Studio, elige "Cola auto" para que aparezca aquí
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {autoItems.map(item => <QueueItem key={item.id} item={item} />)}
              </div>
            )}
          </div>

          {/* Backend info */}
          <div style={{ background: '#6C3BFF08', border: '0.5px solid #6C3BFF30', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#808098', lineHeight: 1.7 }}>
            El modo automático usa el <strong style={{ color: '#9b7aff' }}>backend Node.js</strong> incluido en tu descarga.
            Sigue el README para arrancarlo y conectar YouTube. TikTok e Instagram requieren aprobación adicional de sus portales de desarrolladores.
          </div>
        </div>
      )}
    </div>
  )
}
