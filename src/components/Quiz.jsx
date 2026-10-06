import { useEffect, useRef, useState } from 'react'

function fmt(sec) {
  const m = Math.floor(sec / 60)
  return `${m}:${String(sec % 60).padStart(2, '0')}`
}

export default function Quiz({ title, mode, questions, minutes, onFinish, onExit }) {
  const exam = mode === 'exam'
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState({})
  const [left, setLeft] = useState(minutes ? minutes * 60 : null)
  const answersRef = useRef(answers)
  answersRef.current = answers

  useEffect(() => {
    if (left === null) return
    if (left <= 0) {
      onFinish(answersRef.current)
      return
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  const q = questions[i]
  const chosen = answers[q.id]
  const answered = chosen !== undefined
  const showFeedback = !exam && answered
  const last = i === questions.length - 1
  const done = Object.keys(answers).length

  const choose = (opt) => {
    if (!exam && answered) return
    setAnswers({ ...answers, [q.id]: opt })
  }

  const finish = () => {
    if (exam && done < questions.length && !window.confirm(`${questions.length - done} question(s) unanswered. Finish anyway?`)) return
    onFinish(answers)
  }

  return (
    <>
      <div className="bar">
        <button className="link" onClick={() => (window.confirm('Leave this quiz? Your answers will be lost.') ? onExit() : null)}>✕ Exit</button>
        <strong>{title}</strong>
        {left !== null && <span className={left < 120 ? 'timer warn' : 'timer'}>{fmt(left)}</span>}
      </div>
      <progress value={i + 1} max={questions.length} />
      <p className="muted">Question {i + 1} of {questions.length}</p>

      <section className="card question">
        <h2>{q.question}</h2>
        {q.image && <img className="sign" src={q.image} alt="Road sign or signal to identify" />}
        <ul className="options" role="radiogroup">
          {q.options.map((opt) => {
            let cls = 'option'
            if (showFeedback) {
              if (opt === q.answer) cls += ' correct'
              else if (opt === chosen) cls += ' wrong'
            } else if (opt === chosen) cls += ' selected'
            return (
              <li key={opt}>
                <button role="radio" aria-checked={opt === chosen} className={cls} onClick={() => choose(opt)}>{opt}</button>
              </li>
            )
          })}
        </ul>
        {showFeedback && (
          <div className={chosen === q.answer ? 'feedback ok' : 'feedback bad'} role="status">
            <strong>{chosen === q.answer ? 'Correct!' : `Incorrect. Answer: ${q.answer}`}</strong>
            {q.explanation && <p>{q.explanation}</p>}
          </div>
        )}
      </section>

      <div className="row nav">
        {exam && <button disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>}
        {!last && <button className="primary" disabled={!exam && !answered} onClick={() => setI(i + 1)}>Next</button>}
        {(last || exam) && (
          <button className={last ? 'primary' : ''} disabled={!exam && !answered} onClick={finish}>
            {exam ? `Finish (${done}/${questions.length})` : 'See results'}
          </button>
        )}
      </div>
    </>
  )
}
