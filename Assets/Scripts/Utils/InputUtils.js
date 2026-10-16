//@component
// Reusable script-input helpers, exposed as `global.inputUtils`.
// Place this on a SceneObject near the top of the Scene Hierarchy so it
// initializes before any script that calls it.

/**
 * Print a warning for every listed script input that isn't set in the Inspector.
 * @param {ScriptComponent} scriptObj  the calling script (`script`)
 * @param {string[]}        names      names of the required inputs
 */
function warnIfMissing(scriptObj, names) {
    var sceneObject = scriptObj.getSceneObject().name;
    for (var name of names) {
        if (isNull(scriptObj[name])) {
            print("Warning: input '" + name + "' on '" + sceneObject + "' is not set in the Inspector");
        }
    }
}

global.inputUtils = {
    warnIfMissing: warnIfMissing,
};
