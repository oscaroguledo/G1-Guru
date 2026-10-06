import { summarize } from '../lib/storage'

const LABEL = { rules: 'Rules of the road', road_signs: 'Road signs' }

export default function Progress({ progress, all, onBack, onReset }) {
  const sum = summarize(progress, all)
  const weakQs = all.filter((q) => progress.questions[q.id]?.lastCorrect === false)
  return (
    <>
      <div className="bar">
        <button className="link" onClick={onBack}>← Back</button>
        <strong>My progress</strong>
        <span />
      </div>

      <section className="card">
        <h2>By category</h2>
        {Object.entries(sum).map(([cat, c]) => (
          <div key={cat} className="cat">
            <div className="row between"><span>{LABEL[cat] || cat}</span><span>{c.mastered}/{c.total} right last time</span></div>
            <progress value={c.mastered} max={c.total} />
            <p className="muted">{c.seen} attempted{c.seen ? `, ${Math.round((c.seenCorrect / c.seen) * 100)}% of those correct` : ''}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Mock exam history</h2>
        {progress.exams.length === 0 && <p className="muted">No mock exams taken yet.</p>}
        <ul className="history">
          {progress.exams.map((e) => (
            <li key={e.date}>
              <span>{new Date(e.date).toLocaleString()}</span>
              <span className={e.passed ? 'ok-text' : 'bad-text'}>{e.correct}/{e.total} {e.passed ? 'Pass' : 'Fail'}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Weak questions ({weakQs.length})</h2>
        {weakQs.length === 0 && <p className="muted">Nothing to review. Nice!</p>}
        <ul className="weak">
          {weakQs.slice(0, 15).map((q) => <li key={q.id}>{q.question} <em>→ {q.answer}</em></li>)}
        </ul>
        {weakQs.length > 15 && <p className="muted">…and {weakQs.length - 15} more. Use “Review weak” on the home screen.</p>}
      </section>

      <button className="danger" onClick={onReset}>Reset progress</button>
    </>
  )
}
