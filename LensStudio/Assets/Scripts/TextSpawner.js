// Spawns text from the text prefab

// @input Asset.ObjectPrefab textPrefab

const FONT_SIZE_CONSTANT = 1.09 / 48; // font size 48 is equivalent to 1.09 cm height, see https://docs.lensstudio.com/api/lens-scripting/Text?target=camera-kit#size

/**
 * Spawn a copy of the configured prefab
 * @param   {Object}      options
 * @param   {vec3}        [options.position] world position
 * @param   {number|vec3} [options.scale]    uniform scale (number) or per-axis scale (vec3)
 * @param   {vec4}        [options.color]    base color (r,g,b,a)
 * @param   {string}      [options.text]     text
 * @returns {SceneObject}                    the spawned instance
 */
function spawnObject(options) {
    var fontScale = options.scale;
    options.scale = new vec3(1.0, 1.0, 1.0); // set the scale as 1.0, then adjust the size through the font size
    var textObject = global.prefabSpawner.spawnPrefab(script.textPrefab, options);

    var textComponent = textObject.getComponent("Component.Text");
    textComponent.text = options.text;
    textComponent.textFill.color = options.color;
    textComponent.size = fontScale / FONT_SIZE_CONSTANT;

    return textObject;
}

script.spawnObject = spawnObject;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["textPrefab"]);
});
