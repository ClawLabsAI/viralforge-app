import { VIDEO_STYLES } from '../store'

const CANVAS_SIZES = {
  youtube: { w: 1280, h: 720  },
  tiktok:  { w: 720,  h: 1280 },
}

export async function renderVideoFrames(script, platKey) {
  const pm  = CANVAS_SIZES[platKey] || CANVAS_SIZES.youtube
  const st  = VIDEO_STYLES[script.style] || VIDEO_STYLES.dark
  const canvas = document.createElement('canvas')
  canvas.width  = pm.w
  canvas.height = pm.h
  const ctx = canvas.getContext('2d')
  const scenes = script.scenes || []
  const totalSec = script.dur || 60
  const keyFrames = []

  // Generate 1 keyframe per second for preview animation
  for (let t = 0; t < totalSec; t++) {
    const si = Math.min(Math.floor((t / totalSec) * scenes.length), scenes.length - 1)
    const lf = t % Math.max(Math.floor(totalSec / scenes.length), 1)
    const fpScene = Math.max(Math.floor(totalSec / scenes.length), 1)
    drawFrame(ctx, pm.w, pm.h, scenes, si, lf, fpScene, totalSec, t, st, script, platKey)
    keyFrames.push(canvas.toDataURL('image/jpeg', 0.6))
  }

  // Final high-quality frame
  drawFrame(ctx, pm.w, pm.h, scenes, scenes.length - 1, 999, 999, totalSec, totalSec, st, script, platKey)
  const finalFrame = canvas.toDataURL('image/jpeg', 0.9)
  const dataUrl    = canvas.toDataURL('image/png')

  return { platKey, pm, keyFrames, finalFrame, dataUrl }
}

function drawFrame(ctx, cw, ch, scenes, si, lf, fpScene, totalSec, t, st, script, platKey) {
  // Background
  ctx.fillStyle = st.bg
  ctx.fillRect(0, 0, cw, ch)

  // Bottom bar
  const barH = Math.floor(ch * 0.07)
  ctx.fillStyle = st.bar
  ctx.fillRect(0, ch - barH, cw, barH)

  // Progress line
  ctx.fillStyle = st.accent
  ctx.fillRect(0, ch - barH, Math.floor(cw * (t / totalSec)), 4)

  // Scene text with word wrap
  const scene = scenes[si] || { text: '' }
  const fz = Math.floor(cw * (platKey === 'tiktok' ? 0.048 : 0.042))
  ctx.font = `500 ${fz}px "Space Grotesk", system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const words = scene.text.split(' ')
  const maxW  = cw * 0.8
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w }
    else line = test
  }
  if (line) lines.push(line)

  const lh = fz * 1.4
  const totalH = lines.length * lh
  const startY = ch / 2 - totalH / 2 + lh / 2

  // Fade in/out per scene
  const fade = Math.min(lf / 6, 1) * Math.min((fpScene - lf) / 6, 1)
  ctx.globalAlpha = Math.max(0.05, fade)
  ctx.fillStyle = st.text
  lines.forEach((l, i) => ctx.fillText(l, cw / 2, startY + i * lh))
  ctx.globalAlpha = 1

  // Hook (first scene)
  if (si === 0 && lf < 20 && script.hook) {
    ctx.font = `400 ${Math.floor(fz * 0.6)}px "Space Grotesk", system-ui, sans-serif`
    ctx.fillStyle = st.accent
    ctx.globalAlpha = Math.min(lf / 6, 1)
    ctx.fillText(script.hook, cw / 2, ch * 0.16)
    ctx.globalAlpha = 1
  }

  // Scene indicator dots
  const dr = Math.floor(cw * 0.009)
  const dg = dr * 3.2
  const dx = cw / 2 - (scenes.length * dg) / 2 + dg / 2
  scenes.forEach((_, i) => {
    ctx.beginPath()
    ctx.arc(dx + i * dg, ch - barH / 2, dr, 0, Math.PI * 2)
    ctx.fillStyle = i === si ? st.accent : st.sub
    ctx.fill()
  })
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
