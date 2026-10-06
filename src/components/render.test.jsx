import { describe, it, expect } from 'vitest'
import { renderToString as rts } from 'react-dom/server'
import questions from '../data/questions.json'
import { buildExam, buildPractice, score } from '../lib/quiz'
import Home from './Home.jsx'
import Quiz from './Quiz.jsx'
import Results from './Results.jsx'
import Progress from './Progress.jsx'

const progress = { questions: { 1: { seen: 2, correct: 1, lastCorrect: false } }, exams: [{ date: '2026-01-01T00:00:00Z', correct: 30, total: 40, passed: false }] }
const noop = () => {}
const renderToString = (el) => rts(el).replace(/<!-- -->/g, '')

describe('screens render', () => {
  it('home', () => {
    const html = renderToString(<Home progress={progress} all={questions} onStart={noop} onProgress={noop} />)
    expect(html).toContain('Start mock exam')
    expect(html).toContain('Review weak (1)')
  })
  it('exam quiz shows timer, practice quiz does not', () => {
    const exam = renderToString(<Quiz title="Mock exam" mode="exam" questions={buildExam(questions)} minutes={30} onFinish={noop} onExit={noop} />)
    expect(exam).toContain('30:00')
    expect(exam).toContain('Question 1 of 40')
    const prac = renderToString(<Quiz title="Practice" mode="practice" questions={buildPractice(questions, { size: 5 })} onFinish={noop} onExit={noop} />)
    expect(prac).not.toContain('timer')
  })
  it('results lists missed questions', () => {
    const qs = buildPractice(questions, { size: 5 })
    const result = score(qs, {})
    const html = renderToString(<Results view={{ result, answers: {}, mode: 'practice', questions: qs }} onHome={noop} onRetry={noop} />)
    expect(html).toContain('Questions to review')
    expect(html).toContain('No answer')
  })
  it('progress', () => {
    const html = renderToString(<Progress progress={progress} all={questions} onBack={noop} onReset={noop} />)
    expect(html).toContain('Mock exam history')
    expect(html).toContain('30/40')
  })
})
