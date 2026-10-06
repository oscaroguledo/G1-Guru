import { describe, it, expect } from 'vitest'
import questions from '../data/questions.json'
import { buildExam, buildPractice, score, shuffle, pick, withShuffledOptions, EXAM_SIZE, EXAM_SIGNS } from './quiz'

const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

describe('shuffle / pick', () => {
  it('keeps all items and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    expect([...shuffle(input, seeded())].sort()).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
  it('works with the default random source', () => {
    expect(shuffle([1, 2, 3]).sort()).toEqual([1, 2, 3])
    expect(pick([1, 2, 3, 4], 2)).toHaveLength(2)
  })
  it('handles empty lists', () => {
    expect(shuffle([])).toEqual([])
    expect(pick([], 5)).toEqual([])
  })
  it('withShuffledOptions keeps the same options and answer', () => {
    const q = questions[0]
    const s = withShuffledOptions(q, seeded(5))
    expect([...s.options].sort()).toEqual([...q.options].sort())
    expect(s.answer).toBe(q.answer)
    expect(withShuffledOptions(q).options).toHaveLength(4)
  })
})

describe('buildExam', () => {
  it('has 40 unique questions: 20 signs and 20 rules, answers always among options', () => {
    const exam = buildExam(questions, seeded(7))
    expect(exam).toHaveLength(EXAM_SIZE)
    expect(new Set(exam.map((q) => q.id)).size).toBe(EXAM_SIZE)
    expect(exam.filter((q) => q.category === 'road_signs')).toHaveLength(EXAM_SIGNS)
    expect(exam.filter((q) => q.category === 'rules')).toHaveLength(EXAM_SIZE - EXAM_SIGNS)
    for (const q of exam) expect(q.options).toContain(q.answer)
  })
  it('works with the default random source', () => {
    expect(buildExam(questions)).toHaveLength(EXAM_SIZE)
  })
})

describe('buildPractice', () => {
  it('defaults to 20 questions from every category', () => {
    expect(buildPractice(questions)).toHaveLength(20)
  })
  it('honours category and size', () => {
    const p = buildPractice(questions, { category: 'rules', size: 10 }, seeded(3))
    expect(p).toHaveLength(10)
    expect(p.every((q) => q.category === 'rules')).toBe(true)
  })
  it('weakOnly selects questions that were last answered wrong', () => {
    const stats = { 1: { seen: 1, correct: 0, lastCorrect: false }, 2: { seen: 1, correct: 1, lastCorrect: true }, 3: { seen: 0 } }
    expect(buildPractice(questions, { weakOnly: true, stats, size: 5 }).map((q) => q.id)).toEqual([1])
  })
  it('weakOnly falls back to the whole pool when nothing is weak', () => {
    expect(buildPractice(questions, { weakOnly: true, stats: {}, size: 5 })).toHaveLength(5)
  })
})

describe('score', () => {
  const qs = questions.slice(0, 10)
  it('passes at exactly 80%', () => {
    const answers = Object.fromEntries(qs.map((q, i) => [q.id, i < 8 ? q.answer : 'wrong']))
    const r = score(qs, answers)
    expect(r).toMatchObject({ correct: 8, total: 10, pct: 0.8, passed: true })
    expect(r.missed).toHaveLength(2)
  })
  it('fails below 80% and counts unanswered as missed', () => {
    const answers = Object.fromEntries(qs.slice(0, 7).map((q) => [q.id, q.answer]))
    const r = score(qs, answers)
    expect(r.passed).toBe(false)
    expect(r.missed).toHaveLength(3)
  })
  it('handles an empty quiz', () => {
    expect(score([], {})).toMatchObject({ correct: 0, total: 0, pct: 0, passed: false })
  })
})
