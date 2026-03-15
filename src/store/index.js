import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const VIDEO_STYLES = {
  dark:   { bg: '#0a0a0f', text: '#ffffff', accent: '#6C3BFF', sub: '#aaaaaa', bar: '#1a1a2e' },
  neon:   { bg: '#050510', text: '#00ffcc', accent: '#ff00aa', sub: '#8888ff', bar: '#0d0d30' },
  clean:  { bg: '#f8f8f8', text: '#111111', accent: '#6C3BFF', sub: '#666666', bar: '#e8e8e8' },
  nature: { bg: '#1a1a12', text: '#e8e0c8', accent: '#7ab648', sub: '#a09070', bar: '#2a2a1a' },
  retro:  { bg: '#1a0a00', text: '#ffcc88', accent: '#ff6600', sub: '#aa8844', bar: '#2a1500' },
}
export const PLAT_INFO = {
  yt: { name: 'YouTube',   dot: '#FF0000', uploadUrl: 'https://studio.youtube.com' },
  tk: { name: 'TikTok',    dot: '#111111', uploadUrl: 'https://www.tiktok.com/upload' },
  ig: { name: 'Instagram', dot: '#E1306C', uploadUrl: 'https://www.instagram.com' },
}
export const CONTENT_TYPES = {
  top10: 'Top 10 / Rankings', facts: 'Curiosidades / Facts',
  motiv: 'Motivacional',      news:  'Noticias / Tendencias', edu: 'Educativo / Tutorial',
}

export const useStore = create(
  persist(
    (set) => ({
      queue: [],
      addToQueue: (item) => set(s => ({ queue: [{ ...item, id: Date.now(), status: item.mode==='auto'?'scheduled':'draft', views:0,likes:0,comments:0, createdAt:new Date().toISOString() }, ...s.queue] })),
      updateQueueItem: (id, u) => set(s => ({ queue: s.queue.map(i => i.id===id ? {...i,...u} : i) })),
      removeFromQueue: (id) => set(s => ({ queue: s.queue.filter(i => i.id!==id) })),
      markAsLive: (id) => set(s => ({ queue: s.queue.map(i => i.id===id ? {...i,status:'live',views:Math.floor(Math.random()*14000+800),likes:Math.floor(Math.random()*700+60),comments:Math.floor(Math.random()*90+10)} : i) })),
      library: [],
      addToLibrary: (item) => set(s => ({ library: [{ ...item, id:Date.now(), createdAt:new Date().toISOString() }, ...s.library] })),
      removeFromLibrary: (id) => set(s => ({ library: s.library.filter(i => i.id!==id) })),
      projects: [
        { id:1, title:'Top 10 empresas de IA 2025',    type:'top10', niche:'Tecnología',  plats:['yt','tk'], col:'guion',      prio:'high', date:'18 mar', notes:'' },
        { id:2, title:'5 curiosidades sobre el sueño', type:'facts', niche:'Salud',       plats:['yt','ig'], col:'idea',       prio:'med',  date:'20 mar', notes:'' },
        { id:3, title:'Hábitos atómicos — resumen',    type:'motiv', niche:'Psicología',  plats:['tk'],      col:'produccion', prio:'high', date:'19 mar', notes:'' },
      ],
      nextProjectId: 4,
      addProject: (p) => set(s => ({ projects:[{...p,id:s.nextProjectId},...s.projects], nextProjectId:s.nextProjectId+1 })),
      moveProject: (id,col) => set(s => ({ projects: s.projects.map(p => p.id===id?{...p,col}:p) })),
      removeProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id!==id) })),
      calPosts: [
        { id:101, title:'Top 10 empresas IA',     plat:'yt', date:'2026-03-16', time:'18:00', type:'top10' },
        { id:102, title:'Curiosidades del sueño', plat:'ig', date:'2026-03-16', time:'19:00', type:'facts' },
        { id:103, title:'Hábitos atómicos',       plat:'tk', date:'2026-03-18', time:'20:00', type:'motiv' },
        { id:104, title:'Noticias IA semana',     plat:'yt', date:'2026-03-20', time:'17:00', type:'news'  },
        { id:105, title:'Historia del dinero',    plat:'yt', date:'2026-03-23', time:'18:00', type:'edu'   },
      ],
      nextCalId: 106,
      addCalPost: (p) => set(s => ({ calPosts:[...s.calPosts,{...p,id:s.nextCalId}], nextCalId:s.nextCalId+1 })),
      removeCalPost: (id) => set(s => ({ calPosts: s.calPosts.filter(p => p.id!==id) })),
      templates: [
        { id:1, name:'Top 10 Tecnología YT', type:'top10', style:'dark',  plat:'youtube', dur:60,  lang:'español', niche:'Tecnología', useCount:3 },
        { id:2, name:'Facts Rápidos TikTok', type:'facts', style:'neon',  plat:'tiktok',  dur:30,  lang:'español', niche:'Ciencia',    useCount:7 },
        { id:3, name:'Motivacional YouTube', type:'motiv', style:'clean', plat:'youtube', dur:180, lang:'español', niche:'Psicología', useCount:2 },
        { id:4, name:'Noticias IA Semanal',  type:'news',  style:'dark',  plat:'youtube', dur:60,  lang:'español', niche:'Tecnología', useCount:5 },
      ],
      nextTemplateId: 5,
      addTemplate: (t) => set(s => ({ templates:[{...t,id:s.nextTemplateId,useCount:0,createdAt:new Date().toISOString()},...s.templates], nextTemplateId:s.nextTemplateId+1 })),
      removeTemplate: (id) => set(s => ({ templates: s.templates.filter(t => t.id!==id) })),
      incrementTemplateUse: (id) => set(s => ({ templates: s.templates.map(t => t.id===id?{...t,useCount:t.useCount+1}:t) })),
      connections: { yt:false, tk:false, ig:false },
      setConnection: (plat,val) => set(s => ({ connections:{...s.connections,[plat]:val} })),
      ttsEnabled: true,
      ttsVoice: 'es-ES-AlvaroNeural',
      ttsRate: 1.0,
    }),
    { name: 'viralforge-store-v2' }
  )
)
