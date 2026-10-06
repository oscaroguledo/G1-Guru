import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Quiz from './Quiz.jsx'

const qs = [
  { id: 1, question: 'First?', options: ['Right', 'Wrong'], answer: 'Right', explanation: 'Because.' },
  { id: 2, question: 'Second?', options: ['Yes', 'No'], answer: 'Yes', image: 'images/stop.jpg' },
  { id: 3, question: 'Third?', options: ['Up', 'Down'], answer: 'Up' },
]

describe('Quiz (practice)', () => {
  it('gives instant feedback, locks answers, requires an answer to continue', async () => {
    const onFinish = vi.fn()
    const user = userEvent.setup()
    render(<Quiz title="Practice" mode="practice" questions={qs} onFinish={onFinish} onExit={() => {}} />)
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    expect(screen.getByText('Next')).toBeDisabled()
    expect(screen.queryByText(/^\d+:\d\d$/)).not.toBeInTheDocument()

    await user.click(screen.getByText('Wrong'))
    expect(screen.getByText('Incorrect. Answer: Right')).toBeInTheDocument()
    expect(screen.getByText('Because.')).toBeInTheDocument()
    await user.click(screen.getByText('Right')) // locked: ignored
    expect(screen.getByText('Incorrect. Answer: Right')).toBeInTheDocument()

    await user.click(screen.getByText('Next'))
    expect(screen.getByAltText('Road sign or signal to identify')).toHaveAttribute('src', 'images/stop.jpg')
    await user.click(screen.getByText('Yes'))
    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.queryByText('Because.')).not.toBeInTheDocument()

    await user.click(screen.getByText('Next'))
    expect(screen.getByText('See results')).toBeDisabled()
    await user.click(screen.getByText('Up'))
    await user.click(screen.getByText('See results'))
    expect(onFinish).toHaveBeenCalledWith({ 1: 'Wrong', 2: 'Yes', 3: 'Up' })
  })

  it('exit asks for confirmation', async () => {
    const onExit = vi.fn()
    const confirm = vi.spyOn(window, 'confirm')
    const user = userEvent.setup()
    render(<Quiz title="Practice" mode="practice" questions={qs} onFinish={() => {}} onExit={onExit} />)
    confirm.mockReturnValueOnce(false)
    await user.click(screen.getByText('✕ Exit'))
    expect(onExit).not.toHaveBeenCalled()
    confirm.mockReturnValueOnce(true)
    await user.click(screen.getByText('✕ Exit'))
    expect(onExit).toHaveBeenCalledOnce()
    confirm.mockRestore()
  })
})

describe('Quiz (exam)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const tick = (s) => { for (let i = 0; i < s; i++) act(() => vi.advanceTimersByTime(1000)) }
  const click = (el) => fireEvent.click(el)

  it('counts down, warns near the end and auto-submits at zero', () => {
    const onFinish = vi.fn()
    render(<Quiz title="Mock exam" mode="exam" questions={qs} minutes={3} onFinish={onFinish} onExit={() => {}} />)
    expect(screen.getByText('3:00')).toBeInTheDocument()
    expect(screen.getByText('3:00')).not.toHaveClass('warn')
    click(screen.getByText('Right'))
    tick(61)
    expect(screen.getByText('1:59')).toHaveClass('warn')
    tick(119)
    expect(onFinish).toHaveBeenCalledWith({ 1: 'Right' })
  })

  it('lets you navigate, change answers and finish; confirms when unanswered', () => {
    const onFinish = vi.fn()
    const confirm = vi.spyOn(window, 'confirm')
    render(<Quiz title="Mock exam" mode="exam" questions={qs} minutes={30} onFinish={onFinish} onExit={() => {}} />)
    expect(screen.getByText('Previous')).toBeDisabled()
    expect(screen.queryByText('Correct!')).not.toBeInTheDocument()
    click(screen.getByText('Wrong'))
    expect(screen.queryByText(/Incorrect/)).not.toBeInTheDocument() // no feedback in exam
    click(screen.getByText('Right')) // can change
    click(screen.getByText('Next'))
    click(screen.getByText('Previous'))
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()

    confirm.mockReturnValueOnce(false)
    click(screen.getByText('Finish (1/3)'))
    expect(onFinish).not.toHaveBeenCalled()
    expect(confirm).toHaveBeenCalledWith('2 question(s) unanswered. Finish anyway?')

    confirm.mockReturnValueOnce(true)
    click(screen.getByText('Finish (1/3)'))
    expect(onFinish).toHaveBeenCalledWith({ 1: 'Right' })

    onFinish.mockClear()
    click(screen.getByText('Next'))
    click(screen.getByText('Yes'))
    click(screen.getByText('Next'))
    click(screen.getByText('Up'))
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
    click(screen.getByText('Finish (3/3)'))
    expect(onFinish).toHaveBeenCalledWith({ 1: 'Right', 2: 'Yes', 3: 'Up' })
    confirm.mockRestore()
  })
})
