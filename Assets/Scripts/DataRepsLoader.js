//@input Asset.JsonAsset jsonFile
//@input Component.ScriptComponent sphereSpawner
//@input Component.ScriptComponent boxSpawner
//@input Component.ScriptComponent cylinderSpawner
//@input Component.ScriptComponent planeSpawner
//@input Component.ScriptComponent pyramidSpawner
//@input Component.ScriptComponent octahedronSpawner
//@input Component.ScriptComponent plusSpawner

function onStart() {
    global.inputUtils.warnIfMissing(script, ["jsonFile", "sphereSpawner", "boxSpawner", "cylinderSpawner", "planeSpawner", "pyramidSpawner", "octahedronSpawner", "plusSpawner"]);

    var jsonString = script.jsonFile.getString();
    var data = JSON.parse(jsonString);

    // TODO: generalize code for array with several elements
    for (var obj of data[0]){
        // TODO: implement upper case stage elements separately
        var type = obj.type.toLowerCase(); 

        if (type === "sphere"){
            if (obj.w !== obj.h || obj.w !== obj.d) {
                print("Warning: sphere dimensions are not equal");
            }

            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            var scale = global.constants.toWorldScale(obj.w);
            var color = global.colorUtils.toColor(obj.color);
            script.sphereSpawner.spawnObject({ position: position, scale: scale, color: color });
        }

        if (type === "box"){
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
            var color = global.colorUtils.toColor(obj.color);
            script.boxSpawner.spawnObject({ position: position, scale: scale, color: color });
        }

        if (type === "cylinder"){
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
            var color = global.colorUtils.toColor(obj.color);
            script.cylinderSpawner.spawnObject({ position: position, scale: scale, color: color });
        }

        if (type === "pyramid" || type === "pyramid_down"){
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
            var color = global.colorUtils.toColor(obj.color);
            var rotation = null;
            if (type === "pyramid_down"){
                rotation = quat.fromEulerAngles(Math.PI, 0, 0);
            }
            script.pyramidSpawner.spawnObject({ position: position, rotation: rotation, scale: scale, color: color });
        }

        if (type === "octahedron"){
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
            var color = global.colorUtils.toColor(obj.color);
            script.octahedronSpawner.spawnObject({ position: position, scale: scale, color: color });
        }

        if (type === "plus" || type === "cross"){
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
            var color = global.colorUtils.toColor(obj.color);
            var rotation = null;
            if (type === "cross"){
                rotation = quat.fromEulerAngles(0, 0, Math.PI / 4);
            }
            script.plusSpawner.spawnObject({ position: position, rotation: rotation, scale: scale, color: color });
        }

        if (type === "line"){
            var midPoint = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            // var left = midPoint.add(global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d).uniformScale(0.5)));
            // var right = midPoint.add(global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d).uniformScale(-0.5)));
            var color = global.colorUtils.toColor(obj.color);
            var direction = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
            var length = direction.length;
            var scale = new vec3(global.constants.LINE_WIDTH, length, global.constants.LINE_WIDTH);
            var rotation = null;
            if (length > 1e-6){
                rotation = quat.rotationFromTo(new vec3(0, 1, 0), direction.normalize());
            }
            script.boxSpawner.spawnObject({ position: midPoint, rotation: rotation, scale: scale, color: color });
        }

        if (type === "xz"){
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
            script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
        }

        if (type === "xy" || type == "-xy" || type === "zy"|| type == "-zy"){
            // plane origin is at the lower edge -> shift up by half the height
            // TODO: document this in the repository
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y + 0.5 * obj.h, obj.z));

            // swap d and h, because the plane in Lens Studio has extensions in width & height
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.d, obj.h)); 
            script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
        }

        if (script.planeSpawner.flatLegendPattern.test(type)){
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y, obj.z));
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.h, obj.d));
            script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
        }

        if (script.planeSpawner.uprightLegendPattern.test(type)){
            // plane origin is at the lower edge -> shift up by half the height
            // TODO: document this in the repository
            var position = global.constants.toWorldScale(new vec3(obj.x, obj.y + 0.5 * obj.h, obj.z));
            // swap d and h, because the plane in Lens Studio has extensions in width & height
            var scale = global.constants.toWorldScale(new vec3(obj.w, obj.d, obj.h)); 
            script.planeSpawner.spawnPlaneOfType(type, { position: position, scale: scale, textureName: obj.asset });
        }
    }
}

script.createEvent("OnStartEvent").bind(onStart); 