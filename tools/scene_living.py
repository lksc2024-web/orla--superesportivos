# Living room study: floor-to-ceiling window on the left, slatted wood wall, plum velvet sofa.
import sys, math, bpy
sys.path.insert(0, "/home/claude/fm/py")
from scene_lib import *

args = dict(a.split("=") for a in sys.argv[sys.argv.index("--") + 1:]) if "--" in sys.argv else {}
W, H = int(args.get("w", 480)), int(args.get("h", 270))
SAMPLES = int(args.get("s", 32))
VIEW = args.get("view", "wide")
OUT = args.get("out", "/home/claude/fm/renders/test_living.png")

reset()
X0, X1, Y0, Y1, HT = -3.2, 3.2, -1.2, 5.0, 2.85
plaster = mat_plaster("plaster", "#ece6dc")
ceil = mat_plaster("ceil", "#f1ede6", bump=0.0)
floor = mat_wood("floor", "#cdb08c", "#a98a68", scale=(1, 1, 1))
slat = mat_wood("slat", "#8a5d3b", "#6b4428", plank=False, rough=0.5, stretch=30)
frame = mat_basic("frame", "#2b2a28", rough=0.45, metal=0.6)

# shell
plane("floor", (X1 - X0, Y1 - Y0), ((X0 + X1) / 2, (Y0 + Y1) / 2, 0), floor)
plane("ceiling", (X1 - X0, Y1 - Y0), ((X0 + X1) / 2, (Y0 + Y1) / 2, HT), ceil, rot=(math.pi, 0, 0))
WIN = (0.5, 4.3, 0.0, 2.62)
wall_with_opening("wallL", "x", X0 - 0.09, (Y0, Y1), HT, WIN, plaster)
wall_with_opening("wallR", "x", X1 + 0.09, (Y0, Y1), HT, None, plaster)
wall_with_opening("wallB", "y", Y1 + 0.09, (X0, X1), HT, None, plaster)
wall_with_opening("wallF", "y", Y0 - 0.09, (X0, X1), HT, None, plaster)
window_frame("x", X0 - 0.06, WIN, frame, mullions=3)
# slatted wood wall behind the sofa, with a warm cove light in the ceiling
slats("ripado", "y", Y1 - 0.02, (-1.75, 1.95), 0.0, HT, slat)
box("cove", (X1 - X0, 0.22, 0.12), (0, Y1 - 0.3, HT - 0.06), ceil)
box("led", (3.6, 0.02, 0.02), (0.1, Y1 - 0.42, HT - 0.125), mat_emit("ledm", "#ffc98a", 18))
# outside: a soft garden band so the window does not read as empty
garden = mat_fabric("garden", "#5f6f4a", scale=8, rough=1.0, sheen=0)
box("parapet", (0.25, 16, 1.05), (X0 - 4.2, 2.4, 0.525), mat_plaster("ext", "#e9e2d6"))
box("parapet_cap", (0.32, 16, 0.04), (X0 - 4.2, 2.4, 1.07), mat_stone("cap", "#cfc2ad", scale=3))
plane("terrace", (10, 14), (X0 - 5.0, 2.4, -0.01), mat_stone("deck", "#cdbfa8", scale=2))

bpy.ops.mesh.primitive_plane_add(size=1, location=(X0 + 0.14, 3.85, 1.31), rotation=(math.pi / 2, 0, math.pi / 2))
cur = bpy.context.object; cur.scale = (0.85, 2.6, 1); bpy.ops.object.transform_apply(scale=True)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.subdivide(number_cuts=60); bpy.ops.object.mode_set(mode="OBJECT")
wv = cur.modifiers.new("w", "WAVE"); wv.use_y = False; wv.height = 0.05; wv.width = 0.12; wv.speed = 0; wv.narrowness = 1.2
cur.data.materials.append(mat_sheer("sheer"))
# rug, coffee table, objects
plane("rug", (3.1, 2.3), (0.2, 3.25, 0.006), mat_fabric("rug", "#d8ccb8", scale=140, sheen=0.2))
stone = mat_stone("trav", "#d9cab2")
cyl("ctable", 0.48, 0.34, (0.15, 3.15, 0.17), stone, bevel=0.01)
cyl("ctable2", 0.3, 0.26, (0.85, 3.45, 0.13), mat_wood("walnut", "#6e4a31", "#4f3220", plank=False, stretch=20), bevel=0.008)
box("book1", (0.3, 0.22, 0.035), (0.05, 3.05, 0.358), mat_basic("bk1", "#6b3b5c", 0.7), bevel=0.003)
box("book2", (0.27, 0.2, 0.03), (0.07, 3.06, 0.39), mat_basic("bk2", "#e4dccd", 0.8), bevel=0.003)
sphere("bowl", 0.11, (0.38, 3.25, 0.39), mat_basic("ceramic", "#2e2b29", 0.35, coat=0.4), scale=(1, 1, 0.45))
cyl("vase", 0.06, 0.22, (0.85, 3.45, 0.37), mat_basic("vase", "#c9b79c", 0.6), r2=0.035)

# furniture
import_glb("GlamVelvetSofa", (0.15, 4.35, 0), 0, 1.0, recolor={"fabric": "#4a2241"})
import_glb("ChairDamaskPurplegold", (-1.55, 2.75, 0), math.radians(68), 1.08)
import_glb("SheenChair", (1.95, 2.55, 0), math.radians(-72), 1.08, recolor={"fabric": "#cdbca3"})
import_glb("DiffuseTransmissionPlant", (-2.55, 4.45, 0.0), math.radians(20), 1.9)
cyl("plinth", 0.3, 0.02, (-2.55, 4.45, 0.01), stone)
# floor lamp
cyl("lamp_base", 0.16, 0.03, (2.55, 4.35, 0.015), frame)
cyl("lamp_pole", 0.012, 1.45, (2.55, 4.35, 0.75), frame)
cyl("lamp_shade", 0.24, 0.3, (2.55, 4.35, 1.55), mat_sheer("shade", "#efe4d2"), r2=0.17)
point_light((2.55, 4.35, 1.52), 45, "#ffc78f", 0.08)
# art on the right wall
box("art", (0.03, 1.0, 1.3), (X1 - 0.02, 3.6, 1.45), mat_fabric("canvas", "#b9a183", scale=30, sheen=0), bevel=0.004)
box("art_mark", (0.012, 0.42, 0.62), (X1 - 0.04, 3.48, 1.5), mat_basic("plum", "#5b2a4e", 0.9))

# daylight from the left
daylight(sun_elev=22, sun_rot=0, strength=0.32, sun_strength=0.0)
bpy.ops.object.light_add(type="SUN")
sun = bpy.context.object
sun.data.energy = 6.5; sun.data.angle = math.radians(0.8); sun.data.color = hex2rgb("#ffe0b8")[:3]
sun.rotation_euler = (0, math.radians(-64), math.radians(30))
portal("x", X0, WIN, inward=1)

if VIEW == "wide":
    camera((0.75, -0.55, 1.25), 9, lens=21, shift_y=-0.04)
elif VIEW == "tall":
    camera((0.35, 0.7, 1.15), 4, lens=19, shift_y=-0.07)
elif VIEW == "plant":
    camera_look((-1.35, 2.85, 1.05), (-2.5, 4.55, 0.95), lens=38)
elif VIEW == "light":
    camera_look((0.2, 1.05, 1.15), (-2.6, 3.0, 0.75), lens=32)
elif VIEW == "table":
    camera_look((1.0, 2.3, 1.3), (0.15, 3.15, 0.33), lens=42)
render(OUT, W, H, samples=SAMPLES, depth_path=args.get("depth"))
