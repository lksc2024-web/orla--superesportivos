# Upscaled collage tiles → responsive webp sets (+ depth for the main image).
import os, sys
from PIL import Image, ImageFilter
SRC = "/home/claude/fm/ref"; DST = "/home/claude/fm/web/public/img"
sets = {"sala-vista": [960, 1440, 1920, 2560], "leitura": [800, 1600, 2236], "quarto": [800, 1600, 2236], "jantar": [800, 1400, 1924],
        "cozinha": [600, 1100], "varanda": [600, 1270], "lavabo": [600, 950], "office": [600, 950], "banho": [500, 800]}
out_name = {"office": "home-office"}
for name in (sys.argv[1:] or list(sets)):
    p = f"{SRC}/{name}_up.png"
    if not os.path.exists(p):
        print("missing", name); continue
    im = Image.open(p).convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.0, percent=40, threshold=2))
    o = out_name.get(name, name)
    for w in sets[name]:
        w2 = min(w, im.width)
        im.resize((w2, round(im.height * w2 / im.width)), Image.LANCZOS).save(f"{DST}/{o}-{w}.webp", quality=82, method=6)
    print(name, im.size, [round(os.path.getsize(f"{DST}/{o}-{w}.webp") / 1024) for w in sets[name]], "KB")
    if name == "sala-vista":
        Image.open(f"{SRC}/sala-vista-depth.png").convert("L").save(f"{DST}/sala-vista-depth.webp", quality=88, method=6)
        og = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
        top = max(0, (og.height - 630) // 2)
        og.crop((0, top, 1200, top + 630)).save("/home/claude/fm/web/public/og.jpg", quality=84, optimize=True)
        print(" depth + og ok")
