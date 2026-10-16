//@component
// Generic spawner for any 3D prefab (box, sphere, ...).
// Add one instance per prefab to the Scene

// @input Asset.ObjectPrefab objectPrefab

/**
 * Spawn a copy of the configured prefab.
 * @param {vec3}        position    world position
 * @param {quat}        [rotation]  optional world rotation, e.g. quat.fromEulerAngles(x, y, z) in radians; null keeps the prefab's own orientation
 * @param {number|vec3} [scale]     optional uniform scale (number) or per-axis scale (vec3)
 * @param {vec4}        [color]     optional color (r,g,b,a); the instance gets its own cloned material
 * @returns {SceneObject}
 */
function spawnObject(position, rotation, scale, color) {
    return global.prefabSpawner.spawnPrefab(
        script.objectPrefab, position, rotation, scale, color);
}

// expose for other scripts
script.spawnObject = spawnObject;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["objectPrefab"]);
});
