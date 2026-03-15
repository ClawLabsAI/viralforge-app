const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-20250514'

async function callClaude(prompt, maxTokens = 1000) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  const raw  = data.content.map(b => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function generateScript({ topic, type, lang, dur, style, plat }) {
  const typeLabels = { top10:'Top 10 / Rankings', facts:'Curiosidades / Facts', motiv:'Motivacional', news:'Noticias / Tendencias', edu:'Educativo / Tutorial' }
  return callClaude(`Crea un guión para video faceless de ${dur} segundos en ${lang}.
Tipo: ${typeLabels[type]||type}. Tema: "${topic}".
Responde SOLO JSON sin backticks:
{"title":"título llamativo SEO","scenes":[{"id":1,"text":"narración máx 18 palabras","duration":4}],"hook":"frase gancho impactante","cta":"llamada a la acción","description":"descripción YouTube 120 palabras","tags":"tag1,tag2,tag3,tag4,tag5,tag6,tag7","tiktok_caption":"caption viral TikTok con hashtags","instagram_caption":"caption Instagram con emojis y hashtags","thumbnail_idea":"descripción miniatura ideal para CTR máximo"}`)
}

export async function generateViralIdeas({ type, niche, lang = 'español', count = 8 }) {
  const typeLabels = { top10:'Top 10 / Rankings', facts:'Curiosidades / Facts', motiv:'Motivacional', news:'Noticias / Tendencias', edu:'Educativo / Tutorial' }
  return callClaude(`Eres un experto en content marketing viral. Genera ${count} ideas de videos faceless en ${lang} para el nicho "${niche}", tipo "${typeLabels[type]||type}".
Basa las ideas en tendencias reales y virales actuales de YouTube, TikTok e Instagram de 2024-2025.
Responde SOLO JSON sin backticks:
{"ideas":[{"title":"título del video","hook":"primer gancho de apertura","why_viral":"por qué es viral en 1 frase","estimated_views":"rango estimado de vistas","trending_score":85,"platforms":["yt","tk"],"keywords":["kw1","kw2","kw3"]}]}`, 1500)
}

export async function generateAnalyticsSummary({ queue, library, period }) {
  const liveVideos = queue.filter(i => i.status === 'live')
  const totalViews = liveVideos.reduce((a,b) => a+(b.views||0), 0)
  const totalLikes = liveVideos.reduce((a,b) => a+(b.likes||0), 0)
  const byPlat = { yt: liveVideos.filter(i=>i.plat==='yt'), tk: liveVideos.filter(i=>i.plat==='tk'), ig: liveVideos.filter(i=>i.plat==='ig') }
  return callClaude(`Analiza estos datos de rendimiento de un canal faceless y genera recomendaciones accionables.
Período: últimos ${period}.
Videos publicados: ${liveVideos.length}. Total vistas: ${totalViews}. Total likes: ${totalLikes}.
YouTube: ${byPlat.yt.length} videos. TikTok: ${byPlat.tk.length} videos. Instagram: ${byPlat.ig.length} videos.
Videos en biblioteca: ${library.length}.
Responde SOLO JSON sin backticks:
{"summary":"resumen ejecutivo 2 frases","top_insight":"insight más importante","recommendations":["recomendación accionable 1","recomendación 2","recomendación 3","recomendación 4"],"best_platform":"plataforma con mejor rendimiento","best_content_type":"tipo de contenido recomendado","posting_frequency":"frecuencia de publicación recomendada","growth_score":72}`, 800)
}

// Text-to-Speech usando Web Speech API (nativa del navegador, sin coste)
export function speakText(text, { voice = '', rate = 1.0, onEnd } = {}) {
  if (!('speechSynthesis' in window)) return null
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = rate
  utt.lang = 'es-ES'
  if (voice) {
    const voices = window.speechSynthesis.getVoices()
    const found  = voices.find(v => v.name === voice || v.lang === voice)
    if (found) utt.voice = found
  }
  if (onEnd) utt.onend = onEnd
  window.speechSynthesis.speak(utt)
  return utt
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function getAvailableVoices() {
  if (!('speechSynthesis' in window)) return []
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es') || v.lang.startsWith('en'))
}
