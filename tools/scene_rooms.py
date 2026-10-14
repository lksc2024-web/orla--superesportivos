# Three more conceptual studies: dining, bedroom, home office. Same light language as the living room.
import sys, math, random, bpy
sys.path.insert(0, "/home/claude/fm/py")
from scene_lib import *

args = dict(a.split("=") for a in sys.argv[sys.argv.index("--") + 1:]) if "--" in sys.argv else {}
W, H = int(args.get("w", 480)), int(args.get("h", 300))
SAMPLES = int(args.get("s", 24))
ROOM = args.get("room", "dining")
OUT = args.get("out", f"/home/claude/fm/renders/t_{ROOM}.png")
random.seed(7)

reset()
HT = 2.8
plaster = mat_plaster("plaster", "#ece6dc")
ceil = mat_plaster("ceil", "#f1ede6", bump=0.0)
floor = mat_wood("floor", "#cdb08c", "#a98a68")
walnut = mat_wood("walnut", "#6e4a31", "#4f3220", plank=False, stretch=20)
oak = mat_wood("oak", "#c19b72", "#a07b55", plank=False, stretch=20)
frame = mat_basic("frame", "#2b2a28", rough=0.45, metal=0.6)
stone = mat_stone("trav", "#d9cab2")
plum_wall = mat_plaster("plumwall", "#6a4560", bump=0.03)
linen = mat_fabric("linen", "#e8dfd0", scale=120, sheen=0.25)


def shell(X0, X1, Y0, Y1, WIN, side="L", back_mat=None):
    plane("floor", (X1 - X0, Y1 - Y0), ((X0 + X1) / 2, (Y0 + Y1) / 2, 0), floor)
    plane("ceiling", (X1 - X0, Y1 - Y0), ((X0 + X1) / 2, (Y0 + Y1) / 2, HT), ceil, rot=(math.pi, 0, 0))
    wall_with_opening("wL", "x", X0 - 0.09, (Y0, Y1), HT, WIN if side == "L" else None, plaster)
    wall_with_opening("wR", "x", X1 + 0.09, (Y0, Y1), HT, WIN if side == "R" else None, plaster)
    wall_with_opening("wB", "y", Y1 + 0.09, (X0, X1), HT, None, back_mat or plaster)
    wall_with_opening("wF", "y", Y0 - 0.09, (X0, X1), HT, None, plaster)
    at = X0 - 0.06 if side == "L" else X1 + 0.06
    window_frame("x", at, WIN, frame, mullions=3)
    ext = X0 - 4.0 if side == "L" else X1 + 4.0
    box("parapet", (0.25, 16, 1.05), (ext, (Y0 + Y1) / 2, 0.525), mat_plaster("ext", "#e9e2d6"))
    plane("terrace", (8, 16), ((at + ext) / 2, (Y0 + Y1) / 2, -0.01), mat_stone("deck", "#cdbfa8", scale=2))
    portal("x", X0 if side == "L" else X1, WIN, inward=1 if side == "L" else -1)


def sun(elev, az_deg, energy=6.0, side="L"):
    bpy.ops.object.light_add(type="SUN")
    s = bpy.context.object
    s.data.energy = energy; s.data.angle = math.radians(0.8); s.data.color = hex2rgb("#ffe0b8")[:3]
    tilt = -(90 - elev) if side == "L" else (90 - elev)
    s.rotation_euler = (0, math.radians(tilt), math.radians(az_deg))


def sheer(x, y, h=2.6, width=0.9):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, y, h / 2 + 0.02), rotation=(math.pi / 2, 0, math.pi / 2))
    c = bpy.context.object; c.scale = (width, h, 1); bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.subdivide(number_cuts=60); bpy.ops.object.mode_set(mode="OBJECT")
    wv = c.modifiers.new("w", "WAVE"); wv.use_y = False; wv.height = 0.05; wv.width = 0.12; wv.speed = 0; wv.narrowness = 1.2
    c.data.materials.append(mat_sheer("sheer"))


def pendant_globe(x, y, z, r=0.17):
    cyl("cord", 0.004, HT - z - r, (x, y, (HT + z + r) / 2), frame, verts=8)
    sphere("globe", r, (x, y, z), mat_emit("opal", "#ffe2bd", 6.0))


def books_row(x0, x1, y, z, depth=0.22):
    cols = ["#e4dccd", "#5b2a4e", "#b9a183", "#2e2b29", "#d6c7b0", "#8a6f5a", "#efe8dc", "#6a4560"]
    x = x0
    while x < x1:
        w = random.uniform(0.022, 0.045); h = random.uniform(0.2, 0.29)
        if random.random() < 0.12:
            x += 0.08; continue
        box("bk", (w, depth, h), (x + w / 2, y, z + h / 2), mat_basic("b", random.choice(cols), 0.75), bevel=0.002)
        x += w + 0.002


if ROOM == "dining":
    X0, X1, Y0, Y1 = -3.0, 3.0, -1.0, 4.6
    WIN = (0.3, 4.0, 0.0, 2.58)
    shell(X0, X1, Y0, Y1, WIN, "L", back_mat=plum_wall)
    sheer(X0 + 0.14, 3.6)
    # sideboard with slatted front against the plum wall
    box("sb", (2.4, 0.45, 0.7), (0.4, Y1 - 0.25, 0.42), walnut, bevel=0.006)
    slats("sbs", "y", Y1 - 0.48, (-0.78, 1.58), 0.1, 0.74, oak, w=0.03, gap=0.012, depth=0.02)
    box("sbtop", (2.42, 0.47, 0.03), (0.4, Y1 - 0.25, 0.785), stone)
    cyl("vase1", 0.1, 0.42, (-0.4, Y1 - 0.25, 1.0), mat_basic("v1", "#d8cbb6", 0.6), r2=0.05)
    sphere("vase2", 0.12, (0.0, Y1 - 0.25, 0.92), mat_basic("v2", "#2e2b29", 0.3, coat=0.5), scale=(1, 1, 1.1))
    box("art", (1.2, 0.03, 0.9), (0.9, Y1 - 0.03, 1.65), mat_fabric("canvas", "#e2d6c3", scale=30, sheen=0), bevel=0.004)
    box("art2", (0.5, 0.012, 0.36), (1.05, Y1 - 0.05, 1.72), mat_basic("plumart", "#3d2337", 0.9))
    # round table and four chairs
    cyl("top", 0.72, 0.04, (0.2, 2.0, 0.75), oak, bevel=0.01)
    cyl("ped", 0.16, 0.71, (0.2, 2.0, 0.36), oak, r2=0.1)
    cyl("foot", 0.38, 0.03, (0.2, 2.0, 0.015), oak, bevel=0.005)
    for i, a in enumerate([0, 90, 180, 270]):
        r = math.radians(a)
        x, y = 0.2 + math.sin(r) * 0.95, 2.0 - math.cos(r) * 0.95
        import_glb("SheenChair", (x, y, 0), r + math.pi, 1.0, recolor={"fabric": "#d5c6ae"})
    cyl("bowl", 0.17, 0.08, (0.2, 2.0, 0.81), mat_basic("bowl", "#efe8dc", 0.35, coat=0.3), r2=0.1)
    for k in range(3):
        sphere("fruit", 0.045, (0.16 + k * 0.05, 2.0 + (k % 2) * 0.04, 0.88), mat_basic("lemon", "#d6b23a", 0.5))
    pendant_globe(0.0, 2.0, 1.75); pendant_globe(0.42, 2.05, 1.62, 0.13)
    import_glb("DiffuseTransmissionPlant", (-2.45, 3.95, 0), 0.4, 1.8)
    plane("rug", (2.8, 2.6), (0.2, 2.0, 0.006), mat_fabric("rug", "#d8ccb8", scale=140, sheen=0.2))
    daylight(22, 0, 0.32, 0.0); sun(30, 26, 6.0, "L")
    camera((1.35, -0.75, 1.3), 13, lens=24, shift_y=-0.06)

elif ROOM == "bedroom":
    X0, X1, Y0, Y1 = -2.6, 2.8, -1.0, 4.4
    WIN = (0.2, 3.2, 0.0, 2.58)
    shell(X0, X1, Y0, Y1, WIN, "R")
    sheer(X1 - 0.14, 0.75, width=1.0); sheer(X1 - 0.14, 3.0, width=0.6)
    # upholstered plum headboard panel with slatted wings
    box("head", (2.2, 0.08, 1.25), (0.0, Y1 - 0.05, 0.98), mat_fabric("hb", "#5a3150", scale=90, sheen=0.5), bevel=0.02)
    slats("hw", "y", Y1 - 0.02, (-2.5, -1.15), 0.0, HT, mat_wood("slat", "#8a5d3b", "#6b4428", plank=False, stretch=30))
    slats("hw2", "y", Y1 - 0.02, (1.15, 2.7), 0.0, HT, mat_wood("slat2", "#8a5d3b", "#6b4428", plank=False, stretch=30))
    box("base", (1.9, 2.1, 0.28), (0.0, Y1 - 1.15, 0.2), walnut, bevel=0.01)
    box("matt", (1.82, 2.02, 0.24), (0.0, Y1 - 1.15, 0.45), mat_fabric("mat", "#f2ede4", scale=200, sheen=0.1), bevel=0.06)
    duv = box("duvet", (1.95, 1.45, 0.1), (0.0, Y1 - 1.55, 0.6), linen, bevel=0.045)
    box("throw", (2.0, 0.45, 0.04), (0.0, Y1 - 1.95, 0.665), mat_fabric("throw", "#6e4a66", scale=160, sheen=0.4), bevel=0.018)
    for x in (-0.48, 0.48):
        box("pil", (0.72, 0.16, 0.42), (x, Y1 - 0.3, 0.78), mat_fabric("pw", "#f4efe7", scale=200, sheen=0.1), bevel=0.07, rot=(math.radians(-14), 0, 0))
    box("pil3", (0.5, 0.13, 0.32), (0.0, Y1 - 0.42, 0.72), mat_fabric("pp", "#b9a183", scale=120, sheen=0.3), bevel=0.06, rot=(math.radians(-12), 0, 0))
    for x in (-1.45, 1.45):
        box("ns", (0.55, 0.42, 0.48), (x, Y1 - 0.25, 0.34), walnut, bevel=0.006)
        box("nsl", (0.56, 0.43, 0.02), (x, Y1 - 0.25, 0.59), stone)
        import_glb("AnisotropyBarnLamp", (x, Y1 - 0.02, 1.55), math.pi, 1.4)
        point_light((x, Y1 - 0.25, 1.42), 18, "#ffc78f", 0.05)
    cyl("cup", 0.04, 0.09, (1.3, Y1 - 0.2, 0.645), mat_basic("cup", "#efe8dc", 0.3, coat=0.3))
    box("bkn", (0.18, 0.13, 0.04), (-1.4, Y1 - 0.25, 0.62), mat_basic("bkn", "#5b2a4e", 0.7), bevel=0.003)
    plane("rug", (2.6, 2.0), (0.0, Y1 - 1.6, 0.006), mat_fabric("rug", "#d8ccb8", scale=140, sheen=0.2))
    import_glb("ChairDamaskPurplegold", (1.85, 0.6, 0), math.radians(-120), 1.05)
    import_glb("DiffuseTransmissionPlant", (2.3, 3.75, 0), 1.2, 1.4)
    daylight(22, 0, 0.3, 0.0); sun(28, -150, 5.5, "R")
    camera((-0.85, -0.85, 1.25), -9, lens=22, shift_y=-0.07)

elif ROOM == "office":
    X0, X1, Y0, Y1 = -2.6, 2.6, -1.0, 4.0
    WIN = (0.0, 2.9, 0.0, 2.58)
    shell(X0, X1, Y0, Y1, WIN, "L")
    sheer(X0 + 0.14, 2.6, width=0.7)
    # full-height oak shelving with books and objects
    for x in (-1.9, -0.65, 0.6, 1.85):
        box("upr", (0.03, 0.36, HT), (x, Y1 - 0.18, HT / 2), oak)
    for z in (0.02, 0.42, 0.86, 1.3, 1.74, 2.18):
        box("shelf", (3.8, 0.36, 0.03), (-0.025, Y1 - 0.18, z), oak)
    for (x0, x1, z) in [(-1.88, -1.1, 0.875), (-0.63, 0.2, 1.315), (0.62, 1.4, 0.435), (-1.88, -1.3, 1.755), (0.62, 1.15, 1.755), (-0.63, -0.1, 0.435)]:
        books_row(x0, x1, Y1 - 0.2, z)
    sphere("obj1", 0.09, (-0.6 + 0.5, Y1 - 0.2, 0.96), mat_basic("o1", "#2e2b29", 0.3, coat=0.4))
    cyl("obj2", 0.07, 0.24, (1.5, Y1 - 0.2, 1.43), mat_basic("o2", "#c9b79c", 0.6), r2=0.04)
    cyl("obj3", 0.1, 0.16, (-1.6, Y1 - 0.2, 0.52), mat_basic("o3", "#6a4560", 0.5))
    # desk with a stone top facing the window light
    box("desk", (1.7, 0.75, 0.04), (-0.2, 1.75, 0.74), stone, bevel=0.004)
    for dx in (-0.75, 0.75):
        box("leg", (0.04, 0.7, 0.72), (-0.2 + dx, 1.75, 0.36), walnut)
    import_glb("SheenChair", (-0.2, 2.45, 0), math.pi, 1.0, recolor={"fabric": "#5a3150"})
    box("lap", (0.34, 0.24, 0.012), (-0.35, 1.65, 0.767), frame, bevel=0.002)
    box("sketch", (0.42, 0.3, 0.003), (0.25, 1.7, 0.762), mat_basic("paper", "#f4efe6", 0.9))
    cyl("pen", 0.005, 0.15, (0.32, 1.62, 0.768), frame, verts=8).rotation_euler = (0, math.pi / 2, 0.4)
    cyl("mug", 0.04, 0.1, (0.55, 1.95, 0.81), mat_basic("mug", "#efe8dc", 0.3, coat=0.3))
    import_glb("DiffuseTransmissionPlant", (-2.1, 3.4, 0), 2.2, 1.7)
    plane("rug", (2.2, 1.8), (-0.2, 1.9, 0.006), mat_fabric("rug", "#d8ccb8", scale=140, sheen=0.2))
    pendant_globe(-0.2, 1.75, 1.85, 0.15)
    daylight(22, 0, 0.32, 0.0); sun(32, 18, 6.0, "L")
    camera((1.15, -0.7, 1.3), 12, lens=23, shift_y=-0.05)

render(OUT, W, H, samples=SAMPLES)
