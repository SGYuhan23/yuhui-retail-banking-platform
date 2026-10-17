"""Verify presentation, business source and data against the pre-refactor baseline."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'verification/internal-refactor/ui-invariants.json').read_text())
portability_path = root / 'verification/pages-release/portability-files.json'
portability = json.loads(portability_path.read_text()) if portability_path.exists() else {}
changed = []
for relative, expected in manifest['files'].items():
    if relative in portability:
        assert portability[relative]['before'] == expected, 'Portability override must identify the original baseline'
        expected = portability[relative]['after']
    path = root / relative
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        changed.append(relative)
editor = (root / 'yuhui-web/src/pages/RuleTreeEditor/index.tsx').read_text()
unchanged_segment = editor[editor.index('  const selectedNode ='):]
if hashlib.sha256(unchanged_segment.encode()).hexdigest() != manifest['editorInteractionAndRenderSha256']:
    changed.append('RuleTreeEditor interaction handlers / JSX')
print(json.dumps({'result': 'FAIL' if changed else 'PASS', 'protectedFiles': len(manifest['files']),
                  'editorInteractionAndRenderUnchanged': not changed, 'changed': changed}, ensure_ascii=False))
raise SystemExit(bool(changed))
