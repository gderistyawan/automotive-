#!/usr/bin/env python3
"""Membuat gambar SVG placeholder (siluet) untuk tiap kendaraan demo di public/images/cars/.
Ini BUKAN foto kendaraan asli. Ganti dengan foto resmi (lihat README)."""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'cars')
os.makedirs(OUT, exist_ok=True)

SHAPES = {
    'sedan': {
        'body': 'M50 262 L58 228 Q64 214 96 208 L200 196 Q232 150 280 134 Q310 124 350 124 L510 124 Q552 126 584 150 L640 196 L712 206 Q748 214 752 240 L756 262 Q756 270 746 270 L690 270 A44 44 0 0 0 602 270 L238 270 A44 44 0 0 0 150 270 L62 270 Q50 270 50 262 Z',
        'glass': 'M222 196 Q246 156 288 142 Q312 134 350 134 L500 134 Q536 136 560 156 L604 196 Z',
    },
    'suv': {
        'body': 'M50 262 L56 222 Q62 204 96 198 L190 190 Q214 130 266 112 L300 106 L560 106 Q596 110 618 140 L660 190 L716 200 Q750 210 754 240 L758 262 Q758 270 748 270 L690 270 A44 44 0 0 0 602 270 L238 270 A44 44 0 0 0 150 270 L62 270 Q50 270 50 262 Z',
        'glass': 'M214 188 Q232 138 272 122 L304 116 L552 116 Q580 120 598 144 L630 188 Z',
    },
    'hatch': {
        'body': 'M60 262 L66 226 Q72 210 104 204 L196 194 Q222 144 268 128 Q296 118 336 118 L520 118 Q560 120 584 146 L626 196 L706 206 Q744 214 748 240 L752 262 Q752 270 742 270 L690 270 A44 44 0 0 0 602 270 L238 270 A44 44 0 0 0 150 270 L72 270 Q60 270 60 262 Z',
        'glass': 'M214 196 Q240 150 282 136 L520 134 Q548 138 570 160 L596 196 Z',
    },
}

CARS = [
    ('terra-x', 'suv', '#3b4a5a'), ('ridge-7', 'suv', '#2f4a3a'), ('sleek-s', 'sedan', '#2d3037'),
    ('pulse-one', 'hatch', '#8fb53a'), ('city-h', 'hatch', '#2b5b7a'), ('volt-e', 'hatch', '#dfe6ea'),
    ('volt-x', 'suv', '#111318'), ('hybrid-g', 'suv', '#8b919c'),
]

def svg(kind, color, mirrored):
    s = SHAPES[kind]
    flip = ' transform="translate(800 0) scale(-1 1)"' if mirrored else ''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" role="img" aria-label="Ilustrasi placeholder kendaraan">
<defs>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{color}"/><stop offset="1" stop-color="#0b0c0f"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4150"/><stop offset="1" stop-color="#0f1115"/></linearGradient>
<radialGradient id="s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<g{flip}>
<ellipse cx="400" cy="296" rx="360" ry="22" fill="url(#s)"/>
<path d="{s['body']}" fill="url(#b)" stroke="#ffffff" stroke-opacity=".18" stroke-width="2"/>
<path d="{s['glass']}" fill="url(#g)" stroke="#ffffff" stroke-opacity=".15"/>
<path d="M120 232 H680" stroke="#C8FA50" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>
<rect x="728" y="214" width="22" height="9" rx="4" fill="#fff" fill-opacity=".9"/>
<rect x="52" y="214" width="16" height="9" rx="4" fill="#C8FA50"/>
<g fill="#0a0a0c" stroke="#2a2d34" stroke-width="3"><circle cx="194" cy="262" r="40"/><circle cx="646" cy="262" r="40"/></g>
<g fill="none" stroke="#C8FA50" stroke-width="4"><circle cx="194" cy="262" r="20"/><circle cx="646" cy="262" r="20"/></g>
</g>
<text x="400" y="344" text-anchor="middle" font-family="sans-serif" font-size="12" letter-spacing="3" fill="#6b6e76">DEMO PLACEHOLDER — BUKAN FOTO ASLI</text>
</svg>'''

for cid, kind, color in CARS:
    for suffix, m in (('', False), ('-alt', True)):
        with open(os.path.join(OUT, f'{cid}{suffix}.svg'), 'w', encoding='utf-8') as f:
            f.write(svg(kind, color, m))
print('ok', len(CARS) * 2, 'files')
