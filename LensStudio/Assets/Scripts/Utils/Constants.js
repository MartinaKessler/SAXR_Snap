// Project-wide constants, exposed as `global.constants`
// Place this on a SceneObject near the top of the scene hierarchy so it initializes before any script that calls it

var WORLD_SCALE = 100; // converts from units of the json (m) to units in Lens Studio (cm)
var LINE_WIDTH  = 0.2; // width of the line for the visualization type "line"

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

global.constants = {
    WORLD_SCALE: WORLD_SCALE,
    LINE_WIDTH: LINE_WIDTH,
    toWorldScale: toWorldScale,
};
