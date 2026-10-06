import { useCallback, useState } from 'react'
import questions from './data/questions.json'
import { buildExam, buildPractice, score, EXAM_MINUTES } from './lib/quiz'
import { loadProgress, recordAnswers, recordExam, resetProgress, saveProgress } from './lib/storage'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import Progress from './components/Progress.jsx'

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [view, setView] = useState({ name: 'home' })

  const update = useCallback((next) => {
    setProgress(next)
    saveProgress(next)
  }, [])

  const start = (mode, opts = {}) => {
    const retry = [mode, opts]
    if (mode === 'exam') {
      setView({ name: 'quiz', mode, title: 'Mock exam', retry, questions: buildExam(questions), minutes: EXAM_MINUTES })
    } else if (mode === 'sample') {
      const official = questions.filter((q) => q.official)
      setView({ name: 'quiz', mode: 'practice', title: 'Official sample questions', retry, questions: buildPractice(official, { size: official.length }) })
    } else if (mode === 'signs') {
      setView({
        name: 'quiz',
        mode: 'practice',
        title: 'Road sign quiz',
        retry,
        questions: buildPractice(questions.filter((q) => q.image), { size: opts.size ?? 20, stats: progress.questions, weakOnly: opts.weakOnly }),
      })
    } else {
      setView({
        name: 'quiz',
        mode: 'practice',
        title: opts.weakOnly ? 'Weak questions' : 'Practice',
        retry,
        questions: buildPractice(questions, { category: opts.category, weakOnly: opts.weakOnly, stats: progress.questions, size: opts.size ?? 20 }),
      })
    }
  }

  const finish = (qs, answers, mode, title, retry) => {
    let next = recordAnswers(progress, qs, answers)
    const result = score(qs, answers)
    if (mode === 'exam') next = recordExam(next, result)
    update(next)
    setView({ name: 'results', result, questions: qs, answers, mode, title, retry })
  }

  const home = () => setView({ name: 'home' })

  return (
    <main className="app">
      {view.name === 'home' && <Home progress={progress} all={questions} onStart={start} onProgress={() => setView({ name: 'progress' })} />}
      {view.name === 'quiz' && (
        <Quiz
          key={view.questions.map((q) => q.id).join(',')}
          title={view.title}
          mode={view.mode}
          questions={view.questions}
          minutes={view.minutes}
          onFinish={(answers) => finish(view.questions, answers, view.mode, view.title, view.retry)}
          onExit={home}
        />
      )}
      {view.name === 'results' && (
        <Results
          view={view}
          onHome={home}
          onRetry={() => start(...view.retry)}
        />
      )}
      {view.name === 'progress' && (
        <Progress
          progress={progress}
          all={questions}
          onBack={home}
          onReset={() => {
            if (window.confirm('Erase all saved progress on this device?')) {
              resetProgress()
              setProgress(loadProgress())
            }
          }}
        />
      )}
    </main>
  )
}
