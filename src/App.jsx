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
    if (mode === 'exam') {
      setView({ name: 'quiz', mode, title: 'Mock exam', questions: buildExam(questions), minutes: EXAM_MINUTES })
    } else if (mode === 'signs') {
      setView({
        name: 'quiz',
        mode: 'practice',
        title: 'Road sign quiz',
        questions: buildPractice(questions.filter((q) => q.image), { size: opts.size ?? 20, stats: progress.questions, weakOnly: opts.weakOnly }),
      })
    } else {
      setView({
        name: 'quiz',
        mode: 'practice',
        title: opts.weakOnly ? 'Weak questions' : 'Practice',
        questions: buildPractice(questions, { category: opts.category, weakOnly: opts.weakOnly, stats: progress.questions, size: opts.size ?? 20 }),
      })
    }
  }

  const finish = (qs, answers, mode, title) => {
    let next = recordAnswers(progress, qs, answers)
    const result = score(qs, answers)
    if (mode === 'exam') next = recordExam(next, result)
    update(next)
    setView({ name: 'results', result, questions: qs, answers, mode, title })
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
          onFinish={(answers) => finish(view.questions, answers, view.mode, view.title)}
          onExit={home}
        />
      )}
      {view.name === 'results' && (
        <Results
          view={view}
          onHome={home}
          onRetry={() => (view.mode === 'exam' ? start('exam') : view.title === 'Road sign quiz' ? start('signs') : start('practice'))}
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
