import sys, numpy as np, potrace
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
_img = Image.open(src).convert('RGBA')
_bg = Image.new('RGBA', _img.size, (255, 255, 255, 255))
im = np.asarray(Image.alpha_composite(_bg, _img).convert('RGB')).astype(int)
h, w, _ = im.shape
# Sample the two brand colours from the artwork.
def dominant(mask):
    px = im[mask]; return tuple(int(v) for v in np.median(px, axis=0))
r, g, b = im[...,0], im[...,1], im[...,2]
navy_guess = (b > r + 25) & (b > g + 5) & (r < 90)
teal_guess = (g > r + 50) & (b > r + 40) & (abs(g - b) < 45) & (g > 100)
navy, teal = dominant(navy_guess), dominant(teal_guess)
print('navy', '#%02x%02x%02x' % navy, 'teal', '#%02x%02x%02x' % teal, 'size', w, h)
def dist(c): return np.sqrt(((im - np.array(c)) ** 2).sum(axis=2))
white = dist((255,255,255))
dn, dt = dist(navy), dist(teal)
# Each pixel belongs to the nearest of navy/teal/white.
navy_mask = (dn < dt) & (dn < white) & (dn < 110)
teal_mask = (dt < dn) & (dt < white) & (dt < 110)
def trace(mask):
    bm = potrace.Bitmap(~mask)  # potracer treats dark (0) pixels as ink
    path = bm.trace(turdsize=20, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for curve in path:
        sp = curve.start_point; d.append(f'M{sp.x:.1f} {sp.y:.1f}')
        for s in curve.segments:
            if s.is_corner:
                d.append(f'L{s.c.x:.1f} {s.c.y:.1f}L{s.end_point.x:.1f} {s.end_point.y:.1f}')
            else:
                d.append(f'C{s.c1.x:.1f} {s.c1.y:.1f} {s.c2.x:.1f} {s.c2.y:.1f} {s.end_point.x:.1f} {s.end_point.y:.1f}')
        d.append('Z')
    return ''.join(d)
pn, pt = trace(navy_mask), trace(teal_mask)
ys, xs = np.where(navy_mask | teal_mask)
x0, y0, x1, y1 = xs.min(), ys.min(), xs.max(), ys.max()
pad = 12
vb = f'{x0-pad} {y0-pad} {x1-x0+2*pad} {y1-y0+2*pad}'
print('viewBox', vb)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="CivilEng ResearchHub">
  <path fill="#%02x%02x%02x" fill-rule="evenodd" d="{pn}"/>
  <path fill="#%02x%02x%02x" fill-rule="evenodd" d="{pt}"/>
</svg>
''' % (*navy, *teal)
open(out, 'w').write(svg)
print('bytes', len(svg))
