import './CodeExplainer.css'

// ── Nested-loop Python code panel ─────────────────────────────
function CodePanel({ isHighlighting, loopCount, loopIteration, waveNum0, speed }) {
  // Phase 1: outer for + count= + speed= lines glow (iteration is null)
  const outerPhase = isHighlighting && loopIteration === null
  // Phase 2: inner for + append lines glow (iteration is a number)
  const innerPhase = isHighlighting && loopIteration !== null

  return (
    <div className="panel">
      <div className="panel-title">Python code — running live</div>
      <pre className="code-block">
        <span className="cm">{'# Outer loop — one iteration per wave\n'}</span>
        <span className={`hi-line${outerPhase ? ' active' : ''}`}>
          <span className="kw">for</span>
          {' wave_num '}
          <span className="kw">in</span>
          {' '}
          <span className="fn">range</span>
          {'('}
          <span className="num">10</span>
          {'):'}
        </span>
        {'\n'}
        {'    '}
        <span className={`hi-line${outerPhase ? ' active' : ''}`}>
          {'count = wave_num + '}
          <span className="num">2</span>
          {waveNum0 !== null
            ? <span className="live-val">{'  # = '}{loopCount}</span>
            : null}
        </span>
        {'\n'}
        {'    '}
        <span className={`hi-line${outerPhase ? ' active' : ''}`}>
          {'speed = '}
          <span className="num">{'1.0'}</span>
          {' + wave_num * '}
          <span className="num">{'0.3'}</span>
          {waveNum0 !== null
            ? <span className="live-val">{'  # = '}{speed}</span>
            : null}
        </span>
        {'\n\n'}
        {'    '}
        <span className="cm">{'# Inner loop — spawn each enemy\n'}</span>
        {'    '}
        <span className={`hi-line${innerPhase ? ' active' : ''}`}>
          <span className="kw">for</span>
          {' i '}
          <span className="kw">in</span>
          {' '}
          <span className="fn">range</span>
          {'(count):'}
        </span>
        {'\n'}
        {'        '}
        {'e = '}
        <span className="fn">Enemy</span>
        {'(speed=speed)\n'}
        {'        '}
        <span className={`hi-line${innerPhase ? ' active' : ''}`}>
          {'enemies.'}
          <span className="fn">append</span>
          {'(e)'}
        </span>
        {'\n\n'}
        {'    '}
        <span className="fn">wait</span>
        {'('}
        <span className="num">4</span>
        {')'}
        {'  '}
        <span className="cm">{'# seconds between waves'}</span>
      </pre>
    </div>
  )
}

// ── Outer loop tracker — 10 wave boxes ────────────────────────
function OuterLoopTracker({ waveNum0, totalWaves, isHighlighting, gameOver }) {
  if (waveNum0 === null && !gameOver) return null

  const current = waveNum0 ?? totalWaves  // after game over, all are done

  return (
    <div className="panel">
      <div className="panel-title">Outer loop tracker — wave_num in range(10)</div>
      <div className="loop-tracker">
        <div className="loop-i-label">
          <span className="kw">wave_num</span>
          {' = '}
          {gameOver
            ? <span className="done-text">✓ all done</span>
            : <span className="num">{waveNum0}</span>
          }
          {!gameOver && waveNum0 !== null && (
            <span className="muted"> &nbsp;(wave {waveNum0 + 1} of {totalWaves})</span>
          )}
        </div>

        <div className="loop-boxes">
          {Array.from({ length: totalWaves }, (_, i) => {
            let cls = 'loop-box'
            if (gameOver)                                      cls += ' all-done'
            else if (i < current)                             cls += ' done'
            else if (i === current && isHighlighting)         cls += ' current'
            else if (i === current)                           cls += ' done'
            return (
              <div key={i} className={cls} title={`wave_num = ${i}`}>
                {i}
              </div>
            )
          })}
        </div>
        <div className="loop-caption">
          Each box = one wave. The lit box is the current <code>wave_num</code>.
        </div>
      </div>
    </div>
  )
}

// ── Inner loop tracker — count enemy boxes ────────────────────
function InnerLoopTracker({ loopCount, loopIteration, wave, waveNum0 }) {
  if (wave === 0) return null

  const isDone = loopIteration === null
  const currentI = loopIteration ?? loopCount - 1

  return (
    <div className="panel">
      <div className="panel-title">Inner loop tracker — i in range(count)</div>
      <div className="loop-tracker">
        <div className="loop-i-label">
          <span className="kw">i</span>
          {' = '}
          <span className="num">{isDone ? '✓ done' : loopIteration}</span>
          {!isDone && (
            <span className="muted">
              {' '}&nbsp;(enemy {(loopIteration ?? 0) + 1} of {loopCount})
            </span>
          )}
        </div>

        <div className="loop-boxes">
          {Array.from({ length: loopCount }, (_, i) => (
            <div
              key={i}
              className={[
                'loop-box',
                !isDone && i < currentI   ? 'done'     : '',
                !isDone && i === currentI ? 'current'  : '',
                isDone                    ? 'all-done' : '',
              ].join(' ').trim()}
              title={`i = ${i}`}
            >
              {i}
            </div>
          ))}
        </div>
        <div className="loop-caption">
          Each box = one enemy spawned. Wave {wave ?? 1} spawns{' '}
          <strong style={{ color: 'var(--text)' }}>{loopCount} enemies</strong> — because{' '}
          <code>wave_num({waveNum0 ?? 0}) + 2 = {loopCount}</code>.
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function CodeExplainer({
  isHighlighting, loopCount, loopIteration,
  waveNum0, totalWaves, speed,
  wave, running, gameOver,
}) {
  const subtitle = gameOver
    ? 'All 10 waves complete — the outer loop finished!'
    : running
      ? 'Watch both loops light up as each wave spawns!'
      : 'Press ▶ Start to see the nested loops in action'

  return (
    <div className="code-explainer">
      <div className="explainer-header">
        <h2 className="explainer-title">Code Explainer</h2>
        <p className="explainer-subtitle">{subtitle}</p>
      </div>

      <CodePanel
        isHighlighting={isHighlighting}
        loopCount={loopCount}
        loopIteration={loopIteration}
        waveNum0={waveNum0}
        speed={speed}
      />

      <OuterLoopTracker
        waveNum0={waveNum0}
        totalWaves={totalWaves}
        isHighlighting={isHighlighting}
        gameOver={gameOver}
      />

      <InnerLoopTracker
        loopCount={loopCount}
        loopIteration={loopIteration}
        wave={wave}
        waveNum0={waveNum0}
      />

    </div>
  )
}
