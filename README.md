# ViralForge App

Dashboard completo para automatizar la creación y publicación de contenido faceless en YouTube, TikTok e Instagram.

## Stack

- **React 18** + **Vite** — frontend rápido con HMR
- **React Router 6** — navegación entre páginas
- **Zustand** — estado global persistido en localStorage
- **Tailwind CSS** — estilos utilitarios
- **Claude API** — generación de guiones con IA

## Estructura

```
src/
├── components/
│   ├── Studio/      ← Generador con IA + preview + descarga
│   ├── Publish/     ← Cola manual + automática (2 tabs)
│   ├── Calendar/    ← Calendario editorial mes/semana
│   ├── Projects/    ← Kanban de producción
│   ├── Library/     ← Biblioteca de videos generados
│   └── shared/      ← Componentes reutilizables
├── store/           ← Estado global Zustand (persistido)
├── utils/
│   ├── api.js       ← Claude API helper
│   └── videoRenderer.js ← Canvas video renderer
├── App.jsx          ← Layout + routing
├── main.jsx         ← Entry point
└── index.css        ← Design tokens + estilos globales
```

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run dev

# Abre http://localhost:5173
```

## Despliegue en Vercel (recomendado)

### Primera vez — configuración inicial

1. Sube este proyecto a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita
3. **New Project** → selecciona tu repositorio de GitHub
4. Vercel detecta Vite automáticamente — no toques nada
5. **Deploy** → en 60 segundos tienes tu URL: `viralforge-xxx.vercel.app`

### Actualizaciones futuras

Cada vez que hagamos una mejora aquí en Claude:

```bash
# Copia los archivos actualizados a tu repositorio local
git add .
git commit -m "feat: nueva mejora de ViralForge"
git push
```

Vercel detecta el push y redespliegue automáticamente en ~30 segundos. Tu URL siempre tiene la última versión.

## Variables de entorno en Vercel

La Claude API se llama directamente desde el frontend (igual que en los widgets del chat).
Si en el futuro quieres proteger tu API key, añade en Vercel → Settings → Environment Variables:

```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Y en `src/utils/api.js` usa `import.meta.env.VITE_ANTHROPIC_API_KEY`.

## Módulos incluidos

| Módulo     | Funcionalidad |
|------------|---------------|
| Studio     | Genera guión con IA, renderiza video en Canvas, descarga PNG, añade a cola |
| Publicar   | Tab Manual (descarga + links) y Tab Automático (API + programación) |
| Calendario | Vista mes/semana, filtro por plataforma, añadir publicaciones |
| Proyectos  | Kanban drag & drop con 5 columnas de producción |
| Biblioteca | Todos los videos generados, descarga y re-añadir a cola |

## Backend para publicación automática

El módulo automático usa el backend Node.js incluido en `viralforge-backend/`.
Ver `viralforge-backend/README.md` para instrucciones de configuración.
