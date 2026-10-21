// Reusable prefab-spawning helper.
// Place this on a SceneObject ABOVE any script that depends on it in the
// Scene Hierarchy so it initializes first. Other scripts call it via an
// explicit input Component.ScriptComponent prefabSpawner reference,
// or fall back to `global.prefabSpawner`.

/**
 * Instantiate a prefab and set up its transform / material.
 * @param {ObjectPrefab}  prefab              prefab asset to instantiate
 * @param {Object}        options
 * @param {vec3}          [options.position]  world position
 * @param {quat}          [options.rotation]  world rotation, e.g. quat.fromEulerAngles(x, y, z) in radians
 * @param {number|vec3}   [options.scale]     uniform scale (number) or per-axis scale (vec3)
 * @param {vec4}          [options.color]     color (r,g,b,a); the instance gets its own cloned material
 * @param {Asset.Texture} [options.texture]   base texture, the instance gets its own cloned material
 * @returns {SceneObject}
 */
function spawnPrefab(prefab, options) {
    if (!prefab) {
        throw new Error("PrefabSpawner.spawnPrefab: prefab is null");
    }

    // parent = null -> scene root
    var obj = prefab.instantiate(null);

    var t = obj.getTransform();
    if (options.position) {
        t.setWorldPosition(options.position);
    }
    if (options.scale !== undefined && options.scale !== null) {
        var scaleVec = (typeof options.scale === "number")
            ? new vec3(options.scale, options.scale, options.scale)
            : options.scale;
        t.setWorldScale(scaleVec);
    }
    // rotation (radians at runtime!):
    if (options.rotation !== undefined && options.rotation !== null) {
        t.setWorldRotation(options.rotation);
    }

    if (options.color || options.texture) {
        global.materialUtils.applyMaterialProperties(obj, { color: options.color, texture: options.texture });
    }

    return obj;
}

// expose for other scripts
script.spawnPrefab = spawnPrefab;
global.prefabSpawner = script;
