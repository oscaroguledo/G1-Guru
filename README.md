# G1 Guru

**Free practice for the Ontario G1 knowledge test** — 357 questions, a timed mock exam, a road-sign quiz and progress tracking. Works offline, runs in any browser, no account and no ads.

[![CI](https://github.com/oscaroguledo/G1-Guru/actions/workflows/ci.yml/badge.svg)](https://github.com/oscaroguledo/G1-Guru/actions/workflows/ci.yml)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Questions](https://img.shields.io/badge/questions-357-blue)

> **Not affiliated with the Ontario government.** G1 Guru is an independent study aid built from the *Official MTO Driver's Handbook*. Always check the current handbook and [ontario.ca](https://www.ontario.ca/page/get-g1-licence) for the rules and for the exact test format.

---

## Contents

- [What's inside](#whats-inside)
- [Using G1 Guru to prepare](#using-g1-guru-to-prepare)
- [Run it](#run-it)
- [Where the questions come from](#where-the-questions-come-from)
- [For developers](#for-developers)
- [Accuracy and limitations](#accuracy-and-limitations)

## What's inside

| | |
|---|---|
| **Mock exam** | 40 random questions (20 road signs + 20 rules of the road), 30-minute timer, 80% (32/40) to pass. Move back and forth, change answers, and review every miss at the end. |
| **Practice mode** | 20 questions at a time with instant right/wrong feedback and a short explanation. Pick all topics, rules only, or signs only. |
| **Road-sign quiz** | 109 picture questions: regulatory, warning, construction and information signs, traffic lights, flashing beacons and pedestrian signals. |
| **Weak-question review** | One tap to re-drill the questions you last got wrong. |
| **Progress tracking** | Accuracy by topic, mock-exam history and your weak list — saved privately in your browser. |
| **Offline** | Install it to your phone or computer and study with no connection. |

**Question bank:** 357 questions — 211 rules of the road and 146 road-sign/signal questions (109 with pictures). Answer order is reshuffled every time you start a quiz, so you can't memorise positions.

## Using G1 Guru to prepare

A study plan that works for most people (about two weeks):

1. **Read the handbook first.** Skim the [Official MTO Driver's Handbook](https://www.ontario.ca/document/official-mto-drivers-handbook), especially *Signs, lights and pavement markings*, *Sharing the road*, and *Driving in different conditions*.
2. **Learn the signs.** Do the **Road sign quiz** a few times. Shapes and colours carry meaning: red/white regulatory, yellow warning, orange construction, green direction, blue services.
3. **Practise by topic.** Use **Practice** mode. After each answer, read the explanation — don't just click through.
4. **Fix your weak spots.** Use **Review weak** until that list is empty.
5. **Test yourself.** Take a **Mock exam** under real conditions: no notes, no phone, one sitting. Aim for **90%+ on three mock exams in a row** before you book the real test.
6. **Book your test** at a DriveTest centre and bring your ID (see ontario.ca for accepted documents and fees).

**Tips for test day:** read the whole question and every option before answering; if two answers look right, choose the safer, more cautious one.

## Run it

### Use it online

If a hosted copy is available it is published from this repository to GitHub Pages (see [Deploying](#deploying)).

### Run it on your own computer

You need [Node.js](https://nodejs.org) 20.19 or newer (or 22.12+).

```bash
git clone https://github.com/oscaroguledo/G1-Guru.git
cd G1-Guru
npm install
npm run dev
```

Open the address it prints (usually <http://localhost:5173>).

### Install it as an app (offline)

Build and serve the production version, open it once while online, then use your browser's **Install** / **Add to Home Screen** option:

```bash
npm run build
npm run preview
```

After the first visit the app, all questions and all sign images are cached, so it works without internet. Your progress is stored on your device only (browser `localStorage`) — nothing is sent anywhere. Clearing your browser data or using **Reset progress** erases it.

## Where the questions come from

- Rules questions are based on the **Official Ministry of Transportation (MTO) Driver's Handbook** (print version dated 19 Feb 2025) and have been checked against its text — distances, times, penalties and G1 conditions.
- Every sign, signal and pedestrian-light picture is extracted from that handbook and matched to the handbook's own caption.
- Where the handbook is the source for a number (for example *2 seconds* following distance, *5 m* from railway tracks, *30 m* around a pedestrian crossover), the question uses the handbook's figure.

## For developers

**Stack:** React 19 · Vite 8 · Vitest + Testing Library · vite-plugin-pwa (service worker/offline).

```
src/
  App.jsx               screen routing + saving results
  components/           Home, Quiz, Results, Progress
  lib/quiz.js           shuffling, mock-exam/practice selection, scoring
  lib/storage.js        localStorage progress (answers, exam history)
  data/questions.json   the question bank
public/images/          sign and signal pictures
scripts/validate.py     standalone data checker
```

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | Run all tests |
| `npm run coverage` | Tests with coverage — **fails below 100%** statements, branches, functions and lines |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serve the production build |
| `npm run validate` | Python check of `questions.json` and images |

### Tests

The suite (46 tests) covers the quiz logic, storage, every screen, full end-to-end flows through the app (practice, sign quiz, mock exam, weak review, progress reset, timer expiry) and **content integrity**: 4 distinct options per question, the answer is always among the options, no duplicate questions, and every image exists and is used. Coverage is enforced at 100% in CI.

### Question format

```json
{
  "id": 42,
  "category": "road_signs",
  "question": "What does this sign mean?",
  "image": "images/no-left-turn.jpg",
  "options": ["…", "…", "…", "…"],
  "answer": "Do not turn left at the intersection",
  "explanation": "Optional text shown after answering."
}
```

`category` is `rules` or `road_signs`; `image` and `explanation` are optional. To add a question, edit `src/data/questions.json`, keep ids sequential, and run `npm test`.

### Deploying

The `Deploy to GitHub Pages` workflow builds and publishes `dist/`. In the repository settings choose **Pages → Source: GitHub Actions**, then run the workflow from the **Actions** tab. Any static host (Netlify, Cloudflare Pages, S3) also works — upload the contents of `dist/`.

### Contributing

Found a wrong answer or an unclear question? Open an issue or pull request with the handbook section that supports the correction. Please keep wrong options plausible and similar in length to the correct one.

## Accuracy and limitations

- Passing G1 Guru's mock exam does not guarantee passing the real test. The real test's questions and format are set by the Ontario government and can change; the 40-question / 80% format used here is a common study standard, so confirm the current format on ontario.ca.
- Road rules change. The content follows the handbook edition above; check the current online handbook for updates.
- Sign pictures are small (about 170 px wide in the source handbook) and are upscaled for display.
