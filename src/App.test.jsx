import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import questions from './data/questions.json'

let confirm
beforeEach(() => {
  confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
})
afterEach(() => confirm.mockRestore())

const user = () => userEvent.setup()
const progressKey = 'g1guru.progress.v1'
const stored = () => JSON.parse(localStorage.getItem(progressKey))

async function answerAll(u, n, pick = (i) => i) {
  for (let i = 0; i < n; i++) {
    const opts = screen.getAllByRole('radio')
    await u.click(opts[pick(i) % opts.length])
    const next = screen.queryByText('Next')
    if (next) await u.click(next)
  }
}

describe('App', () => {
  it('practice: answer 20 questions, see results, persist progress, try again, go home', async () => {
    const u = user()
    render(<App />)
    expect(screen.getByText(`${questions.length}`)).toBeInTheDocument()
    await u.click(screen.getByText('Road signs'))
    await u.click(screen.getByText('Start practice'))
    expect(screen.getByText('Question 1 of 20')).toBeInTheDocument()
    await answerAll(u, 20)
    await u.click(screen.getByText('See results'))
    expect(screen.getByText(/\d+\/20 \(\d+%\)/)).toBeInTheDocument()
    expect(Object.keys(stored().questions)).toHaveLength(20)
    expect(stored().exams).toHaveLength(0)

    await u.click(screen.getByText('Try again'))
    expect(screen.getByText('Question 1 of 20')).toBeInTheDocument()
    await u.click(screen.getByText('✕ Exit'))
    expect(screen.getByText('Start mock exam')).toBeInTheDocument()
  })

  it('practice: perfect score shows no missed questions', async () => {
    const u = user()
    render(<App />)
    await u.click(screen.getByText('Start practice'))
    for (let i = 0; i < 20; i++) {
      // find the question on screen by its exact option set, then click its answer
      const shown = screen.getAllByRole('radio').map((b) => b.textContent).sort().join('|')
      const q = questions.find((x) => [...x.options].sort().join('|') === shown)
      await u.click(screen.getByText(q.answer))
      await u.click(screen.queryByText('Next') ?? screen.getByText('See results'))
    }
    expect(screen.getByText('20/20 (100%)')).toBeInTheDocument()
    expect(screen.getByText('Perfect score!')).toBeInTheDocument()
  })

  it('sign quiz only has image questions and retries as a sign quiz', async () => {
    const u = user()
    render(<App />)
    await u.click(screen.getByText('Start sign quiz'))
    expect(screen.getByText('Road sign quiz')).toBeInTheDocument()
    for (let i = 0; i < 20; i++) {
      expect(screen.getByRole('img')).toBeInTheDocument()
      await u.click(screen.getAllByRole('radio')[0])
      await u.click(screen.queryByText('Next') ?? screen.getByText('See results'))
    }
    await u.click(screen.getByText('Try again'))
    expect(screen.getByText('Road sign quiz')).toBeInTheDocument()
  })

  it('official sample: all official questions, retry restarts the sample', async () => {
    const official = questions.filter((q) => q.official)
    expect(official).toHaveLength(8)
    const u = user()
    render(<App />)
    await u.click(screen.getByText('Start official sample'))
    expect(screen.getByText('Official sample questions')).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 8')).toBeInTheDocument()
    await answerAll(u, 8)
    await u.click(screen.getByText('See results'))
    await u.click(screen.getByText('Try again'))
    expect(screen.getByText('Official sample questions')).toBeInTheDocument()
  })

  it('mock exam: 40 questions, records history, retry restarts exam', async () => {
    const u = user()
    render(<App />)
    await u.click(screen.getByText('Start mock exam'))
    expect(screen.getByText('Question 1 of 40')).toBeInTheDocument()
    expect(screen.getByText('30:00')).toBeInTheDocument()
    await u.click(screen.getAllByRole('radio')[0])
    await u.click(screen.getByText('Finish (1/40)'))
    expect(confirm).toHaveBeenCalled()
    expect(screen.getByText(/Not yet/)).toBeInTheDocument()
    expect(stored().exams).toHaveLength(1)
    expect(stored().exams[0]).toMatchObject({ total: 40, passed: false })
    await u.click(screen.getByText('Try again'))
    expect(screen.getByText('Question 1 of 40')).toBeInTheDocument()
  })

  it('mock exam: declining the unanswered confirm keeps you in the exam', async () => {
    const u = user()
    render(<App />)
    await u.click(screen.getByText('Start mock exam'))
    confirm.mockReturnValue(false)
    await u.click(screen.getByText('Finish (0/40)'))
    expect(screen.getByText('Question 1 of 40')).toBeInTheDocument()
  })

  it('weak review picks only questions answered wrong last time', async () => {
    const rules = questions.filter((q) => q.category === 'rules').slice(0, 3)
    localStorage.setItem(progressKey, JSON.stringify({ questions: Object.fromEntries(rules.map((q) => [q.id, { seen: 1, correct: 0, lastCorrect: false }])), exams: [] }))
    const u = user()
    render(<App />)
    await u.click(screen.getByText('Rules of the road'))
    await u.click(screen.getByText('Review weak (3)'))
    expect(screen.getByText('Weak questions')).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()
  })

  it('progress screen shows history and can reset (with confirmation)', async () => {
    localStorage.setItem(progressKey, JSON.stringify({ questions: {}, exams: [{ date: '2026-01-01T00:00:00Z', correct: 33, total: 40, passed: true }] }))
    const u = user()
    render(<App />)
    await u.click(screen.getByText('View my progress'))
    expect(screen.getByText('33/40 Pass')).toBeInTheDocument()

    confirm.mockReturnValueOnce(false)
    await u.click(screen.getByText('Reset progress'))
    expect(screen.getByText('33/40 Pass')).toBeInTheDocument()

    confirm.mockReturnValueOnce(true)
    await u.click(screen.getByText('Reset progress'))
    expect(screen.getByText('No mock exams taken yet.')).toBeInTheDocument()
    expect(localStorage.getItem(progressKey)).toBeNull()

    await u.click(screen.getByText('← Back'))
    expect(screen.getByText('Start mock exam')).toBeInTheDocument()
  })
})
