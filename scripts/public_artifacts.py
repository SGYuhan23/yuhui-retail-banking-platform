"""One publication policy shared by exporter and verifier."""
from pathlib import Path

# runtime here is root-only: the Maven runtime source module must remain.
ROOT_BLOCKED = {'data', 'runtime', 'temp', 'cache', 'scratch', 'zip', 'legacy-review', '.runtime'}
ANY_BLOCKED = {'.git', 'node_modules', 'target', 'dist', '.umi', '.umi-production', '__pycache__', '.idea', '.vscode', '.DS_Store', '.local-config'}
INTERNAL_DOCS = {'legacy-refactor-audit.md', 'legacy-refactor-result.md', '简历与面试说明.md', 'public-release-final-audit.md', 'github-public-final-report.md', 'public-hygiene-final-audit.md'}

def exclusion(relative):
    p = Path(relative)
    if str(p) in {"verification/final-patch/backend-build.log", "verification/final-patch/backend-tests.log"}: return "obsolete build evidence"
    if p.parts[0] in ROOT_BLOCKED: return 'local runtime or working directory'
    if ANY_BLOCKED.intersection(p.parts): return 'build, dependency or IDE artifact'
    if 'legacy-refactor' in p.parts or p.name in INTERNAL_DOCS: return 'internal refactor or career material'
    if p.suffix.lower() in {'.zip', '.pyc', '.class', '.map'}: return 'generated artifact'
    if p.suffix == '.log' and p.parts[:2] != ('verification', 'final-patch'): return 'runtime log outside formal evidence whitelist'
    if p.name.startswith('.env') and p.name != '.env.example': return 'private environment file'
    return None

def public_files(root):
    for p in sorted(root.rglob('*')):
        if p.is_file() and not p.is_symlink() and not exclusion(p.relative_to(root)):
            yield p
