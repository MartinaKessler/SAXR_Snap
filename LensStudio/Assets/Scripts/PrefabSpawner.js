// Reusable prefab-spawning helper, exposed as `global.prefabSpawner`
// Place this on a SceneObject near the top of the scene hierarchy so it initializes before any script that calls it
// Other scripts call it via an input Component.ScriptComponent prefabSpawner or via `global.prefabSpawner`

/**
 * Instantiate a prefab and set up its transform/material
 * @param   {ObjectPrefab}  prefab             prefab asset to instantiate
 * @param   {Object}        options
 * @param   {vec3}          [options.position] world position
 * @param   {quat}          [options.rotation] world rotation, e.g. quat.fromEulerAngles(x, y, z) in radians, missing keeps the prefab's own orientation
 * @param   {number|vec3}   [options.scale]    uniform scale (number) or per-axis scale (vec3)
 * @param   {vec4}          [options.color]    base color (r,g,b,a), the object gets its own cloned material
 * @param   {Asset.Texture} [options.texture]  base texture, the object gets its own cloned material
 * @returns {SceneObject}                      the spawned instance
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

script.spawnPrefab = spawnPrefab;
global.prefabSpawner = script;
