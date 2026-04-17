import { useState } from 'react'
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

// ── Explanation modal ─────────────────────────────────────────
const EXPLAIN_STEPS = [
  {
    highlight: 'for-kw',
    label: 'For loops',
    tip: 'A for loop repeats a block of code a fixed number of times, running once per wave in this game.',
  },
  {
    highlight: 'iterator',
    label: 'The iterator',
    tip: 'wave_num is the iterator: a variable that automatically counts up (0, 1, 2...) each time the loop repeats.',
  },
  {
    highlight: 'range',
    label: 'Range & termination',
    tip: 'range(10) sets when the loop stops; without it the loop would repeat forever.',
  },
  {
    highlight: 'body',
    label: 'The body',
    tip: 'Everything indented under the for line is the body. It runs once for every value of wave_num.',
  },
  {
    highlight: 'inner-for',
    label: 'Nested loops',
    tip: 'A loop inside a loop is nesting. The inner loop runs completely for every single outer iteration.',
    bonus: true,
  },
  {
    highlight: null,
    label: 'While loops',
    tip: 'A while loop keeps going as long as its condition is true. This game uses a fixed 10 waves, but we could rewrite it to keep spawning until you hit 1000 points.',
    bonus: true,
    whileCode: true,
  },
]

function ExplainModal({ onClose }) {
  const [step, setStep] = useState(0)
  const { highlight, label, tip, bonus, whileCode } = EXPLAIN_STEPS[step]
  const hi = (id) => `mhi${highlight === id ? ' mhi-on' : ''}`

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <div className="modal-hdr">
          <span className="modal-title">
            {whileCode ? <><span className="modal-title-bonus">BONUS:</span> While loops</> : 'How for loops work'}
          </span>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {whileCode ? (
          <pre className="modal-code">
            <span className="cm">{'# keeps spawning as long as the condition is true\n'}</span>
            <span className="kw">while</span>{' score '}
            {'< '}
            <span className="num">1000</span>
            {':\n'}
            {'    '}<span className="fn">spawn_wave</span>{'()\n'}
            {'    '}<span className="fn">wait</span>{'('}<span className="num">4</span>{')\n\n'}
            <span className="cm">{'# vs. the for loop version (fixed 10 waves)\n'}</span>
            <span className="kw">for</span>{' wave_num '}
            <span className="kw">in</span>{' '}
            <span className="fn">range</span>{'('}
            <span className="num">10</span>
            {'):\n'}
            {'    '}<span className="fn">spawn_wave</span>{'()\n'}
            {'    '}<span className="fn">wait</span>{'('}<span className="num">4</span>{')'}
          </pre>
        ) : (
          <pre className="modal-code">
            <span className="cm">{'# outer loop: one iteration per wave\n'}</span>
            <span className={hi('for-kw')}><span className="kw">for</span></span>
            {' '}
            <span className={hi('iterator')}>wave_num</span>
            {' '}<span className="kw">in</span>{' '}
            <span className={hi('range')}><span className="fn">range</span>{'('}<span className="num">10</span>{')'}</span>
            {':'}
            <span className={hi('body')}>
              {'\n    '}{'count = wave_num + '}<span className="num">2</span>
              {'\n    '}{'speed = '}<span className="num">1.0</span>{' + wave_num * '}<span className="num">0.3</span>
              {'\n\n    '}<span className="cm">{'# inner loop: spawn each enemy'}</span>
              {'\n    '}
              <span className={hi('inner-for')}>
                <span className="kw">for</span>{' i '}
                <span className="kw">in</span>{' '}
                <span className="fn">range</span>{'(count):'}
              </span>
              {'\n        '}{'e = '}<span className="fn">Enemy</span>{'(speed=speed)'}
              {'\n        '}{'enemies.'}<span className="fn">append</span>{'(e)'}
            </span>
            {'\n\n    '}
            <span className="fn">wait</span>{'('}<span className="num">4</span>{')  '}
            <span className="cm">{'# seconds between waves'}</span>
          </pre>
        )}

        <div className={`modal-tip${bonus ? ' modal-tip-bonus' : ''}`}>
          <div className="modal-tip-label">{label}</div>
          <p className="modal-tip-text">{tip}</p>
        </div>

        <div className="modal-nav">
          <div className="modal-dots">
            {EXPLAIN_STEPS.map((s, i) => (
              <button
                key={i}
                className={`modal-dot${i === step ? ' on' : ''}${s.bonus ? ' bonus' : ''}`}
                onClick={() => setStep(i)}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>
          <div className="modal-nav-btns">
            {step > 0 && (
              <button className="modal-btn secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            {step < EXPLAIN_STEPS.length - 1
              ? <button className="modal-btn" onClick={() => setStep(s => s + 1)}>Next →</button>
              : <button className="modal-btn" onClick={onClose}>Done ✓</button>
            }
          </div>
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
  const [modalOpen, setModalOpen] = useState(false)

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

      <button className="explain-btn" onClick={() => setModalOpen(true)}>
        Begin Explanation
      </button>

      {modalOpen && <ExplainModal onClose={() => setModalOpen(false)} />}

    </div>
  )
}
