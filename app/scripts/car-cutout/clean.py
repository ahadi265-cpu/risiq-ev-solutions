"""Post-process a rembg RGBA cutout: keep the largest object, optional despike/de-yellow, de-fringe, soften edge."""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, dst = sys.argv[1], sys.argv[2]
flags = set(sys.argv[3:])
im = Image.open(src).convert('RGBA'); a = np.array(im); al = a[..., 3].astype(np.float32)
H, W = al.shape
if 'noyellow' in flags:  # the wheel clamp on the E07 side shot
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    yellow = (r > 150) & (g > 120) & (b < 90) & (r - b > 90)
    yellow = ndi.binary_dilation(yellow, iterations=3)
    yellow[: int(H * 0.6)] = False
    al[yellow] = 0
if 'despike' in flags:  # thin vertical protrusions above the roof: clip the top profile to a median
    mask = al > 24
    top = np.where(mask.any(0), mask.argmax(0), H)
    k = 121; pad = np.pad(top.astype(float), k // 2, mode='edge')
    med = np.array([np.median(pad[i:i + k]) for i in range(W)])
    for x in range(W):
        if top[x] < med[x] - 12: al[: int(med[x]) , x] = np.minimum(al[: int(med[x]), x], 0)
bin_ = al > 24
lab, n = ndi.label(bin_)
if n > 1:
    sizes = ndi.sum(bin_, lab, range(1, n + 1)); keep = 1 + int(np.argmax(sizes)); al[lab != keep] = 0
# fill pinholes inside the body, then a 1px feather so edges sit cleanly on dark and light grounds
solid = ndi.binary_fill_holes(al > 24)
al = np.where(solid & (al < 255) & ndi.binary_erosion(solid, iterations=6), 255, al)
al = ndi.gaussian_filter(al, 0.9)
# de-fringe: pull semi-transparent edge pixels' colour from just inside the body
core = ndi.binary_erosion(al > 250, iterations=3)
rgb = a[..., :3].astype(np.float32)
idx = ndi.distance_transform_edt(~core, return_distances=False, return_indices=True)
edge = (al > 0) & (al < 250)
rgb[edge] = rgb[idx[0][edge], idx[1][edge]]
out = np.dstack([rgb, al]).clip(0, 255).astype(np.uint8)
res = Image.fromarray(out, 'RGBA'); res = res.crop(res.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())
res.save(dst); print(dst, res.size)
