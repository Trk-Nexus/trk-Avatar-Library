# SPDX-License-Identifier: GPL-3.0-or-later
"""Research only: exact cmap membership, not language support or shaping.
Usage: python3 tools/check-re-modern-font-coverage.py FONT_DIRECTORY
Requires fonttools[woff]. Font files are NOT fetched or distributed by this tool.
"""
import hashlib
import json
import sys
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
catalog = json.loads((root / 'docs/re-modern-research/title-font-integration/catalog.proposal.json').read_text())
work = json.loads((root / 'drafts/re-modern/pixel-console/skin.json').read_text())
assets = {}
for asset in catalog['assets']:
    path = Path(sys.argv[1]) / asset['file']
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != asset['sha256']:
        raise SystemExit(f"hash mismatch: {asset['file']}")
    with TTFont(path) as font:
        cmap = font.getBestCmap() or {}
        assets[asset['id']] = set(cmap)

for candidate in catalog['candidates']:
    covered = set().union(*(assets[a] for a in candidate['assets']))
    print(candidate['id'])
    for lang, text in work['label'].items():
        missing = list(dict.fromkeys(c for c in text if ord(c) not in covered))
        print(f"  {lang}: {text} -> " + (f"missing {''.join(missing)} ({', '.join(f'U+{ord(c):04X}' for c in missing)})" if missing else 'all code points present'))
