//@component
// @input Asset.ObjectPrefab planePrefab

var planeTextures = {
    // // iris
    // "xy.png": requireAsset("../Datasets/iris/xy.png"),
    // "-xy.png": requireAsset("../Datasets/iris/-xy.png"),
    // "xz.png": requireAsset("../Datasets/iris/xz.png"),
    // "zy.png": requireAsset("../Datasets/iris/zy.png"),
    // "-zy.png": requireAsset("../Datasets/iris/-zy.png"),
    // "lc.png": requireAsset("../Datasets/iris/lc.png"),

    // // burnout
    // "xy.png": requireAsset("../Datasets/burnout/xy.png"),
    // "xz.png": requireAsset("../Datasets/burnout/xz.png"),
    // "zy.png": requireAsset("../Datasets/burnout/zy.png"),
    // "lc.png": requireAsset("../Datasets/burnout/lc.png"),
    // "lm.png": requireAsset("../Datasets/burnout/lm.png"),

    // // energy
    // "xy.png": requireAsset("../Datasets/energy/xy.png"),
    // "xz.png": requireAsset("../Datasets/energy/xz.png"),
    // "zy.png": requireAsset("../Datasets/energy/zy.png"),
    // "-zy.png": requireAsset("../Datasets/energy/-zy.png"),
    // "lc.png": requireAsset("../Datasets/energy/lc.png"),

    // eco
    // "xy.png": requireAsset("../Datasets/eco/xy.png"),
    // "-xy.png": requireAsset("../Datasets/eco/-xy.png"),
    // "xz.png": requireAsset("../Datasets/eco/xz.png"),
    // "zy.png": requireAsset("../Datasets/eco/zy.png"),
    // "-zy.png": requireAsset("../Datasets/eco/-zy.png"),
    // "lc.png": requireAsset("../Datasets/eco/lc.png"),
    // "lc.png": requireAsset("../Datasets/eco/CNflag.png"),
    // "lc.png": requireAsset("../Datasets/eco/EUflag.png"),
    // "lc.png": requireAsset("../Datasets/eco/USflag.png"),

    // // ingredients
    // "lc.png": requireAsset("../Datasets/ingredients/lc.png"),

    // ingredients_cylinder
    // "lc.png": requireAsset("../Datasets/ingredients_cylinder/lc.png"),

    // line
    "xy.png": requireAsset("../Datasets/line/xy.png"),
    "-xy.png": requireAsset("../Datasets/line/-xy.png"),
    "xz.png": requireAsset("../Datasets/line/xz.png"),
    "zy.png": requireAsset("../Datasets/line/zy.png"),
    "-zy.png": requireAsset("../Datasets/line/-zy.png"),
};

// Rotation that maps the plane prefab (lying in XZ) onto each data plane type.
// Negative variants face the opposite direction (extra 180° around Y).
var planeRotations = {
    "xz":  quat.fromEulerAngles(0, 0, 0),
    "xy":  quat.fromEulerAngles(Math.PI / 2, 0, 0),
    "-xy":  quat.fromEulerAngles(Math.PI / 2, Math.PI, 0),
    "zy":  quat.fromEulerAngles(0, - Math.PI / 2, Math.PI / 2),
    "-zy":  quat.fromEulerAngles(0, Math.PI / 2, - Math.PI / 2),
};

// Legend panels (see README): l + c|m|s|g, then pose "=" flat, "|" upright or "!" upright billboarding.
var flatLegendPattern = /^l[cmsg]=/i;
var uprightLegendPattern = /^l[cmsg][|!]/i;

// Checked in order when the type has no exact entry in planeRotations.
var planeRotationPatterns = [
    { pattern: flatLegendPattern,    rotation: quat.fromEulerAngles(0, 0, 0) },
    { pattern: uprightLegendPattern, rotation: quat.fromEulerAngles(Math.PI / 2, 0, 0) },
];

// Returns the rotation for a plane type, or null if the type is unknown.
function findPlaneRotation(type) {
    if (type in planeRotations) {
        return planeRotations[type];
    }
    for (var i = 0; i < planeRotationPatterns.length; i++) {
        if (planeRotationPatterns[i].pattern.test(type)) {
            return planeRotationPatterns[i].rotation;
        }
    }
    return null;
}

function spawnPlaneOfType(type, position, scale, color, textureName) {
    var rotation = findPlaneRotation(type);
    if (!rotation) {
        print("Warning: unknown plane type: " + type);
        return null;
    }
    return spawnPlane(position, rotation, scale, color, textureName);
}

/**
 * Spawn a copy of the Plane prefab.
 * @param {vec3}   position  world position
 * @param {quat}   [rotation]  optional world rotation; null keeps the prefab's own orientation (XZ plane)
 * @param {number|vec3} [scale]  optional uniform scale (number) or per-axis scale (vec3)
 * @param {vec4}   [color]  optional color (r,g,b,a); the instance gets its own cloned material
 * @param {string} [textureName]  optional key into planeTextures, e.g. "xy.png"
 * @returns {SceneObject}
 */
function spawnPlane(position, rotation, scale, color, textureName) {
    var texture = resolveTexture(textureName);
    return global.prefabSpawner.spawnPrefab(
        script.planePrefab, position, rotation, scale, color, texture);
}

function resolveTexture(textureName) {
    if (!textureName) return null;
    var texture = planeTextures[textureName];
    if (!texture) {
        print("Warning: no texture found for asset name: " + textureName);
    }
    return texture || null;
}

// expose for other scripts
script.spawnPlaneOfType = spawnPlaneOfType;
script.spawnPlane = spawnPlane;
script.flatLegendPattern = flatLegendPattern;
script.uprightLegendPattern = uprightLegendPattern;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["planePrefab"]);
});