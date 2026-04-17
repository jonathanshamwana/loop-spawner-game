import { useState, useCallback, useRef } from 'react'
import GameCanvas from './components/GameCanvas'
import CodeExplainer from './components/CodeExplainer'
import './App.css'

const TOTAL_WAVES = 10

function HeadshotLogo() {
  return (
    <img
      className="site-logo headshot-logo"
      src="/images/jonathan-headhsot.jpeg"
      alt="Jonathan"
    />
  )
}

export default function App() {
  const [score, setScore] = useState(0)
  const [alive, setAlive] = useState(0)
  const [wave, setWave] = useState(0)
  const [countdown, setCountdown] = useState(null)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  // Code explainer animation state
  const [loopCount, setLoopCount] = useState(2)   // inner range(count)
  const [loopIteration, setLoopIteration] = useState(null) // current i in inner loop
  const [isHighlighting, setIsHighlighting] = useState(false)

  const gameRef = useRef(null)
  const animTimerRef = useRef(null)

  // Derived values (no extra state needed)
  const waveNum0 = wave > 0 ? wave - 1 : null  // 0-indexed wave_num for display
  const currentSpeed = wave > 0
    ? parseFloat((1.0 + (wave - 1) * 0.3).toFixed(1))
    : 1.0

  const handleWaveSpawn = useCallback((waveNum, count, speed) => {
    setWave(waveNum)
    setLoopCount(count)
    setIsHighlighting(true)
    setLoopIteration(null) // outer phase first — no inner iteration yet
    clearTimeout(animTimerRef.current)

    // Phase 1: outer loop line highlighted (~420ms) before inner loop starts
    animTimerRef.current = setTimeout(() => {
      let i = 0
      const step = () => {
        setLoopIteration(i)
        if (i < count - 1) {
          i++
          animTimerRef.current = setTimeout(step, 300)
        } else {
          animTimerRef.current = setTimeout(() => {
            setLoopIteration(null)
            setIsHighlighting(false)
          }, 500)
        }
      }
      step()
    }, 420)
  }, [])

  const handleGameEnd = useCallback(() => {
    setGameOver(true)
    clearTimeout(animTimerRef.current)
    setLoopIteration(null)
    setIsHighlighting(false)
  }, [])

  const handleReset = useCallback(() => {
    clearTimeout(animTimerRef.current)
    setScore(0)
    setAlive(0)
    setWave(0)
    setCountdown(null)
    setRunning(false)
    setGameOver(false)
    setLoopCount(2)
    setLoopIteration(null)
    setIsHighlighting(false)
    gameRef.current?.reset()
  }, [])

  // HUD "next wave" display
  const nextWaveLabel = () => {
    if (gameOver) return 'Done!'
    if (wave === TOTAL_WAVES) return 'Final!'
    if (countdown != null) return `${countdown}s`
    return '—'
  }

  return (
    <div className="app">
      <div className="split-screen">

        {/* ── LEFT: Game ── */}
        <div className="game-side">
          <div className="game-header">
            <h1 className="game-title">
              <HeadshotLogo />
              <span className="title-loop">for loop</span>
              {' '}
              <span className="title-ninja">ninja</span>
            </h1>
            <p className="game-subtitle">Click enemies to zap them · +10 pts each</p>
          </div>

          <div className="hud">
            <div className="stat">
              <div className="stat-label">Score</div>
              <div className="stat-value" style={{ color: 'var(--blue)' }}>{score}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Enemies</div>
              <div className="stat-value" style={{ color: 'var(--orange)' }}>{alive}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Wave</div>
              <div className="stat-value" style={{ color: 'var(--purple)' }}>
                {wave > 0 ? `${wave} / ${TOTAL_WAVES}` : '—'}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Next wave</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>
                {nextWaveLabel()}
              </div>
            </div>
          </div>

          <div className="btn-row">
            {!running && !gameOver && (
              <button className="btn-primary" onClick={() => gameRef.current?.start()}>
                ▶ Start
              </button>
            )}
            <button className="btn-secondary" onClick={handleReset}>↺ Reset</button>
          </div>

          <GameCanvas
            ref={gameRef}
            onWaveSpawn={handleWaveSpawn}
            onScoreChange={setScore}
            onAliveChange={setAlive}
            onCountdownChange={setCountdown}
            onRunningChange={setRunning}
            onGameEnd={handleGameEnd}
          />
        </div>

        {/* ── RIGHT: Code Explainer ── */}
        <div className="explainer-side">
          <CodeExplainer
            isHighlighting={isHighlighting}
            loopCount={loopCount}
            loopIteration={loopIteration}
            waveNum0={waveNum0}
            totalWaves={TOTAL_WAVES}
            speed={currentSpeed}
            wave={wave}
            running={running}
            gameOver={gameOver}
          />
        </div>

      </div>
    </div>
  )
}
