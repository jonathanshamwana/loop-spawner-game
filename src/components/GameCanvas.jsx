import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import './GameCanvas.css'

const PALETTE = ['#c792ea', '#82aaff', '#f78c6c', '#c3e88d', '#ff5370', '#ffcb6b']
const W = 560
const H = 310
const TOTAL_WAVES = 10

// ── Enemy factory — takes explicit speed now ───────────────────
function createEnemy(spd) {
  const side = Math.floor(Math.random() * 4)
  const jitter = spd * 0.45
  let x, y, vx, vy
  if (side === 0)      { x = Math.random()*W; y = -20;   vx = (Math.random()-0.5)*jitter; vy = spd }
  else if (side === 1) { x = W+20;  y = Math.random()*H; vx = -spd; vy = (Math.random()-0.5)*jitter }
  else if (side === 2) { x = Math.random()*W; y = H+20;  vx = (Math.random()-0.5)*jitter; vy = -spd }
  else                 { x = -20;   y = Math.random()*H; vx = spd;  vy = (Math.random()-0.5)*jitter }
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
  { onWaveSpawn, onScoreChange, onAliveChange, onCountdownChange, onRunningChange, onGameEnd },
  ref
) {
  const canvasRef = useRef(null)
  const actionsRef = useRef({ start: null, reset: null })
  const [isGameOver, setIsGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  const cbRef = useRef({})
  cbRef.current = { onWaveSpawn, onScoreChange, onAliveChange, onCountdownChange, onRunningChange, onGameEnd }

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

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
      const waveNum0 = wave - 1                                   // 0-indexed (0–9)
      const count = waveNum0 + 2                                  // 2 → 11
      const spd = parseFloat((1.0 + waveNum0 * 0.3).toFixed(1))  // 1.0 → 3.7
      cbRef.current.onWaveSpawn(wave, count, spd)
      for (let i = 0; i < count; i++) enemies.push(createEnemy(spd))
      countdown = 4
      // On the last wave, immediately clear "next wave" display
      if (wave === TOTAL_WAVES) cbRef.current.onCountdownChange(null)
    }

    function endGame() {
      clearInterval(timerId)
      timerId = null
      // keep running=true so remaining particles finish animating
      cbRef.current.onRunningChange(false)
      cbRef.current.onCountdownChange(null)
      cbRef.current.onGameEnd?.(score)
      setIsGameOver(true)
      setFinalScore(score)
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
        if (wave < TOTAL_WAVES) {
          cbRef.current.onCountdownChange(countdown)
          if (countdown <= 0) spawnWave()
        } else if (countdown <= 0) {
          endGame()
        }
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
      setIsGameOver(false)
      setFinalScore(0)
      clearCanvas()
    }

    actionsRef.current = { start, reset }

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
  }, [])

  useImperativeHandle(ref, () => ({
    start: () => actionsRef.current.start?.(),
    reset: () => actionsRef.current.reset?.(),
  }), [])

  return (
    <div className="canvas-wrap">
      <canvas ref={canvasRef} className="game-canvas" />
      {isGameOver && (
        <div className="game-over-overlay">
          <div className="go-emoji">🎉</div>
          <div className="go-title">All 10 Waves Survived!</div>
          <div className="go-score">Final Score: <span>{finalScore}</span></div>
          <div className="go-hint">Press ↺ Reset to play again</div>
        </div>
      )}
    </div>
  )
})

export default GameCanvas
