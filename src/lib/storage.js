// Progress persistence in localStorage (works offline).
const KEY = 'g1guru.progress.v1'

const empty = () => ({ questions: {}, exams: [] })

export function loadProgress(store = globalThis.localStorage) {
  try {
    const raw = store?.getItem(KEY)
    if (!raw) return empty()
    const p = JSON.parse(raw)
    return { questions: p.questions || {}, exams: p.exams || [] }
  } catch {
    return empty()
  }
}

export function saveProgress(p, store = globalThis.localStorage) {
  try {
    store?.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable or full: progress just won't persist */
  }
}

export function recordAnswers(progress, questions, answers) {
  const questionsStats = { ...progress.questions }
  for (const q of questions) {
    if (answers[q.id] === undefined) continue
    const s = questionsStats[q.id] || { seen: 0, correct: 0, lastCorrect: null }
    const ok = answers[q.id] === q.answer
    questionsStats[q.id] = { seen: s.seen + 1, correct: s.correct + (ok ? 1 : 0), lastCorrect: ok }
  }
  return { ...progress, questions: questionsStats }
}

export function recordExam(progress, result, date = new Date().toISOString()) {
  const entry = { date, correct: result.correct, total: result.total, passed: result.passed }
  return { ...progress, exams: [entry, ...progress.exams].slice(0, 50) }
}

export function summarize(progress, all) {
  const byCat = {}
  for (const q of all) {
    const c = (byCat[q.category] ||= { total: 0, seen: 0, seenCorrect: 0, mastered: 0 })
    c.total++
    const s = progress.questions[q.id]
    if (s && s.seen) {
      c.seen++
      if (s.lastCorrect) c.seenCorrect++
    }
    if (s?.lastCorrect) c.mastered++
  }
  return byCat
}

export function resetProgress(store = globalThis.localStorage) {
  try {
    store?.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
