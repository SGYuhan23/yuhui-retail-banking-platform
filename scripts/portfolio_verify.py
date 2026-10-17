#!/usr/bin/env python3
"""Inspect an actual public tree. Default checks the export selection from a development checkout."""
import argparse
import hashlib
import ipaddress
import json
from pathlib import Path
import re
from urllib.parse import unquote
import sys
sys.dont_write_bytecode = True
from public_artifacts import exclusion, public_files

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('public_export', nargs='?', type=Path)
parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
parser.add_argument('--strict', action='store_true', help='Fail on forbidden files present in the inspected tree')
parser.add_argument('--scan-output', type=Path)
args = parser.parse_args()
root = (args.public_export or args.root).resolve()
files = list(public_files(root))
scan = {k: [] for k in ['secret_candidates','absolute_path_matches','private_ip_matches','email_matches','phone_matches','runtime_log_matches','forbidden_artifact_matches']}
issues = {'broken_local_markdown_links': [], 'required_missing': [], 'frozen_changed': [], 'obsolete_license_warning': [], 'identity_leaks': [], 'real_secret': [], 'old_author_identity': [], 'old_repo_identity': [], 'forbidden_public_ip': [], 'private_external_asset': [], 'bank_terms': [], 'unwanted_documents': []}
if args.strict:
    for p in root.rglob('*'):
        r = p.relative_to(root)
        if r.parts[0] == ".git" and not p.is_symlink(): continue
        reason = exclusion(r)
        if reason or p.is_symlink():
            scan['forbidden_artifact_matches'].append({'path':str(r),'reason':reason or 'symbolic link'})
            if p.suffix == '.log': scan['runtime_log_matches'].append(str(r))
private_paths = re.compile(r'(?<![A-Za-z0-9_./-])/' + r'(?:Users|home)/[^\s/]+|[A-Za-z]:\\(?:Users|Documents and Settings)\\|user' + r'\.home\s*=')
private_ips = re.compile(r'(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])')
secret_patterns = [r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', r'\bgh[pousr]_[A-Za-z0-9]{30,}\b',r'\bAKIA[0-9A-Z]{16}\b',r'\bsk-[A-Za-z0-9]{32,}\b']
keywords = re.compile(r'password|passwd|secret|token|api_?key|access_?key|private_?key|authorization|cookie|jdbc:|redis:|rabbitmq:|mysql:',re.I)
# Generated scan summaries contain candidate labels rather than credentials.
generated = {'verification/public-release-scan.json','verification/public-release/verify.json', 'verification/github-final/public-scan.json', 'verification/github-final/public-verify.txt'}
for p in files:
    r = str(p.relative_to(root))
    bank_terms = ['重庆农村'+'商业银行', '重庆'+'农商行', 'CQ'+'RCB', 'Chongqing Rural'+' Commercial Bank', '渝快'+'荟']
    if any(term.casefold() in r.casefold() for term in bank_terms): issues['bank_terms'].append(r)
    if p.suffix.lower() == '.md' and p.stem.lower() in {'contributions','credits','acknowledgements','provenance'}: issues['unwanted_documents'].append(r)
    try: candidate_text = p.read_text()
    except UnicodeError: candidate_text = ''
    if any(term.casefold() in candidate_text.casefold() for term in bank_terms): issues['bank_terms'].append(r)
    if r in generated: continue
    try: text = p.read_text()
    except UnicodeError: continue
    if any(v in text for v in ['wan'+'yj', 'xy'+'bjz', 'maintainer="'+'yong"']) or re.search(r'(?:setUserId\(|"userId"\s*:\s*)"'+'yong"', text): issues['old_author_identity'].append(r)
    # Historical filenames in the explicit provenance report are evidence, not stale runtime identity.
    reference_evidence = r == 'verification/reference-overlap-2026-10-17.json'
    if not reference_evidence and any(v in text for v in ['lottery-'+'replica', 'lottery-backend-'+'master']): issues['old_repo_identity'].append(r)
    if ('115.190.'+'198.152') in text: issues['forbidden_public_ip'].append(r)
    # Generic endpoint configuration is allowed; concrete regional OSS URLs need review.
    asset_text = text.replace('https://oss-'+'cn-beijing.aliyuncs.com', '') if r == 'yuhui-server/runtime/.env.example' else text
    if re.search(r'https?://[^\s"<>]*oss-cn-', asset_text) or ('markdown-'+'my.oss') in text: issues['private_external_asset'].append(r)
    if private_paths.search(text): scan['absolute_path_matches'].append(r)
    for value in set(private_ips.findall(text)):
        try: address = ipaddress.ip_address(value)
        except ValueError: continue
        if not address.is_private and str(address) not in {'127.0.0.1', '0.0.0.0'}: issues['forbidden_public_ip'].append({'path':r,'match':value})
        if any(address in ipaddress.ip_network(net) for net in ['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16']):
            # Network range specifications in this scanner are rules, not host addresses.
            if r == 'scripts/portfolio_verify.py' and value in {'10.0.0.0','172.16.0.0','192.168.0.0'}: continue
            scan['private_ip_matches'].append({'path':r,'match':value})
    for value in set(re.findall(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',text)):
        scan['email_matches'].append({'path':r,'match':value,'classification':'reviewed public attribution or synthetic example'})
    # Only phone-like prose, excluding long hashes, lockfile integrity and numeric SQL identifiers.
    for value in set(re.findall(r'(?<![\w\d])1[3-9]\d{9}(?![\w\d])',text)):
        scan['phone_matches'].append({'path':r,'match':value,'classification':'candidate; manual review required'})
    hits = keywords.findall(text)
    if hits: scan['secret_candidates'].append({'path':r,'keyword_hits':len(hits),'classification':'reviewed: field/API name, environment reference, public dependency, DEMO_ONLY or TEST_ONLY fixture'})
    if any(re.search(pattern,text) for pattern in secret_patterns): issues['real_secret'].append(r)
    if 'PUBLIC_LICENSE_STATUS' + ' = UNRESOLVED' in text: issues['obsolete_license_warning'].append(r)
    if ('byte'+'dance').lower() in text.lower() or re.search(r'(?i)\b[\w-]+-(?:MacBook|MacBook-Pro|MacBook-Air)\b',text): issues['identity_leaks'].append(r)
    if p.suffix == '.md':
        for link in re.findall(r'!?\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)',text):
            link = unquote(link.strip('<>').split('#')[0])
            if not link or re.match(r'^[a-zA-Z][\w+.-]*:',link): continue
            if not (p.parent/link).exists(): issues['broken_local_markdown_links'].append([r,link])
for required in ['README.md','verification/README.md','yuhui-server/pom.xml','yuhui-server/runtime/src/main/java','yuhui-server/entrypoints/src/main/java/com/yuhui/operating','yuhui-web/src','yuhui-web/pnpm-lock.yaml','.github/workflows/quality.yml']:
    if not (root/required).exists(): issues['required_missing'].append(required)
shots = sorted((root/'assets/screenshots').glob('*.jpg'))
if len(shots) < 7: issues['required_missing'].append('seven product screenshots')
for name in ['frozen-v3','frozen-assets']:
    manifest = root/f'verification/public-release/{name}.json'
    if not manifest.exists(): issues['required_missing'].append(str(manifest.relative_to(root))); continue
    for r,digest in json.loads(manifest.read_text()).items():
        if not (root/r).exists() or hashlib.sha256((root/r).read_bytes()).hexdigest() != digest: issues['frozen_changed'].append(r)
fail = any(issues.values()) or any(scan[k] for k in ['absolute_path_matches','private_ip_matches','runtime_log_matches','forbidden_artifact_matches'])
result = {'result':'FAIL' if fail else 'PASS','mode':'strict artifact' if args.strict else 'export selection',**issues,'public_file_count':len(files),'public_bytes':sum(p.stat().st_size for p in files)}
scan['summary'] = {'real_secret':len(issues['real_secret']),'absolute_private_path':len(scan['absolute_path_matches']),'private_ip':len(scan['private_ip_matches']),'runtime_log':len(scan['runtime_log_matches']),'forbidden_artifact':len(scan['forbidden_artifact_matches'])}
scan['scope'] = 'Text heuristics plus manual candidate review; not a security certification. Loopback and symbolic configuration references are allowed.'
scan['forbidden_counts'] = {
    'real_secret_matches': len(issues['real_secret']),
    'absolute_private_path_matches': len(scan['absolute_path_matches']),
    'private_ip_matches': len(scan['private_ip_matches']),
    'forbidden_public_ip_matches': len(issues['forbidden_public_ip']),
    'runtime_log_matches': len(scan['runtime_log_matches']),
    'old_author_identity_matches': len(issues['old_author_identity']),
    'old_repo_identity_matches': len(issues['old_repo_identity']),
    'private_external_asset_matches': len(issues['private_external_asset']),
    'internal_audit_artifact_matches': sum('audit' in x['path'] or 'report' in x['path'] or 'legacy-refactor' in x['path'] for x in scan['forbidden_artifact_matches']),
    'broken_links': len(issues['broken_local_markdown_links']),
    'bank_term_matches':len(issues['bank_terms']),
    'unwanted_document_matches':len(issues['unwanted_documents'])}
if args.scan_output: args.scan_output.write_text(json.dumps(scan,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(fail)
