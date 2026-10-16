//@component
// Reusable prefab-spawning helper.
// Place this on a SceneObject ABOVE any script that depends on it in the
// Scene Hierarchy so it initializes first. Other scripts call it via an
// explicit input Component.ScriptComponent prefabSpawner reference,
// or fall back to `global.prefabSpawner`.

/**
 * Instantiate a prefab and set up its transform / material.
 * @param {ObjectPrefab} prefab    prefab asset to instantiate
 * @param {vec3}          [position] world position
 * @param {quat}          [rotation] world rotation, e.g. quat.fromEulerAngles(x, y, z) in radians
 * @param {number|vec3}   [scale]    uniform scale (number) or per-axis scale (vec3)
 * @param {vec4}          [color]    optional tint; the instance gets its own cloned material
 * @param {Asset.Texture} [texture]  optional base texture; the instance gets its own cloned material

 * @returns {SceneObject}
 */
function spawnPrefab(prefab, position, rotation, scale, color, texture) {
    if (!prefab) {
        throw new Error("PrefabSpawner.spawnPrefab: prefab is null");
    }

    // parent = null -> scene root
    var obj = prefab.instantiate(null);

    var t = obj.getTransform();
    if (position) {
        t.setWorldPosition(position);
    }
    if (scale !== undefined && scale !== null) {
        var scaleVec = (typeof scale === "number")
            ? new vec3(scale, scale, scale)
            : scale;
        t.setWorldScale(scaleVec);
    }
    // rotation (radians at runtime!):
    if (rotation !== undefined && rotation !== null) {
        t.setWorldRotation(rotation);
    }

    // Per-instance material so tint/texture don't leak to other instances.
    // Visuals may sit on child objects (e.g. Octahedron = two halves), so
    // all of them get the same cloned material.
    if (color || texture) {
        var visuals = findRenderMeshVisuals(obj, []);
        if (visuals.length > 0) {
            var mat = visuals[0].mainMaterial.clone();
            if (color) {
                mat.mainPass.baseColor = color;
            }
            if (texture) {
                mat.mainPass.baseTex = texture;
            }
            for (var i = 0; i < visuals.length; i++) {
                visuals[i].clearMaterials();
                visuals[i].addMaterial(mat);
            }
        }
    }

    return obj;
}

// Collects the RenderMeshVisuals of obj and all its descendants.
function findRenderMeshVisuals(obj, result) {
    var rmv = obj.getComponent("Component.RenderMeshVisual");
    if (rmv) {
        result.push(rmv);
    }
    for (var i = 0; i < obj.getChildrenCount(); i++) {
        findRenderMeshVisuals(obj.getChild(i), result);
    }
    return result;
}

// expose for other scripts
script.spawnPrefab = spawnPrefab;
global.prefabSpawner = script;
