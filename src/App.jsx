import { Routes, Route, NavLink } from 'react-router-dom'
import Studio    from './components/Studio/Studio'
import Publish   from './components/Publish/Publish'
import Calendar  from './components/Calendar/Calendar'
import Projects  from './components/Projects/Projects'
import Library   from './components/Library/Library'
import Analytics from './components/Analytics/Analytics'
import Ideas     from './components/Ideas/Ideas'
import Templates from './components/Templates/Templates'
import { useStore } from './store'

const NAV = [
  { to:'/',           icon:'⚡', label:'Studio'      },
  { to:'/ideas',      icon:'🔥', label:'Ideas'       },
  { to:'/publish',    icon:'🚀', label:'Publicar'    },
  { to:'/calendar',   icon:'📅', label:'Calendario'  },
  { to:'/projects',   icon:'🎬', label:'Proyectos'   },
  { to:'/library',    icon:'📚', label:'Biblioteca'  },
  { to:'/analytics',  icon:'📊', label:'Analíticas'  },
  { to:'/templates',  icon:'📋', label:'Plantillas'  },
]

export default function App() {
  const queue   = useStore(s => s.queue)
  const library = useStore(s => s.library)
  const fmtN = n => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n)
  const totalReach = queue.filter(i=>i.status==='live').reduce((a,b)=>a+(b.views||0),0)

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{ width:200, flexShrink:0, background:'#0a0a10', borderRight:'0.5px solid #1a1a2a', display:'flex', flexDirection:'column', padding:'16px 10px', position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 8px', marginBottom:24 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', flexShrink:0 }}>V</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#f0eeff' }}>ViralForge</div>
            <div style={{ fontSize:10, color:'#606080' }}>Content Studio</div>
          </div>
        </div>

        <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to==='/'} className={({ isActive }) => `nav-item${isActive?' active':''}`}>
              <span style={{ fontSize:15 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop:16, padding:'12px 8px', borderTop:'0.5px solid #1a1a2a' }}>
          <div style={{ fontSize:10, fontWeight:500, color:'#404060', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Resumen</div>
          {[
            { label:'En cola',    val: queue.length },
            { label:'Publicados', val: queue.filter(i=>i.status==='live').length },
            { label:'Biblioteca', val: library.length },
            { label:'Alcance',    val: totalReach>0?fmtN(totalReach):'—' },
          ].map(({ label, val }) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0' }}>
              <span style={{ fontSize:11, color:'#606080' }}>{label}</span>
              <span style={{ fontSize:12, fontWeight:500, color:'#a0a0c0' }}>{val}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflowY:'auto', minWidth:0 }}>
        <Routes>
          <Route path="/"          element={<Studio />}    />
          <Route path="/ideas"     element={<Ideas />}     />
          <Route path="/publish"   element={<Publish />}   />
          <Route path="/calendar"  element={<Calendar />}  />
          <Route path="/projects"  element={<Projects />}  />
          <Route path="/library"   element={<Library />}   />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/templates" element={<Templates />} />
        </Routes>
      </main>
    </div>
  )
}
