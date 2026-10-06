import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from './Home.jsx'

const all = [
  { id: 1, category: 'rules', official: true },
  { id: 2, category: 'road_signs' },
]

describe('Home', () => {
  it('shows empty stats for a new user and disables weak review', () => {
    render(<Home progress={{ questions: {}, exams: [] }} all={all} onStart={() => {}} onProgress={() => {}} />)
    expect(screen.getByText('Review weak (0)')).toBeDisabled()
    expect(screen.getByText(/The 1 sample knowledge-test questions/)).toBeInTheDocument()
    expect(screen.getByText('–')).toBeInTheDocument()
  })

  it('shows last exam and weak count; starts each mode with options', async () => {
    const onStart = vi.fn()
    const onProgress = vi.fn()
    const progress = {
      questions: { 1: { seen: 2, correct: 1, lastCorrect: false }, 2: { seen: 1, correct: 1, lastCorrect: true } },
      exams: [{ date: '2026-01-01', correct: 30, total: 40, passed: false }],
    }
    render(<Home progress={progress} all={all} onStart={onStart} onProgress={onProgress} />)
    expect(screen.getByText('30/40')).toBeInTheDocument()
    const user = userEvent.setup()

    await user.click(screen.getByText('Start mock exam'))
    expect(onStart).toHaveBeenLastCalledWith('exam')

    await user.click(screen.getByText('Start sign quiz'))
    expect(onStart).toHaveBeenLastCalledWith('signs')

    await user.click(screen.getByText('Start official sample'))
    expect(onStart).toHaveBeenLastCalledWith('sample')

    await user.click(screen.getByText('Start practice'))
    expect(onStart).toHaveBeenLastCalledWith('practice', { category: 'all' })

    await user.click(screen.getByText('Rules of the road'))
    await user.click(screen.getByText('Review weak (1)'))
    expect(onStart).toHaveBeenLastCalledWith('practice', { category: 'rules', weakOnly: true })

    await user.click(screen.getByText('View my progress'))
    expect(onProgress).toHaveBeenCalled()
  })
})
