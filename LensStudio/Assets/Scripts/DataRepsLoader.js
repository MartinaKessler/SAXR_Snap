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
                    print("Warning: sphere dimensions are not equal");
                }

                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = global.constants.toWorldScale(obj.w);
                var color = global.colorUtils.toColor(obj.color);
                script.sphereSpawner.spawnObject({ position: position, scale: scale, color: color });
                break;

            case "box":
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                script.boxSpawner.spawnObject({ position: position, scale: scale, color: color });
                break;

            case "cylinder":
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                script.cylinderSpawner.spawnObject({ position: position, scale: scale, color: color });
                break;

            case "pyramid":
            case "pyramid_down":
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                var rotation = null;
                if (type === "pyramid_down") {
                    rotation = quat.fromEulerAngles(Math.PI, 0, 0);
                }
                script.pyramidSpawner.spawnObject({ position: position, rotation: rotation, scale: scale, color: color });
                break;

            case "octahedron":
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                script.octahedronSpawner.spawnObject({ position: position, scale: scale, color: color });
                break;

            case "plus":
            case "cross":
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var color = global.colorUtils.toColor(obj.color);
                var rotation = null;
                if (type === "cross") {
                    rotation = quat.fromEulerAngles(0, 0, Math.PI / 4);
                }
                script.plusSpawner.spawnObject({ position: position, rotation: rotation, scale: scale, color: color });
                break;

            case "line":
                var midPoint = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var color = global.colorUtils.toColor(obj.color);
                var direction = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
                var length = direction.length;
                var scale = new vec3(global.constants.LINE_WIDTH, length, global.constants.LINE_WIDTH);
                var rotation = null;
                if (length > 1e-6) {
                    rotation = quat.rotationFromTo(new vec3(0, 1, 0), direction.normalize());
                }
                script.boxSpawner.spawnObject({ position: midPoint, rotation: rotation, scale: scale, color: color });
                break;

            case "area":
                var midPoint = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var upperRight = midPoint.add(global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d).uniformScale(0.5)));
                var upperLeft = midPoint.add(global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d).uniformScale(-0.5)));
                // TODO: add y offset of xz plane, or check if offset is always at 0
                var lowerLeft = new vec3(upperLeft.x, 0, upperLeft.z);
                var lowerRight = new vec3(upperRight.x, 0, upperRight.z);
                var color = global.colorUtils.toColor(obj.color);
                script.quadSpawner.spawnQuad({ corners: [upperLeft, upperRight, lowerRight, lowerLeft], color: color });
                break;

            case "xz":
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
                script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
                break;

            case "xy":
            case "-xy":
            case "zy":
            case "-zy":
                // plane origin is at the lower edge -> shift up by half the height
                // TODO: document this in the repository
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y + 0.5 * obj.h, obj.z));

                // swap d and h, because the plane in Lens Studio has extensions in width & height
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.d, obj.h));
                script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
                break;
        
        default:
            if (script.planeSpawner.flatLegendPattern.test(type)) {
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
                script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
            }
            else if (script.planeSpawner.uprightLegendPattern.test(type)) {
                // plane origin is at the lower edge -> shift up by half the height
                // TODO: document this in the repository
                var position = global.constants.toWorldScale(new vec3(obj.x, obj.y + 0.5 * obj.h, obj.z));
                // swap d and h, because the plane in Lens Studio has extensions in width & height
                var scale = global.constants.toWorldScale(new vec3(obj.w, obj.d, obj.h));
                script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
            }
            else {
                print("Warning: unknown data rep type " + type);
            }
        }
    }
}

function onStart() {
    global.inputUtils.warnIfMissing(script, ["remoteMediaLoader", "sphereSpawner", "boxSpawner", "cylinderSpawner", "planeSpawner", "pyramidSpawner", "octahedronSpawner", "plusSpawner", "quadSpawner"]);

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