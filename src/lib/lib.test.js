import { describe, it, expect } from 'vitest'
import questions from '../data/questions.json'
import { buildExam, buildPractice, score, shuffle, EXAM_SIZE } from './quiz'
import { recordAnswers, recordExam, summarize, loadProgress, saveProgress } from './storage'

const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

describe('quiz', () => {
  it('shuffle keeps all items', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded()).sort()).toEqual([1, 2, 3, 4, 5])
  })
  it('exam has 40 unique questions, half signs, answers present in options', () => {
    const exam = buildExam(questions, seeded(7))
    expect(exam).toHaveLength(EXAM_SIZE)
    expect(new Set(exam.map((q) => q.id)).size).toBe(EXAM_SIZE)
    expect(exam.filter((q) => q.category === 'road_signs')).toHaveLength(20)
    for (const q of exam) expect(q.options).toContain(q.answer)
  })
  it('practice honours category', () => {
    const p = buildPractice(questions, { category: 'rules', size: 10 }, seeded(3))
    expect(p).toHaveLength(10)
    expect(p.every((q) => q.category === 'rules')).toBe(true)
  })
  it('practice weakOnly selects last-wrong questions', () => {
    const stats = { 1: { seen: 1, correct: 0, lastCorrect: false } }
    const p = buildPractice(questions, { weakOnly: true, stats, size: 5 }, seeded())
    expect(p.map((q) => q.id)).toEqual([1])
  })
  it('score passes at 80%', () => {
    const qs = questions.slice(0, 10)
    const answers = Object.fromEntries(qs.map((q, i) => [q.id, i < 8 ? q.answer : 'x']))
    const r = score(qs, answers)
    expect(r.correct).toBe(8)
    expect(r.passed).toBe(true)
    expect(r.missed).toHaveLength(2)
    expect(score(qs, {}).passed).toBe(false)
  })
})

describe('storage', () => {
  const memory = () => {
    const m = {}
    return { getItem: (k) => m[k] ?? null, setItem: (k, v) => (m[k] = v), removeItem: (k) => delete m[k] }
  }
  it('records answers, exams and summarizes', () => {
    const qs = questions.slice(0, 3)
    let p = recordAnswers({ questions: {}, exams: [] }, qs, { [qs[0].id]: qs[0].answer, [qs[1].id]: 'nope' })
    expect(p.questions[qs[0].id]).toMatchObject({ seen: 1, correct: 1, lastCorrect: true })
    expect(p.questions[qs[1].id].lastCorrect).toBe(false)
    expect(p.questions[qs[2].id]).toBeUndefined()
    p = recordExam(p, { correct: 30, total: 40, passed: false })
    expect(p.exams[0]).toMatchObject({ correct: 30, passed: false })
    const s = summarize(p, questions)
    expect(s.road_signs.total + s.rules.total).toBe(questions.length)
  })
  it('round-trips through storage and tolerates corrupt data', () => {
    const st = memory()
    saveProgress({ questions: { 1: { seen: 1 } }, exams: [] }, st)
    expect(loadProgress(st).questions[1].seen).toBe(1)
    st.setItem('g1guru.progress.v1', '{bad')
    expect(loadProgress(st)).toEqual({ questions: {}, exams: [] })
  })
})
