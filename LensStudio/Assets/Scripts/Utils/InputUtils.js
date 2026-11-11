// Reusable script input helpers, exposed as `global.inputUtils`
// Place this on a SceneObject near the top of the scene hierarchy so it initializes before any script that calls it

/**
 * Print a warning for every listed script input that isn't set in the inspector
 * @param {ScriptComponent} scriptObj the calling script
 * @param {string[]}        names     names of the required inputs
 */
function warnIfMissing(scriptObj, names) {
    var sceneObject = scriptObj.getSceneObject().name;
    for (var name of names) {
        if (isNull(scriptObj[name])) {
            print("Warning: input '" + name + "' on '" + sceneObject + "' is not set in the inspector");
        }
    }
}

global.inputUtils = {
    warnIfMissing: warnIfMissing,
};
