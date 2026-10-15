# Pillar images sit in tall frames: give them the x4 model too.
import cv2, time
D = "/home/claude/fm/ref"
sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel("/home/claude/fm/models/EDSR_x4.pb"); sr.setModel("edsr", 4)
for n in ["leitura", "quarto", "jantar"]:
    t = time.time(); out = sr.upsample(cv2.imread(f"{D}/{n}.png")); cv2.imwrite(f"{D}/{n}_up.png", out)
    print(n, out.shape, round(time.time() - t), "s", flush=True)
print("X4DONE", flush=True)
