import './CodeExplainer.css'

// ── Syntax-highlighted Python code ────────────────────────────
function CodePanel({ isHighlighting, loopCount, loopIteration }) {
  const loopActive = isHighlighting
  const bodyActive = isHighlighting && loopIteration !== null
  const callActive = isHighlighting

  return (
    <div className="panel">
      <div className="panel-title">Python code — running live</div>
      <pre className="code-block">
        <span className="kw">def</span> <span className="fn">spawn_wave</span>{'(wave_num):\n'}
        {'  enemies = []\n'}
        {'  '}
        <span className={`hi-line${loopActive ? ' active' : ''}`}>
          <span className="kw">for</span>{' i '}
          <span className="kw">in</span>{' '}
          <span className="fn">range</span>
          {'('}
          <span className="num">{loopCount}</span>
          {'):'}
        </span>
        {'\n'}
        {'    x = '}<span className="fn">random</span>{'(SCREEN_W)\n'}
        {'    e = '}<span className="fn">Enemy</span>{'(x, speed=wave_num)\n'}
        {'    '}
        <span className={`hi-line${bodyActive ? ' active' : ''}`}>
          {'enemies.'}
          <span className="fn">append</span>
          {'(e)'}
        </span>
        {'\n'}
        {'  '}
        <span className="kw">return</span>
        {' enemies\n\n'}
        <span className="cm">{'# called every 4 seconds:\n'}</span>
        <span className={`hi-line${callActive ? ' active' : ''}`}>
          {'all_enemies = '}
          <span className="fn">spawn_wave</span>
          {'(wave_num)'}
        </span>
      </pre>
    </div>
  )
}

// ── Loop step visualiser ───────────────────────────────────────
function LoopVisualiser({ loopCount, loopIteration, wave }) {
  if (wave === 0) return null

  const isDone = loopIteration === null
  const currentI = loopIteration ?? loopCount - 1

  return (
    <div className="panel">
      <div className="panel-title">Loop tracker — what is i right now?</div>
      <div className="loop-tracker">
        <div className="loop-i-label">
          <span className="kw">i</span>
          {' = '}
          <span className="num">{isDone ? '✓ done' : loopIteration}</span>
          {!isDone && (
            <span className="muted"> &nbsp;(step {(loopIteration ?? 0) + 1} of {loopCount})</span>
          )}
        </div>

        <div className="loop-boxes">
          {Array.from({ length: loopCount }, (_, i) => (
            <div
              key={i}
              className={[
                'loop-box',
                !isDone && i < currentI  ? 'done'    : '',
                !isDone && i === currentI ? 'current' : '',
                isDone                   ? 'all-done' : '',
              ].join(' ').trim()}
              title={`i = ${i}`}
            >
              {i}
            </div>
          ))}
        </div>

        <div className="loop-caption">
          Each box = one iteration of the loop. The highlighted box is the current value of <code>i</code>.
        </div>
      </div>
    </div>
  )
}

// ── Concept cards ─────────────────────────────────────────────
function ConceptCards({ isHighlighting, loopIteration, loopCount, wave }) {
  const loopActive  = isHighlighting
  const bodyActive  = isHighlighting && loopIteration !== null
  const callActive  = isHighlighting

  return (
    <div className="panel">
      <div className="panel-title">What each part does</div>
      <div className="concepts">

        <div className={`concept-card${loopActive ? ' active' : ''}`}>
          <div className="concept-tag">for loop</div>
          <h4><code>for i in range({loopCount}):</code></h4>
          <p>
            Runs the indented code <strong>{loopCount} times</strong>. The variable <code>i</code> starts at <strong>0</strong> and counts up to <strong>{loopCount - 1}</strong>. Think of it like a counter!
          </p>
        </div>

        <div className={`concept-card${bodyActive ? ' active' : ''}`}>
          <div className="concept-tag">loop body</div>
          <h4><code>enemies.append(e)</code></h4>
          <p>
            This line runs <strong>inside</strong> the loop, so it happens once per iteration. Each time through, it adds one enemy to the <code>enemies</code> list.
          </p>
        </div>

        <div className={`concept-card${callActive ? ' active' : ''}`}>
          <div className="concept-tag">function call</div>
          <h4><code>spawn_wave(wave_num)</code></h4>
          <p>
            Wave number goes up each round, so <code>range(n)</code> gets a bigger <code>n</code> — meaning <strong>more enemies every wave!</strong>
            {wave > 0 && <> Currently wave <strong>{wave}</strong>, so n = <strong>{loopCount}</strong>.</>}
          </p>
        </div>

      </div>
    </div>
  )
}

// ── Wave log ─────────────────────────────────────────────────
function WaveLog({ logs }) {
  return (
    <div className="panel">
      <div className="panel-title">Wave log</div>
      <div className="wave-log">
        {logs.map((entry, i) => (
          <div
            key={entry + i}
            className={`log-entry${i === 0 && entry !== '— waiting to start —' ? ' new' : ''}`}
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function CodeExplainer({ isHighlighting, loopCount, loopIteration, logs, wave, running }) {
  return (
    <div className="code-explainer">
      <div className="explainer-header">
        <h2 className="explainer-title">Code Explainer</h2>
        <p className="explainer-subtitle">
          {running
            ? 'Watch the code light up as each wave spawns!'
            : 'Press ▶ Start to see the for loop in action'}
        </p>
      </div>
      <CodePanel isHighlighting={isHighlighting} loopCount={loopCount} loopIteration={loopIteration} />
      <LoopVisualiser loopCount={loopCount} loopIteration={loopIteration} wave={wave} />
      <ConceptCards
        isHighlighting={isHighlighting}
        loopIteration={loopIteration}
        loopCount={loopCount}
        wave={wave}
      />
      <WaveLog logs={logs} />
    </div>
  )
}
