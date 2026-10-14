import sys
from PIL import Image, ImageFilter
which = sys.argv[1]
if which == 'e07':
    im = Image.open('out/e07-006-clean.png').convert('RGBA'); W, H = im.size
    s = W / 900.0
    def blur_box(box, radius, darken=1.0):
        x0, y0, x1, y1 = [int(v * s) for v in box]
        reg = im.crop((x0, y0, x1, y1)); a = reg.getchannel('A')
        rgb = reg.convert('RGB').filter(ImageFilter.GaussianBlur(radius))
        if darken < 1: rgb = rgb.point(lambda v: int(v * darken))
        out = rgb.convert('RGBA'); out.putalpha(a); im.paste(out, (x0, y0))
    blur_box((738, 206, 832, 250), 14)            # number plate
    blur_box((214, 60, 276, 116), 22, darken=0.45)  # driver's face through the open window
    im.save('out/e07-final.png')
    final = im
else:
    final = Image.open('out/dol-2024-clean.png').convert('RGBA')
W = 1400; final = final.resize((W, round(final.height * W / final.width)), Image.LANCZOS)
dst = {'e07': 'out/deepal-e07.webp', 'dolphin': 'out/dolphin.webp'}[which]
final.save(dst, 'WEBP', quality=88, method=6, alpha_quality=96)
import os; print(dst, final.size, os.path.getsize(dst) // 1024, 'KB')
