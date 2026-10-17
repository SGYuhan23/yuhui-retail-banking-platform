"""Inventory reference overlap. Scores are review signals, never licensing conclusions."""
import argparse
import hashlib
import json
import re
import subprocess
import zipfile
from collections import defaultdict
from pathlib import Path

EXTENSIONS = {'.java', '.ts', '.tsx', '.js', '.jsx', '.xml', '.sql', '.less', '.css'}
# Preserve quoted strings (including URLs) before recognizing comments.
LEXEMES = re.compile(
    r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`'
    r'|/\*[\s\S]*?\*/|//[^\n]*|<!--[\s\S]*?-->|[\w$]+|[^\s\w]',
)


def signature(content, suffix):
    parts = [m.group() for m in LEXEMES.finditer(content)]
    parts = [p for p in parts if not p.startswith(('/*', '//', '<!--'))]
    if suffix == '.java':
        # Package migration and import ordering do not count as implementation changes.
        kept, declaration = [], False
        for part in parts:
            if part in ('package', 'import'):
                declaration = True
            elif declaration and part == ';':
                declaration = False
            elif not declaration:
                kept.append(part)
        parts = kept
    shingles = {tuple(parts[i:i + 5]) for i in range(max(0, len(parts) - 4))}
    return parts, shingles


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reference', action='append', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    references, archives = defaultdict(list), []
    for archive in args.reference:
        with zipfile.ZipFile(archive) as bundle:
            archives.append({
                'name': archive.name,
                'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
                'license_named_files': [n for n in bundle.namelist()
                                        if re.search(r'(^|/)(license|copying|notice)(\.|$)', n, re.I)],
            })
            for entry in bundle.namelist():
                suffix = Path(entry).suffix
                if suffix not in EXTENSIONS:
                    continue
                raw = bundle.read(entry)
                tokens, shingles = signature(raw.decode('utf8', errors='replace'), suffix)
                references[suffix].append((entry, raw, tokens, shingles))
    rows = []
    # Git inventory excludes dependencies, build output and local secrets.
    inventory = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
    for relative in inventory:
        path = root / relative
        if not relative.startswith(('yuhui-server/', 'yuhui-web/', 'infra/')):
            continue
        if path.suffix not in EXTENSIONS or not path.is_file():
            continue
        raw = path.read_bytes()
        tokens, shingles = signature(raw.decode('utf8', errors='replace'), path.suffix)
        if len(tokens) < 100:
            continue
        candidates = []
        for entry, ref_raw, ref_tokens, ref_shingles in references[path.suffix]:
            denominator = len(shingles) + len(ref_shingles)
            score = 2 * len(shingles & ref_shingles) / denominator if denominator else 0
            candidates.append((score, entry, raw == ref_raw, tokens == ref_tokens))
        if not candidates:
            continue
        score, entry, exact, normalized = max(candidates)
        rows.append({'path': relative, 'reference': entry, 'tokens': len(tokens),
                     'shingle_dice': round(score, 4), 'byte_identical': exact,
                     'normalized_identical': normalized,
                     'review': 'HIGH_OVERLAP' if score >= .8 else 'REVIEW_CONTEXT'})
    rows.sort(key=lambda row: (-row['shingle_dice'], -row['tokens']))
    report = {
        'method': 'Best match across all reference files of the same extension; Dice of 5-token shingles.',
        'limitations': ['Only files with at least 100 tokens are scored.',
                       'Comments, whitespace and Java package/import declarations are excluded.',
                       'Shared syntax and boilerplate can produce high scores.',
                       'Low scores do not establish independent authorship or permission to publish.',
                       'License filename inventory is not a complete rights investigation.'],
        'references': archives,
        'summary': {'scored': len(rows), 'high_overlap': sum(r['shingle_dice'] >= .8 for r in rows),
                    'byte_identical': sum(r['byte_identical'] for r in rows),
                    'normalized_identical': sum(r['normalized_identical'] for r in rows)},
        'files': rows,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report['summary'], ensure_ascii=False))


if __name__ == '__main__':
    main()
