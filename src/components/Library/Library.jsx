import { useStore, CONTENT_TYPES } from '../../store'
import { downloadDataUrl } from '../../utils/videoRenderer'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../shared/PageHeader'

export default function Library() {
  const library         = useStore(s => s.library)
  const removeFromLibrary = useStore(s => s.removeFromLibrary)
  const addToQueue      = useStore(s => s.addToQueue)
  const navigate        = useNavigate()

  function handleAddToQueue(item, mode) {
    const platMap = { youtube: 'yt', tiktok: 'tk' }
    addToQueue({
      title:      item.title,
      plat:       platMap[item.platKey] || 'yt',
      mode,
      date:       new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      time:       '18:00',
      finalFrame: item.finalFrame || null,
      dataUrl:    item.dataUrl    || null,
      description: item.script?.description || '',
      tags:        item.script?.tags || '',
    })
    navigate('/publish')
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <PageHeader icon="📚" title="Biblioteca" subtitle={`${library.length} videos generados`} />

      {library.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#a0a0b8', marginBottom: 6 }}>Biblioteca vacía</div>
          <div style={{ fontSize: 12, color: '#606080' }}>Los videos que generes en Studio se guardarán aquí automáticamente</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {library.map(item => (
            <div key={item.id} className="card card-hover" style={{ overflow: 'hidden' }}>
              {/* Thumbnail */}
              <div style={{ height: 110, background: '#0a0a15', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                {item.finalFrame
                  ? <img src={item.finalFrame} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : '🎬'}
              </div>

              {/* Info */}
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#e0e0f0', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: '#606080', textTransform: 'capitalize' }}>{item.platKey || '—'}</span>
                  <span style={{ fontSize: 10, color: '#404060' }}>·</span>
                  <span style={{ fontSize: 10, color: '#606080' }}>{item.script?.dur || 0}s</span>
                  {item.script?.type && (
                    <span style={{ fontSize: 9, color: '#6C3BFF', background: '#6C3BFF18', padding: '1px 5px', borderRadius: 3 }}>
                      {CONTENT_TYPES[item.script.type] || item.script.type}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#404060' }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : ''}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '6px 10px 10px', borderTop: '0.5px solid #1a1a2a' }}>
                <button
                  className="btn btn-success"
                  style={{ fontSize: 10, padding: '5px 0' }}
                  onClick={() => item.dataUrl && downloadDataUrl(item.dataUrl, `viralforge-${item.platKey}-${item.id}.png`)}
                  disabled={!item.dataUrl}
                >Descargar</button>
                <button
                  className="btn"
                  style={{ fontSize: 10, padding: '5px 0' }}
                  onClick={() => handleAddToQueue(item, 'manual')}
                >+ Manual</button>
                <button
                  className="btn"
                  style={{ fontSize: 10, padding: '5px 0', borderColor: '#6C3BFF44', color: '#9b7aff' }}
                  onClick={() => handleAddToQueue(item, 'auto')}
                >+ Auto</button>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: 10, padding: '5px 0' }}
                  onClick={() => removeFromLibrary(item.id)}
                >Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
