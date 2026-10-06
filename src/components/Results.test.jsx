import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Results from './Results.jsx'

const q1 = { id: 1, question: 'Q one?', answer: 'A', options: ['A', 'B'], explanation: 'Because.' }
const q2 = { id: 2, question: 'Q two?', answer: 'C', options: ['C', 'D'], image: 'images/stop.jpg' }
const mk = (over) => ({ result: { correct: 0, total: 2, pct: 0, passed: false, missed: [q1, q2] }, answers: { 1: 'B' }, mode: 'practice', ...over })

describe('Results', () => {
  it('lists missed questions, answers, explanation and image', () => {
    render(<Results view={mk()} onHome={() => {}} onRetry={() => {}} />)
    expect(screen.getByText('Keep practising.')).toBeInTheDocument()
    expect(screen.getByText('Your answer: B')).toBeInTheDocument()
    expect(screen.getByText('Your answer: No answer')).toBeInTheDocument()
    expect(screen.getByText('Because.')).toBeInTheDocument()
    expect(screen.getByAltText('Sign or signal')).toHaveAttribute('src', 'images/stop.jpg')
  })

  it('exam messages for fail and pass', () => {
    const { rerender } = render(<Results view={mk({ mode: 'exam' })} onHome={() => {}} onRetry={() => {}} />)
    expect(screen.getByText(/Not yet/)).toBeInTheDocument()
    rerender(<Results view={mk({ mode: 'exam', result: { correct: 2, total: 2, pct: 1, passed: true, missed: [] } })} onHome={() => {}} onRetry={() => {}} />)
    expect(screen.getByText(/You passed/)).toBeInTheDocument()
    expect(screen.getByText('Perfect score!')).toBeInTheDocument()
  })

  it('practice pass message and buttons', async () => {
    const onHome = vi.fn()
    const onRetry = vi.fn()
    render(<Results view={mk({ result: { correct: 2, total: 2, pct: 1, passed: true, missed: [] } })} onHome={onHome} onRetry={onRetry} />)
    expect(screen.getByText('Great work!')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByText('Try again'))
    await user.click(screen.getByText('Home'))
    expect(onRetry).toHaveBeenCalled()
    expect(onHome).toHaveBeenCalled()
  })
})
