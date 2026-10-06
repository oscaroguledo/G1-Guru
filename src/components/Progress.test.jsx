import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Progress from './Progress.jsx'

const all = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, category: i % 2 ? 'rules' : 'road_signs', question: `Question ${i + 1}`, answer: `Answer ${i + 1}` }))
all.push({ id: 99, category: 'other', question: 'Odd', answer: 'x' })

describe('Progress', () => {
  it('shows empty states', () => {
    render(<Progress progress={{ questions: {}, exams: [] }} all={all} onBack={() => {}} onReset={() => {}} />)
    expect(screen.getByText('No mock exams taken yet.')).toBeInTheDocument()
    expect(screen.getByText('Nothing to review. Nice!')).toBeInTheDocument()
    expect(screen.getByText('other')).toBeInTheDocument()
  })

  it('shows stats, history, weak list with overflow, and wires buttons', async () => {
    const questions = {}
    for (let i = 1; i <= 18; i++) questions[i] = { seen: 2, correct: 0, lastCorrect: false }
    questions[19] = { seen: 4, correct: 3, lastCorrect: true }
    const progress = {
      questions,
      exams: [
        { date: '2026-01-02T00:00:00Z', correct: 35, total: 40, passed: true },
        { date: '2026-01-01T00:00:00Z', correct: 20, total: 40, passed: false },
      ],
    }
    const onBack = vi.fn()
    const onReset = vi.fn()
    render(<Progress progress={progress} all={all} onBack={onBack} onReset={onReset} />)
    expect(screen.getByText('35/40 Pass')).toBeInTheDocument()
    expect(screen.getByText('20/40 Fail')).toBeInTheDocument()
    expect(screen.getByText('Weak questions (18)')).toBeInTheDocument()
    expect(screen.getByText(/…and 3 more/)).toBeInTheDocument()
    expect(screen.getByText(/10% of those correct/)).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByText('← Back'))
    await user.click(screen.getByText('Reset progress'))
    expect(onBack).toHaveBeenCalled()
    expect(onReset).toHaveBeenCalled()
  })
})
