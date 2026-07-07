#!/usr/bin/env python3
"""Merge control, engines, and pair fields into data.json technologies."""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / 'data.json'

# name: (control, engines, pair)
MAPPING = {
    'Writing': ('child', ['substitution'], None),
    'Printing press': ('child', ['contamination'], None),
    'Novels': ('child', ['displacement', 'contamination'], None),
    'Railways': ('adult', [], None),
    'Telegraph': ('adult', [], None),
    'Telephone': ('adult', [], None),
    'Movies': ('child', ['contamination'], 'projection'),
    'Radio': ('child', ['contamination'], None),
    'Comic books': ('child', ['contamination'], None),
    'Television': ('child', ['displacement', 'contamination'], None),
    'Rock and roll': ('child', [], None),
    'Pocket calculator': ('child', ['substitution'], 'computation'),
    'Home video (VHS)': ('child', ['contamination'], None),
    'Personal computer': ('child', [], None),
    'Dungeons and Dragons': ('child', [], None),
    'Video games': ('child', ['displacement', 'contamination'], None),
    'Internet': ('child', ['displacement', 'integrity', 'contamination'], None),
    'Social media': ('child', ['displacement', 'contamination'], None),
    'Smartphones': ('child', ['displacement', 'contamination'], 'screens'),
    'Generative AI': ('child', ['substitution', 'displacement', 'integrity', 'contamination'], 'language'),
    'Paper': ('institution', [], None),
    'Hindu-Arabic numerals': ('institution', [], None),
    'Handwriting technologies': ('institution', ['substitution'], None),
    'Chess': ('child', ['displacement'], None),
    'Penny dreadfuls and dime novels': ('child', ['displacement', 'contamination'], None),
    'Phonograph and player piano': ('child', ['substitution'], None),
    'Sunday comic strips': ('child', ['contamination'], None),
    'Crossword puzzles': ('adult', ['displacement'], None),
    'Automation (cybernation)': ('adult', [], None),
    'Photocopier': ('institution', ['integrity'], None),
    'Walkman': ('child', ['displacement'], None),
    'Pagers': ('child', [], None),
    'Mobile-phone, Wi-Fi and 5G radiation': ('adult', [], None),
    'Virtual reality': ('child', [], None),
    'Texting and instant messaging': ('child', ['substitution'], None),
    'Wikipedia': ('child', ['integrity'], None),
    'GPS navigation': ('adult', ['substitution'], None),
    'Search engines': ('child', ['substitution'], None),
    '3D printing': ('adult', [], None),
    'Smart speakers and voice assistants': ('child', ['substitution'], None),
    'Fidget spinners': ('child', ['displacement'], None),
    'Spectacles': ('adult', [], None),
    'Blackboard and chalk': ('institution', [], None),
    'Braille': ('institution', [], None),
    'Penny post and correspondence education': ('adult', [], None),
    'Pencil with attached eraser': ('institution', [], None),
    'The school science laboratory': ('institution', [], None),
    'Mimeograph and spirit duplicators': ('institution', [], None),
    'Electric school clocks and bells': ('institution', [], None),
    'Slide rule': ('institution', [], 'computation'),
    'School building services': ('institution', [], None),
    'Filmstrip and slide projectors': ('institution', [], 'projection'),
    'Machine test scoring (IBM 805 to Scantron)': ('institution', [], None),
    'The yellow school bus': ('institution', [], None),
    'Overhead projector': ('institution', [], None),
    'Language laboratory': ('institution', [], None),
    'Educational programming environments (Logo to Scratch)': ('institution', [], None),
    'Assistive and accessibility technologies': ('institution', [], None),
    'Probeware and microcomputer-based labs': ('institution', [], None),
    'Classroom response systems (clickers to Kahoot)': ('institution', [], None),
    'Interactive whiteboards': ('institution', [], None),
    'Learning management systems': ('institution', [], None),
    'Plagiarism-detection services': ('institution', [], None),
    'Interactive science simulations (PhET)': ('institution', [], None),
    'Chromebooks and cloud classroom suites': ('institution', [], 'screens'),
    'Machine translation in the language classroom': ('child', ['substitution', 'integrity'], 'language'),
    'Videoconferencing and emergency remote teaching': ('institution', [], None),
}

# Data notes (preserved for schema documentation):
# - Personal computer: learning fear = yes but engines = [] because its learning fear was
#   exclusion (fear of not having it), unique in the dataset.
# - Home video (VHS): natural experiment — moral panic at home, model classroom technology at school.


def normalize_name(name: str) -> str:
    s = unicodedata.normalize('NFKC', name).lower().strip()
    s = s.rstrip('*').strip()
    s = s.replace('–', '-').replace('—', '-')
    s = re.sub(r'\s*\([^)]*\)\s*$', '', s).strip()
    s = re.sub(r'[^\w\s,-]+$', '', s).strip()
    return re.sub(r'\s+', ' ', s)


def first_two_words(name: str) -> str:
    base = normalize_name(name)
    words = [w for w in re.split(r'[\s,/]+', base) if w and w not in {'the', 'a', 'an'}]
    if len(words) >= 2:
        return f'{words[0]} {words[1]}'
    return words[0] if words else base


def build_lookup():
    exact = {}
    prefix = {}
    for key, value in MAPPING.items():
        norm = normalize_name(key)
        exact[norm] = (key, value)
        two = first_two_words(key)
        prefix.setdefault(two, []).append((key, value))
    return exact, prefix


def match_entry(name: str, exact, prefix):
    norm = normalize_name(name)
    if norm in exact:
        return exact[norm]

    two = first_two_words(name)
    candidates = prefix.get(two, [])
    if len(candidates) == 1:
        return candidates[0]

    for key, value in candidates:
        if normalize_name(key) == norm:
            return key, value

    return None, None


def verify(technologies):
    errors = []
    with_control = [t for t in technologies if t.get('control')]
    if len(with_control) != 67:
        errors.append(f'expected 67 entries with control, got {len(with_control)}')

    counts = {'child': 0, 'adult': 0, 'institution': 0}
    for t in with_control:
        counts[t['control']] = counts.get(t['control'], 0) + 1
    expected_counts = {'child': 30, 'adult': 10, 'institution': 27}
    for k, v in expected_counts.items():
        if counts.get(k) != v:
            errors.append(f'control count {k}: expected {v}, got {counts.get(k, 0)}')

    learning_yes = [t for t in technologies if t.get('fears', {}).get('Learning') == 'Yes']
    if len(learning_yes) != 23:
        errors.append(f'learning fear Yes: expected 23, got {len(learning_yes)}')

    learning_by_control = {'child': 0, 'adult': 0, 'institution': 0}
    for t in learning_yes:
        c = t.get('control')
        if c in learning_by_control:
            learning_by_control[c] += 1
    if learning_by_control != {'child': 20, 'adult': 2, 'institution': 1}:
        errors.append(f'learning Yes by control: expected child 20 adult 2 institution 1, got {learning_by_control}')

    high_dial = [t for t in technologies if (t.get('dial') or 0) >= 3]
    if len(high_dial) != 12:
        errors.append(f'dial >= 3: expected 12, got {len(high_dial)}')
    if any(t.get('control') != 'child' for t in high_dial):
        errors.append('dial >= 3: not all control = child')

    for group in ('institution', 'adult'):
        max_dial = max((t.get('dial') or 0) for t in technologies if t.get('control') == group)
        if max_dial != 2:
            errors.append(f'max dial for {group}: expected 2, got {max_dial}')

    return errors


def main():
    exact, prefix = build_lookup()
    data = json.loads(DATA_PATH.read_text(encoding='utf-8'))
    technologies = data['technologies']

    unmatched_entries = []
    matched_keys = set()

    for tech in technologies:
        key, value = match_entry(tech['name'], exact, prefix)
        if not value:
            unmatched_entries.append(tech['name'])
            continue

        matched_keys.add(key)
        control, engines, pair = value
        tech['control'] = control
        tech['engines'] = engines
        if pair:
            tech['pair'] = pair
        elif 'pair' in tech:
            del tech['pair']

    unmatched_keys = sorted(set(MAPPING.keys()) - matched_keys)

    if unmatched_entries:
        print('WARNING: entries without control value:', unmatched_entries)
    if unmatched_keys:
        print('WARNING: mapping keys with no match:', unmatched_keys)

    verify_errors = verify(technologies)
    if verify_errors:
        print('VERIFY FAILED:')
        for err in verify_errors:
            print(' -', err)
        raise SystemExit(1)

    print('Verify OK: 67 entries, control child 30 / adult 10 / institution 27')

    if 'meta' not in data:
        data['meta'] = {}
    data['meta']['schemaNotes'] = [
        'Personal computer has learning fear = yes but engines = [] because its learning fear was exclusion (fear of not having it), unique in the dataset.',
        'Home video (VHS) is its own natural experiment: the same device was a moral panic at home and a model classroom technology at school.'
    ]

    DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Wrote {DATA_PATH}')


if __name__ == '__main__':
    main()
