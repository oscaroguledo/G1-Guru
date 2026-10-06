import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import questions from './questions.json'

describe('question bank integrity', () => {
  it('has sequential ids and valid categories', () => {
    expect(questions.map((q) => q.id)).toEqual(questions.map((_, i) => i + 1))
    for (const q of questions) expect(['rules', 'road_signs']).toContain(q.category)
  })
  it('every question has 4 distinct non-empty options including the answer', () => {
    for (const q of questions) {
      expect(q.question.trim().length, `#${q.id}`).toBeGreaterThan(5)
      expect(q.options, `#${q.id}`).toHaveLength(4)
      expect(new Set(q.options).size, `#${q.id}`).toBe(4)
      expect(q.options.every((o) => o.trim()), `#${q.id}`).toBe(true)
      expect(q.options, `#${q.id}`).toContain(q.answer)
    }
  })
  it('has no duplicate questions', () => {
    const keys = questions.map((q) => `${q.question.trim().toLowerCase()}|${q.image ?? ''}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
  it('image questions point at existing files and every image is used', () => {
    const used = new Set()
    for (const q of questions.filter((x) => x.image)) {
      expect(existsSync(`public/${q.image}`), q.image).toBe(true)
      used.add(q.image.replace('images/', ''))
    }
    expect(readdirSync('public/images').filter((f) => f.endsWith('.jpg')).sort()).toEqual([...used].sort())
  })
  it('has enough of each kind to build a mock exam', () => {
    expect(questions.filter((q) => q.category === 'road_signs').length).toBeGreaterThanOrEqual(20)
    expect(questions.filter((q) => q.category === 'rules').length).toBeGreaterThanOrEqual(20)
  })
  it('sign image questions are all road_signs', () => {
    expect(questions.filter((q) => q.image).every((q) => q.category === 'road_signs')).toBe(true)
  })
})
