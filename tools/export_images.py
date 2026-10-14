# Render PNGs → responsive webp sets, blurred depth maps, OG image.
import os, sys
from PIL import Image, ImageFilter, ImageOps
SRC = "/home/claude/fm/final"; DST = "/home/claude/fm/web/public/img"
os.makedirs(DST, exist_ok=True)
sets = {"hero": [960, 1440, 1920], "hero_m": [600, 900], "dining": [800, 1200, 1600], "bedroom": [800, 1200, 1600],
        "office": [800, 1200, 1600], "plant": [500, 1000], "light": [500, 1000], "table": [500, 1000]}
only = sys.argv[1:] or list(sets)
for name in only:
    p = f"{SRC}/{name}.png"
    if not os.path.exists(p):
        print("missing", name); continue
    im = Image.open(p).convert("RGB")
    out = name.replace("_", "-")
    for w in sets[name]:
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(f"{DST}/{out}-{w}.webp", quality=80, method=6)
    print(name, [round(os.path.getsize(f"{DST}/{out}-{w}.webp") / 1024) for w in sets[name]], "KB")
    if name in ("hero", "hero_m"):
        d = Image.open(f"{SRC}/{name}_depth_0001.png").convert("I").point(lambda v: v / 256).convert("L")
        dw = 960 if name == "hero" else 600
        d = ImageOps.autocontrast(d.resize((dw, round(d.height * dw / d.width)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.2)), cutoff=1)
        d.save(f"{DST}/{out}-depth.webp", quality=85, method=6)
        print(" depth", d.size, d.getextrema())
    if name == "hero":
        og = im.resize((1200, 675), Image.LANCZOS).crop((0, 22, 1200, 652))
        og.save("/home/claude/fm/web/public/og.jpg", quality=84, optimize=True)
