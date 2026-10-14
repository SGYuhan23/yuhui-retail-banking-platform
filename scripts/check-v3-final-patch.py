#!/usr/bin/env python3
from v3_test_support import *
from v3_final_patch_checks import run_checks
first=reset();baseline=fingerprint(first)
run_checks()
final=reset()
check('FINAL PATCH reset restores unchanged seed, customers, events and costs',fingerprint(final)==baseline)
report={'result':'PASS','checks':checks,'demo':final['review']}
(ROOT/'verification/final-patch/targeted-acceptance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'result':'PASS','assertions':len(checks)},ensure_ascii=False))
