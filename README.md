Master Ontario’s G1 test with 357 practice questions, mock exams, and road sign quizzes. Ace your G1 on your first try!

Prepare for the Ontario G1 driver’s test with G1 Guru, the ultimate study app for new drivers! Whether you’re a student, newcomer, or just refreshing your knowledge, G1 Guru makes learning the rules of the road easy, fun, and effective.

Features:
357 Practice Questions: Cover all categories, including road signs, traffic rules, parking, and safety.
Mock Exams: Simulate the real G1 test experience with timed, multiple-choice exams.
Road Sign Quizzes: Learn regulatory, warning, and information signs with images.
Instant Feedback & Explanations: Understand why each answer is correct or incorrect.
Track Your Progress: Monitor weak areas and watch your scores improve over time.
Offline Mode: Study anywhere, anytime — no internet required.
User-Friendly Interface: Clean, simple, and mobile-optimized for quick study sessions.
Why Choose G1 Guru?
Designed to match Ontario’s official Driver’s Handbook content
Helps you pass the G1 test confidently on your first attempt
Perfect for students, newcomers, and anyone preparing for their driver’s test

## Development

```bash
npm install
npm run dev        # start the app at http://localhost:5173
npm test           # unit + render tests
npm run validate   # check questions.json (answers, images, duplicates)
npm run build      # production build in dist/ (installable, works offline)
```

### How it works
- React + Vite single-page app; questions live in `src/data/questions.json`, sign images in `public/images/`.
- **Mock exam**: 40 questions (20 signs, 20 rules), 30-minute timer, 80% to pass.
- **Practice**: 20 questions with instant feedback and explanations; filter by category or review weak questions.
- **Sign quiz**: image questions taken from the Official MTO Driver's Handbook.
- **Progress**: saved in the browser (localStorage); stats by category, exam history, weak questions.
- **Offline**: a service worker precaches the app, questions and images so it works with no connection.

Sign images and rules are sourced from the Official MTO Driver's Handbook.
