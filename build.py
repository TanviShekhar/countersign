#!/usr/bin/env python3
"""Builds index.html, the standalone page for GitHub Pages, from countersign.html.

countersign.html is written as a page fragment (title, styles, then markup), which is the form
Claude publishes. A normal web host needs a full document, so this wraps the fragment in one.
Run it after editing countersign.html:  python3 build.py
"""
from pathlib import Path

here = Path(__file__).parent
src = (here / "countersign.html").read_text(encoding="utf-8")
cut = src.index('<div id="gate"')
head, body = src[:cut], src[cut:]

page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Countersign: a working prototype of an AI-read supplier contract repository.">
<style>:root{{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}}html,body{{min-height:100%}}body{{margin:0;font:14px system-ui,sans-serif}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
{head.strip()}
</head>
<body>
{body.strip()}
</body>
</html>
"""
(here / "index.html").write_text(page, encoding="utf-8")
print(f"index.html written ({len(page):,} characters)")
