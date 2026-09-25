"""Regenerate public/fonts/newsreader-display-*.woff2 from @fontsource-variable/newsreader.

Pins the optical-size axis at 72 (the display cut used for all headings) and trims
weights to 200–500 — about half the size of the full variable font.
Usage: pip install fonttools brotli && python3 scripts/build-fonts.py
"""
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = 'node_modules/@fontsource-variable/newsreader/files'
for sub in ['latin', 'latin-ext']:
    for style in ['normal', 'italic']:
        font = TTFont(f'{SRC}/newsreader-{sub}-opsz-{style}.woff2')
        inst = instancer.instantiateVariableFont(font, {'opsz': 72, 'wght': (200, 500)})
        inst.flavor = 'woff2'
        inst.save(f'public/fonts/newsreader-display-{sub}-{style}.woff2')
        print('✓', sub, style)
