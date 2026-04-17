import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import './GameCanvas.css'

const PALETTE = ['#c792ea', '#82aaff', '#f78c6c', '#c3e88d', '#ff5370', '#ffcb6b']
const W = 560
const H = 310

// ── Enemy factory ──────────────────────────────────────────────
function createEnemy(waveNum) {
  const side = Math.floor(Math.random() * 4)
  const spd = 0.9 + waveNum * 0.25
  let x, y, vx, vy
  if (side === 0)      { x = Math.random()*W; y = -20;   vx = (Math.random()-0.5)*1.4; vy = spd }
  else if (side === 1) { x = W+20;  y = Math.random()*H; vx = -spd; vy = (Math.random()-0.5)*1.4 }
  else if (side === 2) { x = Math.random()*W; y = H+20;  vx = (Math.random()-0.5)*1.4; vy = -spd }
  else                 { x = -20;   y = Math.random()*H; vx = spd;  vy = (Math.random()-0.5)*1.4 }
  return {
    x, y, vx, vy,
    r: 13, alive: true, age: 0,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    shape: Math.floor(Math.random() * 3),
    spikes: 5 + Math.floor(Math.random() * 4),
  }
}

// ── Drawing helpers ────────────────────────────────────────────
function drawGrid(ctx) {
  ctx.strokeStyle = '#0f1117'
  ctx.lineWidth = 1
  for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
}

function drawEnemy(ctx, e) {
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.rotate(e.age * 0.035)
  ctx.fillStyle = e.color
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  if (e.shape === 0) {
    ctx.beginPath()
    for (let i = 0; i < e.spikes * 2; i++) {
      const a = (i * Math.PI) / e.spikes
      const r = i % 2 === 0 ? e.r : e.r * 0.48
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    ctx.closePath(); ctx.fill(); ctx.stroke()
  } else if (e.shape === 1) {
    ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath(); ctx.arc(-4, -4, 4, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.beginPath()
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2
      ctx.lineTo(Math.cos(a) * e.r, Math.sin(a) * e.r)
    }
    ctx.closePath(); ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

function boom(particles, x, y, color) {
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2
    const spd = 2 + Math.random() * 4
    particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1, color })
  }
}

function drawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.065
    if (p.life <= 0) { particles.splice(i, 1); continue }
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}

// ── Component ──────────────────────────────────────────────────
const GameCanvas = forwardRef(function GameCanvas(
  { onWaveSpawn, onScoreChange, onAliveChange, onCountdownChange, onRunningChange },
  ref
) {
  const canvasRef = useRef(null)
  const actionsRef = useRef({ start: null, reset: null })

  // Stable refs for callbacks so the effect doesn't go stale
  const cbRef = useRef({})
  cbRef.current = { onWaveSpawn, onScoreChange, onAliveChange, onCountdownChange, onRunningChange }

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Mutable game state — lives entirely inside this effect closure
    let enemies = [], particles = []
    let score = 0, wave = 0, countdown = 4
    let running = false, rafId = null, timerId = null

    function clearCanvas() {
      ctx.fillStyle = '#07080f'
      ctx.fillRect(0, 0, W, H)
      drawGrid(ctx)
    }

    function spawnWave() {
      wave++
      const count = 2 + wave
      cbRef.current.onWaveSpawn(wave, count)
      for (let i = 0; i < count; i++) enemies.push(createEnemy(wave))
      countdown = 4
    }

    function loop() {
      ctx.fillStyle = '#07080f'
      ctx.fillRect(0, 0, W, H)
      drawGrid(ctx)

      enemies = enemies.filter(e => e.alive)
      for (const e of enemies) {
        e.x += e.vx; e.y += e.vy; e.age++
        if (e.x < -60 || e.x > W + 60 || e.y < -60 || e.y > H + 60) e.alive = false
        else drawEnemy(ctx, e)
      }
      drawParticles(ctx, particles)
      cbRef.current.onAliveChange(enemies.length)
      if (running) rafId = requestAnimationFrame(loop)
    }

    function start() {
      if (running) return
      running = true
      cbRef.current.onRunningChange(true)
      spawnWave()
      loop()
      timerId = setInterval(() => {
        countdown--
        cbRef.current.onCountdownChange(countdown)
        if (countdown <= 0) spawnWave()
      }, 1000)
    }

    function reset() {
      running = false
      clearInterval(timerId)
      cancelAnimationFrame(rafId)
      enemies = []; particles = []; score = 0; wave = 0; countdown = 4
      cbRef.current.onRunningChange(false)
      cbRef.current.onScoreChange(0)
      cbRef.current.onAliveChange(0)
      cbRef.current.onCountdownChange(null)
      clearCanvas()
    }

    // Expose start/reset to parent via ref
    actionsRef.current = { start, reset }

    // Click to zap enemies
    function handleClick(ev) {
      if (!running) return
      const rect = canvas.getBoundingClientRect()
      const mx = (ev.clientX - rect.left) * (W / rect.width)
      const my = (ev.clientY - rect.top) * (H / rect.height)
      for (const e of enemies) {
        if (!e.alive) continue
        const dx = mx - e.x, dy = my - e.y
        if (Math.sqrt(dx * dx + dy * dy) < e.r + 10) {
          e.alive = false
          boom(particles, e.x, e.y, e.color)
          score += 10
          cbRef.current.onScoreChange(score)
          break
        }
      }
    }

    canvas.addEventListener('click', handleClick)
    clearCanvas()

    return () => {
      canvas.removeEventListener('click', handleClick)
      clearInterval(timerId)
      cancelAnimationFrame(rafId)
    }
  }, []) // runs once — all state lives in closure, callbacks accessed via cbRef

  useImperativeHandle(ref, () => ({
    start: () => actionsRef.current.start?.(),
    reset: () => actionsRef.current.reset?.(),
  }), [])

  return (
    <div className="canvas-wrap">
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  )
})

export default GameCanvas
