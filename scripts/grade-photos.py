"""Apply one consistent colour grade to the real photographs (warm Mediterranean,
deeper shadows, calmer saturation). Reads the originals in media-inbox/, writes
public/media/. Usage: python3 scripts/grade-photos.py"""
from PIL import Image, ImageEnhance, ImageOps

PHOTOS = {
    'IMG_2304_Original.jpeg': 'dingac-aerial.jpg',
    'IMG_2305_Original.jpeg': 'terrace-sea-view.jpg',
    'IMG_2306_Original.jpeg': 'dingac-slope-sea.jpg',
    'IMG_2307_Original.jpeg': 'serving-cheese-prosciutto.jpg',
    'IMG_2308_Original.jpeg': 'guests-toast-couple.jpg',
    'IMG_2309_Original.jpeg': 'guests-toast-table.jpg',
    'IMG_2310_Original.jpeg': 'pouring-wine.jpg',
}

def curve(v):
    # gentle S-curve: deeper shadows, soft highlights
    x = v / 255
    y = x * x * (3 - 2 * x) * 0.35 + x * 0.65
    return int(max(0, min(255, y * 255)))

def grade(im):
    im = ImageOps.exif_transpose(im).convert('RGB')
    im = ImageEnhance.Color(im).enhance(0.82)          # calmer saturation
    im = im.point([curve(i) for i in range(256)] * 3)   # contrast / shadows
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * 1.035 + 3)))  # warm
    g = g.point(lambda v: min(255, int(v * 1.005)))
    b = b.point(lambda v: int(v * 0.93))
    return Image.merge('RGB', (r, g, b))

for src, out in PHOTOS.items():
    grade(Image.open(f'media-inbox/{src}')).save(f'public/media/{out}', 'JPEG', quality=84, optimize=True, progressive=True)
    print('✓', out)
