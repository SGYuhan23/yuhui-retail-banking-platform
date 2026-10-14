#!/usr/bin/env python3
"""Stage allowed files, verify the actual tree, then create and hash-check the ZIP."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import zipfile
from public_artifacts import public_files
ROOT = Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output',type=Path)
    args=parser.parse_args()
    output=args.output.resolve()
    if ROOT == output or ROOT in output.parents: parser.error('Output must be outside the source tree')
    with tempfile.TemporaryDirectory(prefix='yuhui-public-') as directory:
        staged=Path(directory)/ROOT.name
        for source in public_files(ROOT):
            destination=staged/source.relative_to(ROOT)
            destination.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(source,destination)
        subprocess.run([sys.executable,'-B',str(staged/'scripts/portfolio_verify.py'),'--root',str(staged),'--strict'],check=True)
        files=list(public_files(staged))
        manifest={str(p.relative_to(staged)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
        output.parent.mkdir(parents=True,exist_ok=True)
        with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
            for p in files: archive.write(p,str(p.relative_to(staged)))
        with zipfile.ZipFile(output) as archive:
            assert archive.testzip() is None
            for name,digest in manifest.items(): assert hashlib.sha256(archive.read(name)).hexdigest()==digest
    output.with_suffix('.manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    digest=hashlib.sha256(output.read_bytes()).hexdigest()
    output.with_suffix('.zip.sha256').write_text(digest+'  '+output.name+'\n')
    print(json.dumps({'zip':str(output),'files':len(manifest),'zip_bytes':output.stat().st_size,'sha256':digest,'integrity':'PASS'},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
