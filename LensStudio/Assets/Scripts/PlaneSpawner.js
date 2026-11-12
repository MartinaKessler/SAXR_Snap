// Spawns textured planes (data planes and legend panels) from the plane prefab
// Textures come from planeTextures or, with global.config.useUrl, from a URL

// @input Asset.ObjectPrefab        planePrefab
// @input Component.ScriptComponent remoteMediaLoader

var planeTextures = { 
    // // iris
    // "xy.png":  requireAsset("../Datasets/iris/xy.png"),
    // "-xy.png": requireAsset("../Datasets/iris/-xy.png"),
    // "xz.png":  requireAsset("../Datasets/iris/xz.png"),
    // "xz.png":  requireAsset("../Datasets/irisLOD/xz.png"),
    // "zy.png":  requireAsset("../Datasets/iris/zy.png"),
    // "-zy.png": requireAsset("../Datasets/iris/-zy.png"),
    // "lc.png":  requireAsset("../Datasets/iris/lc.png"),

    // irisLOD
    "xy.png":  requireAsset("../Datasets/irisLOD/xy.png"),
    "-xy.png": requireAsset("../Datasets/irisLOD/-xy.png"),
    "xz.png":  requireAsset("../Datasets/irisLOD/xz.png"),
    "xz+s.png":  requireAsset("../Datasets/irisLOD/xz+s.png"),
    "zy.png":  requireAsset("../Datasets/irisLOD/zy.png"),
    "-zy.png": requireAsset("../Datasets/irisLOD/-zy.png"),
    "lc.png":  requireAsset("../Datasets/irisLOD/lc.png"),

    // // iris
    // "https://service.metason.net/ar/content/viz/irisLOD/xy.png":  requireAsset("../Datasets/iris/xy.png"),
    // "https://service.metason.net/ar/content/viz/irisLOD/-xy.png": requireAsset("../Datasets/iris/-xy.png"),
    // "https://service.metason.net/ar/content/viz/irisLOD/xz.png":  requireAsset("../Datasets/iris/xz.png"),
    // "https://service.metason.net/ar/content/viz/irisLOD/zy.png":  requireAsset("../Datasets/iris/zy.png"),
    // "https://service.metason.net/ar/content/viz/irisLOD/-zy.png": requireAsset("../Datasets/iris/-zy.png"),
    // "https://service.metason.net/ar/content/viz/irisLOD/lc.png":  requireAsset("../Datasets/iris/lc.png"),

    // // area
    // "xy.png":  requireAsset("../Datasets/area/xy.png"),
    // "-xy.png": requireAsset("../Datasets/area/-xy.png"),
    // "xz.png":  requireAsset("../Datasets/area/xz.png"),
    // "zy.png":  requireAsset("../Datasets/area/zy.png"),
    // "-zy.png": requireAsset("../Datasets/area/-zy.png"),

    // // burnout
    // "xy.png": requireAsset("../Datasets/burnout/xy.png"),
    // "xz.png": requireAsset("../Datasets/burnout/xz.png"),
    // "zy.png": requireAsset("../Datasets/burnout/zy.png"),
    // "lc.png": requireAsset("../Datasets/burnout/lc.png"),
    // "lm.png": requireAsset("../Datasets/burnout/lm.png"),

    // // energy
    // "xy.png":  requireAsset("../Datasets/energy/xy.png"),
    // "xz.png":  requireAsset("../Datasets/energy/xz.png"),
    // "zy.png":  requireAsset("../Datasets/energy/zy.png"),
    // "-zy.png": requireAsset("../Datasets/energy/-zy.png"),
    // "lc.png":  requireAsset("../Datasets/energy/lc.png"),

    // eco
    // "xy.png":  requireAsset("../Datasets/eco/xy.png"),
    // "-xy.png": requireAsset("../Datasets/eco/-xy.png"),
    // "xz.png":  requireAsset("../Datasets/eco/xz.png"),
    // "zy.png":  requireAsset("../Datasets/eco/zy.png"),
    // "-zy.png": requireAsset("../Datasets/eco/-zy.png"),
    // "lc.png":  requireAsset("../Datasets/eco/lc.png"),
    // "lc.png":  requireAsset("../Datasets/eco/CNflag.png"),
    // "lc.png":  requireAsset("../Datasets/eco/EUflag.png"),
    // "lc.png":  requireAsset("../Datasets/eco/USflag.png"),

    // // ingredients
    // "lc.png": requireAsset("../Datasets/ingredients/lc.png"),

    // ingredients_cylinder
    // "lc.png": requireAsset("../Datasets/ingredients_cylinder/lc.png"),

    // // line
    // "xy.png":  requireAsset("../Datasets/line/xy.png"),
    // "-xy.png": requireAsset("../Datasets/line/-xy.png"),
    // "xz.png":  requireAsset("../Datasets/line/xz.png"),
    // "zy.png":  requireAsset("../Datasets/line/zy.png"),
    // "-zy.png": requireAsset("../Datasets/line/-zy.png"),
};

// Rotation that maps the plane prefab (lying in XZ) onto each data plane type
// Negative variants face the opposite direction (extra 180° around Y)
var planeRotations = {
    "xz":  quat.fromEulerAngles(0, 0, 0),
    "xy":  quat.fromEulerAngles(Math.PI / 2, 0, 0),
    "-xy": quat.fromEulerAngles(Math.PI / 2, Math.PI, 0),
    "zy":  quat.fromEulerAngles(0, - Math.PI / 2, Math.PI / 2),
    "-zy": quat.fromEulerAngles(0, Math.PI / 2, - Math.PI / 2),
};
// TODO: add link to SAXR README
// Legend panels (see README): l + c|m|s|g, then pose "=" flat, "|" upright or "!" upright billboarding
var flatLegendPattern    = /^l[cmsg]=/i;
var uprightLegendPattern = /^l[cmsg][|!]/i;

// Checked in order when the type has no exact entry in planeRotations
var planeRotationPatterns = [
    { pattern: flatLegendPattern,    rotation: quat.fromEulerAngles(0, 0, 0) },
    { pattern: uprightLegendPattern, rotation: quat.fromEulerAngles(Math.PI / 2, 0, 0) },
];

// Returns the rotation for a plane type, or null if the type is unknown
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

/**
 * Spawn a plane whose rotation is derived from its data type
 * @param   {string}           type                  plane type, e.g. "xy", "-zy", "lc="
 * @param   {Object}           options
 * @param   {vec3}             [options.position]    world position
 * @param   {number|vec3}      [options.scale]       uniform scale (number) or per-axis scale (vec3)
 * @param   {vec4}             [options.color]       base color (r,g,b,a), the object gets its own cloned material
 * @param   {string}           [options.textureName] key into planeTextures, e.g. "xy.png", or the image URL if global.config.useUrl is set
 * @returns {SceneObject|null}                       the spawned plane, null if the type is unknown or the texture is loaded from a URL
 */
function spawnPlaneOfType(type, options) {
    var rotation = findPlaneRotation(type);
    if (!rotation) {
        print("Warning: unknown plane type: " + type);
        return null;
    }
    if (global.config.useUrl) {
        resolveTexture({
                position: options.position,
                rotation: rotation,
                scale: options.scale,
                color: options.color,
                textureName: options.textureName,
            });
        // the plane is spawned asynchronously once the texture has loaded
        return null;
    }
    else {
        return spawnPlane({
            position: options.position,
            rotation: rotation,
            scale: options.scale,
            color: options.color,
            texture: resolveTexture(options),
        });
    }
}

/**
 * Spawn a copy of the plane prefab
 * @param   {Object}        options
 * @param   {vec3}          [options.position] world position
 * @param   {quat}          [options.rotation] world rotation, e.g. quat.fromEulerAngles(x, y, z) in radians, missing keeps the prefab's own orientation
 * @param   {number|vec3}   [options.scale]    uniform scale (number) or per-axis scale (vec3)
 * @param   {vec4}          [options.color]    base color (r,g,b,a), the object gets its own cloned material
 * @param   {Asset.Texture} [options.texture]  base texture, the object gets its own cloned material
 * @returns {SceneObject}                      the spawned plane
 */
function spawnPlane(options) {
    return global.prefabSpawner.spawnPrefab(script.planePrefab, {
        position: options.position,
        rotation: options.rotation,
        scale: options.scale,
        color: options.color,
        texture: options.texture,
    });
}

// Returns the local texture for options.textureName
// With global.config.useUrl the texture is downloaded instead and the plane is spawned once it has loaded
function resolveTexture(options) {
    if (!options.textureName) return null;
    
    if (global.config.useUrl) {
        script.remoteMediaLoader.loadTexture(spawnPlane, options);
    }
    else {
        var texture = planeTextures[options.textureName];
        // var texture = script.remoteMediaLoader.loadTexture(spawnPlane, options);
        if (!texture) {
            print("Warning: no texture found for asset name: " + options.textureName);
            return null;
        }
        print("Texture found for asset name: " + options.textureName);
        return texture;
    }
}

script.spawnPlaneOfType = spawnPlaneOfType;
script.spawnPlane = spawnPlane;
script.flatLegendPattern = flatLegendPattern;
script.uprightLegendPattern = uprightLegendPattern;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["planePrefab", "remoteMediaLoader"]);
});