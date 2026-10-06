import { it, expect } from 'vitest'

it('mounts the app into #root', async () => {
  document.body.innerHTML = '<div id="root"></div>'
  await import('./main.jsx')
  await new Promise((r) => setTimeout(r, 0))
  expect(document.querySelector('#root h1').textContent).toBe('G1 Guru')
})
