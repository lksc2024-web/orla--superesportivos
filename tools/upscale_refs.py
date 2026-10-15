# Upscale the collage tiles: main image x4, the rest x2 (EDSR), then a light sharpen.
import cv2, time
D = "/home/claude/fm/ref"
jobs = [("sala-vista", 4)] + [(n, 2) for n in ["leitura", "quarto", "jantar", "cozinha", "varanda", "lavabo", "office", "banho"]]
models = {}
for n, k in jobs:
    t = time.time()
    if k not in models:
        sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(f"/home/claude/fm/models/EDSR_x{k}.pb"); sr.setModel("edsr", k); models[k] = sr
    out = models[k].upsample(cv2.imread(f"{D}/{n}.png"))
    cv2.imwrite(f"{D}/{n}_up.png", out)
    print(n, out.shape, round(time.time() - t), "s", flush=True)
print("ALLDONE", flush=True)
