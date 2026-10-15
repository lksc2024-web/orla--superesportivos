# Monocular depth for the main photo (MiDaS v2.1 small, ONNX). White = near.
import sys, numpy as np, cv2, onnxruntime as ort
src, dst, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
img = cv2.imread(src)[:, :, ::-1].astype(np.float32) / 255.0
x = cv2.resize(img, (256, 256), interpolation=cv2.INTER_CUBIC)
x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
x = x.transpose(2, 0, 1)[None].astype(np.float32)
sess = ort.InferenceSession("/home/claude/fm/models/model-small.onnx", providers=["CPUExecutionProvider"])
out = sess.run(None, {sess.get_inputs()[0].name: x})[0][0]
h = round(img.shape[0] * width / img.shape[1])
d = cv2.resize(out, (width, h), interpolation=cv2.INTER_CUBIC)
lo, hi = np.percentile(d, 1), np.percentile(d, 99)
d = np.clip((d - lo) / (hi - lo), 0, 1).astype(np.float32)
guide = cv2.resize((img[:, :, ::-1] * 255).astype(np.uint8), (width, h))
d = cv2.ximgproc.jointBilateralFilter(guide, (d * 255).astype(np.uint8), 9, 30, 7)
d = cv2.GaussianBlur(d, (0, 0), 1.6)
cv2.imwrite(dst, d)
print(dst, d.shape, d.min(), d.max())
