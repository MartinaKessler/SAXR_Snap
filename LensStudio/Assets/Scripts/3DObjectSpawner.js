// Generic spawner for any 3D prefab (box, sphere, ...).
// Add one instance per prefab to the Scene

// @input Asset.ObjectPrefab objectPrefab

/**
 * Spawn a copy of the configured prefab.
 * @param {Object}      options
 * @param {vec3}        [options.position]  world position
 * @param {quat}        [options.rotation]  world rotation, e.g. quat.fromEulerAngles(x, y, z) in radians; missing keeps the prefab's own orientation
 * @param {number|vec3} [options.scale]     uniform scale (number) or per-axis scale (vec3)
 * @param {vec4}        [options.color]     color (r,g,b,a); the instance gets its own cloned material
 * @returns {SceneObject}
 */
function spawnObject(options) {
    return global.prefabSpawner.spawnPrefab(script.objectPrefab, options);
}

// expose for other scripts
script.spawnObject = spawnObject;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["objectPrefab"]);
});
