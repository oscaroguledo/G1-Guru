import { useState } from 'react'
import { summarize } from '../lib/storage'

export default function Home({ progress, all, onStart, onProgress }) {
  const [category, setCategory] = useState('all')
  const sum = summarize(progress, all)
  const seen = Object.values(sum).reduce((n, c) => n + c.seen, 0)
  const mastered = Object.values(sum).reduce((n, c) => n + c.mastered, 0)
  const last = progress.exams[0]
  const weak = Object.values(progress.questions).filter((s) => s.lastCorrect === false).length

  return (
    <>
      <header className="hero">
        <h1>G1 Guru</h1>
        <p>Ontario G1 knowledge test practice</p>
      </header>

      <section className="stats">
        <div><strong>{all.length}</strong><span>questions</span></div>
        <div><strong>{seen}</strong><span>attempted</span></div>
        <div><strong>{mastered}</strong><span>got right last time</span></div>
        <div><strong>{last ? `${last.correct}/${last.total}` : '–'}</strong><span>last exam</span></div>
      </section>

      <section className="card">
        <h2>Mock exam</h2>
        <p>40 questions (20 road signs, 20 rules of the road), 30 minutes. You need 80% (32/40) to pass.</p>
        <button className="primary" onClick={() => onStart('exam')}>Start mock exam</button>
      </section>

      <section className="card">
        <h2>Practice</h2>
        <p>20 questions with instant feedback and explanations.</p>
        <div className="row">
          {[['all', 'All'], ['rules', 'Rules of the road'], ['road_signs', 'Road signs']].map(([v, l]) => (
            <button key={v} className={category === v ? 'chip active' : 'chip'} onClick={() => setCategory(v)}>{l}</button>
          ))}
        </div>
        <div className="row">
          <button className="primary" onClick={() => onStart('practice', { category })}>Start practice</button>
          <button disabled={!weak} onClick={() => onStart('practice', { category, weakOnly: true })}>Review weak ({weak})</button>
        </div>
      </section>

      <section className="card">
        <h2>Road sign quiz</h2>
        <p>Identify signs, signals and pedestrian lights from the Official MTO Driver’s Handbook.</p>
        <button className="primary" onClick={() => onStart('signs')}>Start sign quiz</button>
      </section>

      <section className="card">
        <h2>Official sample questions</h2>
        <p>The {all.filter((q) => q.official).length} sample knowledge-test questions published in the Official MTO Driver’s Handbook.</p>
        <button className="primary" onClick={() => onStart('sample')}>Start official sample</button>
      </section>

      <button className="link" onClick={onProgress}>View my progress</button>
    </>
  )
}
