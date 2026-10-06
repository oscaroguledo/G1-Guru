// Pure quiz helpers: shuffling, question selection, scoring.

export const EXAM_SIZE = 40
export const EXAM_SIGNS = 20
export const EXAM_MINUTES = 30
export const PASS_RATE = 0.8

export function shuffle(list, rand = Math.random) {
  const a = list.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function withShuffledOptions(q, rand = Math.random) {
  return { ...q, options: shuffle(q.options, rand) }
}

export function pick(list, n, rand = Math.random) {
  return shuffle(list, rand).slice(0, n)
}

export function buildExam(all, rand = Math.random) {
  const signs = all.filter((q) => q.category === 'road_signs')
  const rules = all.filter((q) => q.category === 'rules')
  const picked = [...pick(signs, EXAM_SIGNS, rand), ...pick(rules, EXAM_SIZE - EXAM_SIGNS, rand)]
  return shuffle(picked, rand).map((q) => withShuffledOptions(q, rand))
}

export function buildPractice(all, { category = 'all', weakOnly = false, stats = {}, size = 20 } = {}, rand = Math.random) {
  let pool = category === 'all' ? all : all.filter((q) => q.category === category)
  if (weakOnly) {
    const weak = pool.filter((q) => {
      const s = stats[q.id]
      return s && s.seen > 0 && s.lastCorrect === false
    })
    if (weak.length) pool = weak
  }
  return pick(pool, size, rand).map((q) => withShuffledOptions(q, rand))
}

export function score(questions, answers) {
  let correct = 0
  const missed = []
  for (const q of questions) {
    if (answers[q.id] === q.answer) correct++
    else missed.push(q)
  }
  const total = questions.length
  const pct = total ? correct / total : 0
  return { correct, total, pct, passed: pct >= PASS_RATE, missed }
}
