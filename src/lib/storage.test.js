import { describe, it, expect } from 'vitest'
import questions from '../data/questions.json'
import { loadProgress, saveProgress, recordAnswers, recordExam, summarize, resetProgress } from './storage'

const memory = () => {
  const m = {}
  return { m, getItem: (k) => m[k] ?? null, setItem: (k, v) => (m[k] = v), removeItem: (k) => delete m[k] }
}
const broken = { getItem: () => { throw new Error('no') }, setItem: () => { throw new Error('no') }, removeItem: () => { throw new Error('no') } }
const empty = { questions: {}, exams: [] }

describe('load / save / reset', () => {
  it('returns empty progress when nothing is stored, or no storage exists', () => {
    expect(loadProgress(memory())).toEqual(empty)
    expect(loadProgress(null)).toEqual(empty)
  })
  it('round-trips and fills missing fields', () => {
    const st = memory()
    saveProgress({ questions: { 1: { seen: 1 } }, exams: [] }, st)
    expect(loadProgress(st).questions[1].seen).toBe(1)
    st.setItem('g1guru.progress.v1', '{}')
    expect(loadProgress(st)).toEqual(empty)
  })
  it('tolerates corrupt data and unavailable storage', () => {
    const st = memory()
    st.setItem('g1guru.progress.v1', '{bad')
    expect(loadProgress(st)).toEqual(empty)
    expect(loadProgress(broken)).toEqual(empty)
    expect(() => saveProgress(empty, broken)).not.toThrow()
    expect(() => resetProgress(broken)).not.toThrow()
    expect(() => saveProgress(empty, null)).not.toThrow()
    expect(() => resetProgress(null)).not.toThrow()
  })
  it('uses localStorage by default and resets it', () => {
    saveProgress({ questions: { 5: { seen: 2 } }, exams: [] })
    expect(loadProgress().questions[5].seen).toBe(2)
    resetProgress()
    expect(loadProgress()).toEqual(empty)
  })
})

describe('recordAnswers / recordExam / summarize', () => {
  const qs = questions.slice(0, 3)
  it('tracks seen/correct/lastCorrect and ignores unanswered questions', () => {
    let p = recordAnswers(empty, qs, { [qs[0].id]: qs[0].answer, [qs[1].id]: 'nope' })
    expect(p.questions[qs[0].id]).toEqual({ seen: 1, correct: 1, lastCorrect: true })
    expect(p.questions[qs[1].id]).toEqual({ seen: 1, correct: 0, lastCorrect: false })
    expect(p.questions[qs[2].id]).toBeUndefined()
    p = recordAnswers(p, qs, { [qs[1].id]: qs[1].answer })
    expect(p.questions[qs[1].id]).toEqual({ seen: 2, correct: 1, lastCorrect: true })
  })
  it('keeps the 50 most recent exams, newest first', () => {
    let p = empty
    for (let i = 0; i < 55; i++) p = recordExam(p, { correct: i, total: 40, passed: false }, `2026-01-01T00:00:${String(i % 60).padStart(2, '0')}Z`)
    expect(p.exams).toHaveLength(50)
    expect(p.exams[0].correct).toBe(54)
  })
  it('stamps the current date by default', () => {
    expect(recordExam(empty, { correct: 32, total: 40, passed: true }).exams[0]).toMatchObject({ correct: 32, passed: true })
  })
  it('summarizes per category', () => {
    const [a, b] = [questions[0], questions[1]]
    const p = { questions: { [a.id]: { seen: 2, correct: 2, lastCorrect: true }, [b.id]: { seen: 1, correct: 0, lastCorrect: false }, [questions[2].id]: { seen: 0, correct: 0, lastCorrect: null } }, exams: [] }
    const s = summarize(p, questions)
    expect(s.road_signs.total + s.rules.total).toBe(questions.length)
    expect(s.road_signs.seen + s.rules.seen).toBe(2)
    expect(s.road_signs.mastered + s.rules.mastered).toBe(1)
    expect(s.road_signs.seenCorrect + s.rules.seenCorrect).toBe(1)
  })
})
