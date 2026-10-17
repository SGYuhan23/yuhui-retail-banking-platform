"""Repair known local demo label encoding; preserve business data and stock caches."""
from pathlib import Path
import subprocess
root = Path(__file__).resolve().parents[1]
compose = ['docker', 'compose', '-f', str(root / 'compose.local.yml'), 'exec', '-T']
mysql = compose + ['-e', 'MYSQL_PWD=yuhui_local_only', 'mysql', 'mysql', '-uroot', '--default-character-set=utf8mb4', '--batch', '--skip-column-names']
# Keep the pre-repair configuration text locally for recovery; never overwrite it.
backup = root / '.runtime' / 'rewards-labels-before-repair.tsv'
backup.parent.mkdir(exist_ok=True)
if not backup.exists():
    query = "SELECT 'activity',id,activity_name,activity_desc FROM marketing.activity; SELECT 'award',id,award_desc FROM marketing.award; SELECT 'activity_award',activity_id,award_id,award_title FROM marketing.activity_award;"
    result = subprocess.run(mysql, input=query, text=True, capture_output=True, check=True)
    backup.write_text(result.stdout)
subprocess.run(mysql, input=(root / 'infra/migration/08-rewards-label-encoding.sql').read_text(), text=True, check=True)
activity = '1989345533881966594'
awards = ['1989336435136356353','1989336788581965826','1989337375050522625','1989337465119006721','1989336702498070529','1989336928877240321','1989336991691137026','1989337068971188225','1934859819538202696']
keys = ['activity_of_' + activity, 'activity_award_list_' + activity, 'activity_award_list_all', 'activity_rule_weight_' + activity]
keys += ['award_of_' + item for item in awards]
keys += ['activity_award_of_' + activity + '_' + item for item in awards]
# Delete only descriptive configuration caches, never stock counters or quotas.
subprocess.run(compose + ['redis', 'redis-cli', 'DEL', *keys], check=True, stdout=subprocess.DEVNULL)
print('Known rewards labels checked; descriptive caches refreshed.')
