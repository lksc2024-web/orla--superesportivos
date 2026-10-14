# Interior scene toolkit for Cycles: room shell, materials, furniture placement, daylight, camera.
import bpy, math, mathutils, os

ASSETS = "/home/claude/fm/assets"


def reset():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.images):
        for b in list(coll):
            if b.users == 0:
                coll.remove(b)


def hex2rgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)


def mat_basic(name, color, rough=0.8, metal=0.0, sheen=0.0, coat=0.0, trans=0.0, sss=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hex2rgb(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if sheen:
        b.inputs["Sheen Weight"].default_value = sheen
    if coat:
        b.inputs["Coat Weight"].default_value = coat
    if trans:
        b.inputs["Transmission Weight"].default_value = trans
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
    return m


def _nodes(m):
    return m.node_tree.nodes, m.node_tree.links


def mat_wood(name, c1="#b48a62", c2="#8f6845", scale=(1, 1, 1), plank=True, rough=0.42, stretch=14.0):
    """Procedural wood: stretched noise grain, optional plank seams via a brick texture."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    N, L = _nodes(m)
    b = N["Principled BSDF"]
    tc = N.new("ShaderNodeTexCoord")
    mp = N.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = scale
    L.new(tc.outputs["Object"], mp.inputs["Vector"])
    # grain
    sep = N.new("ShaderNodeMapping"); sep.inputs["Scale"].default_value = (1.0, stretch, 1.0)
    L.new(mp.outputs["Vector"], sep.inputs["Vector"])
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 6.0; nz.inputs["Detail"].default_value = 8; nz.inputs["Distortion"].default_value = 0.6
    L.new(sep.outputs["Vector"], nz.inputs["Vector"])
    wave = N.new("ShaderNodeTexWave"); wave.wave_type = "BANDS"; wave.bands_direction = "X"
    wave.inputs["Scale"].default_value = 3.0; wave.inputs["Distortion"].default_value = 7.0; wave.inputs["Detail"].default_value = 3
    L.new(sep.outputs["Vector"], wave.inputs["Vector"])
    mix = N.new("ShaderNodeMix"); mix.data_type = "FLOAT"
    L.new(nz.outputs["Fac"], mix.inputs[2]); L.new(wave.outputs["Fac"], mix.inputs[3]); mix.inputs[0].default_value = 0.35
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = hex2rgb(c2); ramp.color_ramp.elements[1].color = hex2rgb(c1)
    ramp.color_ramp.elements[0].position = 0.3; ramp.color_ramp.elements[1].position = 0.75
    L.new(mix.outputs[0], ramp.inputs["Fac"])
    col = ramp.outputs["Color"]
    if plank:
        br = N.new("ShaderNodeTexBrick")
        br.inputs["Scale"].default_value = 1.0
        br.inputs["Mortar Size"].default_value = 0.004
        br.inputs["Brick Width"].default_value = 2.2
        br.inputs["Row Height"].default_value = 0.2
        br.inputs["Color1"].default_value = (1, 1, 1, 1); br.inputs["Color2"].default_value = (0.95, 0.95, 0.95, 1)
        br.inputs["Mortar"].default_value = (0.6, 0.6, 0.6, 1)
        br.offset = 0.37
        L.new(mp.outputs["Vector"], br.inputs["Vector"])
        mul = N.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs[0].default_value = 1.0
        L.new(col, mul.inputs[6]); L.new(br.outputs["Color"], mul.inputs[7])
        col = mul.outputs[2]
        bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.25
        L.new(br.outputs["Fac"], bump.inputs["Height"])
        L.new(bump.outputs["Normal"], b.inputs["Normal"])
    L.new(col, b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    return m


def mat_fabric(name, color, scale=60.0, rough=0.95, sheen=0.4):
    m = mat_basic(name, color, rough=rough, sheen=sheen)
    N, L = _nodes(m)
    b = N["Principled BSDF"]
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = scale; nz.inputs["Detail"].default_value = 4
    bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.15
    L.new(nz.outputs["Fac"], bump.inputs["Height"]); L.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_stone(name, color="#d8cab4", scale=4.0, rough=0.55):
    """Travertine-like: soft noise variation and tiny pits."""
    m = mat_basic(name, color, rough=rough)
    N, L = _nodes(m)
    b = N["Principled BSDF"]
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = scale; nz.inputs["Detail"].default_value = 10
    ramp = N.new("ShaderNodeValToRGB")
    c = mathutils.Color(hex2rgb(color)[:3])
    ramp.color_ramp.elements[0].color = (c.r * 0.82, c.g * 0.8, c.b * 0.76, 1)
    ramp.color_ramp.elements[1].color = (c.r * 1.05, c.g * 1.04, c.b * 1.02, 1)
    L.new(nz.outputs["Fac"], ramp.inputs["Fac"]); L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    vor = N.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 90
    bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.08
    L.new(vor.outputs["Distance"], bump.inputs["Height"]); L.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_plaster(name, color, rough=0.92, bump=0.04):
    m = mat_basic(name, color, rough=rough)
    N, L = _nodes(m)
    b = N["Principled BSDF"]
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 18; nz.inputs["Detail"].default_value = 12
    bp = N.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump
    L.new(nz.outputs["Fac"], bp.inputs["Height"]); L.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_emit(name, color, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    N, L = _nodes(m)
    for n in list(N):
        N.remove(n)
    e = N.new("ShaderNodeEmission"); e.inputs["Color"].default_value = hex2rgb(color); e.inputs["Strength"].default_value = strength
    o = N.new("ShaderNodeOutputMaterial"); L.new(e.outputs[0], o.inputs[0])
    return m


def mat_sheer(name, color="#f3eee6"):
    """Linen sheer curtain: translucent + a bit of transparency."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    N, L = _nodes(m)
    for n in list(N):
        N.remove(n)
    tr = N.new("ShaderNodeBsdfTranslucent"); tr.inputs["Color"].default_value = hex2rgb(color)
    df = N.new("ShaderNodeBsdfDiffuse"); df.inputs["Color"].default_value = hex2rgb(color)
    tp = N.new("ShaderNodeBsdfTransparent")
    m1 = N.new("ShaderNodeMixShader"); m1.inputs[0].default_value = 0.45
    L.new(df.outputs[0], m1.inputs[1]); L.new(tr.outputs[0], m1.inputs[2])
    m2 = N.new("ShaderNodeMixShader"); m2.inputs[0].default_value = 0.42
    L.new(m1.outputs[0], m2.inputs[1]); L.new(tp.outputs[0], m2.inputs[2])
    o = N.new("ShaderNodeOutputMaterial"); L.new(m2.outputs[0], o.inputs[0])
    return m


def box(name, size, loc, mat=None, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        md = o.modifiers.new("bv", "BEVEL"); md.width = bevel; md.segments = 3; md.limit_method = "ANGLE"
    if mat:
        o.data.materials.append(mat)
    return o


def cyl(name, r, h, loc, mat=None, verts=64, bevel=0.0, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=verts)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, vertices=verts)
    o = bpy.context.object
    o.name = name
    if bevel:
        md = o.modifiers.new("bv", "BEVEL"); md.width = bevel; md.segments = 3; md.limit_method = "ANGLE"
    bpy.ops.object.shade_smooth()
    if mat:
        o.data.materials.append(mat)
    return o


def sphere(name, r, loc, mat=None, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.object
    o.name = name; o.scale = scale
    bpy.ops.object.shade_smooth()
    if mat:
        o.data.materials.append(mat)
    return o


def torus(name, R, r, loc, mat=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=64, minor_segments=16)
    o = bpy.context.object
    o.name = name
    bpy.ops.object.shade_smooth()
    if mat:
        o.data.materials.append(mat)
    return o


def plane(name, size, loc, mat=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name; o.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        o.data.materials.append(mat)
    return o


def wall_with_opening(name, axis, at, span, height, opening, mat, thick=0.18):
    """Wall on plane x=at (axis='x') or y=at (axis='y'); span=(a,b) along the other horizontal axis.
    opening=(u0,u1,z0,z1) or None. Built from boxes around the hole."""
    a, b = span
    parts = []
    def piece(u0, u1, z0, z1):
        if u1 - u0 <= 0.001 or z1 - z0 <= 0.001:
            return
        cu, cz = (u0 + u1) / 2, (z0 + z1) / 2
        if axis == "x":
            parts.append(box(f"{name}", (thick, u1 - u0, z1 - z0), (at, cu, cz), mat))
        else:
            parts.append(box(f"{name}", (u1 - u0, thick, z1 - z0), (cu, at, cz), mat))
    if not opening:
        piece(a, b, 0, height)
    else:
        u0, u1, z0, z1 = opening
        piece(a, u0, 0, height); piece(u1, b, 0, height)
        piece(u0, u1, 0, z0); piece(u0, u1, z1, height)
    return parts


def window_frame(axis, at, opening, mat, mullions=3, depth=0.06, w=0.045):
    u0, u1, z0, z1 = opening
    def bar(cu, cz, su, sz):
        if axis == "x":
            box("frame", (depth, su, sz), (at, cu, cz), mat)
        else:
            box("frame", (su, depth, sz), (cu, at, cz), mat)
    bar((u0 + u1) / 2, z0 + w / 2, u1 - u0, w); bar((u0 + u1) / 2, z1 - w / 2, u1 - u0, w)
    bar(u0 + w / 2, (z0 + z1) / 2, w, z1 - z0); bar(u1 - w / 2, (z0 + z1) / 2, w, z1 - z0)
    for i in range(1, mullions):
        cu = u0 + (u1 - u0) * i / mullions
        bar(cu, (z0 + z1) / 2, w * 0.8, z1 - z0)
    # glass: skip (open) so the sky lights the room cleanly; Cycles portal handles sampling


def slats(name, axis, at, span, z0, z1, mat, w=0.04, gap=0.022, depth=0.03, back=None):
    a, b = span
    u = a
    while u + w <= b + 1e-6:
        if axis == "x":
            box(name, (depth, w, z1 - z0), (at, u + w / 2, (z0 + z1) / 2), mat, bevel=0.004)
        else:
            box(name, (w, depth, z1 - z0), (u + w / 2, at, (z0 + z1) / 2), mat, bevel=0.004)
        u += w + gap


def import_glb(fname, loc=(0, 0, 0), rot_z=0.0, scale=1.0, recolor=None):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ASSETS, fname + ".glb"))
    new = [o for o in bpy.data.objects if o not in before]
    roots = [o for o in new if o.parent is None]
    holder = bpy.data.objects.new(fname + "_root", None)
    bpy.context.scene.collection.objects.link(holder)
    for r in roots:
        r.parent = holder
    holder.location = loc; holder.rotation_euler = (0, 0, rot_z); holder.scale = (scale,) * 3
    if recolor:
        for o in new:
            if o.type != "MESH":
                continue
            for s in o.material_slots:
                mt = s.material
                if not mt:
                    continue
                for key, col in recolor.items():
                    if key.lower() in mt.name.lower():
                        nt = mt.node_tree
                        bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
                        if not bsdf:
                            continue
                        for lk in list(bsdf.inputs["Base Color"].links):
                            nt.links.remove(lk)
                        bsdf.inputs["Base Color"].default_value = hex2rgb(col)
                        if bsdf.inputs["Sheen Weight"].default_value > 0:
                            for lk in list(bsdf.inputs["Sheen Tint"].links):
                                nt.links.remove(lk)
                            bsdf.inputs["Sheen Tint"].default_value = hex2rgb(col)
    return holder


def daylight(sun_elev=24, sun_rot=120, strength=1.0, sun_strength=1.0):
    w = bpy.data.worlds.new("sky")
    bpy.context.scene.world = w
    w.use_nodes = True
    N, L = w.node_tree.nodes, w.node_tree.links
    bg = N["Background"]
    sky = N.new("ShaderNodeTexSky")
    sky.sky_type = "NISHITA"
    sky.sun_elevation = math.radians(sun_elev)
    sky.sun_rotation = math.radians(sun_rot)
    sky.sun_intensity = sun_strength
    sky.air_density = 1.2; sky.dust_density = 1.6
    L.new(sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    return w


def portal(axis, at, opening, inward=1):
    u0, u1, z0, z1 = opening
    bpy.ops.object.light_add(type="AREA")
    l = bpy.context.object
    l.data.shape = "RECTANGLE"
    l.data.cycles.is_portal = True
    if axis == "x":
        l.location = (at + 0.12 * inward, (u0 + u1) / 2, (z0 + z1) / 2)
        l.rotation_euler = (0, math.radians(-90 * inward), 0)
        l.data.size = (z1 - z0); l.data.size_y = (u1 - u0)
    else:
        l.location = ((u0 + u1) / 2, at + 0.12 * inward, (z0 + z1) / 2)
        l.rotation_euler = (math.radians(90 * inward), 0, 0)
        l.data.size = (u1 - u0); l.data.size_y = (z1 - z0)
    return l


def area_light(loc, rot, size, power, color="#ffe8cc"):
    bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
    l = bpy.context.object
    l.data.size = size; l.data.energy = power; l.data.color = hex2rgb(color)[:3]
    return l


def point_light(loc, power, color="#ffd6a0", radius=0.05):
    bpy.ops.object.light_add(type="POINT", location=loc)
    l = bpy.context.object
    l.data.energy = power; l.data.color = hex2rgb(color)[:3]; l.data.shadow_soft_size = radius
    return l


def camera(loc, yaw_deg, lens=24, shift_y=0.0, shift_x=0.0, pitch_deg=0.0):
    """Two-point perspective by default: level camera, framing with lens shift."""
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens; cd.shift_y = shift_y; cd.shift_x = shift_x
    cd.clip_start = 0.05; cd.clip_end = 100
    c = bpy.data.objects.new("cam", cd)
    bpy.context.scene.collection.objects.link(c)
    c.location = loc
    c.rotation_euler = (math.radians(90 + pitch_deg), 0, math.radians(yaw_deg))
    bpy.context.scene.camera = c
    return c


def render(path, w, h, samples=96, depth_path=None, exposure=0.0, mist=(0.5, 12.0)):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.cycles.max_bounces = 8; sc.cycles.diffuse_bounces = 4; sc.cycles.glossy_bounces = 3
    sc.cycles.transmission_bounces = 6; sc.cycles.transparent_max_bounces = 12
    sc.cycles.sample_clamp_indirect = 6.0
    sc.cycles.blur_glossy = 1.0
    sc.render.resolution_x = w; sc.render.resolution_y = h; sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.view_settings.exposure = exposure
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = path
    vl = sc.view_layers[0]
    if depth_path:
        vl.use_pass_mist = True
        sc.world.mist_settings.start = mist[0]; sc.world.mist_settings.depth = mist[1]; sc.world.mist_settings.falloff = "LINEAR"
        sc.use_nodes = True
        nt = sc.node_tree
        for n in list(nt.nodes):
            nt.nodes.remove(n)
        rl = nt.nodes.new("CompositorNodeRLayers")
        comp = nt.nodes.new("CompositorNodeComposite")
        nt.links.new(rl.outputs["Image"], comp.inputs["Image"])
        fo = nt.nodes.new("CompositorNodeOutputFile")
        fo.base_path = os.path.dirname(depth_path)
        fo.file_slots[0].path = os.path.basename(depth_path) + "_"
        fo.format.file_format = "PNG"; fo.format.color_mode = "BW"; fo.format.color_depth = "16"
        inv = nt.nodes.new("CompositorNodeInvert")
        nt.links.new(rl.outputs["Mist"], inv.inputs["Color"])
        nt.links.new(inv.outputs["Color"], fo.inputs[0])
    bpy.ops.render.render(write_still=True)


def camera_look(loc, target, lens=35, shift_y=0.0):
    cd = bpy.data.cameras.new("cam"); cd.lens = lens; cd.shift_y = shift_y; cd.clip_start = 0.05; cd.clip_end = 100
    c = bpy.data.objects.new("cam", cd)
    bpy.context.scene.collection.objects.link(c)
    c.location = loc
    d = mathutils.Vector(target) - mathutils.Vector(loc)
    c.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = c
    cd.dof.use_dof = True; cd.dof.focus_distance = d.length; cd.dof.aperture_fstop = 2.8
    return c
