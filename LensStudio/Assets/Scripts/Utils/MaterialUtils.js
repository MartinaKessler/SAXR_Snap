// Reusable material helpers, exposed as `global.materialUtils`
// Place this on a SceneObject near the top of the scene hierarchy so it initializes before any script that calls it

/**
 * Collect the RenderMeshVisuals of obj and all its children
 * @param   {SceneObject}        obj
 * @param   {RenderMeshVisual[]} result array to append to (pass [] on the first call)
 * @returns {RenderMeshVisual[]}        the filled result array
 */
function findRenderMeshVisuals(obj, result) {
    var rmv = obj.getComponent("Component.RenderMeshVisual");
    if (rmv) {
        result.push(rmv);
    }
    for (var i = 0; i < obj.getChildrenCount(); i++) {
        findRenderMeshVisuals(obj.getChild(i), result);
    }
    return result;
}

/**
 * Set color and/or texture on all RenderMeshVisuals of obj including all children
 * The material is cloned so other objects sharing it are not affected
 * Visuals on child objects (e.g. Octahedron = two halves) all get the same clone
 * @param   {SceneObject}   obj
 * @param   {Object}        options
 * @param   {vec4}          [options.color]   base color (r,g,b,a), the object gets its own cloned material
 * @param   {Asset.Texture} [options.texture] base texture, the object gets its own cloned material
 * @returns {boolean}                         false if obj has no RenderMeshVisual with a material
 */
function applyMaterialProperties(obj, options) {
    var visuals = findRenderMeshVisuals(obj, []);
    if (visuals.length === 0 || !visuals[0].mainMaterial) {
        return false;
    }

    var mat = visuals[0].mainMaterial.clone();
    if (options.color) {
        mat.mainPass.baseColor = options.color;
    }
    if (options.texture) {
        mat.mainPass.baseTex = options.texture;
    }
    for (var i = 0; i < visuals.length; i++) {
        visuals[i].clearMaterials();
        visuals[i].addMaterial(mat);
    }
    return true;
}

global.materialUtils = {
    findRenderMeshVisuals: findRenderMeshVisuals,
    applyMaterialProperties: applyMaterialProperties,
};
