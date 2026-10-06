export default function Results({ view, onHome, onRetry }) {
  const { result, answers, mode } = view
  const pct = Math.round(result.pct * 100)
  return (
    <>
      <header className={result.passed ? 'hero pass' : 'hero fail'}>
        <h1>{result.correct}/{result.total} ({pct}%)</h1>
        <p>
          {mode === 'exam'
            ? result.passed ? 'You passed! (80% needed)' : 'Not yet — you need 80% to pass. Review the questions below.'
            : result.passed ? 'Great work!' : 'Keep practising.'}
        </p>
      </header>
      <div className="row">
        <button className="primary" onClick={onRetry}>Try again</button>
        <button onClick={onHome}>Home</button>
      </div>
      <h2>{result.missed.length ? 'Questions to review' : 'Perfect score!'}</h2>
      {result.missed.map((q) => (
        <section className="card" key={q.id}>
          <h3>{q.question}</h3>
          {q.image && <img className="sign small" src={q.image} alt="Sign or signal" />}
          <p className="bad-text">Your answer: {answers[q.id] ?? 'No answer'}</p>
          <p className="ok-text">Correct: {q.answer}</p>
          {q.explanation && <p className="muted">{q.explanation}</p>}
        </section>
      ))}
    </>
  )
}
