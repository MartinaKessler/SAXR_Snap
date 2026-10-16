// @input Asset.ObjectPrefab boxPrefab

/**
 * Spawn a copy of the Box prefab.
 * @param {vec3} position  world position
 * @param {vec3} scale     uniform scale
 * @param {vec4} [color]    optional color (r,g,b,a); the instance gets its own cloned material
 * @returns {SceneObject}
 */
function spawnBox(position, scale, color) {
    return global.prefabSpawner.spawnPrefab(
        script.boxPrefab, position, null, scale, color, "Box (spawned)");
}

// expose for other scripts
script.spawnBox = spawnBox;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["boxPrefab"]);
});