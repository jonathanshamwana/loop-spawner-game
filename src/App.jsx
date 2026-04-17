import { useState, useCallback, useRef } from 'react'
import GameCanvas from './components/GameCanvas'
import CodeExplainer from './components/CodeExplainer'
import './App.css'

export default function App() {
  const [score, setScore] = useState(0)
  const [alive, setAlive] = useState(0)
  const [wave, setWave] = useState(0)
  const [countdown, setCountdown] = useState(null)
  const [running, setRunning] = useState(false)
  const [loopCount, setLoopCount] = useState(3)
  const [loopIteration, setLoopIteration] = useState(null)
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [logs, setLogs] = useState(['— waiting to start —'])
  const gameRef = useRef(null)
  const animTimerRef = useRef(null)

  const handleWaveSpawn = useCallback((waveNum, count) => {
    setWave(waveNum)
    setLoopCount(count)
    setIsHighlighting(true)
    setLogs(prev =>
      [`Wave ${waveNum}: range(${count}) → ${count} enemies spawned`, ...prev].slice(0, 8)
    )

    // Animate i=0, i=1, ... i=count-1 to show the loop running step-by-step
    clearTimeout(animTimerRef.current)
    let i = 0
    const step = () => {
      setLoopIteration(i)
      if (i < count - 1) {
        i++
        animTimerRef.current = setTimeout(step, 380)
      } else {
        animTimerRef.current = setTimeout(() => {
          setLoopIteration(null)
          setIsHighlighting(false)
        }, 600)
      }
    }
    step()
  }, [])

  const handleReset = useCallback(() => {
    clearTimeout(animTimerRef.current)
    setScore(0)
    setAlive(0)
    setWave(0)
    setCountdown(null)
    setRunning(false)
    setLoopCount(3)
    setLoopIteration(null)
    setIsHighlighting(false)
    setLogs(['— waiting to start —'])
    gameRef.current?.reset()
  }, [])

  return (
    <div className="app">
      <div className="split-screen">

        {/* ── LEFT: Game ── */}
        <div className="game-side">
          <div className="game-header">
            <h1 className="game-title">
              <span className="kw">for</span> loop spawner
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
              <div className="stat-value" style={{ color: 'var(--purple)' }}>{wave || '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Next wave</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>
                {countdown != null ? `${countdown}s` : '—'}
              </div>
            </div>
          </div>

          <div className="btn-row">
            {!running && (
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
          />
        </div>

        {/* ── RIGHT: Code Explainer ── */}
        <div className="explainer-side">
          <CodeExplainer
            isHighlighting={isHighlighting}
            loopCount={loopCount}
            loopIteration={loopIteration}
            logs={logs}
            wave={wave}
            running={running}
          />
        </div>

      </div>
    </div>
  )
}
