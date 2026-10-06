#!/usr/bin/env python3
"""Validate src/data/questions.json: ids, options, answers, images, duplicates."""
import json, os, sys, collections

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(os.path.join(root, 'src/data/questions.json')))
errors = []
if [q['id'] for q in data] != list(range(1, len(data) + 1)):
    errors.append('ids are not sequential from 1')
seen = collections.Counter()
for q in data:
    i = q['id']
    if q.get('category') not in ('rules', 'road_signs'):
        errors.append(f'{i}: bad category')
    opts = q['options']
    if len(opts) != 4 or len(set(opts)) != 4:
        errors.append(f'{i}: need 4 distinct options')
    if q['answer'] not in opts:
        errors.append(f'{i}: answer not in options')
    if 'image' in q and not os.path.exists(os.path.join(root, 'public', q['image'])):
        errors.append(f'{i}: missing image {q["image"]}')
    key = (q['question'].strip().lower(), q.get('image'))
    seen[key] += 1
errors += [f'duplicate question: {k}' for k, v in seen.items() if v > 1]
used = {os.path.basename(q['image']) for q in data if 'image' in q}
for f in sorted(os.listdir(os.path.join(root, 'public/images'))):
    if f not in used:
        errors.append(f'unused image: {f}')
print(f'{len(data)} questions, {len(used)} images, {len(errors)} problems')
for e in errors:
    print(' -', e)
sys.exit(1 if errors else 0)
