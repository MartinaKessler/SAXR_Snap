// Builds flat quadrilaterals from 4 world-space corners (e.g. the "area" type)

// @input Asset.Material material

/**
 * Spawn a two-sided quad
 * @param   {Object}      options
 * @param   {vec3[]}      options.corners 4 world positions, in order around the outline
 * @param   {vec4}        [options.color] base color (r,g,b,a), the object gets its own cloned material
 * @returns {SceneObject}                 the spawned quad
 */
function spawnQuad(options) {
    var builder = new MeshBuilder([
        { name: "position", components: 3 },
        { name: "normal", components: 3, normalized: true },
    ]);
    builder.topology = MeshTopology.Triangles;
    builder.indexType = MeshIndexType.UInt16;

    var normal_front = options.corners[3].sub(options.corners[0]).cross(options.corners[1].sub(options.corners[0])).normalize();
    var normal_back = normal_front.uniformScale(-1);

    // add a triangle facing towards the front and one facing towards the back
    // so they are visible from both sides
    var vertices = [];
    [normal_front, normal_back].forEach(function (n) {
        options.corners.forEach(function (c) {
            vertices.push(c.x, c.y, c.z, n.x, n.y, n.z);
        });
    });
    builder.appendVerticesInterleaved(vertices);

    // seen from the side the normal points to, the triangles have to be wound counter-clockwise
    // for both triangles, the normal points away from the screen, towards the user

    // front
    // 0=4 ──── 1=5
    // │ ╲      │
    // │   ╲    │
    // │     ╲  │
    // 3=7 ────  2=6

    // back
    // 5=1 ──── 4=0
    // │     /  │
    // │   /    │
    // │ /      │
    // 2=6 ──── 3=7
  
    builder.appendIndices([
        0, 2, 1, // front
        0, 3, 2, // front
        4, 5, 6, // back
        4, 6, 7, // back
    ]);
    builder.updateMesh();

    // vertices are already in world space -> object stays at the origin
    var obj = global.scene.createSceneObject("Quad");
    var rmv = obj.createComponent("Component.RenderMeshVisual");
    rmv.mesh = builder.getMesh();
    var mat = script.material.clone();
    if (options.color) {
        mat.mainPass.baseColor = options.color;
    }
    rmv.mainMaterial = mat;
    return obj;
}

script.spawnQuad = spawnQuad;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["material"]);
});