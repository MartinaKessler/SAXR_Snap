// Builds ring segments (e.g. the "arc" type for pie and donut charts)
// The arc lies in the XZ plane, angles are measured from +X towards -Z (counter-clockwise seen from above)
// so 90° points towards -Z (12 o'clock)

// @input Asset.Material material

var vertexCount = 0;

// point on the circle with radius r at angle a (radians) and height y
function point(r, a, y) {
    return new vec3(r * Math.cos(a), y, -r * Math.sin(a));
}

// radial direction at angle alpha, used as normal of the outer wall
function radial(alpha) {
    return new vec3(Math.cos(alpha), 0, -Math.sin(alpha));
}

// add a quad a,b,c,d (counter-clockwise seen from the side the normals point to)
// normals holds one normal per corner
function addQuad(builder, corners, normals) {
    var vertices = [];
    for (var i = 0; i < 4; i++) {
        var c = corners[i];
        var n = normals[i];
        vertices.push(c.x, c.y, c.z, n.x, n.y, n.z);
    }
    builder.appendVerticesInterleaved(vertices);
    var k = vertexCount;

    // front
    // 0 ────── 3
    // │ ╲      │
    // │   ╲    │
    // │     ╲  │
    // 1 ─────  2

    builder.appendIndices([k, k + 1, k + 2, k, k + 2, k + 3]);
    vertexCount += 4;
}

/**
 * Spawn a ring segment extruded along Y, centered vertically on the position
 * Faces: top & bottom wall, outer wall, inner wall (left out if innerRadius is 0), vertical wall at the start & at the end of the arc segment
 * @param   {Object}      options
 * @param   {vec3}        options.position    world position of the arc center (center of the height)
 * @param   {number}      options.outerRadius outer radius (cm)
 * @param   {number}      options.innerRadius inner radius (cm), 0 for a full pie slice
 * @param   {number}      options.height      height of the extrusion (cm)
 * @param   {number}      options.startAngle  start angle (degrees)
 * @param   {number}      options.sweepAngle  sweep angle (degrees), counter-clockwise seen from above
 * @param   {vec4}        [options.color]     base color (r,g,b,a), the object gets its own cloned material
 * @returns {SceneObject}                     the spawned arc
 */
function spawnArc(options) {
    var builder = new MeshBuilder([
        { name: "position", components: 3 },
        { name: "normal", components: 3, normalized: true },
    ]);
    builder.topology = MeshTopology.Triangles;
    builder.indexType = MeshIndexType.UInt16;

    var outerRadius = options.outerRadius;
    var innerRadius = options.innerRadius;
    var halfHeight = options.height / 2;
    var startAngle = options.startAngle * Math.PI / 180;
    var sweepAngle = options.sweepAngle * Math.PI / 180;
    var numSegments = Math.max(1, Math.ceil(Math.abs(options.sweepAngle) / global.constants.ARC_SEGMENT_ANGLE));

    vertexCount = 0;

    var up = new vec3(0, 1, 0);
    var down = new vec3(0, -1, 0);

    // one quad per face and segment for top, bottom, inner and outer wall
    for (var i = 0; i < numSegments; i++) {
        var a0 = startAngle + sweepAngle * i / numSegments;
        var a1 = startAngle + sweepAngle * (i + 1) / numSegments;

        // naming convention:
        // i = inner, o = outer
        // T = top, B = bottom
        // seen from above
        // oT1 ────────── oT0
        // ╲             ╱ 
        //  ╲           ╱
        //  iT1 ────── iT0
        //
        //        ● center
        var iT0 = point(innerRadius, a0, halfHeight);
        var oT0 = point(outerRadius, a0, halfHeight);
        var iT1 = point(innerRadius, a1, halfHeight);
        var oT1 = point(outerRadius, a1, halfHeight);
        var iB0 = point(innerRadius, a0, -halfHeight);
        var oB0 = point(outerRadius, a0, -halfHeight);
        var iB1 = point(innerRadius, a1, -halfHeight);
        var oB1 = point(outerRadius, a1, -halfHeight);

        var n0 = radial(a0);
        var n1 = radial(a1);

        // top wall
        addQuad(builder, [iT0, oT0, oT1, iT1], [up, up, up, up]);
        // bottom wall
        addQuad(builder, [iB0, iB1, oB1, oB0], [down, down, down, down]);
        // outer wall
        addQuad(builder, [oB0, oB1, oT1, oT0], [n0, n1, n1, n0]);
        // inner wall
        if (innerRadius > 1e-6) {
            var m0 = n0.uniformScale(-1);
            var m1 = n1.uniformScale(-1);
            addQuad(builder, [iB1, iB0, iT0, iT1], [m1, m0, m0, m1]);
        }

        if (i === 0){
            // vertical wall at the start of the arc segment
            var nStart = new vec3(-n0.z, 0, n0.x); // rotate n0 by 90 degrees clockwise seen from above
            addQuad(builder, [oT0, iT0, iB0, oB0], [nStart, nStart, nStart, nStart]); 
        }

        if (i === numSegments - 1){
            // vertical wall at the end of the arc segment
            var nEnd = new vec3(n1.z, 0, -n1.x); // rotate n1 by 90 degrees counter-clockwise seen from above
            addQuad(builder, [iT1, oT1, oB1, iB1], [nEnd, nEnd, nEnd, nEnd]); 
        }
    }

    builder.updateMesh();

    // vertices are in local space -> object is moved to the arc position
    // y is the center of the arc height
    var obj = global.scene.createSceneObject("Arc");
    obj.getTransform().setWorldPosition(options.position);
    var rmv = obj.createComponent("Component.RenderMeshVisual");
    rmv.mesh = builder.getMesh();
    rmv.mainMaterial = script.material;
    // clones the material and handles the render order of transparent arcs
    global.materialUtils.applyMaterialProperties(obj, { color: options.color });
    return obj;
}

script.spawnArc = spawnArc;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["material"]);
});
