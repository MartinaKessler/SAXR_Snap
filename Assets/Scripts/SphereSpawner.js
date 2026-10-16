// @input Asset.ObjectPrefab spherePrefab

/**
 * Spawn a copy of the Sphere prefab.
 * @param {vec3}   position  world position
 * @param {number} scale     uniform scale
 * @param {vec4}   [color]    optional color (r,g,b,a); the instance gets its own cloned material
 * @returns {SceneObject}
 */
function spawnSphere(position, scale, color) {
    return global.prefabSpawner.spawnPrefab(
        script.spherePrefab, position, null, scale, color, "Sphere (spawned)");
}

// expose for other scripts
script.spawnSphere = spawnSphere;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["spherePrefab"]);
});