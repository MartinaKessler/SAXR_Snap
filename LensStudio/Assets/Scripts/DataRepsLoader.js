// Loads the data representations (datareps.json) from a URL or a local file
// and spawns each element with the matching spawner script

// @input Component.ScriptComponent remoteMediaLoader
// @input Component.ScriptComponent sphereSpawner
// @input Component.ScriptComponent boxSpawner
// @input Component.ScriptComponent cylinderSpawner
// @input Component.ScriptComponent planeSpawner
// @input Component.ScriptComponent pyramidSpawner
// @input Component.ScriptComponent octahedronSpawner
// @input Component.ScriptComponent plusSpawner
// @input Component.ScriptComponent quadSpawner
// @input Component.ScriptComponent arcSpawner
// @input Component.ScriptComponent textSpawner

const WORLD_SCALE = 100; // converts from units of the json (m) to units in Lens Studio (cm)
const LINE_WIDTH  = 0.2; // width (cm) of the visualization type "line"

/**
 * Convert a value (m) into Lens Studio world-space (cm) by applying WORLD_SCALE
 * @param   {number|vec3} value a plain number or a vec3
 * @returns {number|vec3}       value in cm
 */
function toWorldScale(value) {
    if (typeof value === "number") {
        return value * WORLD_SCALE;
    }
    return value.uniformScale(WORLD_SCALE);
}

/**
 * Parse an attribute string of key:value pairs separated by ";" into an object
 * e.g. "angle:45;start:90" -> { angle: "45", start: "90" }
 * @param   {string} str attribute string
 * @returns {Object}     keys and values as strings, empty object if str is empty
 */
function parseKeyValuePairs(str) {
    var dict = {};
    if (!str) {
        return dict;
    }
    for (var keyValuePair of str.split(";")) {
        var idx = keyValuePair.indexOf(":");
        if (idx >= 0) {
            dict[keyValuePair.substring(0, idx).trim()] = keyValuePair.substring(idx + 1).trim();
        }
    }
    return dict;
}

/**
 * Spawn all elements of the scene selected by global.config.sceneIndex
 * @param {Array[]} data parsed datareps.json, one array of elements per scene
 */
function spawnDataReps(data) {
    // TODO: generalize code for array with several elements (stage & scenes)
    for (var obj of data[global.config.sceneIndex]) {
        // TODO: implement upper case stage elements separately
        var type = obj.type.toLowerCase();

        switch (type) {
            case "sphere":
                if (obj.w !== obj.h || obj.w !== obj.d) {
                    print("Warning: sphere width, depth and height are not equal, using width");
                }

                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(obj.w);
                var color = global.colorUtils.toColor(obj.color);
                script.sphereSpawner.spawnObject({ position: position, scale: scale, color: color });
                break;

            case "box":
                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                script.boxSpawner.spawnObject({ position: position, scale: scale, color: color });
                break;

            case "cylinder":
                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                script.cylinderSpawner.spawnObject({ position: position, scale: scale, color: color });
                break;

            case "pyramid":
            case "pyramid_down":
                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                var rotation = null;
                if (type === "pyramid_down") {
                    rotation = quat.fromEulerAngles(Math.PI, 0, 0);
                }
                script.pyramidSpawner.spawnObject({ position: position, rotation: rotation, scale: scale, color: color });
                break;

            case "octahedron":
                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                script.octahedronSpawner.spawnObject({ position: position, scale: scale, color: color });
                break;

            case "plus":
            case "cross":
                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                var rotation = null;
                if (type === "cross") {
                    rotation = quat.fromEulerAngles(0, 0, Math.PI / 4);
                }
                script.plusSpawner.spawnObject({ position: position, rotation: rotation, scale: scale, color: color });
                break;

            case "line":
                var midPoint = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var color = global.colorUtils.toColor(obj.color);
                var direction = toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var length = direction.length;
                var scale = new vec3(LINE_WIDTH, length, LINE_WIDTH);
                var rotation = null;
                if (length > 1e-6) {
                    rotation = quat.rotationFromTo(new vec3(0, 1, 0), direction.normalize());
                }
                script.boxSpawner.spawnObject({ position: midPoint, rotation: rotation, scale: scale, color: color });
                break;

            case "area":
                var midPoint = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var upperRight = midPoint.add(toWorldScale(new vec3(obj.w, obj.h, obj.d).uniformScale(0.5)));
                var upperLeft = midPoint.add(toWorldScale(new vec3(obj.w, obj.h, obj.d).uniformScale(-0.5)));
                // TODO: add y offset of xz plane, or check if offset is always at 0
                var lowerLeft = new vec3(upperLeft.x, 0, upperLeft.z);
                var lowerRight = new vec3(upperRight.x, 0, upperRight.z);
                var color = global.colorUtils.toColor(obj.color);
                script.quadSpawner.spawnQuad({ corners: [upperLeft, upperRight, lowerRight, lowerLeft], color: color });
                break;

            case "arc":
                var kvs = parseKeyValuePairs(obj.asset);
                var ratio = parseFloat(kvs.ratio);
                if (isNaN(ratio)) {
                    print("Warning: arc ratio missing or invalid, skipping arc");
                    break;
                }
                var startAngle = parseFloat(kvs.start);
                if (isNaN(startAngle)) {
                    print("Warning: arc start angle missing or invalid, skipping arc");
                    break;
                }
                var sweepAngle = parseFloat(kvs.angle);
                if (isNaN(sweepAngle) || sweepAngle === 0) {
                    print("Warning: arc start angle missing or invalid, skipping arc");
                    break;
                }
                if (obj.w !== obj.d) {
                    print("Warning: arc width and depth are not equal, using width");
                }

                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var outerRadius = toWorldScale(obj.w / 2);
                var color = global.colorUtils.toColor(obj.color);
                script.arcSpawner.spawnArc({
                    position: position,
                    outerRadius: outerRadius,
                    innerRadius: outerRadius * ratio,
                    height: toWorldScale(obj.h),
                    startAngle: startAngle,
                    sweepAngle: sweepAngle,
                    color: color,
                });
                break;

            case "text":
                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(obj.h);
                
                var rotation = null;
                if (obj.h === 0) {
                    // flat for height = 0, upright for depth = 0
                    rotation = quat.fromEulerAngles(-Math.PI/2, 0, 0);
                    scale = toWorldScale(obj.d);
                }

                var color = global.colorUtils.toColor(obj.color);
                script.textSpawner.spawnObject({ position: position, rotation: rotation, scale: scale, color: color, text: obj.asset });
                break;                

            case "xz":
                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(new vec3(obj.w, obj.h, obj.d));
                script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
                break;

            case "xy":
            case "-xy":
            case "zy":
            case "-zy":
                // plane origin is at the lower edge -> shift up by half the height
                var position = toWorldScale(new vec3(obj.x, obj.y + 0.5 * obj.h, obj.z));

                // swap d and h, because the plane in Lens Studio has extensions in width & height
                var scale = toWorldScale(new vec3(obj.w, obj.d, obj.h));
                script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
                break;
        
        default:
            if (script.planeSpawner.flatLegendPattern.test(type)) {
                var position = toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = toWorldScale(new vec3(obj.w, obj.h, obj.d));
                script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
            }
            else if (script.planeSpawner.uprightLegendPattern.test(type)) {
                // plane origin is at the lower edge -> shift up by half the height
                // TODO: document this in the repository
                var position = toWorldScale(new vec3(obj.x, obj.y + 0.5 * obj.h, obj.z));
                // swap d and h, because the plane in Lens Studio has extensions in width & height
                var scale = toWorldScale(new vec3(obj.w, obj.d, obj.h));
                script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
            }
            else {
                print("Warning: unknown data rep type " + type);
            }
        }
    }
}

function onStart() {
    global.inputUtils.warnIfMissing(script, ["remoteMediaLoader", "sphereSpawner", "boxSpawner", "cylinderSpawner", "planeSpawner", "pyramidSpawner", "octahedronSpawner", "plusSpawner", "quadSpawner", "arcSpawner", "textSpawner"]);

    if (global.config.useUrl) {
        script.remoteMediaLoader.loadJson(global.config.jsonUrl, spawnDataReps);
    }
    else {
        var jsonString = global.config.jsonFile.getString();
        var data = JSON.parse(jsonString);
        spawnDataReps(data);
    }

}

script.createEvent("OnStartEvent").bind(onStart);