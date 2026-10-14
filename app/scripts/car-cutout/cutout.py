"""Fetch a Commons file at a given width, cut the car out with rembg, trim, save RGBA PNG + a checker preview."""
import sys, urllib.request, urllib.parse, io, os
from PIL import Image
from rembg import remove, new_session
name, width, model, out = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(name) + f'?width={width}'
req = urllib.request.Request(url, headers={'User-Agent': 'risiq-ev-site-asset-check/1.0 (ahadi265@gmail.com)'})
src = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=120).read())).convert('RGB')
print(name, src.size, model)
sess = new_session(model)
res = remove(src, session=sess, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=15, alpha_matting_erode_size=8)
bbox = res.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
res = res.crop(bbox); res.save(out + '.png')
W = 900; im = res.resize((W, int(res.height * W / res.width)))
for tag, col in (('dark', (11, 15, 23)), ('light', (254, 252, 250))):
    bg = Image.new('RGBA', im.size, col + (255,)); bg.alpha_composite(im); bg.convert('RGB').save(f'{out}-{tag}.jpg', quality=88)
print('cut', res.size)
